import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const MOCK_USER_ID = 'cluser1';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  if (!month || !year) {
    return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
  }

  const budgets = await prisma.budget.findMany({
    where: {
      userId: MOCK_USER_ID,
      month: parseInt(month, 10),
      year: parseInt(year, 10),
    },
    include: {
      category: true,
    },
  });

  return NextResponse.json(budgets);
}

export async function POST(request: Request) {
  const { amount, categoryId, month, year } = await request.json();

  const budget = await prisma.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId: MOCK_USER_ID,
        categoryId,
        month,
        year,
      },
    },
    update: {
      amount,
    },
    create: {
      amount,
      month,
      year,
      userId: MOCK_USER_ID,
      categoryId,
    },
  });

  return NextResponse.json(budget);
}
