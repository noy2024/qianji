import { NextRequest, NextResponse } from 'next/server';
import {
  calculateFinancialHealthScore,
  analyzeExpenseStructure,
  forecastIncome,
  generateAIRecommendations
} from '@/lib/services/aiAnalysis';

// GET /api/ai-analysis - 获取AI财务分析数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId'); // 暂时可选，后续可以从session获取

    switch (type) {
      case 'health-score':
        const healthScore = await calculateFinancialHealthScore(userId || undefined);
        return NextResponse.json({
          success: true,
          data: healthScore
        });

      case 'expense-analysis':
        const expenseAnalysis = await analyzeExpenseStructure(userId || undefined);
        return NextResponse.json({
          success: true,
          data: expenseAnalysis
        });

      case 'income-forecast':
        const incomeForecast = await forecastIncome(userId || undefined);
        return NextResponse.json({
          success: true,
          data: incomeForecast
        });

      case 'recommendations':
        const recommendations = await generateAIRecommendations(userId || undefined);
        return NextResponse.json({
          success: true,
          data: recommendations
        });

      case 'all':
      default:
        // 获取所有分析数据
        const [health, expense, income, recs] = await Promise.all([
          calculateFinancialHealthScore(userId || undefined),
          analyzeExpenseStructure(userId || undefined),
          forecastIncome(userId || undefined),
          generateAIRecommendations(userId || undefined)
        ]);

        return NextResponse.json({
          success: true,
          data: {
            healthScore: health,
            expenseAnalysis: expense,
            incomeForecast: income,
            recommendations: recs
          }
        });
    }
  } catch (error) {
    console.error('AI分析API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'AI分析失败'
      },
      { status: 500 }
    );
  }
}

// POST /api/ai-analysis - 触发AI分析更新
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, forceRefresh = false } = body;

    // 如果需要强制刷新，可以清除缓存
    if (forceRefresh) {
      // TODO: 实现缓存清除逻辑
    }

    // 重新计算所有分析数据
    const [healthScore, expenseAnalysis, incomeForecast, recommendations] = await Promise.all([
      calculateFinancialHealthScore(userId),
      analyzeExpenseStructure(userId),
      forecastIncome(userId),
      generateAIRecommendations(userId)
    ]);

    return NextResponse.json({
      success: true,
      message: 'AI分析已更新',
      data: {
        healthScore,
        expenseAnalysis,
        incomeForecast,
        recommendations
      }
    });
  } catch (error) {
    console.error('AI分析更新失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'AI分析更新失败'
      },
      { status: 500 }
    );
  }
}