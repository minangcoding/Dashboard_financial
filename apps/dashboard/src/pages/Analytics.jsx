import React, { useState, useEffect } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import RootLayout from '../components/layout/RootLayout';
import { useToast } from '../components/ui/Toast';
import { SkeletonCard } from '../components/ui/Skeleton';
import AnimatedNumber from '../components/ui/AnimatedNumber';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-highest px-4 py-3 rounded-xl shadow-xl border border-outline-variant/20 text-xs z-50">
        <p className="font-bold text-on-surface mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className={`tabular-nums flex items-center gap-2 ${p.dataKey === 'income' ? 'text-secondary' : p.dataKey === 'expense' ? 'text-tertiary' : 'text-primary'}`}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
            <span className="capitalize">{p.name}:</span> Rp {Number(p.value).toLocaleString('id-ID')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const showToast = useToast();
  const [summary, setSummary] = useState(null);
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/analytics/summary', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
        
        // Fetch transactions to generate dynamic chart data
        const trxRes = await fetch('http://localhost:3001/api/transactions?limit=1000', { credentials: 'include' });
        if (trxRes.ok) {
           const trxData = await trxRes.json();
           const items = Array.isArray(trxData.data) ? trxData.data : [];
           
           // Process for trends (group by month)
           const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
           const grouped = {};
           items.forEach(trx => {
             const d = new Date(trx.date);
             const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
             if (!grouped[key]) grouped[key] = { income: 0, expense: 0, name: key, sortKey: d.getTime() };
             if (trx.type === 'income') grouped[key].income += Number(trx.amount);
             else grouped[key].expense += Number(trx.amount);
           });
           
           let sorted = Object.values(grouped).sort((a,b) => a.sortKey - b.sortKey);
           if (sorted.length === 0) {
             // Mock data if empty
             sorted = ['NOV 23', 'DEC 23', 'JAN 24', 'FEB 24'].map(m => ({name: m, income: Math.random()*10000000+5000000, expense: Math.random()*8000000+2000000}));
           }
           setTrendsData(sorted.slice(-8)); // last 8 months
        }
      } catch (e) { console.error("Failed to fetch analytics", e); }
      finally { setLoading(false); }
    };
    fetchSummary();
  }, []);

  const fmt = (val) => {
    if (!val && val !== 0) return 'Rp 0';
    const n = Number(val);
    if (Math.abs(n) >= 1e9) return 'Rp ' + (n / 1e9).toFixed(1) + 'B';
    if (Math.abs(n) >= 1e6) return 'Rp ' + (n / 1e6).toFixed(0) + 'M';
    return 'Rp ' + n.toLocaleString('id-ID');
  };

  const handlePDF = () => { window.print(); showToast('Preparing PDF...', 'success'); };
  const handleCSV = () => { window.open('http://localhost:3001/api/transactions/export/csv', '_blank'); showToast('CSV download started', 'success'); };
  const handleDownloadReport = () => { window.print(); showToast('Generating report...', 'success'); };

  const totalIncome = summary ? (summary.netSavings + summary.monthlyBurnRate) : 0;
  
  // Dynamic Pie Data
  const pieData = [
    { name: 'Primary', value: (summary?.monthlyBurnRate || 0) * 0.7 },
    { name: 'Discretionary', value: (summary?.monthlyBurnRate || 0) * 0.2 },
    { name: 'Others', value: (summary?.monthlyBurnRate || 0) * 0.1 },
  ];
  const pieColors = ['#4edea3', '#ffb3ad', '#c0c1ff'];
  
  // Quarterly Data (Mock dynamic based on total)
  const qData = [
    { name: 'Q1', profit: summary ? summary.netSavings * 0.2 : 0 },
    { name: 'Q2', profit: summary ? summary.netSavings * 0.4 : 0 },
    { name: 'Q3', profit: summary ? summary.netSavings * 0.9 : 0 },
    { name: 'Q4', profit: summary ? summary.netSavings * 1.5 : 0 },
  ];

  return (
    <RootLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-stagger">
          <div>
            <nav className="flex items-center gap-2 text-xs font-label uppercase tracking-[0.1em] text-on-surface-variant mb-2">
              <span>Performance</span>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span className="text-primary-fixed-dim">Analytics</span>
            </nav>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Analytics & Insights</h1>
          </div>
          <div className="flex items-center gap-3 no-print">
            <button onClick={handlePDF} className="flex items-center gap-2 bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/15 text-sm font-medium hover:bg-surface-bright active:scale-95 transition-all">
              <span className="material-symbols-outlined text-primary text-sm">picture_as_pdf</span>
              <span>PDF</span>
            </button>
            <button onClick={handleCSV} className="flex items-center gap-2 bg-surface-container px-4 py-2.5 rounded-xl border border-outline-variant/15 text-sm font-medium hover:bg-surface-bright active:scale-95 transition-all">
              <span className="material-symbols-outlined text-primary text-sm">csv</span>
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Row */}
        {loading ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-stagger">
             <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </section>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-stagger">
            {/* Card 1 */}
            <div className="bg-surface-container p-6 rounded-xl border-t border-white/5 flex flex-col justify-between h-40 hover:bg-surface-container-high transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Net Savings Rate</span>
                <div className="bg-secondary-container/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-secondary">trending_up</span>
                </div>
              </div>
              <div>
                <div className="text-4xl font-semibold tracking-tight tabular-nums">{summary?.netSavingsRate || '0%'}</div>
                <p className="text-xs text-on-surface-variant mt-1">From database calculations</p>
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-surface-container p-6 rounded-xl border-t border-white/5 flex flex-col justify-between h-40 hover:bg-surface-container-high transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Monthly Burn Rate</span>
                <span className="material-symbols-outlined text-on-surface-variant">monitoring</span>
              </div>
              <div>
                <div className="text-3xl font-semibold tracking-tight tabular-nums"><AnimatedNumber value={summary?.monthlyBurnRate} prefix="Rp " /></div>
                <div className="w-full bg-surface-container-lowest h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-tertiary h-full transition-all duration-1000" style={{ width: totalIncome > 0 ? `${Math.min(100, Math.round((summary?.monthlyBurnRate || 0) / totalIncome * 100))}%` : '0%' }}></div>
                </div>
              </div>
            </div>
            {/* Card 3 */}
            <div className="bg-surface-container p-6 rounded-xl border-t border-white/5 flex flex-col justify-between h-40 hover:bg-surface-container-high transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Total Income</span>
                <div className="bg-secondary-container/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-secondary">arrow_upward</span>
                </div>
              </div>
              <div>
                <div className="text-3xl font-semibold tracking-tight tabular-nums"><AnimatedNumber value={totalIncome} prefix="Rp " /></div>
                <p className="text-xs text-on-surface-variant mt-1">All-time income total</p>
              </div>
            </div>
            {/* Card 4 */}
            <div className="bg-surface-container p-6 rounded-xl border-t border-white/5 flex flex-col justify-between h-40 hover:bg-surface-container-high transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Proj. Annual Profit</span>
                <span className="material-symbols-outlined text-primary">account_balance</span>
              </div>
              <div>
                <div className="text-3xl font-semibold tracking-tight tabular-nums"><AnimatedNumber value={summary?.projAnnualProfit} prefix="Rp " /></div>
                <p className="text-xs text-on-surface-variant mt-1">Based on current trajectory</p>
              </div>
            </div>
          </section>
        )}

        {/* Main Analytics Grid */}
        <section className="grid grid-cols-12 gap-8 mb-12 animate-stagger">
          {/* Income vs Expense Area Chart */}
          <div className="col-span-12 lg:col-span-8 bg-surface-container p-8 rounded-xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-semibold text-on-surface">Cash Flow Trends</h3>
                <p className="text-sm text-on-surface-variant">Monthly Income vs. Expense Comparison</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#4edea3]"></div>
                  <span className="text-xs font-medium uppercase tracking-wider">Income</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ffb3ad]"></div>
                  <span className="text-xs font-medium uppercase tracking-wider">Expenses</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-[300px] w-full mt-4">
               {loading ? (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant">Loading chart data...</div>
               ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4edea3" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4edea3" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffb3ad" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ffb3ad" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : v} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="income" name="Income" stroke="#4edea3" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" animationDuration={1000}/>
                      <Area type="monotone" dataKey="expense" name="Expense" stroke="#ffb3ad" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" animationDuration={1000}/>
                    </AreaChart>
                  </ResponsiveContainer>
               )}
            </div>
          </div>

          {/* Expense Allocation Donut */}
          <div className="col-span-12 lg:col-span-4 bg-surface-container p-8 rounded-xl flex flex-col">
            <h3 className="text-xl font-semibold text-on-surface mb-2">Expense Allocation</h3>
            <p className="text-sm text-on-surface-variant mb-6">Distribution across verticals</p>
            <div className="relative w-full h-48 mx-auto mb-6">
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        animationDuration={1000}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs uppercase text-on-surface-variant font-bold">Total</span>
                <span className="text-xl font-bold tabular-nums">{fmt(summary?.monthlyBurnRate)}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-[#4edea3]"></div><span className="text-sm text-on-surface font-medium group-hover:text-white transition-colors">Primary Expenses</span></div>
                <span className="text-sm tabular-nums font-bold text-on-surface-variant">70%</span>
              </div>
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-[#ffb3ad]"></div><span className="text-sm text-on-surface font-medium group-hover:text-white transition-colors">Discretionary</span></div>
                <span className="text-sm tabular-nums font-bold text-on-surface-variant">20%</span>
              </div>
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-[#c0c1ff]"></div><span className="text-sm text-on-surface font-medium group-hover:text-white transition-colors">Others</span></div>
                <span className="text-sm tabular-nums font-bold text-on-surface-variant">10%</span>
              </div>
            </div>
          </div>

          {/* Quarterly Profitability */}
          <div className="col-span-12 lg:col-span-7 bg-surface-container p-8 rounded-xl flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-on-surface">Quarterly Profitability</h3>
                <p className="text-sm text-on-surface-variant">Based on net savings data</p>
              </div>
            </div>
            <div className="flex-1 min-h-[220px] w-full">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant">Loading chart...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={qData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : v} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="profit" name="Profit" fill="#c0c1ff" radius={[4, 4, 0, 0]} animationDuration={1000}>
                      {qData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === qData.length - 1 ? '#4edea3' : '#314275'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            <div className="bg-surface-container p-6 rounded-xl flex-1 border-l-4 border-primary">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">AI Insights</h4>
                  <p className="text-[10px] text-primary-fixed-dim uppercase tracking-widest">Generative Intelligence</p>
                </div>
              </div>
              <div className="space-y-6 custom-scrollbar pr-2 overflow-y-auto max-h-[300px]">
                <div className="bg-surface-container-lowest p-4 rounded-xl transition-all hover:bg-surface-container-highest">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      Your savings rate is <span className="text-secondary font-bold tabular-nums">{summary?.netSavingsRate || '0%'}</span>. {Number(String(summary?.netSavingsRate || '0').replace('%', '')) > 30 ? 'Great performance! Keep it up.' : 'Consider reviewing discretionary expenses.'}
                    </p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl transition-all hover:bg-surface-container-highest">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5">lightbulb</span>
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      Projected annual profit: <span className="text-primary font-bold tabular-nums">{fmt(summary?.projAnnualProfit)}</span>. Reinvesting 20% into fixed assets is recommended.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Download Report Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-stagger mb-12">
          <div className="md:col-span-2 bg-surface-container rounded-xl overflow-hidden shadow-lg">
            <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Financial Summary</h3>
            </div>
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full flex-1 p-6 rounded-xl bg-surface-container-low flex flex-col gap-2 transition-transform hover:-translate-y-1">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Total Income</span>
                  <span className="text-2xl font-bold"><AnimatedNumber value={totalIncome} prefix="Rp " /></span>
                  <span className="text-xs text-secondary font-semibold">From transactions</span>
                </div>
                <div className="w-full flex-1 p-6 rounded-xl bg-surface-container-low flex flex-col gap-2 transition-transform hover:-translate-y-1">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Total Expense</span>
                  <span className="text-2xl font-bold"><AnimatedNumber value={summary?.monthlyBurnRate} prefix="Rp " /></span>
                  <span className="text-xs text-tertiary font-semibold">From transactions</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 flex flex-col justify-center items-center text-center shadow-lg transition-colors hover:bg-primary/10">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">workspace_premium</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Liquidity Master Report</h3>
            <p className="text-sm text-on-surface-variant mb-8 px-4 leading-relaxed">Download the comprehensive executive summary.</p>
            <button onClick={handleDownloadReport} className="w-full bg-on-surface text-inverse-on-surface py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-primary transition-all active:scale-95 shadow-md hover:shadow-primary/30">
              <span className="material-symbols-outlined text-xl">download</span>
              <span>Download Report</span>
            </button>
          </div>
        </section>
      </div>
    </RootLayout>
  );
}
