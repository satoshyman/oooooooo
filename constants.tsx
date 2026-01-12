
import React from 'react';
import { Pickaxe, Users, ClipboardList, Settings, PlayCircle, ExternalLink, Zap, MousePointerClick, Heart, Send } from 'lucide-react';
import { Task, View } from './types.ts';

export const INITIAL_TASKS: Task[] = [
  { 
    id: 't1', 
    title: 'Subscribe to Telegram Channel', 
    reward: 0.05, 
    completed: false, 
    icon: 'send', 
    url: 'https://t.me/your_channel' 
  },
  { 
    id: 't2', 
    title: 'Follow us on X (Twitter)', 
    reward: 0.03, 
    completed: false, 
    icon: 'external', 
    url: 'https://twitter.com/your_account' 
  },
  { 
    id: 't3', 
    title: 'Watch Educational Video', 
    reward: 0.1, 
    completed: false, 
    icon: 'video', 
    url: 'https://youtube.com/watch?v=example' 
  },
  { 
    id: 't4', 
    title: 'Rate App 5 Stars', 
    reward: 0.08, 
    completed: false, 
    icon: 'heart', 
    url: '#' 
  },
  { 
    id: 't5', 
    title: 'Share App with Friend', 
    reward: 0.04, 
    completed: false, 
    icon: 'click', 
    url: '#' 
  },
];

export const NAV_ITEMS = [
  { view: View.MINING, label: 'Mining', Icon: Pickaxe },
  { view: View.REFERRALS, label: 'Friends', Icon: Users },
  { view: View.TASKS, label: 'Tasks', Icon: ClipboardList },
  { view: View.ADMIN, label: 'Admin', Icon: Settings },
];

export const TON_LOGO = (className?: string) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#0088CC"/>
    <path d="M5.5 8.5L12 18L18.5 8.5H5.5Z" fill="white"/>
  </svg>
);
