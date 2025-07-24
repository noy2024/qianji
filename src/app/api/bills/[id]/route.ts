import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/bills/[id] - 获取单个账单详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const bill = await prisma.bill.findUnique({
      where: { id },
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

    if (!bill) {
      return NextResponse.json(
        { error: '账单不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(bill);
  } catch (error) {
    console.error('获取账单详情失败:', error);
    return NextResponse.json(
      { error: '获取账单详情失败' },
      { status: 500 }
    );
  }
}

// PUT /api/bills/[id] - 更新账单
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { amount, description, date, type, categoryId, accountId } = body;

    // 验证账单是否存在
    const existingBill = await prisma.bill.findUnique({
      where: { id }
    });

    if (!existingBill) {
      return NextResponse.json(
        { error: '账单不存在' },
        { status: 404 }
      );
    }

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

    // 更新账单
    const updatedBill = await prisma.bill.update({
      where: { id },
      data: {
        title: description.trim(),
        amount: type === 'EXPENSE' ? -Math.abs(amount) : Math.abs(amount),
        description: description.trim(),
        date: new Date(date),
        type,
        categoryId,
        accountId
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

    return NextResponse.json(updatedBill);
  } catch (error) {
    console.error('更新账单失败:', error);
    return NextResponse.json(
      { error: '更新账单失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/bills/[id] - 删除账单
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 验证账单是否存在
    const existingBill = await prisma.bill.findUnique({
      where: { id }
    });

    if (!existingBill) {
      return NextResponse.json(
        { error: '账单不存在' },
        { status: 404 }
      );
    }

    // 删除账单
    await prisma.bill.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: '账单删除成功' },
      { status: 200 }
    );
  } catch (error) {
    console.error('删除账单失败:', error);
    return NextResponse.json(
      { error: '删除账单失败' },
      { status: 500 }
    );
  }
}