import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
}

interface Budget {
  id: string;
  amount: number;
  categoryId: string;
  category: Category;
}

export default function BudgetManagement() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    fetchCategories();
    fetchBudgets();
  }, [month, year]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      
      let data = [];
      if (result.success && result.data) {
        data = result.data;
      } else if (Array.isArray(result)) {
        data = result;
      }
      
      setCategories(data);
      if (data.length > 0) {
        setSelectedCategory(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`/api/budgets?month=${month}&year=${year}`);
      const result = await response.json();
      
      let data = [];
      if (result.success && result.data) {
        data = result.data;
      } else if (Array.isArray(result)) {
        data = result;
      }
      
      setBudgets(data);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      setBudgets([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseFloat(amount),
        categoryId: selectedCategory,
        month,
        year,
      }),
    });
    fetchBudgets();
    setAmount('');
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">预算管理</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">设置预算</h3>
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
            <div className="flex items-center space-x-4">
              <select value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))} className="p-2 border rounded">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{m}月</option>
                ))}
              </select>
              <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))} className="p-2 border rounded" />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">分类</label>
              <select id="category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                {(categories || []).map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">金额</label>
              <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="输入预算金额" />
            </div>
            <button type="submit" className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">保存预算</button>
          </form>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">本月预算</h3>
          <div className="space-y-4">
            {(budgets || []).map((budget) => (
              <div key={budget.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{budget.category?.name || '未知分类'}</span>
                  <span>¥{(budget.amount || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
