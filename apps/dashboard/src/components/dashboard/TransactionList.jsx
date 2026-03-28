import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SkeletonRow } from '../ui/Skeleton';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const url = new URL('http://localhost:3001/api/transactions');
        url.searchParams.append('page', '1');
        url.searchParams.append('limit', '5');
        const res = await fetch(url.toString(), { credentials: 'include' });
        const json = await res.json();
        const data = json.data || json;
        setTransactions(Array.isArray(data) ? data : []);
      } catch (e) { console.error("Failed to load recent transactions", e); }
      finally { setLoading(false); }
    };
    fetchRecent();
  }, []);

  const getIcon = (type) => type === 'income' ? 'payments' : 'receipt_long';

  return (
    <section className="lg:col-span-4">
      <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 h-full flex flex-col animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg">Recent Transactions</h3>
          <Link to="/transactions" className="text-primary text-xs font-medium hover:underline">View All</Link>
        </div>
        
        <div className="flex-1 space-y-2">
          {loading && (
            <>
              <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
            </>
          )}
          {!loading && transactions.length === 0 && <p className="text-sm text-on-surface-variant text-center py-8">No transactions yet.</p>}
          {!loading && transactions.map((tx, idx) => (
            <div 
              key={tx.id} 
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-highest transition-all duration-200 group cursor-pointer"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'text-secondary bg-secondary/10' : 'text-tertiary bg-tertiary/10'}`}>
                <span className="material-symbols-outlined text-xl">{getIcon(tx.type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold group-hover:text-white transition-colors truncate">{tx.description}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">{new Date(tx.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold tabular-nums ${tx.type === 'income' ? 'text-secondary' : 'text-tertiary'}`}>
                  {tx.type === 'income' ? '+' : '-'}Rp {Number(tx.amount).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <p className="text-xs font-medium text-primary-fixed-dim">Vault AI: Add more transactions for smarter recommendations.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
