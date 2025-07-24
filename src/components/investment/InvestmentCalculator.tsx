"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const rates = {
  1: { cash: 0.001875, points: 0.001875 },
  2: { cash: 0.00218, points: 0.00218 },
  3: { cash: 0.0025, points: 0.0025 },
  4: { cash: 0.00281, points: 0.00281 },
  5: { cash: 0.00312, points: 0.00312 },
  6: { cash: 0.00375, points: 0.00375 },
};

export default function InvestmentCalculator() {
  const [amount, setAmount] = useState("10000");
  const [level, setLevel] = useState("1");
  const [weeks, setWeeks] = useState("52");
  const [reinvest, setReinvest] = useState(false);
  const [results, setResults] = useState<{
    cashEarnings: number;
    pointEarnings: number;
    weeklyData: Array<{ week: number; cash: number; points: number }>;
  } | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    try {
      setError("");
      const response = await fetch("/api/investment/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          level: Number(level),
          weeks: Number(weeks),
          reinvest,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Something went wrong");
      }

      const data = await response.json();
      setResults(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">投资产品收益回测</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                投资金额
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="weeks" className="block text-sm font-medium text-gray-700">
                投资周期 (周)
              </label>
              <input
                type="number"
                id="weeks"
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
                min="1"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                收益级别
              </label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {Object.entries(rates).map(([level, rate]) => (
                  <option key={level} value={level}>
                    级别 {level}: {(rate.cash * 100).toFixed(4)}% (现金) + {(rate.points * 100).toFixed(4)}% (积分)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <input
                id="reinvest"
                name="reinvest"
                type="checkbox"
                checked={reinvest}
                onChange={(e) => setReinvest(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="reinvest" className="ml-2 block text-sm text-gray-900">
                将现金收益用于复投
              </label>
            </div>
            <button
              onClick={handleCalculate}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              计算收益
            </button>
            {error && <p className="text-red-500">{error}</p>}
          </div>
          <div className="md:col-span-2">
            {results && (
              <div className="mt-4 p-6 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">回测结果 ({weeks} 周)</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600">总现金收益</p>
                    <p className="text-2xl font-bold text-green-600">¥{results.cashEarnings.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-sm text-gray-600">总积分收益</p>
                    <p className="text-2xl font-bold text-blue-600">{results.pointEarnings.toFixed(2)}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border" style={{ height: 320 }}>
                  <ResponsiveContainer>
                    <LineChart data={results.weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="cash" stroke="#8884d8" name="现金收益" />
                      <Line type="monotone" dataKey="points" stroke="#82ca9d" name="积分收益" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
