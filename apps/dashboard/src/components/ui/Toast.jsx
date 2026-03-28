import React, { useState, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[200] space-y-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`toast-animate pointer-events-auto px-5 py-3.5 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-3 min-w-[280px] border ${
              toast.type === 'success' 
                ? 'bg-[#0d2818] border-secondary/30 text-secondary' 
                : toast.type === 'error'
                ? 'bg-[#2d1114] border-red-500/30 text-red-400'
                : 'bg-surface-container border-outline-variant/20 text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
            </span>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
