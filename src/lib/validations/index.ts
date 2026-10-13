import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const candidateProfileSchema = z.object({
  educationLevel: z.string().optional(),
  experienceLevel: z.string().optional(),
  targetRole: z.string().optional(),
  primaryLanguages: z.array(z.string()).default([]),
  existingSkills: z.array(z.string()).default([]),
  confidenceAreas: z.array(z.string()).default([]),
  improvementAreas: z.array(z.string()).default([]),
  dailyStudyHours: z.number().min(0.5).max(16).default(3),
  preferredDays: z.array(z.string()).default([]),
  preferredTaskDuration: z.number().min(15).max(240).default(60),
});

export const planGenerationInputSchema = z.object({
  targetCompany: z.string().min(1, 'Target company is required'),
  targetRole: z.string().min(1, 'Target role is required'),
  roleCategory: z.string().default('Software Engineering'),
  interviewType: z.enum(['coding', 'technical', 'behavioral', 'system_design', 'hr', 'mixed']).default('mixed'),
  applicationSource: z.enum(['referral', 'direct', 'campus', 'internship', 'other']).default('referral'),
  referralDetails: z.string().optional(),
  educationLevel: z.string().default('Bachelor\'s Degree'),
  experienceLevel: z.string().default('Entry Level (0-2 years)'),
  primaryLanguages: z.array(z.string()).default(['Python', 'JavaScript']),
  existingSkills: z.array(z.string()).default([]),
  confidenceAreas: z.array(z.string()).default([]),
  improvementAreas: z.array(z.string()).default([]),
  interviewDate: z.string().optional().nullable(),
  hasConfirmedDate: z.boolean().default(false),
  planningHorizonDays: z.number().min(7).max(90).default(30),
  dailyStudyHours: z.number().min(0.5).max(12).default(3),
  availableDays: z.array(z.string()).default(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  preparationPriorities: z.array(z.string()).default(['DSA', 'System Design', 'Behavioral']),
  resumeText: z.string().optional(),
});

export const taskCategorySchema = z.enum([
  'DSA',
  'CORE_CS',
  'LANGUAGE',
  'SYSTEM_DESIGN',
  'PROJECTS',
  'RESUME',
  'BEHAVIORAL',
  'MOCK_INTERVIEW',
  'REVISION',
  'OTHER',
]);

export const taskPrioritySchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);
export const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']);

export const aiGeneratedTaskSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10),
  category: taskCategorySchema,
  priority: taskPrioritySchema,
  estimatedDuration: z.number().min(15).max(360), // minutes
  dayOffset: z.number().min(1), // day 1, 2, ... within planning horizon
  completionCriteria: z.string().min(5),
  resourceLinks: z.array(z.string()).default([]),
  order: z.number().default(0),
});

export const aiGeneratedPlanSchema = z.object({
  title: z.string().min(5),
  targetRole: z.string(),
  targetCompany: z.string(),
  planningHorizon: z.number(),
  description: z.string(),
  goals: z.array(z.string()).min(1),
  skillGaps: z.array(z.string()).default([]),
  phases: z.array(
    z.object({
      name: z.string(),
      focus: z.string(),
      startDay: z.number(),
      endDay: z.number(),
    })
  ).default([]),
  tasks: z.array(aiGeneratedTaskSchema).min(3),
  aiDisclaimer: z.string().optional(),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: taskCategorySchema.optional(),
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
  plannedDate: z.string().optional(),
  estimatedDuration: z.number().min(10).max(480).optional(),
  completionCriteria: z.string().optional(),
  notes: z.string().optional().nullable(),
});

export const taskCreateSchema = z.object({
  planId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default('Custom task added by candidate'),
  category: taskCategorySchema.default('OTHER'),
  priority: taskPrioritySchema.default('MEDIUM'),
  plannedDate: z.string(),
  estimatedDuration: z.number().min(15).max(360).default(60),
  completionCriteria: z.string().default('Mark complete once understood and practiced'),
  notes: z.string().optional(),
});

export const replanRequestSchema = z.object({
  planId: z.string().min(1),
  newDailyHours: z.number().min(0.5).max(12).optional(),
  newInterviewDate: z.string().optional().nullable(),
  preserveCompleted: z.boolean().default(true),
  notes: z.string().optional(),
});

export const resumeAnalyzeSchema = z.object({
  resumeText: z.string().min(20, 'Resume text is too short'),
  jobDescription: z.string().optional(),
  targetRole: z.string().default('Software Engineer'),
  targetCompany: z.string().default('Target Company'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PlanGenerationInput = z.infer<typeof planGenerationInputSchema>;
export type AIGeneratedPlan = z.infer<typeof aiGeneratedPlanSchema>;
export type AIGeneratedTask = z.infer<typeof aiGeneratedTaskSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type ReplanRequestInput = z.infer<typeof replanRequestSchema>;
export type ResumeAnalyzeInput = z.infer<typeof resumeAnalyzeSchema>;
