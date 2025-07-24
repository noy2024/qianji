import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/accounts - 获取账户列表
export async function GET(request: NextRequest) {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('获取账户列表失败:', error);
    return NextResponse.json(
      { error: '获取账户列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/accounts - 创建新账户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, balance = 0 } = body;

    // 验证必填字段
    if (!name || !type) {
      return NextResponse.json(
        { error: '账户名称和类型为必填字段' },
        { status: 400 }
      );
    }

    // 验证账户类型
    const validTypes = ['CASH', 'BANK', 'CREDIT', 'INVESTMENT', 'OTHER'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: '无效的账户类型' },
        { status: 400 }
      );
    }

    // 检查账户名称是否已存在
    const existingAccount = await prisma.account.findFirst({
      where: {
        name: name.trim(),
        userId: 'default-user'
      }
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: '账户名称已存在' },
        { status: 400 }
      );
    }

    // 创建账户
    const account = await prisma.account.create({
      data: {
        name: name.trim(),
        type,
        balance: parseFloat(balance) || 0,
        userId: 'default-user' // 暂时使用默认用户ID
      }
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('创建账户失败:', error);
    return NextResponse.json(
      { error: '创建账户失败' },
      { status: 500 }
    );
  }
}