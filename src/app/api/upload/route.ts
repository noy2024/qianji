
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
      
      // 批量创建账单记录，增加去重逻辑
      let createdCount = 0;
      let skippedCount = 0;

      const billProcessingPromises = parsedBills.map(async (billData) => {
        // 确保用户存在 (虽然在循环外已经有了，但为了安全可以保留)
        const userId = 'cluser1';

        // 1. 查找或创建分类
        let categoryId = null;
        if (billData.category) {
          const category = await prisma.category.upsert({
            where: { name_userId: { name: billData.category, userId: userId } },
            update: {},
            create: { name: billData.category, type: billData.type, userId: userId },
          });
          categoryId = category.id;
        }

        // 2. 检查账单是否已存在
        const existingBill = await prisma.bill.findFirst({
          where: {
            userId: userId,
            date: billData.date,
            amount: billData.amount,
            description: billData.description,
          },
        });

        // 3. 如果不存在，则创建
        if (!existingBill) {
          await prisma.bill.create({
            data: {
              title: billData.title,
              amount: billData.amount,
              type: billData.type,
              description: billData.description,
              date: billData.date,
              userId: userId,
              categoryId,
              // accountId 暂时不设置
            },
          });
          createdCount++;
        } else {
          skippedCount++;
        }
      });

      await Promise.all(billProcessingPromises);

      return NextResponse.json({ 
        success: true, 
        message: `导入完成：成功新增 ${createdCount} 条记录，跳过 ${skippedCount} 条重复记录。`,
        summary: {
          totalImported: createdCount,
          totalSkipped: skippedCount,
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
