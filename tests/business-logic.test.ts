import { describe, it, expect, beforeEach } from 'vitest';
import {
  planGenerationInputSchema,
  aiGeneratedPlanSchema,
  registerSchema,
  loginSchema,
} from '../src/lib/validations';
import { generateDemoPlan } from '../src/lib/ai/demo-provider';
import { computeAdaptiveReplan } from '../src/lib/ai/replanner';
import { hashPassword, comparePassword } from '../src/lib/auth';
import { dbRepository } from '../src/lib/repository';
import { memoryStore } from '../src/lib/db';
import { TaskStatus } from '@prisma/client';

describe('Knight AI Business Logic & Test Suite', () => {
  beforeEach(() => {
    // Clear in-memory mock store before tests
    memoryStore.users.clear();
    memoryStore.profiles.clear();
    memoryStore.plans.clear();
    memoryStore.tasks.clear();
    memoryStore.activities.clear();
  });

  describe('1. Authentication & Security', () => {
    it('hashes passwords securely and verifies correctly', async () => {
      const rawPassword = 'SuperSecurePassword123!';
      const hash = await hashPassword(rawPassword);

      expect(hash).not.toBe(rawPassword);
      expect(hash.length).toBeGreaterThan(20);

      const isValid = await comparePassword(rawPassword, hash);
      expect(isValid).toBe(true);

      const isInvalid = await comparePassword('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });

    it('validates user registration schema constraints', () => {
      const valid = registerSchema.safeParse({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'ValidPassword123',
      });
      expect(valid.success).toBe(true);

      const shortPassword = registerSchema.safeParse({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: '123',
      });
      expect(shortPassword.success).toBe(false);

      const invalidEmail = registerSchema.safeParse({
        name: 'Jane Doe',
        email: 'not-an-email',
        password: 'ValidPassword123',
      });
      expect(invalidEmail.success).toBe(false);
    });
  });

  describe('2. Plan Generation Schema & Constraints', () => {
    it('validates input parameters for plan generation', () => {
      const validParams = {
        targetCompany: 'Google',
        targetRole: 'Software Engineer',
        roleCategory: 'Software Engineering',
        interviewType: 'mixed',
        applicationSource: 'referral',
        educationLevel: "Bachelor's Degree",
        experienceLevel: 'Entry Level',
        primaryLanguages: ['Python', 'TypeScript'],
        existingSkills: ['Algorithms', 'Python'],
        confidenceAreas: ['Arrays'],
        improvementAreas: ['Dynamic Programming'],
        planningHorizonDays: 30,
        dailyStudyHours: 3.5,
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        preparationPriorities: ['DSA', 'System Design'],
      };

      const result = planGenerationInputSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('generates a personalized demo plan matching candidate constraints', () => {
      const horizon = 21;
      const dailyHours = 2.5;

      const plan = generateDemoPlan({
        targetCompany: 'Stripe',
        targetRole: 'Backend Engineer',
        roleCategory: 'Backend',
        interviewType: 'coding',
        applicationSource: 'direct',
        educationLevel: 'B.S. CS',
        experienceLevel: 'Entry',
        primaryLanguages: ['Java'],
        existingSkills: ['Java', 'SQL'],
        confidenceAreas: [],
        improvementAreas: ['System Design', 'Concurrency'],
        planningHorizonDays: horizon,
        dailyStudyHours: dailyHours,
        availableDays: ['Mon', 'Wed', 'Fri'],
        preparationPriorities: ['System Design'],
        hasConfirmedDate: false,
      });

      // Verify schema compliance
      const validated = aiGeneratedPlanSchema.safeParse(plan);
      expect(validated.success).toBe(true);

      // Verify constraints
      expect(plan.targetCompany).toBe('Stripe');
      expect(plan.targetRole).toBe('Backend Engineer');
      expect(plan.planningHorizon).toBe(horizon);
      expect(plan.tasks.length).toBeGreaterThan(5);

      // Verify daily task workload does not exceed candidate daily limit
      for (const t of plan.tasks) {
        expect(t.estimatedDuration).toBeLessThanOrEqual(dailyHours * 60);
        expect(t.dayOffset).toBeGreaterThanOrEqual(1);
        expect(t.dayOffset).toBeLessThanOrEqual(horizon);
      }
    });
  });

  describe('3. Task Management & Completion Workflow', () => {
    it('tracks task completion and updates analytics correctly', async () => {
      // Create user
      const user = await dbRepository.createUser({
        name: 'Test Candidate',
        email: 'test@candidate.com',
        passwordHash: 'dummyhash',
      });

      // Create plan with 4 tasks
      const today = new Date();
      const plan = await dbRepository.createPlan(user.id, {
        title: 'Interview Roadmap',
        targetCompany: 'Meta',
        targetRole: 'Product Engineer',
        planningHorizon: 14,
        dailyAvailability: 3,
        goals: ['Goal 1'],
        skillGaps: ['Gap 1'],
        tasks: [
          {
            title: 'Task 1',
            description: 'Desc 1',
            category: 'DSA',
            priority: 'HIGH',
            plannedDate: today,
            estimatedDuration: 60,
            completionCriteria: 'Criteria 1',
            order: 1,
          },
          {
            title: 'Task 2',
            description: 'Desc 2',
            category: 'SYSTEM_DESIGN',
            priority: 'MEDIUM',
            plannedDate: today,
            estimatedDuration: 60,
            completionCriteria: 'Criteria 2',
            order: 2,
          },
        ],
      });

      const tasks = await dbRepository.getUserTasks(user.id, { planId: plan.id });
      expect(tasks.length).toBe(2);

      // Initially 0% completed
      let analytics = await dbRepository.getUserAnalytics(user.id);
      expect(analytics.completedTasks).toBe(0);
      expect(analytics.completionRate).toBe(0);

      // Mark first task completed
      const updated = await dbRepository.updateTask(tasks[0].id, user.id, {
        status: TaskStatus.COMPLETED,
      });
      expect(updated.status).toBe(TaskStatus.COMPLETED);
      expect(updated.completedAt).not.toBeNull();

      // Check analytics updated
      analytics = await dbRepository.getUserAnalytics(user.id);
      expect(analytics.completedTasks).toBe(1);
      expect(analytics.completionRate).toBe(50);

      // Reopen task
      const reopened = await dbRepository.updateTask(tasks[0].id, user.id, {
        status: TaskStatus.TODO,
      });
      expect(reopened.status).toBe(TaskStatus.TODO);
      expect(reopened.completedAt).toBeNull();

      analytics = await dbRepository.getUserAnalytics(user.id);
      expect(analytics.completedTasks).toBe(0);
      expect(analytics.completionRate).toBe(0);
    });
  });

  describe('4. Adaptive Replanning Engine', () => {
    it('preserves completed tasks 100% intact when replanning', async () => {
      const today = new Date();
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - 3);

      const fakePlan = {
        id: 'plan-123',
        targetCompany: 'Amazon',
        targetRole: 'SDE II',
        planningHorizon: 20,
        dailyAvailability: 3,
      };

      const tasks = [
        {
          id: 'task-1-done',
          title: 'Completed Task',
          status: 'COMPLETED',
          priority: 'HIGH',
          category: 'DSA',
          plannedDate: pastDate,
          estimatedDuration: 60,
        },
        {
          id: 'task-2-overdue',
          title: 'Overdue Task',
          status: 'TODO',
          priority: 'HIGH',
          category: 'SYSTEM_DESIGN',
          plannedDate: pastDate,
          estimatedDuration: 60,
        },
        {
          id: 'task-3-upcoming',
          title: 'Upcoming Task',
          status: 'TODO',
          priority: 'MEDIUM',
          category: 'BEHAVIORAL',
          plannedDate: today,
          estimatedDuration: 60,
        },
      ];

      const replanPreview = await computeAdaptiveReplan({
        plan: fakePlan,
        tasks,
        newDailyHours: 3,
      });

      // Verify completed tasks are strictly preserved and never rescheduled
      expect(replanPreview.completedPreservedCount).toBe(1);
      const rescheduledTaskIds = replanPreview.rescheduledTasks.map((t) => t.taskId);
      expect(rescheduledTaskIds).not.toContain('task-1-done');
      expect(rescheduledTaskIds).toContain('task-2-overdue');
      expect(rescheduledTaskIds).toContain('task-3-upcoming');
    });

    it('respects daily capacity and defers lower priority tasks if capacity is exceeded', async () => {
      const today = new Date();

      const tightPlan = {
        id: 'plan-tight',
        targetCompany: 'Apple',
        targetRole: 'iOS Engineer',
        planningHorizon: 2, // Only 2 remaining days!
        dailyAvailability: 1, // Only 1 hr (60 mins) per day = 120 mins capacity total
      };

      // 4 tasks requiring 60 mins each = 240 mins total workload (exceeds 120 mins capacity)
      const tasks = [
        {
          id: 't1',
          title: 'High Priority DSA',
          status: 'TODO',
          priority: 'HIGH',
          category: 'DSA',
          plannedDate: today,
          estimatedDuration: 60,
        },
        {
          id: 't2',
          title: 'High Priority Architecture',
          status: 'TODO',
          priority: 'HIGH',
          category: 'SYSTEM_DESIGN',
          plannedDate: today,
          estimatedDuration: 60,
        },
        {
          id: 't3',
          title: 'Low Priority Review',
          status: 'TODO',
          priority: 'LOW',
          category: 'OTHER',
          plannedDate: today,
          estimatedDuration: 60,
        },
        {
          id: 't4',
          title: 'Low Priority Trivia',
          status: 'TODO',
          priority: 'LOW',
          category: 'OTHER',
          plannedDate: today,
          estimatedDuration: 60,
        },
      ];

      const preview = await computeAdaptiveReplan({
        plan: tightPlan,
        tasks,
        newDailyHours: 1,
      });

      // Low priority tasks should be deferred to protect candidate study limits
      expect(preview.deferredTasks.length).toBeGreaterThan(0);
      expect(preview.deferredTasks[0].priority).toBe('LOW');
    });
  });

  describe('5. Authorization & Multi-User Isolation', () => {
    it('ensures users can only access their own plans and tasks', async () => {
      const userA = await dbRepository.createUser({
        name: 'User A',
        email: 'userA@example.com',
        passwordHash: 'hashA',
      });

      const userB = await dbRepository.createUser({
        name: 'User B',
        email: 'userB@example.com',
        passwordHash: 'hashB',
      });

      const planA = await dbRepository.createPlan(userA.id, {
        title: "User A's Secret Plan",
        targetCompany: 'Company A',
        targetRole: 'Role A',
        planningHorizon: 30,
        dailyAvailability: 2,
        goals: ['Goal A'],
        skillGaps: [],
        tasks: [
          {
            title: "Task for User A",
            description: "Desc",
            category: "DSA",
            priority: "HIGH",
            plannedDate: new Date(),
            estimatedDuration: 60,
            completionCriteria: "Complete",
            order: 1,
          },
        ],
      });

      // User A can access plan A
      const fetchedByA = await dbRepository.getPlanById(planA.id, userA.id);
      expect(fetchedByA).not.toBeNull();
      expect(fetchedByA?.title).toBe("User A's Secret Plan");

      // User B CANNOT access plan A
      const fetchedByB = await dbRepository.getPlanById(planA.id, userB.id);
      expect(fetchedByB).toBeNull();
    });
  });
});
