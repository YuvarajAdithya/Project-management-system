import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@taskflow.com' },
  });

  if (existingUser) {
    console.log('Demo user already exists.');
    return;
  }

  const passwordHash = await bcrypt.hash('demo123456', 10);
  const user = await prisma.user.create({
    data: {
      fullName: 'Demo User',
      email: 'demo@taskflow.com',
      passwordHash,
    },
  });

  const project1 = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'Mobile App Redesign',
      description: 'Modernizing the user interface and improving UX across iOS and Android.',
      status: 'IN_PROGRESS',
      startDate: new Date('2025-01-10'),
      endDate: new Date('2025-03-30'),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'API Infrastructure Migration',
      description: 'Migrating legacy backend services to high-performance microservices with PostgreSQL.',
      status: 'NOT_STARTED',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-05-15'),
    },
  });

  await prisma.task.createMany({
    data: [
      {
        projectId: project1.id,
        name: 'Design System Tokens',
        description: 'Define typography, color palettes, and component variants in Figma.',
        priority: 'HIGH',
        status: 'COMPLETED',
        dueDate: new Date('2025-01-25'),
      },
      {
        projectId: project1.id,
        name: 'Implement Tab Navigation',
        description: 'Configure Expo Router bottom navigation tabs with animated active states.',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        dueDate: new Date('2025-02-15'),
      },
      {
        projectId: project1.id,
        name: 'Unit Tests for State Management',
        description: 'Ensure 85%+ test coverage for authentication and project contexts.',
        priority: 'LOW',
        status: 'PENDING',
        dueDate: new Date('2025-03-01'),
      },
      {
        projectId: project2.id,
        name: 'Audit Existing Database Queries',
        description: 'Identify slow queries and schema indexing opportunities.',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: new Date('2025-02-10'),
      },
    ],
  });

  console.log('Seeding complete! Demo user: demo@taskflow.com / demo123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
