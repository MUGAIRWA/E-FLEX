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

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@eflex.edu' },
    update: {
      role: 'teacher',
      isActive: true,
      subjects: ['Mathematics', 'Physics', 'Chemistry'],
      classesTaught: [
        { class: 'form1', stream: 'Blue' },
        { class: 'form2', stream: 'Green' },
        { class: 'form3', stream: 'Blue' }
      ],
      streamsTaught: ['Blue', 'Green']
    },
    create: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'teacher@eflex.edu',
      password: passwordHash,
      role: 'teacher',
      teacherId: 'TCH-1001',
      phoneNumber: '+254700000002',
      subjects: ['Mathematics', 'Physics', 'Chemistry'],
      classesTaught: [
        { class: 'form1', stream: 'Blue' },
        { class: 'form2', stream: 'Green' },
        { class: 'form3', stream: 'Blue' }
      ],
      streamsTaught: ['Blue', 'Green']
    }
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@eflex.edu' },
    update: {
      role: 'student',
      isActive: true,
      class: 'form3',
      stream: 'Blue'
    },
    create: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'student@eflex.edu',
      password: passwordHash,
      role: 'student',
      studentId: 'STU-1001',
      admissionNumber: 'ADM-2026-001',
      class: 'form3',
      stream: 'Blue',
      phoneNumber: '+254700000003'
    }
  });

  const parent = await prisma.user.upsert({
    where: { email: 'parent@eflex.edu' },
    update: {
      role: 'parent',
      isActive: true,
      childEmail: student.email,
      children: { connect: { id: student.id } }
    },
    create: {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'parent@eflex.edu',
      password: passwordHash,
      role: 'parent',
      phoneNumber: '+254700000004',
      childEmail: student.email,
      children: { connect: { id: student.id } }
    }
  });

  console.log('Seeded accounts (all with password: password123):');
  console.log(`  Admin:   ${admin.email} (role: ${admin.role})`);
  console.log(`  Teacher: ${teacher.email} (role: ${teacher.role})`);
  console.log(`  Parent:  ${parent.email} (role: ${parent.role})`);
  console.log(`  Student: ${student.email} (role: ${student.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

