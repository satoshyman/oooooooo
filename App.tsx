
/* Global declaration for the Telegram WebApp SDK to resolve TypeScript "property does not exist on type Window" errors */
declare global {
  interface Window {
    Telegram?: any;
  }
}

export interface Task {
  id: string;
  title: string;
  reward: number;
  completed: boolean;
  icon: string;
  url: string;
}

export interface Referral {
  id: string;
  username: string;
  joinedAt: string;
  reward: number;
}

export type WithdrawalStatus = 'Pending' | 'Paid' | 'Rejected';

export interface WithdrawalRequest {
  id: string;
  username: string;
  walletAddress: string;
  amount: number;
  status: WithdrawalStatus;
  requestedAt: string;
}

export interface AppConfig {
  sessionDuration: number;
  miningRate: number;
  referralCommissionPercent: number;
  referralJoinBonus: number;
  dailyGiftReward: number;
  dailyGiftCooldown: number;
  faucetReward: number;
  faucetCooldown: number;
  activeMinersDisplay: number;
  minWithdrawal: number;
}

export interface MiningStats {
  balance: number;
  sessionStartTime: number | null; 
  lastDailyGiftClaimed: number | null; 
  lastFaucetClaimed: number | null; 
}

export interface AppState {
  stats: MiningStats;
  config: AppConfig;
  tasks: Task[];
  referrals: Referral[];
  withdrawals: WithdrawalRequest[];
  referralCode: string;
  monetization: {
    monetagTagId: string;
    sponsoredLink: string;
    adBonus: number;
  };
}

export enum View {
  MINING = 'mining',
  REFERRALS = 'referrals',
  TASKS = 'tasks',
  ADMIN = 'admin'
}
