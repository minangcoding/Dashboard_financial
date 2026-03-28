import React, { useState, useEffect } from 'react';
import AnimatedNumber from '../ui/AnimatedNumber';
import { SkeletonCard } from '../ui/Skeleton';

export default function SummarySection() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/analytics/summary', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (e) { console.error("Failed to fetch summary", e); }
      finally { setLoading(false); }
    };
    fetchSummary();
  }, []);

  const totalIncome = summary ? (summary.netSavings + summary.monthlyBurnRate) : 0;
  const totalExpense = summary?.monthlyBurnRate || 0;
  const balance = summary?.netSavings || 0;
  const budgetPct = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;

  if (loading) return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-stagger">
      <SkeletonCard /><SkeletonCard /><SkeletonCard />
    </section>
  );

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-stagger">
      <div className="surface-container bg-surface-container p-8 rounded-xl relative overflow-hidden hover:bg-surface-container-high transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="flex justify-between items-start mb-6">
          <span className="label-sm text-[10px] uppercase tracking-widest text-on-surface-variant">Total Balance</span>
          <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-semibold tabular-nums tracking-tight">
            <AnimatedNumber value={balance} prefix="Rp " />
          </span>
          <span className="text-secondary text-sm font-medium mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            Net Savings: {summary?.netSavingsRate || '0%'}
          </span>
        </div>
      </div>
      
      <div className="surface-container bg-surface-container p-8 rounded-xl relative overflow-hidden hover:bg-surface-container-high transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="flex justify-between items-start mb-6">
          <span className="label-sm text-[10px] uppercase tracking-widest text-on-surface-variant">Pemasukan</span>
          <span className="material-symbols-outlined text-secondary">arrow_downward</span>
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-semibold tabular-nums tracking-tight text-secondary">
            <AnimatedNumber value={totalIncome} prefix="Rp " />
          </span>
          <span className="bg-secondary-container/20 text-secondary text-[10px] px-2 py-0.5 rounded-full w-fit mt-3 uppercase font-bold tracking-wider">From Database</span>
        </div>
      </div>
      
      <div className="surface-container bg-surface-container p-8 rounded-xl relative overflow-hidden hover:bg-surface-container-high transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="flex justify-between items-start mb-6">
          <span className="label-sm text-[10px] uppercase tracking-widest text-on-surface-variant">Pengeluaran</span>
          <span className="material-symbols-outlined text-tertiary">arrow_upward</span>
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-semibold tabular-nums tracking-tight text-tertiary">
            <AnimatedNumber value={totalExpense} prefix="Rp " />
          </span>
          <div className="w-full bg-surface-container-highest h-1 rounded-full mt-4 overflow-hidden">
            <div className="bg-tertiary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${budgetPct}%` }}></div>
          </div>
          <span className="text-on-surface-variant text-[10px] mt-2 uppercase font-medium">{budgetPct}% of income used</span>
        </div>
      </div>
    </section>
  );
}
