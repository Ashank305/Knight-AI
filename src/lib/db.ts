import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

// In-memory fallback store to ensure seamless developer & evaluation experience
// even if external PostgreSQL credentials are not yet configured on the host machine.
export interface MemoryStore {
  users: Map<string, any>;
  profiles: Map<string, any>;
  plans: Map<string, any>;
  tasks: Map<string, any>;
  activities: Map<string, any>;
  resumes: Map<string, any>;
}

declare global {
  // eslint-disable-next-line no-var
  var __memoryStore: MemoryStore | undefined;
}

export const memoryStore: MemoryStore =
  global.__memoryStore || {
    users: new Map(),
    profiles: new Map(),
    plans: new Map(),
    tasks: new Map(),
    activities: new Map(),
    resumes: new Map(),
  };

if (process.env.NODE_ENV !== 'production') {
  global.__memoryStore = memoryStore;
}

export async function isPostgresAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
