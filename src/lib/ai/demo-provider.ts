import { PlanGenerationInput, AIGeneratedPlan, AIGeneratedTask } from '../validations';

export function generateDemoPlan(input: PlanGenerationInput): AIGeneratedPlan {
  const company = input.targetCompany.trim() || 'Tech Enterprise';
  const role = input.targetRole.trim() || 'Software Engineer';
  const horizon = input.planningHorizonDays || 30;
  const dailyHours = input.dailyStudyHours || 3;
  const lang = input.primaryLanguages[0] || 'Python';
  const priorities = input.preparationPriorities || ['DSA', 'System Design'];

  const maxDailyMinutes = Math.min(Math.round(dailyHours * 60), 360);
  const taskDuration = Math.min(Math.max(Math.round(maxDailyMinutes / 2), 45), 120);

  // Determine phases based on horizon
  const phase1End = Math.max(Math.floor(horizon * 0.3), 3);
  const phase2End = Math.max(Math.floor(horizon * 0.7), phase1End + 3);

  const phases = [
    {
      name: 'Phase 1: Foundations & Core Revision',
      focus: `Revisiting core algorithms, data structures in ${lang}, and identifying initial gaps.`,
      startDay: 1,
      endDay: phase1End,
    },
    {
      name: 'Phase 2: High-Yield Practice & Architecture',
      focus: `Focusing on ${company} interview archetypes, system architecture, and complex problems.`,
      startDay: phase1End + 1,
      endDay: phase2End,
    },
    {
      name: 'Phase 3: Mock Interviews & Behavioral Polish',
      focus: 'Simulating timed mock interviews, behavioral STAR responses, and final revision.',
      startDay: phase2End + 1,
      endDay: horizon,
    },
  ];

  const goals = [
    `Master high-probability data structures & patterns frequently tested at ${company}`,
    `Develop structured communication and problem-solving velocity in ${lang}`,
    `Prepare compelling STAR behavioral stories highlighting past project impact`,
    `Build confidence under timed, realistic interview conditions`,
  ];

  const skillGaps = input.improvementAreas.length > 0
    ? input.improvementAreas
    : ['Dynamic Programming & Graph Traversal', 'System Scalability Trade-offs', 'Timed live coding articulation'];

  // Base task library tailored to the candidate
  const taskTemplates = [
    {
      title: `${lang} Syntax & Time Complexity Benchmark`,
      description: `Review memory management, hash map implementations, and benchmark O(1) vs O(N) operations in ${lang}.`,
      category: 'LANGUAGE' as const,
      priority: 'HIGH' as const,
      completionCriteria: `Write and analyze 3 core data structures from scratch in ${lang}.`,
      resourceLinks: ['NeetCode 150 Core Patterns', `${lang} Official Documentation`],
    },
    {
      title: 'Two Pointers & Sliding Window Mastery',
      description: `Solve canonical array and string problems common in ${company} coding assessments.`,
      category: 'DSA' as const,
      priority: 'HIGH' as const,
      completionCriteria: 'Solve 3 LeetCode Medium problems; achieve optimal space complexity.',
      resourceLinks: ['LeetCode Array/String Tagged', 'Blind 75 Curated'],
    },
    {
      title: 'Binary Trees & BFS/DFS Traversal Drill',
      description: 'Practice recursive and iterative tree traversals, level-order processing, and path-sum variants.',
      category: 'DSA' as const,
      priority: 'HIGH' as const,
      completionCriteria: 'Complete 3 Tree traversal challenges without looking at solutions.',
      resourceLinks: ['NeetCode Trees Walkthrough'],
    },
    {
      title: 'Operating Systems & Concurrency Review',
      description: `Understand process vs threads, mutexes, deadlock conditions, and how ${company} evaluates core CS fundamentals.`,
      category: 'CORE_CS' as const,
      priority: 'MEDIUM' as const,
      completionCriteria: 'Summarize thread synchronization primitives and virtual memory paging.',
      resourceLinks: ['OSTEP - Operating Systems Notes'],
    },
    {
      title: 'Binary Search & Monotonic Conditions',
      description: 'Master binary search on rotated sorted arrays and monotonic solution spaces.',
      category: 'DSA' as const,
      priority: 'HIGH' as const,
      completionCriteria: 'Solve Search in Rotated Sorted Array and Koko Eating Bananas.',
      resourceLinks: ['Top Interview 150'],
    },
    {
      title: 'Graphs: Topological Sort & Disjoint Set',
      description: 'Deep dive into cycle detection in directed graphs, Course Schedule problems, and Union-Find.',
      category: 'DSA' as const,
      priority: 'HIGH' as const,
      completionCriteria: 'Implement Union-Find with path compression; solve Course Schedule I & II.',
      resourceLinks: ['Graph Theory Algorithms Playlist'],
    },
    {
      title: 'System Design Foundations: Caching & DB Sharding',
      description: `Analyze Redis caching strategies (Cache-aside, Write-through), SQL vs NoSQL, and CAP theorem trade-offs.`,
      category: 'SYSTEM_DESIGN' as const,
      priority: 'MEDIUM' as const,
      completionCriteria: 'Diagram a distributed cache layer with cache invalidation policies.',
      resourceLinks: ['System Design Primer', 'ByteByteGo Visual Guides'],
    },
    {
      title: 'Dynamic Programming: 1D & 2D Subproblems',
      description: 'Solve classic knapsack, coin change, and longest increasing subsequence using memoization and tabulation.',
      category: 'DSA' as const,
      priority: 'HIGH' as const,
      completionCriteria: 'Write bottom-up DP for Coin Change and Longest Common Subsequence.',
      resourceLinks: ['NeetCode DP Playlist'],
    },
    {
      title: `${company} Product & Architecture Teardown`,
      description: `Research ${company}'s core technical stack, engineering blogs, and public architectural decisions.`,
      category: 'SYSTEM_DESIGN' as const,
      priority: 'MEDIUM' as const,
      completionCriteria: 'Write a 1-page breakdown of how a primary product feature at the company operates at scale.',
      resourceLinks: [`${company} Engineering Blog`],
    },
    {
      title: 'Behavioral Preparation: Leadership & Conflict Resolution',
      description: 'Formulate 4 distinct STAR-method stories covering technical disagreements, failure/learning, and ownership.',
      category: 'BEHAVIORAL' as const,
      priority: 'HIGH' as const,
      completionCriteria: 'Record yourself answering "Tell me about a time a project missed deadline" in under 3 minutes.',
      resourceLinks: ['Amazon Leadership Principles / Standard STAR Matrix'],
    },
    {
      title: 'Full Technical Mock Interview #1',
      description: 'Conduct a timed 45-minute live coding session with a peer or interview simulator.',
      category: 'MOCK_INTERVIEW' as const,
      priority: 'HIGH' as const,
      completionCriteria: 'Complete 2 unseen Medium coding questions with verbal clarification and test cases within 45 mins.',
      resourceLinks: ['Pramp / Interviewing.io guidelines'],
    },
    {
      title: 'Resume Project Deep-Dive & Edge Cases',
      description: 'Prepare to defend every bullet point on your resume, architectural choices, and technical trade-offs.',
      category: 'RESUME' as const,
      priority: 'MEDIUM' as const,
      completionCriteria: 'Write out answers to "What would you redesign if traffic increased 100x?" for your top project.',
      resourceLinks: ['Resume Technical Defense Checklist'],
    },
    {
      title: 'System Design: Design a Rate Limiter or URL Shortener',
      description: 'Conduct an end-to-end 45-minute design session: requirements, estimation, API, data schema, scale bottlenecks.',
      category: 'SYSTEM_DESIGN' as const,
      priority: 'HIGH' as const,
      completionCriteria: 'Draft complete design doc with QPS calculations and Redis sliding window rate limiting.',
      resourceLinks: ['System Design Interview by Alex Xu'],
    },
    {
      title: 'Weak Spot Speed Revision Drill',
      description: `Target the specific areas noted in profile: ${skillGaps.slice(0, 2).join(' & ')}.`,
      category: 'REVISION' as const,
      priority: 'HIGH' as const,
      completionCriteria: 'Solve 3 problems in your historically slowest topic under strict 20-minute timers.',
      resourceLinks: ['Blind 75 Revision List'],
    },
    {
      title: 'Final Mock Interview #2 & Behavioral Polish',
      description: 'Simulate the full loop: 35 minutes algorithmic problem solving + 15 minutes cultural/behavioral questions.',
      category: 'MOCK_INTERVIEW' as const,
      priority: 'HIGH' as const,
      completionCriteria: 'Produce clean, modular code with zero syntax errors on the first test run.',
      resourceLinks: ['Knight AI Mock Interview Rubric'],
    },
    {
      title: 'Interview Day Strategy & Mental Warmup',
      description: 'Review cheat sheets, prepare clarifying questions for the interviewers, and plan rest schedule.',
      category: 'OTHER' as const,
      priority: 'MEDIUM' as const,
      completionCriteria: 'Prepare 5 insightful questions to ask the interviewer regarding team architecture and roadmap.',
      resourceLinks: ['Reverse Interviewing Questions for Engineers'],
    },
  ];

  // Distribute tasks across the candidate's horizon
  const taskCount = Math.min(Math.max(Math.floor(horizon * 0.6), 8), taskTemplates.length);
  const tasks: AIGeneratedTask[] = [];

  for (let i = 0; i < taskCount; i++) {
    const template = taskTemplates[i % taskTemplates.length];
    // Calculate day offset
    const dayOffset = Math.min(Math.max(Math.round(((i + 1) / taskCount) * horizon), 1), horizon);

    tasks.push({
      title: template.title,
      description: template.description,
      category: template.category,
      priority: template.priority,
      estimatedDuration: taskDuration,
      dayOffset,
      completionCriteria: template.completionCriteria,
      resourceLinks: template.resourceLinks,
      order: i + 1,
    });
  }

  // Ensure unique day ordering
  tasks.sort((a, b) => a.dayOffset - b.dayOffset || a.order - b.order);

  return {
    title: `${company} ${role} Personalized Roadmap (${horizon} Days)`,
    targetRole: role,
    targetCompany: company,
    planningHorizon: horizon,
    description: `A targeted ${horizon}-day sprint structured specifically for ${role} candidates at ${company}. Tailored around ${dailyHours} hours/day study capacity with focus on ${priorities.join(' and ')}.`,
    goals,
    skillGaps,
    phases,
    tasks,
    aiDisclaimer: 'Generated using Knight AI Deterministic Preparation Engine (Demo Mode). Add your GEMINI_API_KEY to unlock dynamic Google Gemini 1.5 Flash generation.',
  };
}
