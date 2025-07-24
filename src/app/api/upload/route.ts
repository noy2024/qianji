
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { BillParserFactory } from '@/lib/parsers';

// In a real app, you would move this to a lib/prisma.ts file
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    console.log(`Received file: ${file.name}, size: ${file.size}`);

    // 使用新的解析器工厂
    const parserFactory = new BillParserFactory();
    
    try {
      const parsedBills = await parserFactory.parseFile(file);
      
      // 确保用户存在
      const userId = 'cluser1';
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          email: 'default@example.com',
          name: '默认用户'
        }
      });
      
      // 批量创建账单记录
      const createdBills = await Promise.all(
        parsedBills.map(async (billData) => {
          // 首先尝试找到或创建分类
          let categoryId = null;
          if (billData.category) {
            const category = await prisma.category.upsert({
              where: {
                name_userId: {
                  name: billData.category,
                  userId: userId
                }
              },
              update: {},
              create: {
                name: billData.category,
                type: billData.type,
                userId: userId
              }
            });
            categoryId = category.id;
          }

          // 创建账单记录
          return await prisma.bill.create({
            data: {
              title: billData.title,
              amount: billData.amount,
              type: billData.type,
              description: billData.description,
              date: billData.date.toISOString(),
              userId: userId,
              categoryId,
              // accountId 暂时不设置，可以后续添加账户管理功能
            }
          });
        })
      );

      return NextResponse.json({ 
        success: true, 
        message: `成功导入 ${createdBills.length} 条账单记录`,
        bills: createdBills,
        summary: {
          total: createdBills.length,
          totalAmount: createdBills.reduce((sum, bill) => sum + bill.amount, 0),
          platform: parsedBills[0]?.platform || 'unknown'
        }
      }, { status: 200 });

    } catch (parseError) {
      console.error("解析文件失败:", parseError);
      return NextResponse.json({ 
        error: `文件解析失败: ${parseError instanceof Error ? parseError.message : String(parseError)}` 
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Error in upload API:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
