import prismaPackage from '@prisma/client';

const { PrismaClient } = prismaPackage;

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
