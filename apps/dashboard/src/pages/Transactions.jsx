import React, { useState, useEffect } from 'react';
import RootLayout from '../components/layout/RootLayout';
import { useToast } from '../components/ui/Toast';
import { SkeletonTable } from '../components/ui/Skeleton';

export default function Transactions() {
  const showToast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtering State
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    description: '', subDescription: '', amount: '', type: 'expense', categoryId: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const url = new URL('http://localhost:3001/api/transactions');
      url.searchParams.append('page', page);
      url.searchParams.append('limit', limit);
      if (typeFilter && typeFilter !== 'All Types') {
        url.searchParams.append('type', typeFilter.toLowerCase());
      }
      const res = await fetch(url.toString(), { credentials: 'include' });
      const { data, meta } = await res.json();
      if (!res.ok) throw new Error('Failed to fetch');
      setTransactions(Array.isArray(data) ? data : []);
      setTotal(meta?.total || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/categories', { credentials: 'include' });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch(e) { console.error(e); }
  };

  useEffect(() => { fetchTransactions(); fetchCategories(); }, [typeFilter, page]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === 'true') {
      setShowModal(true);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleExportCSV = () => {
    window.open('http://localhost:3001/api/transactions/export/csv', '_blank');
    showToast('CSV download started!');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/transactions/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error("Delete failed");
      showToast('Transaction deleted', 'success');
      fetchTransactions();
    } catch(e) { showToast('Error deleting transaction', 'error'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:3001/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...formData, amount: String(formData.amount) })
      });
      if (!res.ok) throw new Error("Failed to create transaction");
      setShowModal(false);
      setFormData({ description: '', subDescription: '', amount: '', type: 'expense', categoryId: '', date: new Date().toISOString().split('T')[0] });
      showToast('Transaction saved successfully! 🎉');
      fetchTransactions();
    } catch(e) { showToast(e.message, 'error'); }
    finally { setSubmitting(false); }
  };

  // Client-side search filter
  const filtered = transactions.filter(trx =>
    trx.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RootLayout title="Transactions">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Filter Bar */}
        <section className="bg-surface-container-low rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-center shadow-xl">
          <div className="relative w-full lg:flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-lowest border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary text-on-surface placeholder-on-surface-variant/50" 
              placeholder="Search transactions..." 
              type="text" 
            />
          </div>
          <div className="flex flex-wrap md:flex-nowrap gap-3 w-full lg:w-auto">
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-on-primary font-bold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-primary/90 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-sm">add</span>
              <span>New Transaction</span>
            </button>
            <select 
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="bg-surface-container-lowest border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary text-on-surface appearance-none pr-10 min-w-[140px]"
            >
              <option>All Types</option>
              <option>Income</option>
              <option>Expense</option>
            </select>
            <button onClick={handleExportCSV} className="flex items-center gap-2 bg-primary/20 text-primary font-bold rounded-xl px-4 py-3 text-sm cursor-pointer hover:bg-primary/30 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </section>

        {/* Table Container */}
        <section className="bg-surface-container rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-surface-container-high/50">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Description</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Nominal</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading && (
                  <tr><td colSpan="6"><SkeletonTable rows={5} /></td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-12 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">receipt_long</span>
                    No transactions found.
                  </td></tr>
                )}
                {!loading && filtered.map((trx, idx) => (
                  <tr key={trx.id} className="hover:bg-surface-bright/20 transition-all duration-200 group animate-fade-in" style={{ animationDelay: `${idx * 0.03}s` }}>
                    <td className="px-6 py-5 text-sm tabular-nums text-on-surface-variant whitespace-nowrap">{new Date(trx.date).toLocaleDateString()}</td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-on-surface">{trx.description}</span>
                        {trx.subDescription && <span className="text-[11px] text-on-surface-variant">{trx.subDescription}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[11px] font-medium px-2 py-1 rounded bg-surface-container-highest">{trx.category?.name || 'Uncategorized'}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${trx.type === 'income' ? 'bg-secondary-container/20 text-secondary-fixed-dim' : 'bg-tertiary-container/20 text-tertiary-fixed-dim'}`}>
                        <span className="material-symbols-outlined text-xs">{trx.type === 'income' ? 'arrow_upward' : 'arrow_downward'}</span>
                        <span className="text-[11px] font-bold uppercase">{trx.type}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-5 text-right tabular-nums font-bold ${trx.type === 'income' ? 'text-secondary-fixed-dim' : 'text-tertiary-fixed-dim'}`}>
                      {trx.type === 'income' ? '+' : '-'}Rp {Number(trx.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDelete(trx.id)} className="p-2 hover:text-error transition-colors hover:bg-error/10 rounded-lg"><span className="material-symbols-outlined text-lg">delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length > 0 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-high/30">
              <p className="text-[11px] text-on-surface-variant uppercase tracking-widest font-medium">Page {page} of {Math.ceil(total / limit) || 1} · {total} total</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-white disabled:opacity-30 transition-all">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)} className="p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-white disabled:opacity-30 transition-all">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* NEW TRANSACTION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-only">
          <div className="bg-surface border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl modal-animate">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-headline font-bold text-on-surface">New Transaction</h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Type</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value, categoryId: ''})} className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant mb-1 block">Date</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant mb-1 block">Category</label>
                <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary">
                  <option value="" disabled>Select a category</option>
                  {categories.filter(c => c.type === formData.type).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant mb-1 block">Description</label>
                <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary" placeholder="E.g. Coffee" />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant mb-1 block">Sub Description (Optional)</label>
                <input type="text" value={formData.subDescription} onChange={e => setFormData({...formData, subDescription: e.target.value})} className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary" placeholder="Additional details" />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant mb-1 block">Amount (Rp)</label>
                <input required type="number" min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary tabular-nums" placeholder="150000" />
              </div>
              <button disabled={submitting} type="submit" className="w-full mt-4 bg-primary text-on-primary font-bold rounded-xl py-3 text-sm disabled:opacity-50 hover:bg-primary/90 active:scale-[0.98] transition-all">
                {submitting ? 'Saving...' : 'Save Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </RootLayout>
  );
}
