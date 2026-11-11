const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@eflex.edu' },
    update: { role: 'admin', isActive: true },
    create: {
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@eflex.edu',
      password: passwordHash,
      role: 'admin',
      phoneNumber: '+254700000001'
    }
  });

  console.log('Seeded clean database with administrator account:');
  console.log(`  Admin: ${admin.email} (password: password123, role: ${admin.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
