import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, UserPlus, X, Trash2, Users } from 'lucide-react';
import { playSound } from '../utils/audio';

export default function PlayerManager({ players, setPlayers, setGameState }) {
  const [newPlayerName, setNewPlayerName] = useState('');

  const handleAddPlayer = (e) => {
    e.preventDefault();
    const name = newPlayerName.trim();
    
    if (name && players.length < 10) {
      // Check for duplicate names
      if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        alert("Player name already exists!");
        return;
      }
      
      const newPlayer = {
        id: Date.now().toString(),
        name: name.toUpperCase(),
        score: 0
      };
      
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
      playSound('tick');
    }
  };

  const handleRemovePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
    playSound('tick');
  };

  const getInitials = (name) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="flex flex-col min-h-screen p-8 max-w-6xl mx-auto w-full z-10 relative"
    >
      <div className="flex items-center justify-between mb-12">
        <button 
          onClick={() => { playSound('tick'); setGameState('home'); }}
          className="flex items-center gap-2 text-game-cyan hover:text-slate-900 transition-colors text-xl font-bold"
        >
          <ArrowLeft size={24} /> BACK TO HOME
        </button>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-game-purple to-game-cyan">
          WHO'S PLAYING?
        </h1>
        <div className="text-xl font-bold text-slate-500">
          {players.length} / 10
        </div>
      </div>

      <div className="glass-card p-8 mb-12 flex-shrink-0">
        <form onSubmit={handleAddPlayer} className="flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Enter player name"
            maxLength={15}
            disabled={players.length >= 10}
            className="flex-1 bg-white border-2 border-gray-200 focus:border-game-cyan rounded-xl px-6 py-4 text-2xl text-slate-900 shadow-sm outline-none transition-all w-full placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!newPlayerName.trim() || players.length >= 10}
            className="bg-game-cyan text-white px-8 py-4 rounded-xl text-xl font-bold flex items-center gap-2 hover:bg-game-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap w-full md:w-auto justify-center shadow-md"
          >
            <UserPlus size={24} />
            + ADD PLAYER
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max flex-1 content-start">
        <AnimatePresence>
          {players.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, filter: 'blur(5px)' }}
              layout
              className="glass-card p-6 flex items-center justify-between group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-game-cyan/5 to-game-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-game-cyan to-game-purple flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {getInitials(player.name)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 truncate max-w-[150px]">{player.name}</h3>
                  <p className="text-game-cyan font-bold text-lg">{player.score} POINTS</p>
                </div>
              </div>

              <button
                onClick={() => handleRemovePlayer(player.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2 relative z-10"
                title="Remove player"
              >
                <Trash2 size={28} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {players.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center text-slate-400 py-12">
            <Users size={64} className="mb-4 opacity-30" />
            <p className="text-2xl font-medium">No players added yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
