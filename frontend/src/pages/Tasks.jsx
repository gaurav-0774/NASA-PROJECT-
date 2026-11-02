// pages/Tasks.jsx
// Gamification and mission routine command center.
// Tracks astronaut habits, daily countermeasure tasks, XP rewards, rank levels, and badges.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Award,
  Flame,
  Zap,
  CheckCircle2,
  Circle,
  Sparkles,
  Shield,
  Moon,
  Dumbbell,
  Smile,
  Droplets,
  Activity,
  ClipboardList
} from 'lucide-react';
import GlassCard from '../components/common/GlassCard';
import { api } from '../services/api';
import { useMission } from '../context/MissionContext';

export default function Tasks() {
  const { refreshSummary } = useMission();
  const [tasks, setTasks] = useState([]);
  const [gamification, setGamification] = useState({
    xp: 850,
    level: 2,
    title: 'Health Apprentice',
    streak: 30,
    badges: [],
    progress: 70,
    currentXP: 350,
    xpForNext: 500
  });
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const [xpCelebration, setXpCelebration] = useState(null);

  const iconMap = {
    ClipboardList,
    Moon,
    Dumbbell,
    Smile,
    Droplets,
    Activity
  };

  const loadData = () => {
    setLoading(true);
    api.getTasks()
      .then((res) => {
        setTasks(res.data.tasks || []);
        if (res.data.gamification) {
          setGamification(res.data.gamification);
        }
      })
      .catch((err) => console.error('Failed to load tasks:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleComplete = async (taskId, xp) => {
    setCompletingId(taskId);
    try {
      const res = await api.completeTask(taskId);
      if (res.data.gamification) {
        setGamification(res.data.gamification);
      }
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
      setXpCelebration(`+${xp} XP!`);
      setTimeout(() => setXpCelebration(null), 2500);
      await refreshSummary();
    } catch (err) {
      console.error('Task complete error:', err);
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 mb-2">
            <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
            Crew Adherence & Gamification
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Daily Routine Protocols & XP
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Complete daily health routines to maintain physical conditioning and earn astronaut rank commendations.
          </p>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl glass border border-amber-500/30 bg-amber-500/10 text-amber-300 self-start sm:self-auto shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <Flame className="w-6 h-6 text-amber-400 animate-bounce" />
          <div>
            <div className="text-lg font-black text-white leading-tight">{gamification.streak || 30} Days</div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-amber-300">Mission Streak</div>
          </div>
        </div>
      </div>

      {/* Floating XP Reward Popup */}
      <AnimatePresence>
        {xpCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1.1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed top-20 right-8 z-50 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-black text-lg shadow-[0_0_30px_rgba(34,211,238,0.7)] flex items-center gap-2 pointer-events-none"
          >
            <Zap className="w-6 h-6 fill-slate-950" />
            {xpCelebration}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level & Rank Progress Card */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-cyan-400 tracking-wider">
                Rank Level {gamification.level || 2}
              </div>
              <h2 className="text-2xl font-black text-white mt-0.5">
                {gamification.title || 'Wellness Officer'}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Total Mission Telemetry Points: <strong className="text-white">{gamification.xp || 850} XP</strong>
              </p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-gray-400">Progress to Level {(gamification.level || 2) + 1}</span>
              <span className="text-cyan-400 font-bold">{gamification.progress ?? 70}%</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${gamification.progress ?? 70}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-cyan-400 to-teal-300 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.6)]"
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 mt-1.5 font-mono">
              <span>{gamification.currentXP ?? 350} XP</span>
              <span>{gamification.xpForNext ?? 500} XP Next Level</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Badges Earned Section */}
      <div>
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Mission Commendations & Badges
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <GlassCard className="p-4 flex items-center gap-3.5 border-cyan-500/40 bg-cyan-950/20">
            <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Iron Bones</h4>
              <p className="text-xs text-gray-400 mt-0.5">Completed 7-day ARED resistance protocol</p>
            </div>
          </GlassCard>

          <GlassCard className="p-4 flex items-center gap-3.5 border-purple-500/40 bg-purple-950/20">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Vital Logger</h4>
              <p className="text-xs text-gray-400 mt-0.5">Logged 30 days of consecutive telemetry</p>
            </div>
          </GlassCard>

          <GlassCard className="p-4 flex items-center gap-3.5 border-white/10 opacity-70">
            <div className="p-3 rounded-xl bg-white/5 text-gray-400 border border-white/10">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-300">Sleep Commander</h4>
              <p className="text-xs text-gray-500 mt-0.5">Achieve 7 consecutive nights of 7.5h+ rest</p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Daily Routine Task List */}
      <div>
        <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-cyan-400" />
          Today's Countermeasure Protocols
        </h3>

        <div className="space-y-3">
          {tasks.map((task) => {
            const Icon = iconMap[task.icon] || ClipboardList;
            const isCompleted = task.completed;
            const isWorking = completingId === task.id;

            return (
              <motion.div
                key={task.id}
                whileHover={{ scale: isCompleted ? 1 : 1.01 }}
                className={`p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-white/5 border-white/5 opacity-60'
                    : 'glass border-white/10 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => !isCompleted && handleComplete(task.id, task.xpReward)}
                      disabled={isCompleted || isWorking}
                      className="text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-cyan-400 hidden sm:block">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className={`text-sm font-bold ${isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>
                        {task.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      +{task.xpReward} XP
                    </span>

                    {!isCompleted && (
                      <button
                        onClick={() => handleComplete(task.id, task.xpReward)}
                        disabled={isWorking}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-cyan-500 hover:text-slate-950 transition-all text-white"
                      >
                        {isWorking ? 'Logging...' : 'Complete'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
