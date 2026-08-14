import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft } from 'lucide-react';
import { playSound } from '../utils/audio';

export default function LeaderboardScreen({ players, setGameState }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  useEffect(() => {
    playSound('start');
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col p-8 z-10 relative max-w-5xl mx-auto w-full"
    >
      <div className="flex items-center justify-between mb-12">
        <button 
          onClick={() => { playSound('tick'); setGameState('question'); }}
          className="flex items-center gap-2 text-game-cyan hover:text-slate-900 transition-colors text-xl font-bold"
        >
          <ArrowLeft size={24} /> BACK TO GAME
        </button>
      </div>

      <div className="flex flex-col items-center flex-1">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center mb-12"
        >
          <Trophy size={80} className="text-yellow-500 mb-4 drop-shadow-md" />
          <h1 className="text-6xl font-display font-bold text-slate-900 tracking-widest text-glow">LEADERBOARD</h1>
        </motion.div>

        <div className="w-full max-w-4xl flex flex-col gap-4">
          <AnimatePresence>
            {sortedPlayers.map((player, index) => {
              let medal = null;
              let bgClass = "bg-white border-gray-200 shadow-sm";
              let textClass = "text-slate-700";
              
              if (index === 0) {
                medal = "🥇";
                bgClass = "bg-yellow-50 border-yellow-300 shadow-sm";
                textClass = "text-yellow-600";
              } else if (index === 1) {
                medal = "🥈";
                bgClass = "bg-slate-50 border-slate-300 shadow-sm";
                textClass = "text-slate-600";
              } else if (index === 2) {
                medal = "🥉";
                bgClass = "bg-orange-50 border-orange-300 shadow-sm";
                textClass = "text-orange-700";
              } else {
                medal = <span className="text-2xl font-bold text-slate-400 w-8 text-center">{index + 1}</span>;
              }

              return (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-card p-6 flex items-center justify-between border-2 ${bgClass}`}
                >
                  <div className="flex items-center gap-6">
                    <div className="text-4xl w-12 flex justify-center">{medal}</div>
                    <div className={`text-4xl font-bold uppercase tracking-wider ${textClass}`}>
                      {player.name}
                    </div>
                  </div>
                  <div className="text-4xl font-display font-bold text-game-cyan">
                    {player.score} <span className="text-xl text-slate-400 ml-2 font-sans">PTS</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
