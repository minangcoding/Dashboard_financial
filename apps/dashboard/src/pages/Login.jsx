import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp } from '../lib/auth-client';

const Login = () => {
  const navigate = useNavigate();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLoginView) {
        // Handle Login
        const result = await signIn.email({ email, password });
        if (result.error) throw new Error(result.error.message);
        navigate('/dashboard');
      } else {
        // Handle Sign Up & Seed
        const result = await signUp.email({ email, password, name });
        if (result.error) throw new Error(result.error.message);
        
        // After Sign Up, Seed the database automatically
        try {
           const res = await fetch("http://localhost:3001/api/seed", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ userId: result.data.user.id })
           });
           if (!res.ok) console.warn("Seed failed");
        } catch(e) { console.error("Seeding API error", e); }
        
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary/30 min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 geometric-bg pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px]"></div>

      <main className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-surface-container rounded-xl flex items-center justify-center mb-6 shadow-2xl">
            <span className="material-symbols-outlined text-primary text-4xl">account_balance</span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tighter text-primary">DAS Finance</h1>
          <p className="font-body text-on-surface-variant text-sm mt-2 font-medium">The Private Digital Vault</p>
        </div>

        <div className="glass-card rounded-xl p-8 shadow-2xl border border-outline-variant/10">
          <div className="mb-8">
            <h2 className="font-headline text-xl font-semibold text-on-surface mb-1">
              {isLoginView ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-on-surface-variant text-sm">
              {isLoginView ? 'Securely access your executive portfolio.' : 'Register to automatically populate dummy data.'}
            </p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg">{error}</div>}

          <form className="space-y-6" onSubmit={handleAuth}>
            {!isLoginView && (
              <div className="space-y-2">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">Full Name</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-on-surface-variant text-[20px]">person</span>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full h-12 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant/15 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary focus:border-primary transition-all" placeholder="John Doe" type="text" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1">Email Address</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant text-[20px]">mail</span>
                <input required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-12 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant/15 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary focus:border-primary transition-all tabular-nums" placeholder="executive@dasfinance.com" type="email" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Security Key</label>
                {isLoginView && <a className="text-[11px] font-semibold text-primary/70 hover:text-primary transition-colors" href="#">Forgot Key?</a>}
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant text-[20px]">lock</span>
                <input required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-12 pl-12 pr-12 bg-surface-container-lowest border border-outline-variant/15 rounded-lg text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-primary focus:border-primary transition-all tabular-nums" placeholder="••••••••••••" type="password" />
              </div>
            </div>

            <button disabled={loading} className="w-full h-12 bg-gradient-to-r from-secondary-container to-secondary flex items-center justify-center rounded-xl text-on-secondary-container font-bold text-sm tracking-wide shadow-lg shadow-secondary/10 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50" type="submit">
              {loading ? 'Processing...' : (isLoginView ? 'Authorize Access' : 'Create Vault & Seed Data')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-outline-variant/10 text-center">
            <p className="text-sm text-on-surface-variant">
              {isLoginView ? 'New to the vault?' : 'Already have an account?'}
              <button type="button" onClick={() => setIsLoginView(!isLoginView)} className="text-primary font-bold hover:underline underline-offset-4 ml-2">
                {isLoginView ? 'Open an Account' : 'Login Instead'}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center space-y-4">
          <div className="text-[10px] text-on-surface-variant/40 font-medium uppercase tracking-[0.2em]">
            © 2024 DAS Finance Institutional Group
          </div>
        </div>
      </main>
      
      <div className="hidden lg:block fixed right-[-15%] top-1/2 -translate-y-1/2 w-[40%] h-[80%] bg-surface-container rounded-[40px] rotate-12 border border-outline-variant/10 shadow-2xl overflow-hidden pointer-events-none opacity-50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"></div>
        <div className="p-20 flex flex-col justify-end h-full">
          <div className="h-1 bg-primary/20 w-32 mb-6"></div>
          <div className="text-6xl font-headline font-black text-on-surface-variant/10 leading-none mb-4">SECURE<br />STABLE<br />PRIVATE</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
