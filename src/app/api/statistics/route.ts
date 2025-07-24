import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { StatisticsService } from '@/lib/statistics/service';
import { StatisticsQuery } from '@/lib/statistics/types';

const prisma = new PrismaClient();
const statisticsService = new StatisticsService(prisma);
const MOCK_USER_ID = 'cluser1';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId') || MOCK_USER_ID;

    const query: StatisticsQuery = {
      userId,
      dateRange: startDate && endDate ? {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      } : undefined,
    };

    const statistics = await statisticsService.getBillStatistics(query);
    
    // Ensure the response has the expected structure
    const response = {
      totalIncome: statistics.totalIncome || 0,
      totalExpense: statistics.totalExpense || 0,
      netIncome: statistics.netIncome || 0,
      spendingByCategory: Array.isArray(statistics.categoryBreakdown) ? statistics.categoryBreakdown : [],
      monthlyData: Array.isArray(statistics.monthlyTrend) ? statistics.monthlyTrend : []
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Statistics API error:', error);
    return NextResponse.json(
      {
        totalIncome: 0,
        totalExpense: 0,
        netIncome: 0,
        spendingByCategory: [],
        monthlyData: [],
        error: 'Failed to fetch statistics'
      },
      { status: 500 }
    );
  }
}


