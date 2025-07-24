import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  // 创建默认用户
  const defaultUser = await prisma.user.upsert({
    where: { email: 'default@qianji.com' },
    update: {},
    create: {
      id: 'default-user',
      email: 'default@qianji.com',
      name: '默认用户'
    }
  });

  console.log('创建默认用户:', defaultUser.name);

  // 创建默认账户
  const defaultAccounts = [
    { name: '现金', type: 'CASH', balance: 1000 },
    { name: '工商银行储蓄卡', type: 'BANK', balance: 5000 },
    { name: '招商银行信用卡', type: 'CREDIT', balance: 0 },
    { name: '支付宝', type: 'OTHER', balance: 500 },
    { name: '微信钱包', type: 'OTHER', balance: 200 }
  ];

  for (const accountData of defaultAccounts) {
    const account = await prisma.account.upsert({
      where: {
        id: `account-${accountData.name.toLowerCase().replace(/\s+/g, '-')}`
      },
      update: {},
      create: {
        id: `account-${accountData.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: accountData.name,
        type: accountData.type as any,
        balance: accountData.balance,
        userId: defaultUser.id
      }
    });
    console.log('创建账户:', account.name);
  }

  // 创建默认分类
  const defaultCategories = [
    // 支出分类
    { name: '餐饮美食', type: 'EXPENSE', color: '#FF6B6B', icon: '🍽️' },
    { name: '交通出行', type: 'EXPENSE', color: '#4ECDC4', icon: '🚗' },
    { name: '购物消费', type: 'EXPENSE', color: '#45B7D1', icon: '🛍️' },
    { name: '生活缴费', type: 'EXPENSE', color: '#96CEB4', icon: '💡' },
    { name: '医疗健康', type: 'EXPENSE', color: '#FFEAA7', icon: '🏥' },
    { name: '学习教育', type: 'EXPENSE', color: '#DDA0DD', icon: '📚' },
    { name: '娱乐休闲', type: 'EXPENSE', color: '#98D8C8', icon: '🎮' },
    { name: '房租房贷', type: 'EXPENSE', color: '#F7DC6F', icon: '🏠' },
    { name: '其他支出', type: 'EXPENSE', color: '#BDC3C7', icon: '💸' },
    
    // 收入分类
    { name: '工资收入', type: 'INCOME', color: '#2ECC71', icon: '💰' },
    { name: '兼职收入', type: 'INCOME', color: '#27AE60', icon: '💼' },
    { name: '投资收益', type: 'INCOME', color: '#F39C12', icon: '📈' },
    { name: '红包礼金', type: 'INCOME', color: '#E74C3C', icon: '🧧' },
    { name: '退款返现', type: 'INCOME', color: '#3498DB', icon: '💳' },
    { name: '其他收入', type: 'INCOME', color: '#9B59B6', icon: '💎' }
  ];

  for (const categoryData of defaultCategories) {
    const category = await prisma.category.upsert({
      where: {
        name_userId: {
          name: categoryData.name,
          userId: defaultUser.id
        }
      },
      update: {},
      create: {
        name: categoryData.name,
        type: categoryData.type as any,
        color: categoryData.color,
        icon: categoryData.icon,
        userId: defaultUser.id
      }
    });
    console.log('创建分类:', category.name);
  }

  // 创建一些示例账单
  const sampleBills = [
    {
      title: '午餐',
      amount: -25.50,
      type: 'EXPENSE',
      description: '公司附近餐厅用餐',
      date: new Date('2024-01-15'),
      categoryName: '餐饮美食',
      accountName: '支付宝'
    },
    {
      title: '地铁费',
      amount: -6.00,
      type: 'EXPENSE', 
      description: '上下班地铁费用',
      date: new Date('2024-01-15'),
      categoryName: '交通出行',
      accountName: '微信钱包'
    },
    {
      title: '工资',
      amount: 8000.00,
      type: 'INCOME',
      description: '1月份工资',
      date: new Date('2024-01-01'),
      categoryName: '工资收入',
      accountName: '工商银行储蓄卡'
    },
    {
      title: '咖啡',
      amount: -18.00,
      type: 'EXPENSE',
      description: '星巴克咖啡',
      date: new Date('2024-01-14'),
      categoryName: '餐饮美食',
      accountName: '招商银行信用卡'
    },
    {
      title: '电费',
      amount: -120.00,
      type: 'EXPENSE',
      description: '12月电费账单',
      date: new Date('2024-01-10'),
      categoryName: '生活缴费',
      accountName: '工商银行储蓄卡'
    }
  ];

  for (const billData of sampleBills) {
    // 查找对应的分类和账户
    const category = await prisma.category.findFirst({
      where: {
        name: billData.categoryName,
        userId: defaultUser.id
      }
    });

    const account = await prisma.account.findFirst({
      where: {
        name: billData.accountName,
        userId: defaultUser.id
      }
    });

    if (category && account) {
      const bill = await prisma.bill.create({
        data: {
          title: billData.title,
          amount: billData.amount,
          type: billData.type as any,
          description: billData.description,
          date: billData.date,
          userId: defaultUser.id,
          categoryId: category.id,
          accountId: account.id
        }
      });
      console.log('创建示例账单:', bill.title);
    }
  }

  console.log('数据库初始化完成！');
}

main()
  .catch((e) => {
    console.error('数据库初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });