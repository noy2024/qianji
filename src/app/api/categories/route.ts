import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const MOCK_USER_ID = 'default-user';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || MOCK_USER_ID;
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (id) {
      // Delete operation
      await prisma.category.delete({
        where: { id }
      });
      return NextResponse.json({ success: true });
    }

    const whereClause: Record<string, unknown> = { userId };
    if (type && type !== 'ALL') {
      whereClause.type = type;
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        bills: {
          select: {
            amount: true
          }
        }
      }
    });

    // Calculate statistics for each category
    const categoriesWithStats = categories.map(category => {
      const billCount = category.bills.length;
      const totalAmount = category.bills.reduce((sum, bill) => sum + bill.amount, 0);
      
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        color: category.color,
        icon: category.icon,
        type: category.type,
        billCount,
        totalAmount,
        createdAt: category.createdAt.toISOString()
      };
    });
    
    return NextResponse.json({ success: true, data: categoriesWithStats });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, color, icon, type, userId } = body;

    const category = await prisma.category.create({
      data: {
        name,
        description,
        color,
        icon,
        type,
        userId: userId || MOCK_USER_ID
      }
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, color, icon, type } = body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        color,
        icon,
        type
      }
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
