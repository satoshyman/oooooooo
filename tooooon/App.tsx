
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, View, Task, Referral, AppConfig, WithdrawalRequest, WithdrawalStatus } from './types';
import { INITIAL_TASKS, NAV_ITEMS, TON_LOGO } from './constants.tsx';
import MiningView from './components/MiningView';
import ReferralView from './components/ReferralView';
import TasksView from './components/TasksView';
import AdminView from './components/AdminView';
import { Lock, Unlock, X, Bell } from 'lucide-react';

declare global {
  interface Window {
    Telegram: any;
  }
}

const LOCAL_STORAGE_KEY = 'ton_miner_premium_v1';
const ADMIN_PASSCODE = "7788";

const INITIAL_CONFIG: AppConfig = {
  sessionDuration: 3600 * 1000, 
  miningRate: 0.0002, 
  referralCommissionPercent: 0.10,
  referralJoinBonus: 0.1, 
  dailyGiftReward: 0.0005,
  dailyGiftCooldown: 24 * 60 * 60 * 1000,
  faucetReward: 0.0001,
  faucetCooldown: 10 * 60 * 1000,
  activeMinersDisplay: 25430,
  minWithdrawal: 0.001 
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
  }, []);

  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
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
      tg.headerColor = '#020617';
      tg.backgroundColor = '#020617';
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const handleSecretToggle = () => {
    setLogoClickCount(prev => {
      const nextCount = prev + 1;
      if (nextCount >= 5) {
        setIsPasscodePromptOpen(true);
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('heavy');
        return 0;
      }
      return nextCount;
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
      showToast('Admin Mode Enabled', 'success');
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    } else {
      setPasscodeInput("");
      showToast('Invalid Passcode!', 'error');
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => {
        let newBalance = prev.stats.balance;
        let newSessionStartTime = prev.stats.sessionStartTime;
        const now = Date.now();
        
        if (newSessionStartTime && (now - newSessionStartTime >= prev.config.sessionDuration)) {
          newBalance += prev.config.miningRate;
          newSessionStartTime = null;
          showToast(`Mining Session Finished: +${prev.config.miningRate} TON`);
          window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
        }
        
        return { ...prev, stats: { ...prev.stats, balance: newBalance, sessionStartTime: newSessionStartTime } };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showToast]);

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative text-white overflow-hidden">
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[2000] w-max max-w-[90%] animate-in fade-in slide-in-from-top-8 duration-300">
           <div className={`px-8 py-4 rounded-full border shadow-2xl backdrop-blur-3xl flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-200' : 'bg-blue-500/20 border-blue-500/50 text-blue-100'}`}>
             <Bell size={20} className="animate-pulse" />
             <span className="text-sm font-bold tracking-wide">{toast.message}</span>
           </div>
        </div>
      )}

      <header className="px-6 pt-8 pb-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-4 cursor-pointer active:scale-95 transition-transform" onClick={handleSecretToggle}>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-40 animate-pulse"></div>
            {TON_LOGO("w-12 h-12 relative")}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl leading-tight tracking-tight uppercase">TON Miner</span>
            <span className="text-[10px] text-blue-400 font-black tracking-[0.3em] uppercase opacity-80">Cloud Simulation</span>
          </div>
        </div>
        <div className="glass-card px-4 py-2 rounded-2xl flex items-center gap-2 border-white/5 glow-blue">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
          <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">{state.config.activeMinersDisplay.toLocaleString()} ONLINE</span>
        </div>
      </header>

      <main className="flex-1 px-6 pb-32 pt-4 overflow-y-auto scroll-smooth">
        {currentView === View.MINING && (
          <MiningView 
            stats={state.stats} config={state.config} withdrawals={state.withdrawals} monetization={state.monetization}
            onStart={() => setState(p => ({ ...p, stats: { ...p.stats, sessionStartTime: Date.now() } }))} 
            onClaimDaily={() => { setState(p => ({ ...p, stats: { ...p.stats, balance: p.stats.balance + p.config.dailyGiftReward, lastDailyGiftClaimed: Date.now() } })); showToast('Daily Reward Claimed!'); }} 
            onClaimFaucet={() => { setState(p => ({ ...p, stats: { ...p.stats, balance: p.stats.balance + p.config.faucetReward, lastFaucetClaimed: Date.now() } })); showToast('Faucet Reward Claimed!'); }}
            onAdBonus={() => { setState(p => ({ ...p, stats: { ...p.stats, balance: p.stats.balance + p.monetization.adBonus } })); }}
            onWithdrawal={(wallet, amount) => { setState(prev => ({ ...prev, stats: { ...prev.stats, balance: prev.stats.balance - amount }, withdrawals: [...prev.withdrawals, { id: Date.now().toString(), username: 'User', walletAddress: wallet, amount, status: 'Pending', requestedAt: new Date().toLocaleString() }] })); showToast('Withdrawal Request Sent'); }}
          />
        )}
        {currentView === View.REFERRALS && <ReferralView referrals={state.referrals} code={state.referralCode} />}
        {currentView === View.TASKS && <TasksView tasks={state.tasks} onComplete={(id) => { setState(prev => ({ ...prev, stats: { ...prev.stats, balance: prev.stats.balance + (prev.tasks.find(t => t.id === id)?.reward || 0) }, tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: true } : t) })); showToast('Task Completed!'); }} />}
        {currentView === View.ADMIN && isAdminVisible && (
          <AdminView 
            state={state} onUpdateConfig={(c) => setState(p => ({ ...p, config: c }))} onUpdateMonetization={(m) => setState(p => ({ ...p, monetization: m }))}
            onUpdateTasks={(t) => setState(p => ({ ...p, tasks: t }))} onUpdateWithdrawalStatus={(id, status) => setState(prev => ({ ...prev, withdrawals: prev.withdrawals.map(w => w.id === id ? { ...w, status } : w) }))}
            onReset={() => { localStorage.removeItem(LOCAL_STORAGE_KEY); window.location.reload(); }}
            onAddBalance={(amt) => setState(p => ({ ...p, stats: { ...p.stats, balance: p.stats.balance + amt } }))}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass-card border-t border-white/10 flex justify-around py-6 px-4 z-50 rounded-t-[2.5rem] glow-blue">
        {NAV_ITEMS.filter(item => item.view !== View.ADMIN || isAdminVisible).map(({ view, label, Icon }) => (
          <button key={view} onClick={() => setCurrentView(view)} className={`flex flex-col items-center gap-2 transition-all duration-500 ${currentView === view ? 'scale-110' : 'opacity-40 grayscale'}`}>
            <div className={`p-3 rounded-2xl ${currentView === view ? 'bg-blue-600 text-white glow-blue pulse-effect' : 'text-slate-400'}`}>
              <Icon size={22} strokeWidth={currentView === view ? 3 : 2} />
            </div>
            <span className={`text-[12px] font-black tracking-wide ${currentView === view ? 'text-blue-400' : 'text-slate-500'}`}>{label}</span>
          </button>
        ))}
      </nav>

      {isPasscodePromptOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[3000] flex items-center justify-center p-8 animate-in zoom-in-95 duration-300">
           <div className="w-full max-w-sm glass-card rounded-[3.5rem] p-10 space-y-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl"></div>
              <button onClick={() => setIsPasscodePromptOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X size={28}/></button>
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center text-red-500 glow-red animate-pulse"><Lock size={40} /></div>
                <h2 className="text-2xl font-black uppercase tracking-widest">Admin Access</h2>
              </div>
              <input 
                type="password" value={passcodeInput} onChange={(e) => setPasscodeInput(e.target.value)} 
                className="w-full bg-black/40 border border-white/10 rounded-[2rem] px-6 py-6 text-center text-4xl font-black tracking-[0.5em] text-white focus:border-red-500 outline-none transition-all" 
                placeholder="••••" autoFocus 
              />
              <button onClick={verifyPasscode} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-6 rounded-[2rem] text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95">Verify</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
