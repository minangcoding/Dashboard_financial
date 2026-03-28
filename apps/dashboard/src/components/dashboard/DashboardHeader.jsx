import React, { useEffect, useState } from 'react';

export default function DashboardHeader() {
  const [userName, setUserName] = useState('Executive');

  useEffect(() => {
    // Try fetching user session from Better Auth
    const fetchSession = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/auth/get-session', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data?.user?.name) setUserName(data.user.name);
          else if (data?.user?.email) setUserName(data.user.email.split('@')[0]);
        }
      } catch (e) { /* silently fail */ }
    };
    fetchSession();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 17) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
      <div>
        <p className="text-on-surface-variant font-medium mb-1">{getGreeting()},</p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">{userName}</h2>
      </div>
      <div className="flex items-center gap-4 bg-surface-container p-1 rounded-xl border border-outline-variant/10">
        <button className="px-4 py-2 rounded-lg bg-surface-container-highest text-primary font-medium text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-base">calendar_month</span>
          {currentMonth}
        </button>
      </div>
    </header>
  );
}
