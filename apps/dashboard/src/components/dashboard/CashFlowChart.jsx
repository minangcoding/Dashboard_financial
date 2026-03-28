import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-highest px-4 py-3 rounded-xl shadow-xl border border-outline-variant/20 text-xs">
        <p className="font-bold text-on-surface mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className={`tabular-nums ${p.dataKey === 'income' ? 'text-secondary' : 'text-tertiary'}`}>
            {p.dataKey === 'income' ? 'Income' : 'Expense'}: Rp {Number(p.value).toLocaleString('id-ID')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function CashFlowChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const url = new URL('http://localhost:3001/api/transactions');
        url.searchParams.append('limit', '100');
        const res = await fetch(url.toString(), { credentials: 'include' });
        const json = await res.json();
        const data = json.data || json;
        if (!Array.isArray(data)) return;

        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const grouped = {};
        days.forEach(d => { grouped[d] = { income: 0, expense: 0 }; });

        data.forEach(trx => {
          const dayName = days[new Date(trx.date).getDay()];
          const amt = Number(trx.amount);
          if (trx.type === 'income') grouped[dayName].income += amt;
          else grouped[dayName].expense += amt;
        });

        const result = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => ({
          day,
          income: grouped[day].income,
          expense: grouped[day].expense,
        }));

        setChartData(result);
      } catch (e) { console.error("Failed to load chart data", e); }
      finally { setLoading(false); }
    };
    fetchTransactions();
  }, []);

  const handleDownload = () => {
    window.open('http://localhost:3001/api/transactions/export/csv', '_blank');
  };

  return (
    <section className="lg:col-span-8">
      <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 h-full animate-fade-in">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="headline-md text-xl font-semibold">Cash Flow Analysis</h3>
            <p className="text-on-surface-variant text-sm mt-1">Operational liquidity performance</p>
          </div>
          <div className="flex gap-2 no-print">
            <button onClick={handleDownload} className="p-2 rounded-lg bg-surface-container-highest border border-outline-variant/20 hover:bg-surface-bright transition-colors" title="Download CSV">
              <span className="material-symbols-outlined text-lg">download</span>
            </button>
          </div>
        </div>

        <div className="h-72 w-full mt-4">
          {loading ? (
            <div className="h-full flex items-center justify-center text-on-surface-variant text-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Loading chart...</span>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="#999" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                <YAxis stroke="#999" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : v.toLocaleString()} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="income" fill="#4edea3" radius={[6, 6, 0, 0]} animationDuration={800} />
                <Bar dataKey="expense" fill="#ffb3ad" radius={[6, 6, 0, 0]} animationDuration={800} animationBegin={200} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex gap-6 mt-6 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#4edea3]"></div>
            <span className="text-xs font-medium text-on-surface-variant">Pemasukan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ffb3ad]"></div>
            <span className="text-xs font-medium text-on-surface-variant">Pengeluaran</span>
          </div>
        </div>
      </div>
    </section>
  );
}
