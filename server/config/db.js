const { PrismaClient } = require('@prisma/client');

// Single shared Prisma client (avoid opening a new pool per import / nodemon reload)
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__eflexPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.__eflexPrisma = prisma;

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL connected');
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };