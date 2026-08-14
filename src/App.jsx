import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import HomeScreen from './components/HomeScreen';
import PlayerManager from './components/PlayerManager';
import GameScreen from './components/GameScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import WinnerScreen from './components/WinnerScreen';
import { questions } from './data/questions';
import { setGlobalSoundEnabled } from './utils/audio';

export default function App() {
  const [gameState, setGameState] = useState('home');
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('guess-company-players');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    localStorage.setItem('guess-company-players', JSON.stringify(players));
  }, [players]);

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setPlayers(players.map(p => ({ ...p, score: 0 })));
    setGameState('question');
  };

  const renderScreen = () => {
    switch (gameState) {
      case 'home':
        return <HomeScreen key="home" setGameState={setGameState} players={players} />;
      case 'players':
        return <PlayerManager key="players" players={players} setPlayers={setPlayers} setGameState={setGameState} />;
      case 'question':
        return <GameScreen 
                 key="question" 
                 players={players} 
                 setPlayers={setPlayers} 
                 questions={questions}
                 currentQuestionIndex={currentQuestionIndex}
                 setCurrentQuestionIndex={setCurrentQuestionIndex}
                 setGameState={setGameState} 
               />;
      case 'leaderboard':
        return <LeaderboardScreen key="leaderboard" players={players} setGameState={setGameState} />;
      case 'winner':
        return <WinnerScreen key="winner" players={players} resetGame={resetGame} setGameState={setGameState} />;
      default:
        return <HomeScreen key="home" setGameState={setGameState} players={players} />;
    }
  };

  return (
    <div className="min-h-screen bg-game-bg bg-grid-pattern relative overflow-hidden font-sans text-slate-900">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-game-cyan rounded-full mix-blend-multiply filter blur-[150px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-game-purple rounded-full mix-blend-multiply filter blur-[150px] opacity-10 pointer-events-none" />

      {/* Global Sound Control */}
      <button 
        onClick={() => {
          const newState = !soundEnabled;
          setSoundEnabled(newState);
          setGlobalSoundEnabled(newState);
        }}
        className="absolute top-6 right-6 z-50 glass-card p-3 rounded-full hover:bg-white/10 transition-colors"
        title={soundEnabled ? "Mute Sound" : "Enable Sound"}
      >
        {soundEnabled ? <Volume2 size={24} className="text-game-cyan" /> : <VolumeX size={24} className="text-gray-500" />}
      </button>

      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
    </div>
  );
}
