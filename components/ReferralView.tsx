
import React, { useMemo } from 'react';
import { Referral } from '../types';
import { Copy, Share2, Users, UserPlus, History, TrendingUp, ArrowUpRight, ExternalLink, Award, Sparkles, Diamond, Crown } from 'lucide-react';

interface Props {
  referrals: Referral[];
  code: string;
}

const ReferralView: React.FC<Props> = ({ referrals, code }) => {
  const botUsername = 'TON_CloudMiner_Bot'; 
  const referralLink = `https://t.me/${botUsername}/start?startapp=${code}`;
  const shareText = `💎 Start mining TON for free on Telegram! Join me and get an instant bonus. Registration link: ${referralLink}`;

  // Fix: Safe access to Telegram WebApp for copying and alerts
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      window.Telegram.WebApp.showAlert('Referral link copied!');
    }
  };

  // Fix: Safe access to Telegram WebApp for opening share links
  const handleInvite = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`);
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const totalEarned = referrals.length * 0.1;

  const userRank = useMemo(() => {
    const count = referrals.length;
    if (count >= 11) return { name: 'Platinum', color: 'text-cyan-400', icon: Crown, bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
    if (count >= 6) return { name: 'Diamond', color: 'text-purple-400', icon: Diamond, bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
    if (count >= 3) return { name: 'Star', color: 'text-yellow-400', icon: Sparkles, bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    return { name: 'Member', color: 'text-slate-400', icon: Award, bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
  }, [referrals]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-10">
      
      {/* Referral & Rank Card */}
      <div className={`glass-card rounded-[3rem] p-10 border transition-all duration-700 ${userRank.border} ${userRank.bg} flex flex-col items-center gap-8 relative overflow-hidden group`}>
        <div className={`absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 ${userRank.color.replace('text', 'bg')} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-700`}></div>
        
        <div className="flex flex-col items-center gap-3">
           <div className={`p-5 rounded-3xl ${userRank.bg} ${userRank.color} glow-current animate-pulse`}>
              <userRank.icon size={50} />
           </div>
           <div className="text-center">
             <h2 className={`text-3xl font-black uppercase tracking-widest ${userRank.color}`}>{userRank.name}</h2>
             <p className="text-slate-500 text-[10px] font-black mt-1 uppercase tracking-[0.4em]">Current Rank</p>
           </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-white">Earn 0.1 TON</h1>
          <p className="text-slate-400 font-bold text-sm leading-relaxed px-4">
            Get 10% commission + 0.1 TON instant bonus for every friend who joins!
          </p>
        </div>
        
        <div className="w-full bg-black/40 border border-white/5 p-5 rounded-[2rem] flex items-center justify-between group relative z-10">
          <span className="text-[10px] font-mono font-black text-blue-400 tracking-tight pr-2 truncate max-w-[75%]">{referralLink}</span>
          <button onClick={copyToClipboard} className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl transition-all active:scale-90 shadow-xl glow-blue">
            <Copy size={18} />
          </button>
        </div>

        <button onClick={handleInvite} className="w-full bg-white text-black font-black py-6 rounded-[2.5rem] text-sm uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3">
          <Share2 size={20} /> Invite Friends
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-5">
        <div className="glass-card rounded-[2.5rem] p-8 flex flex-col items-center gap-3 text-center border-white/5 hover:border-blue-500/40 transition-colors">
          <div className="w-14 h-14 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-400 mb-1">
            <Users size={32} />
          </div>
          <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Total Friends</h3>
          <p className="text-3xl font-black text-white">{referrals.length}</p>
        </div>
        <div className="glass-card rounded-[2.5rem] p-8 flex flex-col items-center gap-3 text-center border-white/5 hover:border-emerald-500/40 transition-colors">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-400 mb-1">
            <TrendingUp size={32} />
          </div>
          <h3 className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Total Earnings</h3>
          <p className="text-3xl font-black text-emerald-400">{totalEarned.toFixed(2)} <span className="text-xs">TON</span></p>
        </div>
      </div>

      {/* Reward History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <History size={18} className="text-blue-400" />
             <h3 className="font-black uppercase text-xs text-slate-400 tracking-widest">Reward History</h3>
          </div>
          <span className="text-[10px] bg-white/5 px-4 py-1.5 rounded-full text-slate-500 font-black uppercase">
            {referrals.length} friends
          </span>
        </div>

        <div className="space-y-4">
          {referrals.length === 0 ? (
            <div className="glass-card rounded-[2.5rem] p-16 flex flex-col items-center text-center border-dashed border-white/10">
              <UserPlus size={50} className="text-slate-800 mb-6 animate-pulse" />
              <p className="text-slate-600 font-black text-sm uppercase tracking-widest leading-relaxed">No referrals yet<br/><span className="text-slate-800 text-[10px]">Invite friends to start earning!</span></p>
            </div>
          ) : (
            referrals.slice().reverse().map((ref, idx) => (
              <div key={ref.id} className="glass-card rounded-3xl p-6 flex items-center justify-between group border-white/5 hover:border-emerald-500/20 transition-all duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-500 border border-white/5 group-hover:border-emerald-500/40 transition-colors">
                    <ArrowUpRight size={24} />
                  </div>
                  <div>
                    <p className="font-black text-base text-white">@{ref.username}</p>
                    <p className="text-[10px] text-slate-500 font-bold tracking-tight mt-1">{ref.joinedAt}</p>
                  </div>
                </div>
                <div className="text-right">
                   <div className="flex items-center justify-end gap-1">
                      <span className="text-emerald-400 text-xl font-black">+0.100</span>
                      <span className="text-emerald-500/50 text-[10px] font-black mt-1">TON</span>
                   </div>
                   <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Referral Bonus</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="h-10" />
    </div>
  );
};

export default ReferralView;
