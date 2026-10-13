import { prisma, memoryStore } from './db';
import { PlanStatus, TaskStatus, TaskPriority, TaskCategory, ActivityType } from '@prisma/client';
import crypto from 'crypto';

function generateId(): string {
  return crypto.randomUUID();
}

function useMemoryDb(): boolean {
  return Boolean(process.env.VITEST || process.env.NODE_ENV === 'test');
}

export const dbRepository = {
  // USER OPERATIONS
  async findUserByEmail(email: string) {
    if (!useMemoryDb()) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (user) return user;
      } catch {
        // Fallback
      }
    }
    for (const u of memoryStore.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return u;
      }
    }
    return null;
  },

  async findUserById(id: string) {
    if (!useMemoryDb()) {
      try {
        const user = await prisma.user.findUnique({
          where: { id },
        });
        if (user) return user;
      } catch {
        // Fallback
      }
    }
    return memoryStore.users.get(id) || null;
  },

  async createUser(data: { name: string; email: string; passwordHash: string }) {
    if (!useMemoryDb()) {
      try {
        const user = await prisma.user.create({
          data: {
            name: data.name,
            email: data.email.toLowerCase(),
            passwordHash: data.passwordHash,
          },
        });
        return user;
      } catch {
        // Fallback
      }
    }
    const newUser = {
      id: generateId(),
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.users.set(newUser.id, newUser);
    return newUser;
  },

  async deleteUser(userId: string) {
    if (!useMemoryDb()) {
      try {
        await prisma.user.delete({ where: { id: userId } });
      } catch {
        // Fallback
      }
    }
    memoryStore.users.delete(userId);
    memoryStore.profiles.delete(userId);
    for (const [planId, plan] of memoryStore.plans.entries()) {
      if (plan.userId === userId) {
        memoryStore.plans.delete(planId);
        for (const [taskId, task] of memoryStore.tasks.entries()) {
          if (task.planId === planId) {
            memoryStore.tasks.delete(taskId);
          }
        }
      }
    }
    return true;
  },

  // PROFILE OPERATIONS
  async getProfile(userId: string) {
    if (!useMemoryDb()) {
      try {
        const profile = await prisma.candidateProfile.findUnique({
          where: { userId },
        });
        if (profile) return profile;
      } catch {
        // Fallback
      }
    }
    return memoryStore.profiles.get(userId) || null;
  },

  async upsertProfile(userId: string, data: any) {
    if (!useMemoryDb()) {
      try {
        const profile = await prisma.candidateProfile.upsert({
          where: { userId },
          create: {
            userId,
            ...data,
          },
          update: {
            ...data,
          },
        });
        return profile;
      } catch {
        // Fallback
      }
    }
    const existing = memoryStore.profiles.get(userId) || {
      id: generateId(),
      userId,
      createdAt: new Date(),
    };
    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    memoryStore.profiles.set(userId, updated);
    return updated;
  },

  // PLAN OPERATIONS
  async getUserPlans(userId: string) {
    if (!useMemoryDb()) {
      try {
        const plans = await prisma.preparationPlan.findMany({
          where: { userId },
          include: {
            tasks: {
              select: {
                id: true,
                status: true,
                estimatedDuration: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        if (plans.length > 0) return plans;
      } catch {
        // Fallback
      }
    }

    const plans = [];
    for (const p of memoryStore.plans.values()) {
      if (p.userId === userId) {
        const tasks = [];
        for (const t of memoryStore.tasks.values()) {
          if (t.planId === p.id) {
            tasks.push({
              id: t.id,
              status: t.status,
              estimatedDuration: t.estimatedDuration,
            });
          }
        }
        plans.push({ ...p, tasks });
      }
    }
    plans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return plans;
  },

  async getPlanById(id: string, userId: string) {
    if (!useMemoryDb()) {
      try {
        const plan = await prisma.preparationPlan.findFirst({
          where: { id, userId },
          include: {
            tasks: {
              orderBy: [{ plannedDate: 'asc' }, { order: 'asc' }],
            },
          },
        });
        if (plan) return plan;
      } catch {
        // Fallback
      }
    }

    const plan = memoryStore.plans.get(id);
    if (!plan || plan.userId !== userId) return null;

    const tasks = [];
    for (const t of memoryStore.tasks.values()) {
      if (t.planId === id) {
        tasks.push(t);
      }
    }
    tasks.sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime() || a.order - b.order);

    return { ...plan, tasks };
  },

  async createPlan(userId: string, data: {
    title: string;
    targetCompany: string;
    targetRole: string;
    applicationSource?: string;
    interviewType?: string;
    interviewDate?: Date | null;
    planningHorizon: number;
    dailyAvailability: number;
    goals: string[];
    skillGaps: string[];
    phases?: any;
    isDemoPlan?: boolean;
    tasks: Array<{
      title: string;
      description: string;
      category: TaskCategory;
      priority: TaskPriority;
      plannedDate: Date;
      estimatedDuration: number;
      completionCriteria: string;
      resourceLinks?: string[];
      order: number;
    }>;
  }) {
    if (!useMemoryDb()) {
      try {
        const plan = await prisma.preparationPlan.create({
          data: {
            userId,
            title: data.title,
            targetCompany: data.targetCompany,
            targetRole: data.targetRole,
            applicationSource: data.applicationSource || 'referral',
            interviewType: data.interviewType || 'mixed',
            interviewDate: data.interviewDate,
            planningHorizon: data.planningHorizon,
            dailyAvailability: data.dailyAvailability,
            goals: data.goals,
            skillGaps: data.skillGaps,
            phases: data.phases || [],
            isDemoPlan: data.isDemoPlan || false,
            status: PlanStatus.ACTIVE,
            tasks: {
              create: data.tasks.map((t) => ({
                title: t.title,
                description: t.description,
                category: t.category,
                priority: t.priority,
                status: TaskStatus.TODO,
                plannedDate: t.plannedDate,
                estimatedDuration: t.estimatedDuration,
                completionCriteria: t.completionCriteria,
                resourceLinks: t.resourceLinks || [],
                order: t.order,
              })),
            },
          },
          include: {
            tasks: true,
          },
        });
        return plan;
      } catch {
        // Fallback
      }
    }

    // In-memory fallback
    const planId = generateId();
    const newPlan = {
      id: planId,
      userId,
      title: data.title,
      targetCompany: data.targetCompany,
      targetRole: data.targetRole,
      applicationSource: data.applicationSource || 'referral',
      interviewType: data.interviewType || 'mixed',
      interviewDate: data.interviewDate || null,
      planningHorizon: data.planningHorizon,
      dailyAvailability: data.dailyAvailability,
      goals: data.goals,
      skillGaps: data.skillGaps,
      phases: data.phases || [],
      isDemoPlan: data.isDemoPlan || false,
      status: PlanStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.plans.set(planId, newPlan);

    const createdTasks = [];
    for (const t of data.tasks) {
      const taskId = generateId();
      const newTask = {
        id: taskId,
        planId,
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        status: TaskStatus.TODO,
        plannedDate: t.plannedDate,
        estimatedDuration: t.estimatedDuration,
        completionCriteria: t.completionCriteria,
        notes: null,
        resourceLinks: t.resourceLinks || [],
        order: t.order,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.tasks.set(taskId, newTask);
      createdTasks.push(newTask);
    }

    return { ...newPlan, tasks: createdTasks };
  },

  async updatePlan(id: string, userId: string, data: any) {
    if (!useMemoryDb()) {
      try {
        const plan = await prisma.preparationPlan.update({
          where: { id, userId },
          data: {
            ...data,
            updatedAt: new Date(),
          },
        });
        return plan;
      } catch {
        // Fallback
      }
    }

    const plan = memoryStore.plans.get(id);
    if (!plan || plan.userId !== userId) return null;
    const updated = { ...plan, ...data, updatedAt: new Date() };
    memoryStore.plans.set(id, updated);
    return updated;
  },

  async deletePlan(id: string, userId: string) {
    if (!useMemoryDb()) {
      try {
        await prisma.preparationPlan.delete({
          where: { id, userId },
        });
        return true;
      } catch {
        // Fallback
      }
    }

    const plan = memoryStore.plans.get(id);
    if (!plan || plan.userId !== userId) return false;
    memoryStore.plans.delete(id);
    for (const [taskId, task] of memoryStore.tasks.entries()) {
      if (task.planId === id) {
        memoryStore.tasks.delete(taskId);
      }
    }
    return true;
  },

  // TASK OPERATIONS
  async getUserTasks(userId: string, filters?: {
    status?: TaskStatus;
    category?: TaskCategory;
    priority?: TaskPriority;
    planId?: string;
    isToday?: boolean;
  }) {
    if (!useMemoryDb()) {
      try {
        const whereClause: any = {
          plan: { userId },
        };

        if (filters?.planId) whereClause.planId = filters.planId;
        if (filters?.status) whereClause.status = filters.status;
        if (filters?.category) whereClause.category = filters.category;
        if (filters?.priority) whereClause.priority = filters.priority;

        if (filters?.isToday) {
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date();
          endOfDay.setHours(23, 59, 59, 999);
          whereClause.plannedDate = {
            gte: startOfDay,
            lte: endOfDay,
          };
        }

        const tasks = await prisma.preparationTask.findMany({
          where: whereClause,
          include: {
            plan: {
              select: {
                id: true,
                title: true,
                targetCompany: true,
                targetRole: true,
              },
            },
          },
          orderBy: [{ plannedDate: 'asc' }, { order: 'asc' }],
        });
        if (tasks.length > 0) return tasks;
      } catch {
        // Fallback
      }
    }

    const tasks = [];
    const today = new Date().toDateString();

    for (const t of memoryStore.tasks.values()) {
      const plan = memoryStore.plans.get(t.planId);
      if (!plan || plan.userId !== userId) continue;

      if (filters?.planId && t.planId !== filters.planId) continue;
      if (filters?.status && t.status !== filters.status) continue;
      if (filters?.category && t.category !== filters.category) continue;
      if (filters?.priority && t.priority !== filters.priority) continue;

      if (filters?.isToday) {
        if (new Date(t.plannedDate).toDateString() !== today) continue;
      }

      tasks.push({
        ...t,
        plan: {
          id: plan.id,
          title: plan.title,
          targetCompany: plan.targetCompany,
          targetRole: plan.targetRole,
        },
      });
    }

    tasks.sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime() || a.order - b.order);
    return tasks;
  },

  async getTaskById(id: string, userId?: string) {
    if (!useMemoryDb()) {
      try {
        const task = await prisma.preparationTask.findUnique({
          where: { id },
          include: {
            plan: true,
            activities: {
              orderBy: { timestamp: 'desc' },
            },
          },
        });
        if (task) {
          if (userId && task.plan.userId !== userId) return null;
          return task;
        }
      } catch {
        // Fallback
      }
    }

    const task = memoryStore.tasks.get(id);
    if (!task) return null;
    const plan = memoryStore.plans.get(task.planId);
    if (userId && (!plan || plan.userId !== userId)) return null;

    const activities = [];
    for (const a of memoryStore.activities.values()) {
      if (a.taskId === id) activities.push(a);
    }
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return { ...task, plan, activities };
  },

  async createTask(userId: string, data: {
    planId: string;
    title: string;
    description: string;
    category: TaskCategory;
    priority: TaskPriority;
    plannedDate: Date;
    estimatedDuration: number;
    completionCriteria: string;
    notes?: string;
  }) {
    const plan = await this.getPlanById(data.planId, userId);
    if (!plan) throw new Error('Plan not found or unauthorized');

    if (!useMemoryDb()) {
      try {
        const task = await prisma.preparationTask.create({
          data: {
            planId: data.planId,
            title: data.title,
            description: data.description,
            category: data.category,
            priority: data.priority,
            status: TaskStatus.TODO,
            plannedDate: data.plannedDate,
            estimatedDuration: data.estimatedDuration,
            completionCriteria: data.completionCriteria,
            notes: data.notes || null,
          },
        });
        return task;
      } catch {
        // Fallback
      }
    }

    const taskId = generateId();
    const newTask = {
      id: taskId,
      planId: data.planId,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: TaskStatus.TODO,
      plannedDate: data.plannedDate,
      estimatedDuration: data.estimatedDuration,
      completionCriteria: data.completionCriteria,
      notes: data.notes || null,
      resourceLinks: [],
      order: 99,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.tasks.set(taskId, newTask);
    return newTask;
  },

  async updateTask(id: string, userId: string, data: any) {
    const existing = await this.getTaskById(id, userId);
    if (!existing) return null;

    const completedAt = data.status === TaskStatus.COMPLETED ? (existing.completedAt || new Date()) : (data.status ? null : existing.completedAt);

    if (!useMemoryDb()) {
      try {
        const task = await prisma.preparationTask.update({
          where: { id },
          data: {
            ...data,
            completedAt,
            updatedAt: new Date(),
          },
        });

        if (data.status && data.status !== existing.status) {
          await this.recordTaskActivity(id, data.status === TaskStatus.COMPLETED ? ActivityType.COMPLETED : ActivityType.UPDATED);
        }

        return task;
      } catch {
        // Fallback
      }
    }

    const updated = {
      ...existing,
      ...data,
      completedAt,
      updatedAt: new Date(),
    };
    memoryStore.tasks.set(id, updated);

    if (data.status && data.status !== existing.status) {
      await this.recordTaskActivity(id, data.status === TaskStatus.COMPLETED ? ActivityType.COMPLETED : ActivityType.UPDATED);
    }

    return updated;
  },

  async deleteTask(id: string, userId: string) {
    const existing = await this.getTaskById(id, userId);
    if (!existing) return false;

    if (!useMemoryDb()) {
      try {
        await prisma.preparationTask.delete({ where: { id } });
        return true;
      } catch {
        // Fallback
      }
    }

    memoryStore.tasks.delete(id);
    return true;
  },

  async recordTaskActivity(taskId: string, activityType: ActivityType, metadata?: any) {
    if (!useMemoryDb()) {
      try {
        await prisma.taskActivity.create({
          data: {
            taskId,
            activityType,
            metadata: metadata || null,
          },
        });
        return;
      } catch {
        // Fallback
      }
    }

    const actId = generateId();
    memoryStore.activities.set(actId, {
      id: actId,
      taskId,
      activityType,
      timestamp: new Date(),
      metadata: metadata || null,
    });
  },

  async getUserAnalytics(userId: string) {
    const tasks = await this.getUserTasks(userId);
    const plans = await this.getUserPlans(userId);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === TaskStatus.COMPLETED).length;
    const inProgressTasks = tasks.filter((t: any) => t.status === TaskStatus.IN_PROGRESS).length;
    const todoTasks = tasks.filter((t: any) => t.status === TaskStatus.TODO).length;

    const now = new Date();
    const overdueTasks = tasks.filter((t: any) => {
      return (
        (t.status === TaskStatus.TODO || t.status === TaskStatus.IN_PROGRESS) &&
        new Date(t.plannedDate) < new Date(now.getFullYear(), now.getMonth(), now.getDate())
      );
    }).length;

    const todayStr = now.toDateString();
    const todayTasks = tasks.filter((t: any) => new Date(t.plannedDate).toDateString() === todayStr);
    const todayPlannedMinutes = todayTasks.reduce((acc: number, t: any) => acc + (t.estimatedDuration || 0), 0);
    const todayCompletedMinutes = todayTasks
      .filter((t: any) => t.status === TaskStatus.COMPLETED)
      .reduce((acc: number, t: any) => acc + (t.estimatedDuration || 0), 0);

    const totalEstimatedMinutes = tasks.reduce((acc: number, t: any) => acc + (t.estimatedDuration || 0), 0);
    const completedMinutes = tasks
      .filter((t: any) => t.status === TaskStatus.COMPLETED)
      .reduce((acc: number, t: any) => acc + (t.estimatedDuration || 0), 0);

    // Category breakdown
    const categoryCounts: Record<string, { total: number; completed: number }> = {};
    for (const t of tasks) {
      const cat = t.category;
      if (!categoryCounts[cat]) {
        categoryCounts[cat] = { total: 0, completed: 0 };
      }
      categoryCounts[cat].total += 1;
      if (t.status === TaskStatus.COMPLETED) {
        categoryCounts[cat].completed += 1;
      }
    }

    // Weekly completion counts for previous 7 days
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toDateString();

      const dayCompleted = tasks.filter(
        (t: any) => t.completedAt && new Date(t.completedAt).toDateString() === dateStr
      ).length;

      const dayPlanned = tasks.filter(
        (t: any) => new Date(t.plannedDate).toDateString() === dateStr
      ).length;

      weeklyData.push({
        day: dayName,
        date: d.toISOString().split('T')[0],
        completed: dayCompleted,
        planned: dayPlanned,
      });
    }

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      todayTasksCount: todayTasks.length,
      todayPlannedMinutes,
      todayCompletedMinutes,
      totalEstimatedMinutes,
      completedMinutes,
      completionRate,
      activePlansCount: plans.filter((p: any) => p.status === PlanStatus.ACTIVE).length,
      categoryCounts,
      weeklyData,
    };
  },
};
