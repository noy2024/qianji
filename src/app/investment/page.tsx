'use client';

import { PageNavigation } from '@/components/navigation';
import InvestmentCalculator from '@/components/investment/InvestmentCalculator';

export default function InvestmentPage() {
  return (
    <div className="bg-white">
      <PageNavigation
        title="投资回测"
        description="投资计算、历史回测、收益分析"
      />
      
      <div className="bg-gray-50 min-h-screen">
        <main className="flex flex-col items-center p-4 md:p-24">
          <div className="w-full max-w-7xl">
            <InvestmentCalculator />
          </div>
        </main>
      </div>
    </div>
  );
}