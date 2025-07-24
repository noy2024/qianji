import { NextResponse } from "next/server";

const rates = {
  1: { cash: 0.001875, points: 0.001875 },
  2: { cash: 0.00218, points: 0.00218 },
  3: { cash: 0.0025, points: 0.0025 },
  4: { cash: 0.00281, points: 0.00281 },
  5: { cash: 0.00312, points: 0.00312 },
  6: { cash: 0.00375, points: 0.00375 },
};

export async function POST(request: Request) {
  try {
    const { amount, level, weeks, reinvest } = await request.json();

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid investment amount" },
        { status: 400 }
      );
    }

    if (typeof weeks !== "number" || weeks <= 0) {
      return NextResponse.json(
        { error: "Invalid number of weeks" },
        { status: 400 }
      );
    }

    const rate = rates[level as keyof typeof rates];

    if (!rate) {
      return NextResponse.json(
        { error: "Invalid investment level" },
        { status: 400 }
      );
    }

    let cashEarnings = 0;
    let pointEarnings = 0;
    const weeklyData: { week: number; cash: number; points: number }[] = [];

    if (reinvest) {
      let currentAmount = amount;
      let cumulativePointEarnings = 0;
      for (let i = 0; i < weeks; i++) {
        const week = i + 1;
        const weeklyCashInterest = currentAmount * rate.cash * 7;
        const weeklyPointInterest = amount * rate.points * 7; // Points based on initial amount

        currentAmount += weeklyCashInterest;
        cumulativePointEarnings += weeklyPointInterest;

        weeklyData.push({
          week,
          cash: currentAmount - amount,
          points: cumulativePointEarnings,
        });
      }
      cashEarnings = currentAmount - amount;
      pointEarnings = cumulativePointEarnings;
    } else {
      for (let i = 0; i < weeks; i++) {
        const week = i + 1;
        weeklyData.push({
          week,
          cash: amount * rate.cash * 7 * week,
          points: amount * rate.points * 7 * week,
        });
      }
      cashEarnings = amount * rate.cash * 7 * weeks;
      pointEarnings = amount * rate.points * 7 * weeks;
    }

    return NextResponse.json({
      cashEarnings,
      pointEarnings,
      weeklyData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
