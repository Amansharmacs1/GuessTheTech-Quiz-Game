import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Users, Play } from 'lucide-react';
import { playSound } from '../utils/audio';

export default function HomeScreen({ setGameState, players }) {
  const handleStart = () => {
    playSound('start');
    setGameState('question');
  };

  const handleManage = () => {
    playSound('tick');
    setGameState('players');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="flex flex-col items-center justify-center min-h-screen text-center p-8 z-10 relative"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="mb-8"
      >
        <HelpCircle size={100} className="text-game-cyan filter drop-shadow-[0_0_15px_rgba(0,243,255,0.8)]" />
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-6xl md:text-8xl font-display font-bold text-slate-900 mb-4 tracking-wider text-glow"
      >
        QUIZ<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-game-cyan to-game-purple">GAME</span>
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="text-xl md:text-3xl font-medium text-slate-600 mb-16 tracking-widest"
      >
        30 SECONDS. 2 HINTS. 1 ANSWER.
      </motion.p>

      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center"
      >
        <button
          onClick={handleStart}
          disabled={players.length === 0}
          className={`group relative px-8 py-5 text-2xl font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 w-full md:w-auto
            ${players.length === 0 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300' 
              : 'bg-game-cyan/10 text-game-cyan border-2 border-game-cyan hover:bg-game-cyan hover:text-white hover:shadow-lg'}`}
        >
          <Play size={28} className={players.length > 0 ? 'group-hover:text-black' : ''} />
          START GAME
        </button>

        <button
          onClick={handleManage}
          className="group px-8 py-5 text-2xl font-bold bg-game-purple/10 text-game-purple border-2 border-game-purple rounded-xl transition-all duration-300 hover:bg-game-purple hover:text-white hover:shadow-lg flex items-center justify-center gap-3 w-full md:w-auto"
        >
          <Users size={28} />
          MANAGE PLAYERS {players.length > 0 && <span className="text-sm bg-game-purple text-white px-2 py-1 rounded-full ml-2">{players.length}</span>}
        </button>
      </motion.div>
      
      {players.length === 0 && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-red-500 mt-6 text-lg font-medium"
        >
          Add at least 1 player to start the game
        </motion.p>
      )}
    </motion.div>
  );
}
