
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, View, AppConfig } from './types.ts';
import { INITIAL_TASKS, NAV_ITEMS, TON_LOGO } from './constants.tsx';
import MiningView from './components/MiningView.tsx';
import ReferralView from './components/ReferralView.tsx';
import TasksView from './components/TasksView.tsx';
import AdminView from './components/AdminView.tsx';
import { Lock, X, Bell } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'ton_miner_v2_final';
const ADMIN_PASSCODE = "7788";

const INITIAL_CONFIG: AppConfig = {
  sessionDuration: 3600 * 1000, 
  miningRate: 0.0005, 
  referralCommissionPercent: 0.10,
  referralJoinBonus: 0.1, 
  dailyGiftReward: 0.001,
  dailyGiftCooldown: 24 * 60 * 60 * 1000,
  faucetReward: 0.0002,
  faucetCooldown: 15 * 60 * 1000,
  activeMinersDisplay: 42150,
  minWithdrawal: 0.5 
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.MINING);
  const [isAdminVisible, setIsAdminVisible] = useState(false);
  const [isPasscodePromptOpen, setIsPasscodePromptOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(type === 'error' ? 'error' : 'success');
      }
    } catch(e) {}
  }, []);

  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        return {
          ...p,
          stats: {
            balance: typeof p.stats?.balance === 'number' ? p.stats.balance : 0,
            sessionStartTime: p.stats?.sessionStartTime || null,
            lastDailyGiftClaimed: p.stats?.lastDailyGiftClaimed || null,
            lastFaucetClaimed: p.stats?.lastFaucetClaimed || null
          },
          config: { ...INITIAL_CONFIG, ...(p.config || {}) },
          tasks: Array.isArray(p.tasks) ? p.tasks : INITIAL_TASKS,
          withdrawals: Array.isArray(p.withdrawals) ? p.withdrawals : [],
          referrals: Array.isArray(p.referrals) ? p.referrals : [],
          referralCode: p.referralCode || `TON-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          monetization: { monetagTagId: '0', sponsoredLink: '#', adBonus: 0.0001, ...(p.monetization || {}) }
        };
      }
    } catch (e) { console.warn("Storage Reset"); }
    
    return {
      stats: { balance: 0.0, sessionStartTime: null, lastDailyGiftClaimed: null, lastFaucetClaimed: null },
      config: INITIAL_CONFIG,
      tasks: INITIAL_TASKS,
      referrals: [],
      withdrawals: [],
      referralCode: `TON-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      monetization: { monetagTagId: '0', sponsoredLink: '#', adBonus: 0.0001 }
    };
  });

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      try {
        tg.headerColor = '#020617';
        tg.backgroundColor = '#020617';
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch(e) {}
  }, [state]);

  const handleSecretToggle = () => {
    setLogoClickCount(prev => {
      if (prev + 1 >= 5) {
        setIsPasscodePromptOpen(true);
        try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('heavy'); } catch(e) {}
        return 0;
      }
      return prev + 1;
    });
    const timer = setTimeout(() => setLogoClickCount(0), 2000);
    return () => clearTimeout(timer);
  };

  const verifyPasscode = () => {
    if (passcodeInput === ADMIN_PASSCODE) {
      setIsAdminVisible(true);
      setIsPasscodePromptOpen(false);
      setPasscodeInput("");
      setCurrentView(View.ADMIN);
      showToast('تم تفعيل وضع المسؤول');
    } else {
      setPasscodeInput("");
      showToast('رمز الدخول خاطئ!', 'error');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => {
        const now = Date.now();
        if (prev.stats.sessionStartTime && (now - prev.stats.sessionStartTime >= prev.config.sessionDuration)) {
          return {
            ...prev,
            stats: { ...prev.stats, balance: prev.stats.balance + prev.config.miningRate, sessionStartTime: null }
          };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light'); } catch(e) {}
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative text-white overflow-hidden select-none bg-[#020617]">
      {toast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[2000] w-max max-w-[90%] pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
           <div className={`px-6 py-3 rounded-full border shadow-2xl backdrop-blur-3xl flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-200' : 'bg-blue-600/20 border-blue-400/50 text-blue-100'}`}>
             <Bell size={16} className="animate-pulse" />
             <span className="text-xs font-bold tracking-wide">{toast.message}</span>
           </div>
        </div>
      )}

      <header className="px-6 pt-10 pb-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleSecretToggle}>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30 animate-pulse"></div>
            {TON_LOGO("w-10 h-10 relative")}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tight uppercase">TON Miner</span>
            <span className="text-[9px] text-blue-400 font-bold tracking-[0.2em] uppercase opacity-70">Premium Cloud</span>
          </div>
        </div>
        <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-2 border-white/5 glow-blue">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{state.config.activeMinersDisplay.toLocaleString()}</span>
        </div>
      </header>

      <main className="flex-1 px-5 pb-32 pt-4 overflow-y-auto scroll-smooth">
        {currentView === View.MINING && (
          <MiningView 
            stats={state.stats} config={state.config} withdrawals={state.withdrawals} monetization={state.monetization}
            onStart={() => setState(p => ({ ...p, stats: { ...p.stats, sessionStartTime: Date.now() } }))} 
            onClaimDaily={() => { setState(p => ({ ...p, stats: { ...p.stats, balance: p.stats.balance + p.config.dailyGiftReward, lastDailyGiftClaimed: Date.now() } })); showToast('تم استلام الهدية!'); }} 
            onClaimFaucet={() => { setState(p => ({ ...p, stats: { ...p.stats, balance: p.stats.balance + p.config.faucetReward, lastFaucetClaimed: Date.now() } })); showToast('تم ملء الصنبور!'); }}
            onAdBonus={() => setState(p => ({ ...p, stats: { ...p.stats, balance: p.stats.balance + p.monetization.adBonus } }))}
            onWithdrawal={(wallet, amount) => { setState(prev => ({ ...prev, stats: { ...prev.stats, balance: prev.stats.balance - amount }, withdrawals: [...prev.withdrawals, { id: Date.now().toString(), username: 'User', walletAddress: wallet, amount, status: 'Pending', requestedAt: new Date().toLocaleString() }] })); showToast('تم إرسال طلب السحب'); }}
          />
        )}
        {currentView === View.REFERRALS && <ReferralView referrals={state.referrals} code={state.referralCode} />}
        {currentView === View.TASKS && <TasksView tasks={state.tasks} onComplete={(id) => { setState(prev => ({ ...prev, stats: { ...prev.stats, balance: prev.stats.balance + (prev.tasks.find(t => t.id === id)?.reward || 0) }, tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: true } : t) })); showToast('تم إكمال المهمة'); }} />}
        {currentView === View.ADMIN && isAdminVisible && (
          <AdminView 
            state={state} onUpdateConfig={(c) => setState(p => ({ ...p, config: c }))} onUpdateMonetization={(m) => setState(p => ({ ...p, monetization: m }))}
            onUpdateTasks={(t) => setState(p => ({ ...p, tasks: t }))} onUpdateWithdrawalStatus={(id, status) => setState(prev => ({ ...prev, withdrawals: prev.withdrawals.map(w => w.id === id ? { ...w, status } : w) }))}
            onReset={() => { localStorage.removeItem(LOCAL_STORAGE_KEY); window.location.reload(); }}
            onAddBalance={(amt) => setState(p => ({ ...p, stats: { ...p.stats, balance: p.stats.balance + amt } }))}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass-card border-t border-white/10 flex justify-around py-4 px-2 z-50 rounded-t-[2rem]">
        {NAV_ITEMS.filter(item => item.view !== View.ADMIN || isAdminVisible).map(({ view, label, Icon }) => (
          <button key={view} onClick={() => handleViewChange(view)} className={`flex flex-col items-center gap-1.5 flex-1 transition-all ${currentView === view ? 'text-blue-400' : 'text-slate-500'}`}>
            <div className={`p-2.5 rounded-xl transition-all ${currentView === view ? 'bg-blue-600/20 text-blue-400 scale-110 shadow-lg' : ''}`}>
              <Icon size={20} strokeWidth={currentView === view ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
          </button>
        ))}
      </nav>

      {isPasscodePromptOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[3000] flex items-center justify-center p-6 animate-in zoom-in-95">
           <div className="w-full glass-card rounded-[2.5rem] p-8 space-y-6 relative border-white/10 text-center">
              <button onClick={() => setIsPasscodePromptOpen(false)} className="absolute top-6 right-6 text-slate-500"><X size={24}/></button>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center text-red-500"><Lock size={30} /></div>
                <h2 className="text-xl font-black uppercase">منطقة المسؤولين</h2>
              </div>
              <input 
                type="password" value={passcodeInput} onChange={(e) => setPasscodeInput(e.target.value)} 
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-center text-2xl font-black text-white outline-none focus:border-red-500" 
                placeholder="••••" autoFocus 
              />
              <button onClick={verifyPasscode} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl text-sm uppercase transition-transform active:scale-95">دخول</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
