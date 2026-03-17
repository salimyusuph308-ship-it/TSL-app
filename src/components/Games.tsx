import React, { useState } from 'react';
import { Trophy, Star, Zap, Brain } from 'lucide-react';
import { motion } from 'motion/react';

export const Games: React.FC = () => {
  const [score, setScore] = useState(0);

  const gameModes = [
    { id: 'quiz', title: 'Sign Quiz', desc: 'Identify the sign from the image', icon: Brain, color: 'bg-blue-500' },
    { id: 'challenge', title: 'Daily Challenge', desc: 'Learn 5 new signs today', icon: Zap, color: 'bg-amber-500' },
    { id: 'memory', title: 'Memory Match', desc: 'Match words with signs', icon: Star, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between bg-stone-900 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-stone-400">Total Points</p>
          <h2 className="text-4xl font-black">{score}</h2>
        </div>
        <div className="bg-white/10 p-4 rounded-2xl">
          <Trophy size={32} className="text-amber-400" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 px-1">Choose a Game</h3>
        <div className="space-y-4">
          {gameModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <motion.button
                key={mode.id}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-5 p-6 bg-white rounded-3xl border-2 border-stone-100 shadow-sm text-left group hover:border-emerald-500 transition-all"
              >
                <div className={`${mode.color} p-4 rounded-2xl text-white shadow-lg shadow-current/20`}>
                  <Icon size={28} />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-black text-stone-900">{mode.title}</h4>
                  <p className="text-stone-500 font-medium">{mode.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="bg-emerald-50 p-8 rounded-3xl border-2 border-emerald-100 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg text-white">
            <Trophy size={20} />
          </div>
          <h4 className="font-black text-emerald-900 uppercase tracking-tight">Leaderboard</h4>
        </div>
        <div className="space-y-3">
          {[
            { name: 'You', score: score, rank: 1 },
            { name: 'Amara', score: 450, rank: 2 },
            { name: 'Kofi', score: 320, rank: 3 },
          ].map((user) => (
            <div key={user.name} className="flex items-center justify-between py-2 border-b border-emerald-100 last:border-0">
              <div className="flex items-center gap-3">
                <span className="w-6 text-emerald-600 font-black">{user.rank}.</span>
                <span className="font-bold text-stone-800">{user.name}</span>
              </div>
              <span className="font-black text-emerald-700">{user.score} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
