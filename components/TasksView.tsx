
import React, { useState } from 'react';
import { Task } from '../types';
import { CheckCircle2, PlayCircle, ExternalLink, Zap, MousePointerClick, Tv, Layout } from 'lucide-react';

interface Props {
  tasks: Task[];
  onComplete: (id: string) => void;
}

const TasksView: React.FC<Props> = ({ tasks, onComplete }) => {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Fix: Safe access to Telegram WebApp for task verification haptics
  const handleTaskStart = (task: Task) => {
    if (task.completed) return;
    
    const tg = window.Telegram?.WebApp;
    setActiveTaskId(task.id);

    // Simulate ad viewing duration
    const viewDuration = task.icon === 'video' ? 5000 : 2000;

    if (task.url && task.url !== '#') {
      if (tg && tg.openLink) {
        tg.openLink(task.url);
      } else {
        window.open(task.url, '_blank');
      }
    }

    setTimeout(() => {
      onComplete(task.id);
      setActiveTaskId(null);
      if (tg) tg.HapticFeedback.notificationOccurred('success');
    }, viewDuration);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'video': return <PlayCircle size={24} />;
      case 'external': return <ExternalLink size={24} />;
      case 'click': return <MousePointerClick size={24} />;
      default: return <Zap size={24} />;
    }
  };

  const videoTasks = tasks.filter(t => t.icon === 'video');
  const otherTasks = tasks.filter(t => t.icon !== 'video');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Monetization Header */}
      <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/30 rounded-[2.5rem] p-8 flex flex-col items-center gap-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 animate-pulse"><Tv size={100} /></div>
        </div>
        
        <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-2 animate-icon-pulse shadow-[0_0_20px_rgba(168,85,247,0.4)]">
          <Layout size={32} />
        </div>
        <div className="text-center space-y-1 relative z-10">
          <h1 className="text-3xl font-black uppercase tracking-tight">Earning Center</h1>
          <p className="text-gray-400 font-bold text-sm">Watch ads & visit sponsors to earn TON</p>
        </div>
      </div>

      {/* Video Ads Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          <Tv size={16} className="text-red-500 animate-icon-pulse" />
          <h3 className="font-black uppercase text-xs text-gray-500 tracking-widest">Video Ads (High Reward)</h3>
        </div>
        <div className="space-y-3">
          {videoTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              isProcessing={activeTaskId === task.id}
              onStart={() => handleTaskStart(task)}
              icon={getIcon('video')}
              colorClass="red"
            />
          ))}
        </div>
      </div>

      {/* External Tasks Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          <MousePointerClick size={16} className="text-blue-500 animate-icon-pulse" />
          <h3 className="font-black uppercase text-xs text-gray-500 tracking-widest">Click & Earn</h3>
        </div>
        <div className="space-y-3">
          {otherTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              isProcessing={activeTaskId === task.id}
              onStart={() => handleTaskStart(task)}
              icon={getIcon(task.icon)}
              colorClass="blue"
            />
          ))}
        </div>
      </div>

      {/* External Ad Banner (Monetag/Sponsored) */}
      <div className="bg-[#0f0f0f] border border-orange-500/20 rounded-[2rem] p-6 flex items-center justify-between group transition-all hover:border-orange-500/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform animate-icon-pulse">
            <ExternalLink size={24} />
          </div>
          <div>
            <h4 className="font-black text-sm uppercase">Direct Ad Link</h4>
            <p className="text-[10px] text-gray-500 font-bold">Earn bonus for every visit</p>
          </div>
        </div>
        <button className="bg-orange-600 text-white font-black px-6 py-3 rounded-full text-[10px] uppercase tracking-wider active:scale-95 transition-all animate-icon-pulse shadow-lg shadow-orange-600/20">
          Open
        </button>
      </div>

    </div>
  );
};

interface TaskCardProps {
  task: Task;
  isProcessing: boolean;
  onStart: () => void;
  icon: React.ReactNode;
  colorClass: 'red' | 'blue' | 'purple';
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isProcessing, onStart, icon, colorClass }) => {
  const colors = {
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
  };

  return (
    <div className={`bg-[#0a0a0a] border rounded-[2rem] p-5 transition-all duration-300 ${
      task.completed ? 'opacity-40 border-gray-800' : 'border-slate-800 hover:border-slate-700'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-2xl transition-all duration-500 animate-icon-pulse ${
          task.completed ? 'bg-slate-800 text-green-500' : colors[colorClass]
        }`}>
          {task.completed ? <CheckCircle2 size={24} className="animate-bounce-in" /> : icon}
        </div>
        
        <div className="flex-1">
          <h3 className="font-black text-sm mb-0.5">{task.title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-xs font-black">+{task.reward} TON</span>
            {task.completed && <span className="text-[9px] text-gray-500 font-black uppercase">Earned</span>}
          </div>
        </div>

        {!task.completed && (
          <button 
            onClick={onStart}
            disabled={isProcessing}
            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-90 min-w-[100px] ${
              isProcessing 
                ? 'bg-slate-800 text-slate-500 animate-pulse' 
                : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            {isProcessing ? 'Verifying...' : 'Start'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TasksView;
