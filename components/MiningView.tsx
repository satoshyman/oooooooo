
import React, { useState, useEffect, useMemo } from 'react';
import { MiningStats, AppConfig, WithdrawalRequest } from '../types';
import { Wallet, Zap, Droplets, Gift, X, ArrowUpRight, Cpu, Activity, BarChart3, History, ShieldCheck, TrendingUp } from 'lucide-react';
import { TON_LOGO } from '../constants';

interface Props {
  stats: MiningStats;
  config: AppConfig;
  withdrawals: WithdrawalRequest[];
  monetization: { adBonus: number; sponsoredLink: string };
  onStart: () => void;
  onClaimDaily: () => void;
  onClaimFaucet: () => void;
  onAdBonus: () => void;
  onWithdrawal: (wallet: string, amount: number) => void;
}

const MiningView: React.FC<Props> = ({ stats, config, withdrawals, monetization, onStart, onClaimDaily, onClaimFaucet, onAdBonus, onWithdrawal }) => {
  const [now, setNow] = useState(Date.now());
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [walletInput, setWalletInput] = useState("");
  const [amountInput, setAmountInput] = useState(config.minWithdrawal.toString());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 50); // Faster update for smooth counter
    return () => clearInterval(interval);
  }, []);

  const formatCooldown = (ms: number) => {
    if (ms <= 0) return "READY";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const dailyCooldownLeft = stats.lastDailyGiftClaimed ? config.dailyGiftCooldown - (now - stats.lastDailyGiftClaimed) : 0;
  const faucetCooldownLeft = stats.lastFaucetClaimed ? config.faucetCooldown - (now - stats.lastFaucetClaimed) : 0;
  const miningTimeLeft = stats.sessionStartTime ? config.sessionDuration - (now - stats.sessionStartTime) : 0;

  const isMining = !!stats.sessionStartTime && miningTimeLeft > 0;
  const isDailyReady = dailyCooldownLeft <= 0;
  const isFaucetReady = faucetCooldownLeft <= 0;

  // Real-time calculation of mined TON in this session
  const minedThisSession = useMemo(() => {
    if (!isMining || !stats.sessionStartTime) return 0;
    const elapsedMs = now - stats.sessionStartTime;
    const ratePerMs = config.miningRate / (3600 * 1000);
    return Math.min(config.miningRate, elapsedMs * ratePerMs);
  }, [isMining, stats.sessionStartTime, config.miningRate, now]);

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Main Balance Card */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-[3.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="glass-card relative rounded-[3.5rem] p-10 border-white/10 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[80px]"></div>
          
          <div className="flex flex-col items-center text-center gap-6 py-4">
            <div className="relative p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl text-blue-400 glow-blue">
              <Wallet size={48} />
            </div>
            <div className="space-y-2">
              <p className="text-[12px] text-slate-400 font-black uppercase tracking-[0.5em]">Current Balance</p>
              <div className="flex items-center justify-center gap-3">
                 <span className="text-6xl font-black text-white tabular-nums tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{stats.balance.toFixed(6)}</span>
                 <span className="text-sm font-black text-blue-400 uppercase mt-4">TON</span>
              </div>
            </div>
            <button onClick={() => setWithdrawModalOpen(true)} className="w-full bg-white text-black font-black py-5 rounded-2xl text-[12px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10">Withdraw Profits <ArrowUpRight size={18} className="inline ml-2" /></button>
          </div>
        </div>
      </div>

      {/* Mining Engines */}
      <div className="grid grid-cols-1 gap-5">
        {/* Mining Card */}
        <div className={`glass-card p-6 rounded-[2.5rem] border-white/5 transition-all duration-500 ${isMining ? 'border-blue-500/40 glow-blue shadow-[0_0_30px_rgba(59,130,246,0.1)]' : ''}`}>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${isMining ? 'bg-blue-600 text-white' : 'bg-white/5 text-blue-400'} transition-all`}>
                  <Zap size={28} className={isMining ? 'animate-pulse' : ''} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wide">Cloud Mining</h4>
                  <p className="text-[11px] text-slate-500 font-bold">+{config.miningRate} TON / hr</p>
                </div>
              </div>
              <button onClick={onStart} disabled={isMining} className={`px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-wider transition-all ${isMining ? 'bg-blue-900/30 text-blue-400 cursor-not-allowed' : 'bg-blue-600 text-white glow-blue active:scale-95'}`}>
                {isMining ? formatCooldown(miningTimeLeft) : 'Start Session'}
              </button>
            </div>
            
            {/* Real-time Counter Area */}
            {isMining && (
              <div className="bg-black/40 border border-blue-500/20 rounded-2xl p-4 flex flex-col items-center animate-in zoom-in-95">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Mined This Session</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white tabular-nums">+{minedThisSession.toFixed(8)}</span>
                  <span className="text-[10px] font-bold text-blue-500">TON</span>
                </div>
                <div className="w-full bg-white/5 h-1 mt-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6] transition-all duration-500" 
                    style={{ width: `${( (config.sessionDuration - miningTimeLeft) / config.sessionDuration ) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Daily Gift */}
        <div className={`glass-card p-6 rounded-[2.5rem] border-white/5 transition-all duration-500 ${isDailyReady ? 'border-purple-500/40 glow-purple shadow-[0_0_30px_rgba(168,85,247,0.1)]' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl ${isDailyReady ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-600'} transition-all`}>
                <Gift size={28} className={isDailyReady ? 'animate-bounce' : ''} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wide">Daily Gift</h4>
                <p className="text-[11px] text-slate-500 font-bold">Random daily bonus</p>
              </div>
            </div>
            <button onClick={onClaimDaily} disabled={!isDailyReady} className={`px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-wider transition-all ${isDailyReady ? 'bg-purple-600 text-white glow-purple active:scale-95' : 'bg-purple-900/30 text-slate-600 cursor-not-allowed'}`}>
              {isDailyReady ? 'CLAIM' : formatCooldown(dailyCooldownLeft)}
            </button>
          </div>
        </div>

        {/* Quick Faucet */}
        <div className={`glass-card p-6 rounded-[2.5rem] border-white/5 transition-all duration-500 ${isFaucetReady ? 'border-emerald-500/40 glow-emerald shadow-[0_0_30px_rgba(16,185,129,0.1)]' : ''}`}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${isFaucetReady ? 'bg-emerald-600 text-white' : 'bg-white/5 text-emerald-400'} transition-all`}>
                  <Droplets size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wide">Quick Faucet</h4>
                  <p className="text-[11px] text-slate-500 font-bold">Claim {config.faucetReward} TON</p>
                </div>
              </div>
              <button onClick={onClaimFaucet} disabled={!isFaucetReady} className={`px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-wider transition-all ${isFaucetReady ? 'bg-emerald-600 text-white glow-emerald active:scale-95' : 'bg-emerald-900/30 text-slate-600 cursor-not-allowed'}`}>
                {isFaucetReady ? 'FILL' : formatCooldown(faucetCooldownLeft)}
              </button>
            </div>
            {!isFaucetReady && (
              <div className="bg-black/20 rounded-xl p-2 text-center border border-emerald-500/10">
                 <p className="text-[9px] font-black uppercase text-emerald-500/50">Filling in progress...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="px-4 py-4 flex items-center justify-around glass-card rounded-3xl border-white/5 opacity-60">
        <div className="flex flex-col items-center gap-1">
          <Activity size={16} className="text-emerald-500" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">System Stable</span>
        </div>
        <div className="h-4 w-px bg-white/10"></div>
        <div className="flex flex-col items-center gap-1">
          <Cpu size={16} className="text-blue-500" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">V3.0 Pro</span>
        </div>
        <div className="h-4 w-px bg-white/10"></div>
        <div className="flex flex-col items-center gap-1">
          <TrendingUp size={16} className="text-purple-500" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Speed Ultra</span>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[100] flex items-end justify-center animate-in fade-in slide-in-from-bottom-20 duration-500">
          <div className="w-full max-w-md glass-card border-t border-white/10 rounded-t-[3.5rem] p-10 space-y-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center sticky top-0 bg-[#0a0a0a]/80 backdrop-blur py-2 z-10">
              <h2 className="text-2xl font-black uppercase text-white tracking-widest">Withdraw TON</h2>
              <button onClick={() => setWithdrawModalOpen(false)} className="p-4 text-slate-500 hover:text-white transition-colors"><X size={32} /></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">TON Wallet Address</label>
                <input type="text" value={walletInput} onChange={e => setWalletInput(e.target.value)} placeholder="UQ... or Wallet Address" className="w-full bg-black/40 border border-white/10 rounded-[2rem] px-8 py-6 text-sm text-white focus:border-blue-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 ml-4">Withdraw Amount</label>
                <input type="number" step="0.001" value={amountInput} onChange={e => setAmountInput(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-[2rem] px-8 py-6 text-3xl font-black text-white outline-none focus:border-blue-500 transition-all" />
              </div>
              <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 text-center">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Min Withdrawal: {config.minWithdrawal} TON</p>
              </div>
              <button onClick={() => { if(parseFloat(amountInput) >= config.minWithdrawal) { onWithdrawal(walletInput, parseFloat(amountInput)); setWithdrawModalOpen(false); } }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-7 rounded-[2.5rem] uppercase tracking-widest shadow-2xl transition-all active:scale-95 glow-blue">Confirm Withdrawal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiningView;
