import React, { useState, useEffect } from 'react';
import RootLayout from '../components/layout/RootLayout';
import { useToast } from '../components/ui/Toast';
import { SkeletonCard, SkeletonTable } from '../components/ui/Skeleton';
import AnimatedNumber from '../components/ui/AnimatedNumber';

export default function Assets() {
  const showToast = useToast();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', assetClass: 'cash', ticker: '', balance: '', costBasis: '', currentValue: ''
  });

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/assets', { credentials: 'include' });
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Failed to load assets", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAssets(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:3001/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Failed to create asset");
      setShowModal(false);
      setFormData({ name: '', assetClass: 'cash', ticker: '', balance: '', costBasis: '', currentValue: '' });
      showToast('Asset added successfully! 🎉');
      fetchAssets();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this asset?')) return;
    try {
      await fetch(`http://localhost:3001/api/assets/${id}`, { method: 'DELETE', credentials: 'include' });
      showToast('Asset deleted successfully');
      fetchAssets();
    } catch (e) { showToast('Error deleting asset', 'error'); }
  };

  const handleDownloadCSV = () => {
    // Generate CSV from current assets data
    const headers = ['Name', 'Class', 'Ticker', 'Balance', 'Cost Basis', 'Current Value'];
    const rows = assets.map(a => [a.name, a.assetClass, a.ticker || '', a.balance, a.costBasis, a.currentValue]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assets_report.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Asset report downloaded');
  };

  const fmt = (val) => {
    if (!val && val !== 0) return 'Rp 0';
    return 'Rp ' + Number(val).toLocaleString('id-ID');
  };

  const cashAssets = assets.filter(a => a.assetClass === 'cash');
  const investmentAssets = assets.filter(a => a.assetClass === 'investment');
  const fixedAssets = assets.filter(a => a.assetClass === 'fixed');

  const totalValue = assets.reduce((sum, a) => sum + Number(a.currentValue || 0), 0);
  const totalCash = cashAssets.reduce((sum, a) => sum + Number(a.currentValue || 0), 0);
  const totalInvestment = investmentAssets.reduce((sum, a) => sum + Number(a.currentValue || 0), 0);
  const totalFixed = fixedAssets.reduce((sum, a) => sum + Number(a.currentValue || 0), 0);

  const pctCash = totalValue > 0 ? Math.round((totalCash / totalValue) * 100) : 0;
  const pctInvestment = totalValue > 0 ? Math.round((totalInvestment / totalValue) * 100) : 0;
  const pctFixed = totalValue > 0 ? Math.round((totalFixed / totalValue) * 100) : 0;

  return (
    <RootLayout>
      <div className="animate-fade-in">
        {/* Portfolio Summary Header */}
        <section className="mb-10 animate-stagger">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">Net Portfolio Value</span>
              <h1 className="text-[3.5rem] font-semibold tracking-tight tabular-nums leading-none mt-2">
                <AnimatedNumber value={totalValue} prefix="Rp " />
              </h1>
              <div className="flex items-center gap-3 mt-4">
                <span className="text-on-surface-variant/60 text-xs">{assets.length} assets tracked</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowModal(true)} className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-95 hover:shadow-lg hover:shadow-primary/20">
                Add Asset
              </button>
              <button onClick={handleDownloadCSV} className="bg-surface-variant hover:bg-surface-bright text-on-surface px-4 py-3 rounded-xl transition-all active:scale-95" title="Download CSV">
                <span className="material-symbols-outlined">file_download</span>
              </button>
            </div>
          </div>
          {/* Allocation Visualizer */}
          <div className="bg-surface-container rounded-xl p-8 relative overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-20 -mt-20"></div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Strategic Allocation</h3>
              <div className="flex gap-6 text-xs font-medium">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Liquid ({pctCash}%)</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span> Investments ({pctInvestment}%)</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span> Fixed Assets ({pctFixed}%)</div>
              </div>
            </div>
            <div className="w-full h-3 bg-surface-container-lowest rounded-full flex overflow-hidden">
              <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${pctCash}%` }}></div>
              <div className="h-full bg-secondary transition-all duration-1000 ease-out" style={{ width: `${pctInvestment}%` }}></div>
              <div className="h-full bg-tertiary transition-all duration-1000 ease-out" style={{ width: `${pctFixed}%` }}></div>
            </div>
          </div>
        </section>

        {loading && (
           <div className="grid grid-cols-12 gap-6 animate-stagger">
             <div className="col-span-12 lg:col-span-4"><SkeletonCard /></div>
             <div className="col-span-12 lg:col-span-8"><SkeletonTable rows={3} /></div>
             <div className="col-span-12"><SkeletonCard /></div>
           </div>
        )}

        {!loading && (
          <div className="grid grid-cols-12 gap-6 animate-stagger">
            {/* Cash & Equivalents */}
            <div className="col-span-12 lg:col-span-4 bg-surface-container rounded-xl p-6 transition-colors hover:bg-surface-container-high group">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-lg font-medium text-on-surface">Cash & Equivalents</h2>
                  <p className="text-xs text-on-surface-variant">Immediate liquidity available</p>
                </div>
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">account_balance_wallet</span>
              </div>
              <div className="space-y-5 animate-stagger">
                {cashAssets.length === 0 && <p className="text-sm text-on-surface-variant">No cash assets yet.</p>}
                {cashAssets.map(asset => (
                  <div key={asset.id} className="flex justify-between items-center group/item transition-all hover:-translate-y-1">
                    <div>
                      <p className="text-xs text-on-surface-variant">{asset.ticker || 'Cash'}</p>
                      <p className="font-medium inline-block">{asset.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="tabular-nums font-semibold"><AnimatedNumber value={asset.currentValue} prefix="Rp " /></p>
                      <button onClick={() => handleDelete(asset.id)} className="opacity-0 group-hover/item:opacity-100 text-on-surface-variant hover:text-tertiary transition-all">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-xs text-on-surface-variant">Total Liquid Value</span>
                  <span className="text-sm font-bold text-primary tabular-nums"><AnimatedNumber value={totalCash} prefix="Rp " /></span>
                </div>
              </div>
            </div>

            {/* Investment Portfolio */}
            <div className="col-span-12 lg:col-span-8 bg-surface-container rounded-xl p-6 transition-colors hover:bg-surface-container-high">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-lg font-medium text-on-surface">Investment Portfolio</h2>
                  <p className="text-xs text-on-surface-variant">Equities, Fixed Income, & Managed Funds</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 border-b border-white/5">
                      <th className="pb-4">Asset Name</th>
                      <th className="pb-4">Ticker</th>
                      <th className="pb-4">Cost Basis</th>
                      <th className="pb-4">Current Value</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm animate-stagger">
                    {investmentAssets.length === 0 && (
                      <tr><td colSpan="5" className="py-8 text-center text-on-surface-variant">No investments yet.</td></tr>
                    )}
                    {investmentAssets.map(asset => (
                      <tr key={asset.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group/row">
                        <td className="py-4 font-medium transition-transform group-hover/row:translate-x-1">{asset.name}</td>
                        <td className="py-4 tabular-nums text-on-surface-variant">{asset.ticker || '-'}</td>
                        <td className="py-4 tabular-nums">{fmt(asset.costBasis)}</td>
                        <td className="py-4 tabular-nums font-semibold"><AnimatedNumber value={asset.currentValue} prefix="Rp " /></td>
                        <td className="py-4 text-right">
                          <button onClick={() => handleDelete(asset.id)} className="opacity-0 group-hover/row:opacity-100 p-2 text-on-surface-variant hover:text-tertiary transition-all">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fixed Assets */}
            <div className="col-span-12 bg-surface-container rounded-xl p-6 transition-colors hover:bg-surface-container-high">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-lg font-medium text-on-surface">Fixed Assets</h2>
                  <p className="text-xs text-on-surface-variant">Real Estate & Strategic Equipment</p>
                </div>
                <span className="material-symbols-outlined text-tertiary">apartment</span>
              </div>
              <div className="space-y-4 animate-stagger">
                {fixedAssets.length === 0 && <p className="text-sm text-on-surface-variant">No fixed assets yet.</p>}
                {fixedAssets.map(asset => (
                  <div key={asset.id} className="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-lg group/item transition-all hover:scale-[1.01] hover:shadow-lg">
                    <div className="w-12 h-12 rounded-lg bg-surface-variant flex items-center justify-center text-tertiary flex-shrink-0">
                      <span className="material-symbols-outlined">home</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{asset.name}</h4>
                        <button onClick={() => handleDelete(asset.id)} className="opacity-0 group-hover/item:opacity-100 p-1 text-on-surface-variant hover:text-tertiary transition-all">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                      <p className="text-xs text-on-surface-variant">{asset.ticker || 'Fixed Asset'}</p>
                      <p className="text-sm font-bold mt-1 tabular-nums"><AnimatedNumber value={asset.currentValue} prefix="Rp " /></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Asset Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-only">
            <div className="bg-surface border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl modal-animate">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-headline font-bold text-on-surface">Add Asset</h3>
                <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface transition-colors"><span className="material-symbols-outlined">close</span></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Asset Class</label>
                  <select required value={formData.assetClass} onChange={e => setFormData({...formData, assetClass: e.target.value})} className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary transition-colors hover:bg-surface-container-high">
                    <option value="cash">Cash & Equivalents</option>
                    <option value="investment">Investment</option>
                    <option value="fixed">Fixed Asset</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Asset Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary transition-colors hover:bg-surface-container-high" placeholder="e.g. Bank Mandiri" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1 block">Ticker / Label</label>
                    <input type="text" value={formData.ticker} onChange={e => setFormData({...formData, ticker: e.target.value})} className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary transition-colors hover:bg-surface-container-high" placeholder="e.g. BBCA" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1 block">Balance / Units</label>
                    <input required type="text" value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary tabular-nums transition-colors hover:bg-surface-container-high" placeholder="e.g. 100" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1 block">Cost Basis (Rp)</label>
                    <input required type="number" min="0" value={formData.costBasis} onChange={e => setFormData({...formData, costBasis: e.target.value})} className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary tabular-nums transition-colors hover:bg-surface-container-high" placeholder="15000000" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant mb-1 block">Current Value (Rp)</label>
                    <input required type="number" min="0" value={formData.currentValue} onChange={e => setFormData({...formData, currentValue: e.target.value})} className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary tabular-nums transition-colors hover:bg-surface-container-high" placeholder="17500000" />
                  </div>
                </div>
                <button disabled={submitting} type="submit" className="w-full mt-4 bg-primary text-on-primary font-bold rounded-xl py-3 text-sm disabled:opacity-50 hover:bg-primary/90 active:scale-95 transition-all">
                  {submitting ? 'Saving...' : 'Save Asset'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </RootLayout>
  );
}
