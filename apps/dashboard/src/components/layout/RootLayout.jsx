import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from '../../lib/auth-client';

export default function RootLayout({ children, title }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#131b2e]/60 backdrop-blur-xl flex items-center justify-between px-6 py-4 shadow-2xl shadow-[#000000]/40">
        <div className="flex items-center gap-4">
          {title ? (
            <h2 className="font-['Inter'] tabular-nums tracking-tight text-[#c0c1ff] text-xl font-semibold">{title}</h2>
          ) : (
            <span className="text-xl font-semibold text-[#c0c1ff] tracking-tighter">DAS Finance</span>
          )}
        </div>
        <div className="flex items-center gap-6">
          {!title && (
            <div className="hidden md:flex gap-8">
              <Link to="/dashboard" className="text-[#c0c1ff] font-medium transition-colors font-['Inter'] tabular-nums tracking-tight">Vault</Link>
              <Link to="#" className="text-[#c7c4d7] hover:bg-[#2d3449] transition-colors font-['Inter'] tabular-nums tracking-tight">Analytics</Link>
              <Link to="/transactions" className="text-[#c7c4d7] hover:bg-[#2d3449] transition-colors font-['Inter'] tabular-nums tracking-tight">Transactions</Link>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-[#2d3449] active:scale-95 duration-200 text-[#c0c1ff]">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button className="p-2 rounded-full hover:bg-[#2d3449] active:scale-95 duration-200 text-[#c0c1ff]">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/20">
              <img 
                alt="User profile avatar" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYzE3znlg7C4g0izP6nWcvLdZu5NW3rBBcTRKwkvjjdwn877dRYMW_-xBw61nBguQF8YbqFWSCSX9OSc_U-VTX_kZiJ8_h2M59rYzmmnDR0xO-98lTGuCJ3A0xTgOqxgBUDOkp_uta754iDZnxHQjRL3YV5Fy3lZIEvY_fyFOiqr3BEYi7GQCjxH-4_FQQ0KAY_VVwgpY4r_9GojfTTvD0FE17E_oqpEL6goVGSBiyzWkLwiEYOO2sdag8f9Zf8fIcPuX2_Iv8mIGV"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 hidden md:flex flex-col bg-[#131b2e] py-8 z-40 border-r border-outline-variant/10">
        <div className="px-6 mb-10 mt-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary/10 rounded-xl">
              <span className="material-symbols-outlined text-primary">account_balance</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#c0c1ff] leading-none">DAS Finance</h1>
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">Premium Tier</p>
            </div>
          </div>
          <Link to="/transactions?new=true" className="w-full py-3 px-4 bg-primary text-on-primary rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>New Transaction</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-['Inter'] text-sm font-medium transition-all ${path === '/dashboard' || path === '/' ? 'bg-[#171f33] text-[#c0c1ff] border-r-2 border-[#c0c1ff]' : 'text-[#c7c4d7] hover:bg-[#171f33]/50 hover:text-white'}`}>
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span>Vault</span>
          </Link>
          <Link to="/analytics" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-['Inter'] text-sm font-medium transition-all ${path === '/analytics' ? 'bg-[#171f33] text-[#c0c1ff] border-r-2 border-[#c0c1ff]' : 'text-[#c7c4d7] hover:bg-[#171f33]/50 hover:text-white'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/analytics' ? "'FILL' 1" : "" }}>query_stats</span>
            <span>Analytics</span>
          </Link>
          <Link to="/transactions" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-['Inter'] text-sm font-medium transition-all ${path === '/transactions' ? 'bg-[#171f33] text-[#c0c1ff] border-r-2 border-[#c0c1ff]' : 'text-[#c7c4d7] hover:bg-[#171f33]/50 hover:text-white'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/transactions' ? "'FILL' 1" : "" }}>receipt_long</span>
            <span>Transactions</span>
          </Link>
          <Link to="/assets" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-['Inter'] text-sm font-medium transition-all ${path === '/assets' ? 'bg-[#171f33] text-[#c0c1ff] border-r-2 border-[#c0c1ff]' : 'text-[#c7c4d7] hover:bg-[#171f33]/50 hover:text-white'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/assets' ? "'FILL' 1" : "" }}>account_balance</span>
            <span>Assets</span>
          </Link>
          <Link to="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg font-['Inter'] text-sm font-medium transition-all ${path === '/settings' ? 'bg-[#171f33] text-[#c0c1ff] border-r-2 border-[#c0c1ff]' : 'text-[#c7c4d7] hover:bg-[#171f33]/50 hover:text-white'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/settings' ? "'FILL' 1" : "" }}>settings</span>
            <span>Settings</span>
          </Link>
        </nav>
        <div className="px-4 py-6 border-t border-outline-variant/10 space-y-1">
          <a className="flex items-center gap-3 px-4 py-2 text-[#c7c4d7] hover:text-white transition-all font-['Inter'] text-sm font-medium" href="#">
            <span className="material-symbols-outlined">help_outline</span>
            <span>Support</span>
          </a>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-tertiary-container hover:text-tertiary transition-all font-['Inter'] text-sm font-medium w-full">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:ml-64 pt-24 pb-32 px-6 lg:px-12 max-w-7xl mx-auto">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 md:hidden z-50 bg-[#131b2e]/80 backdrop-blur-2xl rounded-t-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.3)]">
        <a className="flex flex-col items-center justify-center text-[#c0c1ff] bg-[#2d3449] rounded-xl px-4 py-1 active:scale-90 transition-transform" href="#">
          <span className="material-symbols-outlined">grid_view</span>
          <span className="font-['Inter'] text-[10px] uppercase tracking-widest mt-1">Home</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#c7c4d7] hover:bg-[#171f33] active:scale-90 transition-transform" href="#">
          <span className="material-symbols-outlined">swap_horiz</span>
          <span className="font-['Inter'] text-[10px] uppercase tracking-widest mt-1">Transfers</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#c7c4d7] hover:bg-[#171f33] active:scale-90 transition-transform" href="#">
          <span className="material-symbols-outlined">credit_card</span>
          <span className="font-['Inter'] text-[10px] uppercase tracking-widest mt-1">Cards</span>
        </a>
        <a className="flex flex-col items-center justify-center text-[#c7c4d7] hover:bg-[#171f33] active:scale-90 transition-transform" href="#">
          <span className="material-symbols-outlined">person</span>
          <span className="font-['Inter'] text-[10px] uppercase tracking-widest mt-1">Profile</span>
        </a>
      </nav>

      {/* Floating Action Button */}
      <Link to="/transactions?new=true" className="fixed bottom-24 right-6 md:bottom-12 md:right-12 w-16 h-16 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-center active:scale-95 transition-all group z-50 hover:brightness-110 cursor-pointer">
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-300">add</span>
      </Link>
    </>
  );
}
