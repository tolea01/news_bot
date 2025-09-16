import { PrismaClient } from '@prisma/client';

const PRISMA = new PrismaClient({ log: ['error', 'info', 'warn', 'query'] });

export default PRISMA