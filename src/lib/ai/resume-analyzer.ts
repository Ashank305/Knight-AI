import { getAIClient, getAIModelName, isAIAvailable } from './client';
import { buildResumeAnalysisPrompt } from './prompts';

export interface ResumeAnalysisResult {
  demonstratedSkills: string[];
  inferredStrengths: string[];
  potentialGaps: string[];
  estimatedMatchScore: number;
  scoreExplanation: string;
  recommendedActionItems: string[];
  tailoredInterviewTopics: string[];
  isAiPowered: boolean;
}

export async function analyzeResumeAndJob(params: {
  resumeText: string;
  jobDescription?: string;
  targetRole: string;
  targetCompany: string;
}): Promise<ResumeAnalysisResult> {
  const { resumeText, jobDescription, targetRole, targetCompany } = params;

  // If AI is available, run through Gemini
  if (isAIAvailable()) {
    const aiClient = getAIClient();
    if (aiClient) {
      try {
        const prompt = buildResumeAnalysisPrompt(params);
        const modelsToTry = Array.from(new Set([getAIModelName(), 'gemini-3.5-flash', 'gemini-3.8-flash']));
        let text = '';
        for (const model of modelsToTry) {
          try {
            const response = await aiClient.models.generateContent({
              model,
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
                temperature: 0.1,
              },
            });
            text = response.text?.trim() || '';
            if (text) break;
          } catch (e) {
            // Try next model
          }
        }
        if (text) {
          const parsed = JSON.parse(text);
          return {
            demonstratedSkills: Array.isArray(parsed.demonstratedSkills) ? parsed.demonstratedSkills : [],
            inferredStrengths: Array.isArray(parsed.inferredStrengths) ? parsed.inferredStrengths : [],
            potentialGaps: Array.isArray(parsed.potentialGaps) ? parsed.potentialGaps : [],
            estimatedMatchScore: typeof parsed.estimatedMatchScore === 'number' ? parsed.estimatedMatchScore : 72,
            scoreExplanation: parsed.scoreExplanation || 'Estimated match indicator based on stated technical requirements and candidate skills.',
            recommendedActionItems: Array.isArray(parsed.recommendedActionItems) ? parsed.recommendedActionItems : [],
            tailoredInterviewTopics: Array.isArray(parsed.tailoredInterviewTopics) ? parsed.tailoredInterviewTopics : [],
            isAiPowered: true,
          };
        }
      } catch (err) {
        console.warn('AI resume analysis failed, using rule-based analyzer fallback', err);
      }
    }
  }

  // Deterministic rule-based analyzer fallback
  const commonTech = [
    'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'React', 'Next.js',
    'Node.js', 'SQL', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'GCP',
    'Git', 'CI/CD', 'REST API', 'GraphQL', 'Redis', 'Kafka', 'Linux'
  ];

  const lowerResume = resumeText.toLowerCase();
  const lowerJd = (jobDescription || '').toLowerCase();

  const foundSkills = commonTech.filter((tech) => lowerResume.includes(tech.toLowerCase()));
  const jdRequired = commonTech.filter((tech) => lowerJd.includes(tech.toLowerCase()));

  const demonstratedSkills = foundSkills.length > 0 ? foundSkills : ['Problem Solving', 'Data Structures', 'OOP'];
  const potentialGaps = jdRequired.filter((skill) => !foundSkills.includes(skill));

  if (potentialGaps.length === 0) {
    potentialGaps.push('System Scale Bottlenecks', 'Production Distributed Caching', 'Live Coding Articulation');
  }

  const matchRatio = jdRequired.length > 0
    ? (jdRequired.filter((s) => foundSkills.includes(s)).length / jdRequired.length)
    : 0.75;
  const matchScore = Math.min(Math.max(Math.round(matchRatio * 100), 45), 90);

  return {
    demonstratedSkills,
    inferredStrengths: [
      'Strong core engineering foundation and demonstrable project experience',
      'Solid familiarity with modern software development lifecycles',
      'Adaptability across full-stack component layers',
    ],
    potentialGaps,
    estimatedMatchScore: matchScore,
    scoreExplanation: `Estimated match indicator: ${matchScore}%. Evaluated against keyword and technical stack overlap for ${targetRole} at ${targetCompany}. Note: This is an estimated indicator and not a scientifically certified evaluation.`,
    recommendedActionItems: [
      `Review core architectural decisions for past projects to explain trade-offs clearly`,
      `Practice coding problems specifically in ${demonstratedSkills[0] || 'Python'} without an IDE autocomplete`,
      `Address identified gap topics (${potentialGaps.slice(0, 2).join(', ')}) during Phase 2 study`,
    ],
    tailoredInterviewTopics: [
      `${targetRole} Core Architecture & Scaling`,
      'Data Structure Manipulation & Algorithmic Complexity',
      'STAR Method Behavioral Framing of Project Challenges',
    ],
    isAiPowered: false,
  };
}
