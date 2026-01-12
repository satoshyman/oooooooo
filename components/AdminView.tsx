
import React, { useState, useEffect, useRef } from 'react';
import { AppState, AppConfig, Task, WithdrawalStatus } from '../types';
import { 
  ShieldAlert, RefreshCcw, Save, Zap, HandCoins, CheckCircle2, 
  Ban, Trash2, Plus, Users, TrendingUp, ChevronDown, ChevronUp, Cpu, Droplets, Gift
} from 'lucide-react';

interface Props {
  state: AppState;
  onUpdateConfig: (c: AppConfig) => void;
  onUpdateMonetization: (m: any) => void;
  onUpdateTasks: (t: Task[]) => void;
  onUpdateWithdrawalStatus: (id: string, status: WithdrawalStatus) => void;
  onReset: () => void;
  onAddBalance: (amt: number) => void;
}

const AdminView: React.FC<Props> = ({ state, onUpdateConfig, onUpdateMonetization, onUpdateTasks, onUpdateWithdrawalStatus, onReset, onAddBalance }) => {
  const [localConfig, setLocalConfig] = useState<any>(() => ({
    miningRate: state.config.miningRate.toString(),
    faucetReward: state.config.faucetReward.toString(),
    dailyGiftReward: state.config.dailyGiftReward.toString(),
    sessionDuration: state.config.sessionDuration.toString(),
    faucetCooldown: state.config.faucetCooldown.toString()
  }));
  
  const [localTasks, setLocalTasks] = useState<Task[]>(() => [...state.tasks]);
  const [balanceAmt, setBalanceAmt] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>("cards");

  // Fix: Safe Telegram WebApp access for saving configuration
  const saveAll = () => {
    const finalConfig: AppConfig = {
      ...state.config,
      miningRate: parseFloat(localConfig.miningRate) || 0,
      faucetReward: parseFloat(localConfig.faucetReward) || 0,
      dailyGiftReward: parseFloat(localConfig.dailyGiftReward) || 0,
      sessionDuration: parseInt(localConfig.sessionDuration) || 0,
      faucetCooldown: parseInt(localConfig.faucetCooldown) || 0
    };
    
    onUpdateConfig(finalConfig);
    onUpdateTasks(localTasks);
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      window.Telegram.WebApp.showAlert('✅ Changes Saved Successfully!');
    }
  };

  const handleTaskUpdate = (idx: number, field: keyof Task, value: any) => {
    const updated = [...localTasks];
    updated[idx] = { ...updated[idx], [field]: value };
    setLocalTasks(updated);
  };

  const Section = ({ id, title, subtitle, icon: Icon, children, count, colorClass }: any) => (
    <div className={`glass-card rounded-[2.5rem] overflow-hidden transition-all duration-500 mb-4 border ${expandedSection === id ? 'border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'border-white/5'}`}>
      <button 
        type="button"
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${colorClass || 'bg-blue-500/10 text-blue-400'}`}>
            <Icon size={22} />
          </div>
          <div>
            <h3 className="font-black uppercase text-[12px] tracking-widest text-white">{title}</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {count !== undefined && <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black">{count}</span>}
          {expandedSection === id ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
        </div>
      </button>
      {expandedSection === id && (
        <div className="px-6 pb-8 pt-2 space-y-6 animate-in slide-in-from-top-4 duration-500">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 pb-32 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="glass-card bg-gradient-to-br from-red-600/10 to-transparent border border-red-500/20 rounded-[3rem] p-8 flex flex-col items-center gap-4 text-center">
        <div className="w-20 h-20 bg-red-500/20 rounded-[2rem] flex items-center justify-center text-red-500 animate-icon-pulse">
          <ShieldAlert size={40} />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Admin Console</h1>
          <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em] mt-1">Live configuration & management</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex gap-2 sticky top-2 z-50 mb-6 bg-black/40 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/10">
         <button onClick={saveAll} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
           <Save size={18} /> SAVE ALL CHANGES
         </button>
         <button onClick={onReset} className="bg-red-950/40 border border-red-900/40 text-red-500 px-6 rounded-2xl active:scale-95 transition-all">
           <RefreshCcw size={20} />
         </button>
      </div>

      {/* Section 1: Mining Settings */}
      <Section 
        id="cards" 
        title="Engine Settings" 
        subtitle="Mining values & rates" 
        icon={Cpu}
        colorClass="bg-blue-500/10 text-blue-400"
      >
        <div className="space-y-8">
          <div className="space-y-4">
             <div className="flex items-center gap-2 px-1">
               <Zap size={14} className="text-yellow-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Engine</span>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-600 uppercase ml-2">Mining Rate (TON/hr)</label>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={localConfig.miningRate} 
                    onChange={e => setLocalConfig({...localConfig, miningRate: e.target.value})} 
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-600 uppercase ml-2">Session Dur (ms)</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    value={localConfig.sessionDuration} 
                    onChange={e => setLocalConfig({...localConfig, sessionDuration: e.target.value})} 
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono text-white outline-none focus:border-blue-500" 
                  />
                </div>
             </div>
          </div>
          
          <div className="space-y-4">
             <div className="flex items-center gap-2 px-1">
               <Gift size={14} className="text-purple-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Gift Reward</span>
             </div>
             <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-600 uppercase ml-2">TON Reward Amount</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  value={localConfig.dailyGiftReward} 
                  onChange={e => setLocalConfig({...localConfig, dailyGiftReward: e.target.value})} 
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono text-white outline-none focus:border-purple-500" 
                />
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-2 px-1">
               <Droplets size={14} className="text-orange-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faucet Config</span>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-600 uppercase ml-2">Claim Reward</label>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={localConfig.faucetReward} 
                    onChange={e => setLocalConfig({...localConfig, faucetReward: e.target.value})} 
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono text-white outline-none focus:border-orange-500" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-600 uppercase ml-2">Cooldown (ms)</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    value={localConfig.faucetCooldown} 
                    onChange={e => setLocalConfig({...localConfig, faucetCooldown: e.target.value})} 
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono text-white outline-none focus:border-orange-500" 
                  />
                </div>
             </div>
          </div>
        </div>
      </Section>

      {/* Section 2: Tasks Manager */}
      <Section 
        id="tasks" 
        title="Tasks & Ads" 
        subtitle="Manage reward links" 
        icon={Zap}
        count={localTasks.length}
        colorClass="bg-purple-500/10 text-purple-400"
      >
        <div className="space-y-4">
          {localTasks.map((task, idx) => (
            <div key={task.id} className="bg-black/40 border border-white/5 rounded-[2rem] p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Task #{idx + 1}</span>
                <button 
                  type="button"
                  onClick={() => setLocalTasks(localTasks.filter(t => t.id !== task.id))} 
                  className="text-red-500 p-2 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-600 uppercase ml-2">Task Title</label>
                <input 
                  type="text"
                  value={task.title} 
                  onChange={e => handleTaskUpdate(idx, 'title', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-xs text-white outline-none focus:border-purple-500" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-600 uppercase ml-2">Reward (TON)</label>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={task.reward} 
                    onChange={e => handleTaskUpdate(idx, 'reward', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-xs font-mono text-emerald-500 outline-none focus:border-emerald-500" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-600 uppercase ml-2">Task URL</label>
                  <input 
                    type="text"
                    value={task.url} 
                    onChange={e => handleTaskUpdate(idx, 'url', e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-xs text-blue-400 outline-none focus:border-blue-400" 
                />
                </div>
              </div>
            </div>
          ))}
          <button 
            type="button"
            onClick={() => setLocalTasks([...localTasks, { id: Date.now().toString(), title: "New Task", reward: 0.1, completed: false, icon: 'zap', url: '#' }])} 
            className="w-full py-5 border-2 border-dashed border-white/10 rounded-[2rem] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
          >
            <Plus size={20} /> ADD NEW TASK
          </button>
        </div>
      </Section>

      {/* Section 3: Payouts */}
      <Section 
        id="withdrawals" 
        title="Payout Requests" 
        subtitle="Review & approve withdrawals" 
        icon={HandCoins}
        count={state.withdrawals.filter(w => w.status === 'Pending').length}
        colorClass="bg-emerald-500/10 text-emerald-400"
      >
        <div className="space-y-4">
          {state.withdrawals.length === 0 ? (
            <p className="py-12 text-center opacity-40 text-xs font-black uppercase tracking-widest">No payout requests found</p>
          ) : (
            state.withdrawals.slice().reverse().map(req => (
              <div key={req.id} className="bg-black/40 border border-white/5 rounded-[2rem] p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-black text-white">@{req.username}</h4>
                    <p className="text-[9px] text-slate-500 font-mono break-all mt-1">{req.walletAddress}</p>
                  </div>
                   <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${
                    req.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                    req.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>{req.status}</span>
                </div>
                <div className="flex items-end justify-between border-t border-white/5 pt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-emerald-500">{req.amount}</span>
                    <span className="text-[10px] font-bold text-slate-600">TON</span>
                  </div>
                </div>
                {req.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => onUpdateWithdrawalStatus(req.id, 'Paid')} className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">CONFIRM PAYMENT</button>
                    <button onClick={() => onUpdateWithdrawalStatus(req.id, 'Rejected')} className="bg-red-950/40 text-red-500 px-6 rounded-xl border border-red-500/20 active:scale-95 transition-all"><Ban size={18} /></button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Section>

      {/* Section 4: Manual Injection */}
      <Section 
        id="monitoring" 
        title="Balance Injection" 
        subtitle="Simulate adding credit" 
        icon={TrendingUp}
        colorClass="bg-blue-500/10 text-blue-400"
      >
        <div className="bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] p-8 space-y-4">
           <div className="flex gap-2">
            <input 
              type="text"
              inputMode="decimal"
              value={balanceAmt} 
              onChange={e => setBalanceAmt(e.target.value)} 
              className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-sm font-mono text-white outline-none focus:border-blue-500" 
              placeholder="0.00" 
            />
            <button 
              type="button"
              onClick={() => { onAddBalance(parseFloat(balanceAmt) || 0); setBalanceAmt(""); }} 
              className="bg-blue-600 text-white px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
            >
              INJECT
            </button>
           </div>
           <p className="text-[8px] text-slate-500 text-center uppercase font-black">Credit will be added to the current balance immediately</p>
        </div>
      </Section>

      <div className="h-20" />
    </div>
  );
};

export default AdminView;
