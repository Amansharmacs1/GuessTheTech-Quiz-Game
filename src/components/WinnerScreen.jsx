import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Home, Users } from 'lucide-react';
import { playSound } from '../utils/audio';

export default function WinnerScreen({ players, resetGame, setGameState }) {
  const [showWinner, setShowWinner] = useState(false);
  
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  useEffect(() => {
    // Cinematic suspense delay
    setTimeout(() => {
      setShowWinner(true);
      playSound('winner');
    }, 2000);
  }, []);

  if (!showWinner) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10 bg-white/50 backdrop-blur-sm">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-6xl font-display font-bold text-slate-900 tracking-[0.5em]"
        >
          THE GAME IS OVER
        </motion.h1>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-8 z-10 relative overflow-hidden"
    >
      {/* Confetti simulation using Framer Motion (lightweight) */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={`confetti-${i}`}
          initial={{ 
            y: -20, 
            x: Math.random() * window.innerWidth - window.innerWidth/2,
            opacity: 1 
          }}
          animate={{ 
            y: window.innerHeight + 100,
            x: Math.random() * window.innerWidth - window.innerWidth/2,
            rotate: Math.random() * 360,
            opacity: 0
          }}
          transition={{ 
            duration: 3 + Math.random() * 2, 
            repeat: Infinity,
            delay: Math.random() * 2
          }}
          className={`absolute w-3 h-3 ${['bg-game-cyan', 'bg-game-purple', 'bg-yellow-400', 'bg-pink-500'][Math.floor(Math.random() * 4)]}`}
          style={{ top: -20 }}
        />
      ))}

      <motion.div 
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5, duration: 1 }}
        className="mb-8 relative z-20"
      >
        <Trophy size={150} className="text-yellow-500 drop-shadow-xl" />
      </motion.div>

      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-4xl text-game-cyan font-bold tracking-[0.3em] mb-4"
      >
        CHAMPION
      </motion.h2>

      <motion.h1 
        initial={{ y: 20, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
        className="text-8xl font-display font-bold text-game-purple mb-2 uppercase text-center drop-shadow-md"
      >
        {winner?.name || 'NOBODY'}
      </motion.h1>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-5xl font-bold text-yellow-500 mb-16 drop-shadow-sm"
      >
        {winner?.score || 0} POINTS
      </motion.div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="flex gap-6 relative z-20"
      >
        <button
          onClick={resetGame}
          className="bg-game-cyan text-white px-8 py-4 rounded-xl text-xl font-bold flex items-center gap-3 hover:bg-game-cyan/90 transition-colors hover:shadow-lg"
        >
          <RotateCcw size={24} /> PLAY AGAIN
        </button>
        
        <button
          onClick={() => { resetGame(); setGameState('players'); }}
          className="bg-game-purple text-white px-8 py-4 rounded-xl text-xl font-bold flex items-center gap-3 hover:bg-game-purple/90 transition-colors hover:shadow-lg"
        >
          <Users size={24} /> CHANGE PLAYERS
        </button>

        <button
          onClick={() => setGameState('home')}
          className="bg-white border border-gray-200 text-slate-800 px-8 py-4 rounded-xl text-xl font-bold flex items-center gap-3 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Home size={24} /> HOME
        </button>
      </motion.div>
    </motion.div>
  );
}
