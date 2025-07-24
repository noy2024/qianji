# 钱迹 (Qianji) - 您的智能个人财务管家

钱迹是一款现代化的个人财务管理应用，旨在帮助用户轻松记录、分析和优化个人财务状况。结合了 AI 智能分析，提供深度洞察，让财务管理变得前所未有的简单和高效。

## ✨ 功能特性

- **多渠道账单导入**: 支持一键导入支付宝、微信等主流平台的交易记录。
- **手动记账**: 灵活的手动记账功能，随时记录每一笔开销。
- **智能类目**: 自动或手动为每笔交易分配类别，支持自定义分类。
- **AI 财务分析**:
  - **消费分析**: 智能分析消费习惯，发现不合理的开支。
  - **财务健康评分**: 综合评估财务状况，提供优化建议。
  - **收入预测**: 基于历史数据预测未来收入趋势。
- **预算管理**: 设定月度或年度预算，实时追踪预算使用情况。
- **投资辅助**: 内置投资计算器，辅助决策。
- **数据可视化**: 通过丰富的图表和仪表盘，直观展示财务数据。

## 🚀 技术栈

- **前端**: [Next.js](https://nextjs.org/) (React) + [TypeScript](https://www.typescriptlang.org/)
- **UI**: [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **数据可视化**: [Recharts](https.recharts.org/)
- **后端**: Next.js API Routes
- **数据库**: [Prisma](https://www.prisma.io/) + SQLite
- **代码规范**: ESLint

## 📦 项目结构

```
/
├── prisma/               # Prisma schema 和数据库迁移
├── public/               # 静态资源
├── src/
│   ├── app/              # Next.js App Router 页面和 API
│   │   ├── api/          # 后端 API 路由
│   │   └── (pages)/      # 各功能页面
│   ├── components/       # React 组件
│   ├── lib/              # 核心逻辑与工具函数
│   │   ├── parsers/      # 账单文件解析器 (支付宝, 微信)
│   │   ├── services/     # 服务层 (AI分析, 分类)
│   │   └── statistics/   # 统计服务
│   └── config/           # 配置文件 (如: 默认分类)
├── .env.example          # 环境变量示例
└── package.json
```

## 🛠️ 本地开发

1.  **克隆项目**
    ```bash
    git clone https://github.com/your-username/qianji.git
    cd qianji
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **设置环境变量**
    复制 `.env.example` 文件为 `.env`，并根据需要修改。
    ```bash
    cp .env.example .env
    ```

4.  **初始化数据库**
    该命令会重置数据库并填充初始数据。
    ```bash
    npm run db:reset
    ```

5.  **启动开发服务器**
    ```bash
    npm run dev
    ```

6.  在浏览器中打开 `http://localhost:3000` 查看。

## 📜 可用脚本

- `npm run dev`: 启动开发环境。
- `npm run build`: 构建生产版本。
- `npm run start`: 运行生产版本。
- `npm run lint`: 执行代码风格检查。
- `npm run db:seed`: 向数据库填充种子数据。
- `npm run db:reset`: 重置数据库并填充种子数据。

## 🤝 贡献

我们欢迎任何形式的贡献！如果您有任何建议或发现任何问题，请随时提一个 Issue。

---

_README 由 Gemini AI 智能生成和更新。_