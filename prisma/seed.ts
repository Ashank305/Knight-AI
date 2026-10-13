import { hashPassword } from '../src/lib/auth';
import { dbRepository } from '../src/lib/repository';
import { generateDemoPlan } from '../src/lib/ai/demo-provider';
import { TaskStatus } from '@prisma/client';

export async function runSeed() {
  console.log('Seeding Knight AI demo environment...');

  const demoEmail = 'demo@knightai.dev';
  const existingUser = await dbRepository.findUserByEmail(demoEmail);

  let userId: string;
  if (!existingUser) {
    const passwordHash = await hashPassword('Password123!');
    const user = await dbRepository.createUser({
      name: 'Alex Mercer',
      email: demoEmail,
      passwordHash,
    });
    userId = user.id;
    console.log(`Created demo user: ${demoEmail} (Password: Password123!)`);
  } else {
    userId = existingUser.id;
    console.log(`Demo user already exists: ${demoEmail}`);
  }

  // Create Profile
  await dbRepository.upsertProfile(userId, {
    educationLevel: "Bachelor's in Computer Science",
    experienceLevel: 'Entry Level (0-2 years)',
    targetRole: 'Software Engineer',
    primaryLanguages: ['Python', 'TypeScript'],
    existingSkills: ['Python', 'Data Structures', 'REST APIs', 'SQL', 'Git'],
    improvementAreas: ['Dynamic Programming', 'System Design Scalability', 'Behavioral Articulation'],
    dailyStudyHours: 3.5,
    preferredDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    preferredTaskDuration: 60,
  });

  // Check if plans exist
  const existingPlans = await dbRepository.getUserPlans(userId);
  if (existingPlans.length === 0) {
    const generated = generateDemoPlan({
      targetCompany: 'Google',
      targetRole: 'Software Engineer',
      roleCategory: 'Software Engineering',
      interviewType: 'mixed',
      applicationSource: 'referral',
      educationLevel: "Bachelor's in Computer Science",
      experienceLevel: 'Entry Level',
      primaryLanguages: ['Python', 'TypeScript'],
      existingSkills: ['Data Structures', 'Python', 'SQL'],
      confidenceAreas: ['Arrays', 'HashMaps'],
      improvementAreas: ['Dynamic Programming', 'System Design Scalability'],
      planningHorizonDays: 21,
      dailyStudyHours: 3.5,
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      preparationPriorities: ['DSA', 'System Design', 'Behavioral'],
      hasConfirmedDate: false,
    });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 3); // Started 3 days ago for realistic history!

    const tasks = generated.tasks.map((t, idx) => {
      const plannedDate = new Date(startDate);
      plannedDate.setDate(startDate.getDate() + (t.dayOffset || 1) - 1);

      return {
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        plannedDate,
        estimatedDuration: t.estimatedDuration,
        completionCriteria: t.completionCriteria,
        resourceLinks: t.resourceLinks,
        order: idx + 1,
      };
    });

    const plan = await dbRepository.createPlan(userId, {
      title: 'Google Software Engineer Referral Roadmap (21 Days)',
      targetCompany: 'Google',
      targetRole: 'Software Engineer',
      applicationSource: 'referral',
      interviewType: 'mixed',
      planningHorizon: 21,
      dailyAvailability: 3.5,
      goals: generated.goals,
      skillGaps: generated.skillGaps,
      phases: generated.phases,
      isDemoPlan: true,
      tasks,
    });

    // Mark the first 3 tasks as COMPLETED with past completion timestamps for real analytics
    const planTasks = await dbRepository.getUserTasks(userId, { planId: plan.id });
    for (let i = 0; i < Math.min(3, planTasks.length); i++) {
      const task = planTasks[i];
      const compDate = new Date();
      compDate.setDate(compDate.getDate() - (3 - i));
      await dbRepository.updateTask(task.id, userId, {
        status: TaskStatus.COMPLETED,
        completedAt: compDate,
      });
    }

    console.log(`Created sample plan with ${tasks.length} tasks and realistic completion history.`);
  }

  console.log('Seed completed successfully.');
}

if (require.main === module) {
  runSeed().catch(console.error);
}
