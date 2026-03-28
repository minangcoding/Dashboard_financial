import React, { useState, useEffect } from 'react';
import RootLayout from '../components/layout/RootLayout';
import { useToast } from '../components/ui/Toast';
import { SkeletonCard } from '../components/ui/Skeleton';

export default function Categories() {
  const showToast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('income');
  const [formIcon, setFormIcon] = useState('payments');
  const [submitting, setSubmitting] = useState(false);

  const iconOptions = [
    'payments', 'monitoring', 'storefront', 'work', 'savings',
    'shopping_cart', 'directions_car', 'movie', 'medical_services', 'restaurant',
    'school', 'flight', 'home', 'fitness_center', 'devices'
  ];

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/categories', { credentials: 'include' });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:3001/api/categories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ name: formName, type: formType, icon: formIcon })
      });
      if (!res.ok) throw new Error("Failed");
      setIsModalOpen(false);
      setFormName(''); setFormType('income'); setFormIcon('payments');
      showToast('Category created! 🎉');
      fetchCategories();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/categories/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error("Delete failed");
      showToast('Category deleted');
      fetchCategories();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <RootLayout title="Categories Management">
      <div className="max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-2 block">System Configuration</label>
            <h3 className="text-4xl font-bold font-headline text-on-surface tracking-tight">Financial Categories</h3>
            <p className="text-on-surface-variant mt-2 max-w-md">Organize your cash flow with custom classifications.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/10 hover:shadow-primary/20 active:scale-95 transition-all group">
            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add</span>
            Tambah Kategori
          </button>
        </div>

        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-stagger">
            <div className="space-y-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
            <div className="space-y-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center"><span className="material-symbols-outlined text-secondary">trending_up</span></div>
                  <h4 className="text-xl font-semibold">Pemasukan</h4>
                </div>
                <span className="px-3 py-1 bg-secondary-container/20 text-secondary-fixed-dim text-[10px] font-bold rounded-full uppercase tracking-widest">{incomeCategories.length} Categories</span>
              </div>
              <div className="grid grid-cols-1 gap-4 animate-stagger">
                {incomeCategories.length === 0 && <p className="text-sm text-on-surface-variant py-4 text-center">No income categories. Click "Tambah Kategori" to add one.</p>}
                {incomeCategories.map(cat => (
                  <div key={cat.id} className="group bg-surface-container hover:bg-surface-container-high p-5 rounded-xl border border-transparent hover:border-outline-variant/20 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center text-secondary"><span className="material-symbols-outlined text-2xl">{cat.icon || 'category'}</span></div>
                        <div>
                          <h5 className="font-bold text-lg">{cat.name}</h5>
                          <span className="text-xs text-on-surface-variant tabular-nums">{cat.type}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(cat.id)} className="opacity-0 group-hover:opacity-100 p-2 text-on-surface-variant hover:text-tertiary hover:bg-tertiary/10 rounded-lg transition-all"><span className="material-symbols-outlined text-lg">delete</span></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center"><span className="material-symbols-outlined text-tertiary">trending_down</span></div>
                  <h4 className="text-xl font-semibold">Pengeluaran</h4>
                </div>
                <span className="px-3 py-1 bg-tertiary-container/20 text-tertiary-fixed-dim text-[10px] font-bold rounded-full uppercase tracking-widest">{expenseCategories.length} Categories</span>
              </div>
              <div className="grid grid-cols-1 gap-4 animate-stagger">
                {expenseCategories.length === 0 && <p className="text-sm text-on-surface-variant py-4 text-center">No expense categories yet.</p>}
                {expenseCategories.map(cat => (
                  <div key={cat.id} className="group bg-surface-container hover:bg-surface-container-high p-5 rounded-xl border border-transparent hover:border-outline-variant/20 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-surface-container-lowest flex items-center justify-center text-tertiary"><span className="material-symbols-outlined text-2xl">{cat.icon || 'category'}</span></div>
                        <div>
                          <h5 className="font-bold text-lg">{cat.name}</h5>
                          <span className="text-xs text-on-surface-variant tabular-nums">{cat.type}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(cat.id)} className="opacity-0 group-hover:opacity-100 p-2 text-on-surface-variant hover:text-tertiary hover:bg-tertiary/10 rounded-lg transition-all"><span className="material-symbols-outlined text-lg">delete</span></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-surface/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-only">
          <div className="bg-surface-container w-full max-w-lg rounded-2xl p-8 shadow-2xl border border-outline-variant/10 modal-animate">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-2xl font-bold">New Category</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Category Name</label>
                <input required value={formName} onChange={e => setFormName(e.target.value)} className="w-full bg-surface-container-lowest border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-primary text-on-surface" placeholder="e.g. Subscriptions" type="text" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setFormType('income')} className={`flex items-center justify-center gap-2 py-4 rounded-xl border-2 font-bold transition-all ${formType === 'income' ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-highest'}`}>
                    <span className="material-symbols-outlined">trending_up</span> Income
                  </button>
                  <button type="button" onClick={() => setFormType('expense')} className={`flex items-center justify-center gap-2 py-4 rounded-xl border-2 font-bold transition-all ${formType === 'expense' ? 'border-tertiary bg-tertiary/10 text-tertiary' : 'border-transparent bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-highest'}`}>
                    <span className="material-symbols-outlined">trending_down</span> Expense
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-2">Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {iconOptions.map(icon => (
                    <button key={icon} type="button" onClick={() => setFormIcon(icon)} className={`p-3 rounded-xl flex items-center justify-center transition-all ${formIcon === icon ? 'bg-primary/20 text-primary ring-2 ring-primary' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-highest'}`}>
                      <span className="material-symbols-outlined">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4">
                <button disabled={submitting} type="submit" className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </RootLayout>
  );
}
