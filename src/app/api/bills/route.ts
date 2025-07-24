import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/bills - 获取账单列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const categoryId = searchParams.get('categoryId');
    const accountId = searchParams.get('accountId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    // 构建查询条件
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // 计算分页
    const skip = (page - 1) * limit;

    // 获取总数
    const totalCount = await prisma.bill.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    // 获取账单列表
    const bills = await prisma.bill.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        account: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      skip,
      take: limit
    });

    return NextResponse.json({
      bills,
      totalCount,
      totalPages,
      currentPage: page,
      pageSize: limit
    });
  } catch (error) {
    console.error('获取账单列表失败:', error);
    return NextResponse.json(
      { error: '获取账单列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/bills - 创建新账单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, description, date, type, categoryId, accountId } = body;

    // 验证必填字段
    if (!amount || !description || !date || !type || !categoryId || !accountId) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 验证金额
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: '金额必须是大于0的数字' },
        { status: 400 }
      );
    }

    // 验证类型
    if (!['INCOME', 'EXPENSE', 'INVESTMENT', 'TRANSFER'].includes(type)) {
      return NextResponse.json(
        { error: '无效的账单类型' },
        { status: 400 }
      );
    }

    // 验证分类是否存在
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    if (!category) {
      return NextResponse.json(
        { error: '分类不存在' },
        { status: 400 }
      );
    }

    // 验证账户是否存在
    const account = await prisma.account.findUnique({
      where: { id: accountId }
    });
    if (!account) {
      return NextResponse.json(
        { error: '账户不存在' },
        { status: 400 }
      );
    }

    // 创建账单
    const bill = await prisma.bill.create({
      data: {
        title: description.trim(),
        amount: type === 'EXPENSE' ? -Math.abs(amount) : Math.abs(amount),
        description: description.trim(),
        date: new Date(date),
        type,
        categoryId,
        accountId,
        userId: 'default-user' // 暂时使用默认用户ID
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        account: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    return NextResponse.json(bill, { status: 201 });
  } catch (error) {
    console.error('创建账单失败:', error);
    return NextResponse.json(
      { error: '创建账单失败' },
      { status: 500 }
    );
  }
}