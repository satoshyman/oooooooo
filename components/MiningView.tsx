
import React, { useState, useEffect, useMemo } from 'react';
import { MiningStats, AppConfig, WithdrawalRequest } from '../types';
import { Wallet, Zap, Droplets, Gift, X, ArrowUpRight, Cpu, Activity, TrendingUp } from 'lucide-react';

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
  const [amountInput, setAmountInput] = useState("");

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(interval);
  }, []);

  const formatCooldown = (ms: number) => {
    if (ms <= 0) return "READY";
    const totalSeconds = Math.floor(ms / 1000);
    const mm = Math.floor(totalSeconds / 60);
    const ss = totalSeconds % 60;
    return `${mm}:${ss.toString().padStart(2, '0')}`;
  };

  const dailyCooldownLeft = stats.lastDailyGiftClaimed ? config.dailyGiftCooldown - (now - stats.lastDailyGiftClaimed) : 0;
  const faucetCooldownLeft = stats.lastFaucetClaimed ? config.faucetCooldown - (now - stats.lastFaucetClaimed) : 0;
  const miningTimeLeft = stats.sessionStartTime ? config.sessionDuration - (now - stats.sessionStartTime) : 0;

  const isMining = !!stats.sessionStartTime && miningTimeLeft > 0;
  const isDailyReady = dailyCooldownLeft <= 0;
  const isFaucetReady = faucetCooldownLeft <= 0;

  const minedThisSession = useMemo(() => {
    if (!isMining || !stats.sessionStartTime) return 0;
    const elapsed = now - stats.sessionStartTime;
    const ratePerMs = config.miningRate / config.sessionDuration;
    return Math.min(config.miningRate, elapsed * ratePerMs);
  }, [isMining, stats.sessionStartTime, config.miningRate, now]);

  // Fix: Safe HapticFeedback call on withdrawal error
  const handleWithdrawal = () => {
    const amt = parseFloat(amountInput);
    if (!walletInput || isNaN(amt) || amt < config.minWithdrawal || amt > stats.balance) {
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
        return;
    }
    onWithdrawal(walletInput, amt);
    setWithdrawModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Main Balance Card */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="glass-card relative rounded-[2.5rem] p-8 border-white/5 overflow-hidden flex flex-col items-center">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-2">Total TON Assets</p>
          <div className="flex items-baseline gap-2 mb-6">
             <span className="text-5xl font-black text-white tabular-nums tracking-tight">
               {stats.balance.toFixed(6)}
             </span>
             <span className="text-sm font-black text-blue-400 uppercase">TON</span>
          </div>
          {/* Fix: Optional chaining for HapticFeedback medium impact */}
          <button 
            onClick={() => { setWithdrawModalOpen(true); window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium'); }} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
          >
            Withdraw to Wallet <ArrowUpRight size={14} className="inline ml-1" />
          </button>
        </div>
      </div>

      {/* Mining Engines */}
      <div className="space-y-4">
        {/* Mining Card */}
        <div className={`glass-card p-5 rounded-3xl border-white/5 transition-all ${isMining ? 'border-blue-500/30 bg-blue-500/5' : ''}`}>
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-4">
               <div className={`p-3 rounded-2xl ${isMining ? 'bg-blue-600 text-white animate-pulse' : 'bg-white/5 text-blue-400'}`}>
                 <Zap size={24} />
               </div>
               <div>
                 <h4 className="text-xs font-black uppercase">Cloud Engine</h4>
                 <p className="text-[10px] text-slate-500 font-bold">{config.miningRate} TON / hr</p>
               </div>
             </div>
             {/* Fix: Optional chaining for HapticFeedback success notification */}
             <button 
               onClick={() => { if(!isMining) { onStart(); window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success'); } }} 
               disabled={isMining} 
               className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${isMining ? 'bg-slate-800 text-slate-500' : 'bg-white text-black active:scale-95'}`}
             >
               {isMining ? formatCooldown(miningTimeLeft) : 'Start'}
             </button>
          </div>
          {isMining && (
            <div className="bg-black/40 rounded-2xl p-3 border border-white/5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Progress</span>
                <span className="text-[10px] font-black text-white tabular-nums">+{minedThisSession.toFixed(8)} TON</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 shadow-[0_0_8px_#3b82f6] transition-all duration-300" 
                  style={{ width: `${((config.sessionDuration - miningTimeLeft) / config.sessionDuration) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick Claims Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`glass-card p-4 rounded-3xl border-white/5 flex flex-col items-center text-center gap-3 transition-all ${isDailyReady ? 'border-purple-500/30' : ''}`}>
            <div className={`p-3 rounded-2xl ${isDailyReady ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-600'}`}>
              <Gift size={22} />
            </div>
            <div className="space-y-1">
              <h5 className="text-[10px] font-black uppercase">Daily Gift</h5>
              <p className="text-[9px] text-slate-500">Claim reward</p>
            </div>
            <button 
              onClick={onClaimDaily} 
              disabled={!isDailyReady} 
              className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider ${isDailyReady ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-600'}`}
            >
              {isDailyReady ? 'Claim' : formatCooldown(dailyCooldownLeft)}
            </button>
          </div>

          <div className={`glass-card p-4 rounded-3xl border-white/5 flex flex-col items-center text-center gap-3 transition-all ${isFaucetReady ? 'border-emerald-500/30' : ''}`}>
            <div className={`p-3 rounded-2xl ${isFaucetReady ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-600'}`}>
              <Droplets size={22} />
            </div>
            <div className="space-y-1">
              <h5 className="text-[10px] font-black uppercase">Faucet</h5>
              <p className="text-[9px] text-slate-500">Quick refill</p>
            </div>
            <button 
              onClick={onClaimFaucet} 
              disabled={!isFaucetReady} 
              className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider ${isFaucetReady ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-600'}`}
            >
              {isFaucetReady ? 'Fill' : formatCooldown(faucetCooldownLeft)}
            </button>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[2000] flex items-end justify-center animate-in fade-in slide-in-from-bottom-10 duration-500">
          <div className="w-full max-w-md glass-card border-t border-white/10 rounded-t-[2.5rem] p-8 space-y-6 pb-12 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-widest">Withdraw</h2>
              <button onClick={() => setWithdrawModalOpen(false)} className="p-2 text-slate-500"><X size={28} /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2">TON Wallet Address</label>
                <input type="text" value={walletInput} onChange={e => setWalletInput(e.target.value)} placeholder="UQ... (Non-custodial)" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Amount (Min: {config.minWithdrawal})</label>
                <input type="number" value={amountInput} onChange={e => setAmountInput(e.target.value)} placeholder="0.00" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-2xl font-black text-white focus:border-blue-500 outline-none" />
              </div>
              <button onClick={handleWithdrawal} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">Request Payout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiningView;
