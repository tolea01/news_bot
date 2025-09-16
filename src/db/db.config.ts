import { PrismaClient } from '@prisma/client';

const PRISMA: PrismaClient = new PrismaClient({
  log: ['error', 'info', 'warn', 'query'],
});

export default PRISMA;
