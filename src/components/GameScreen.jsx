import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Play, Pause, RotateCcw, Eye, ArrowRight, X } from 'lucide-react';
import { playSound } from '../utils/audio';

// Subcomponents
const Timer = ({ timeRemaining, isRunning }) => {
  const isWarning = timeRemaining <= 15 && timeRemaining > 5;
  const isCritical = timeRemaining <= 5 && timeRemaining > 0;
  
  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-2 shrink-0 flex items-center justify-center">
      <svg viewBox="0 0 192 192" className="absolute inset-0 w-full h-full transform -rotate-90">
        <circle
          cx="96" cy="96" r="88"
          stroke="rgba(0,0,0,0.1)" strokeWidth="12" fill="none"
        />
        <motion.circle
          cx="96" cy="96" r="88"
          stroke={isCritical ? "#ef4444" : isWarning ? "#f97316" : "#0284c7"}
          strokeWidth="12" fill="none"
          strokeDasharray={2 * Math.PI * 88}
          strokeDashoffset={2 * Math.PI * 88 * (1 - timeRemaining / 30)}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="text-center z-10">
        <AnimatePresence mode="popLayout">
          {timeRemaining === 0 ? (
            <motion.div
              key="times-up"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-red-500"
            >
              TIME'S<br/>UP!
            </motion.div>
          ) : (
            <motion.div
              key={timeRemaining}
              initial={isCritical ? { scale: 1.5, opacity: 0 } : false}
              animate={isCritical ? { scale: 1, opacity: 1 } : false}
              className={`text-6xl font-display font-bold ${isCritical ? 'text-red-600' : isWarning ? 'text-orange-500' : 'text-slate-900'}`}
            >
              {timeRemaining}
            </motion.div>
          )}
        </AnimatePresence>
        {timeRemaining > 0 && <div className="text-sm tracking-widest text-slate-500 mt-1">SECONDS</div>}
      </div>
    </div>
  );
};

export default function GameScreen({ players, setPlayers, questions, currentQuestionIndex, setCurrentQuestionIndex, setGameState }) {
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [scoredPlayersThisQuestion, setScoredPlayersThisQuestion] = useState([]);
  const [transitioning, setTransitioning] = useState(false);
  
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [wrongSelections, setWrongSelections] = useState([]);
  
  const question = questions[currentQuestionIndex];
  const highestScore = Math.max(...players.map(p => p.score), 0);

  // Shuffle options on question change
  useEffect(() => {
    if (question?.options) {
      const opts = [...question.options];
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
      setShuffledOptions(opts);
    }
    setWrongSelections([]);
  }, [currentQuestionIndex, question]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isTimerRunning && timeRemaining > 0 && !isAnswerRevealed) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          const next = prev - 1;
          if (next <= 5 && next > 0) playSound('tick-urgent');
          else if (next === 0) playSound('times-up');
          return next;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining, isAnswerRevealed]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input
      if (e.target.tagName === 'INPUT') return;

      switch(e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          if (timeRemaining > 0 && !isAnswerRevealed) setIsTimerRunning(p => !p);
          break;
        case 'n':
          handleNextQuestion();
          break;
        case 'r':
          setTimeRemaining(30);
          break;
        case 'a':
          if (!isAnswerRevealed && shuffledOptions[0]) handleOptionSelect(shuffledOptions[0]);
          break;
        case 'b':
          if (!isAnswerRevealed && shuffledOptions[1]) handleOptionSelect(shuffledOptions[1]);
          break;
        case 'c':
          if (!isAnswerRevealed && shuffledOptions[2]) handleOptionSelect(shuffledOptions[2]);
          break;
        case 'd':
          if (!isAnswerRevealed && shuffledOptions[3]) handleOptionSelect(shuffledOptions[3]);
          break;
        case 'v':
          if (!isAnswerRevealed) handleReveal();
          break;
        case 'l':
          setGameState('leaderboard');
          break;
        case 'escape':
          setGameState('home');
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timeRemaining, isAnswerRevealed]);

  const handleReveal = () => {
    setIsAnswerRevealed(true);
    setIsTimerRunning(false);
    playSound('reveal');
  };

  const handleOptionSelect = (option) => {
    if (isAnswerRevealed || wrongSelections.includes(option) || timeRemaining === 0) return;

    if (option === question.answer) {
      handleReveal();
    } else {
      playSound('wrong');
      setWrongSelections(prev => [...prev, option]);
    }
  };

  const handleScore = (playerId) => {
    if (scoredPlayersThisQuestion.includes(playerId)) return;

    playSound('score');
    setIsTimerRunning(false); // Pause timer when a player is scored
    setScoredPlayersThisQuestion([...scoredPlayersThisQuestion, playerId]);
    
    setPlayers(players.map(p => {
      if (p.id === playerId) {
        return { ...p, score: p.score + 10 };
      }
      return p;
    }));
  };

  const handleNextQuestion = () => {
    playSound('tick');
    if (currentQuestionIndex < questions.length - 1) {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeRemaining(30);
        setIsTimerRunning(false); // require host to start
        setIsAnswerRevealed(false);
        setScoredPlayersThisQuestion([]);
        setTransitioning(false);
      }, 1500);
    } else {
      setGameState('winner');
    }
  };

  if (transitioning) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          className="text-center"
        >
          <h2 className="text-6xl font-display font-bold text-slate-900 text-glow mb-4">GET READY...</h2>
          <p className="text-2xl text-game-cyan font-bold">QUESTION {currentQuestionIndex + 2}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden p-4 md:p-6 w-full max-w-[1920px] mx-auto z-10 relative">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2 shrink-0">
        <div className="text-2xl font-bold text-slate-500">
          QUESTION <span className="text-slate-900 text-glow">{String(currentQuestionIndex + 1).padStart(2, '0')}</span> / {questions.length}
        </div>
        <div className="text-2xl font-display font-bold text-game-cyan tracking-widest text-glow">
          QUIZ GAME
        </div>
        <div className="text-xl font-bold text-slate-500 flex items-center gap-2">
          <Trophy className="text-game-purple" /> TOP SCORE: <span className="text-slate-900">{highestScore}</span>
        </div>
      </div>

      <div className="flex flex-1 gap-8 min-h-0">
        {/* Main Game Area */}
        <div className="flex-[3] flex flex-col items-center justify-between min-h-0">
          
          <Timer timeRemaining={timeRemaining} isRunning={isTimerRunning} />
          
          <div className="w-full max-w-4xl relative flex flex-col items-center flex-1 justify-center min-h-0 py-2">
            <AnimatePresence mode="wait">
              {!isAnswerRevealed ? (
                <motion.div 
                  key="question-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full flex flex-col items-center"
                >
                  {/* Clue Emojis */}
                  <div className="flex justify-center gap-4 mb-4 items-center">
                    {question.emojis.map((emoji, i) => (
                      <motion.div
                        key={currentQuestionIndex + i}
                        initial={{ opacity: 0, y: 50, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: i * 0.3, type: 'spring' }}
                        className="text-5xl md:text-7xl filter drop-shadow-xl"
                      >
                        {emoji}
                      </motion.div>
                    ))}
                  </div>

                  {/* Hints */}
                  <div className="grid grid-cols-2 gap-4 w-full mb-6">
                    <motion.div 
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="glass-card p-4 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 left-0 w-2 h-full bg-game-cyan" />
                      <h3 className="text-game-cyan font-bold mb-1 text-sm md:text-base">HINT 1</h3>
                      <p className="text-lg md:text-xl text-slate-900 leading-tight">{question.hint1}</p>
                      {timeRemaining === 30 && !isTimerRunning && (
                         <div className="absolute inset-0 backdrop-blur-md bg-white/60 flex items-center justify-center">
                           <span className="text-slate-600 font-bold tracking-widest shadow-white drop-shadow-md text-sm">START TIMER</span>
                         </div>
                      )}
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 }}
                      className="glass-card p-4 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 left-0 w-2 h-full bg-game-purple" />
                      <h3 className="text-game-purple font-bold mb-1 text-sm md:text-base">HINT 2</h3>
                      <p className="text-lg md:text-xl text-slate-900 leading-tight">{question.hint2}</p>
                       {timeRemaining === 30 && !isTimerRunning && (
                         <div className="absolute inset-0 backdrop-blur-md bg-white/60 flex items-center justify-center">
                           <span className="text-slate-600 font-bold tracking-widest drop-shadow-md shadow-white text-sm">START TIMER</span>
                         </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="answer-reveal"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center justify-center glass-card bg-white/95 shadow-xl p-8 md:p-12 mb-6"
                >
                  <p className="text-green-600 text-xl font-bold mb-2 tracking-widest flex items-center gap-2">
                    🎉 CORRECT ANSWER
                  </p>
                  <h2 className="text-6xl md:text-8xl font-display font-bold text-slate-900 drop-shadow-md uppercase tracking-wider text-center">
                    {question.answer}
                  </h2>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {shuffledOptions.map((option, idx) => {
                const letters = ['A', 'B', 'C', 'D'];
                const isCorrect = isAnswerRevealed && option === question.answer;
                const isWrong = wrongSelections.includes(option);
                const isDisabled = isAnswerRevealed && !isCorrect;

                return (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, y: 20 }}
                    animate={
                      isWrong 
                        ? { x: [-10, 10, -10, 10, 0], opacity: 0.7, scale: 0.98 }
                        : { opacity: 1, y: 0, scale: isCorrect ? 1.02 : 1 }
                    }
                    transition={{
                      delay: isWrong || isCorrect ? 0 : idx * 0.15 + 1.2,
                      x: { type: "spring", stiffness: 400, damping: 10 }
                    }}
                    whileHover={!isDisabled && !isWrong ? { scale: 1.02 } : {}}
                    whileTap={!isDisabled && !isWrong ? { scale: 0.98 } : {}}
                    onClick={() => handleOptionSelect(option)}
                    disabled={isDisabled || isWrong}
                    className={`relative p-4 md:p-5 rounded-2xl text-left transition-all border-2 flex items-center gap-4 overflow-hidden group
                      ${isCorrect 
                        ? 'bg-green-50 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] z-10' 
                        : isWrong 
                          ? 'bg-red-50/50 border-red-300' 
                          : isDisabled
                            ? 'bg-gray-50 border-gray-200 opacity-60'
                            : 'bg-white border-gray-200 hover:border-game-cyan shadow-sm hover:shadow-md'
                      }`}
                  >
                    {isCorrect && (
                      <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />
                    )}
                    <div className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl flex items-center justify-center font-bold text-xl md:text-2xl shadow-sm
                      ${isCorrect ? 'bg-green-500 text-white' 
                        : isWrong ? 'bg-red-400 text-white'
                        : isDisabled ? 'bg-gray-400 text-white'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-game-cyan group-hover:text-white transition-colors'}`}>
                      {letters[idx]}
                    </div>
                    <span className={`text-xl md:text-3xl font-bold truncate
                      ${isCorrect ? 'text-green-700'
                        : isWrong ? 'text-red-700'
                        : isDisabled ? 'text-gray-400'
                        : 'text-slate-800'}`}>
                      {option}
                    </span>
                    
                    <AnimatePresence>
                      {isCorrect && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-6 text-green-500"
                        >
                          <Trophy size={32} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Scoring Area */}
          <div className="w-full mt-auto pt-4 shrink-0 pb-2">
            <h3 className="text-center text-slate-500 font-bold mb-3 tracking-widest text-sm">AWARD POINTS TO CORRECT PLAYERS</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {players.map(player => {
                const hasScored = scoredPlayersThisQuestion.includes(player.id);
                return (
                  <motion.button
                    key={player.id}
                    whileHover={!hasScored ? { scale: 1.05 } : {}}
                    whileTap={!hasScored ? { scale: 0.95 } : {}}
                    onClick={() => handleScore(player.id)}
                    disabled={hasScored}
                    className={`relative px-4 py-2 md:px-6 md:py-4 rounded-xl border-2 transition-all flex flex-col items-center min-w-[120px]
                      ${hasScored 
                        ? 'bg-green-100 border-green-500 text-green-700 opacity-80' 
                        : 'glass-card hover:bg-game-cyan/10 hover:border-game-cyan text-slate-900 border-gray-200'
                      }`}
                  >
                    <span className="font-bold text-lg md:text-xl mb-1">{player.name}</span>
                    <span className="text-sm md:text-lg opacity-80">{player.score} PTS</span>
                    
                    <AnimatePresence>
                      {hasScored && (
                        <motion.div
                          initial={{ opacity: 0, y: 0 }}
                          animate={{ opacity: 1, y: -40 }}
                          exit={{ opacity: 0 }}
                          className="absolute text-green-600 font-bold text-2xl drop-shadow-sm z-50 pointer-events-none"
                        >
                          +10
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Compact Scoreboard & Host Controls */}
        <div className="flex-[1] flex flex-col gap-4 max-w-sm min-h-0">
          
          {/* Small Scoreboard */}
          <div className="glass-card p-4 md:p-6 flex-1 flex flex-col min-h-0">
            <h3 className="text-lg font-bold text-game-cyan mb-3 flex items-center justify-between">
              LIVE SCORES
              <span className="text-xs bg-gray-100 px-2 py-1 rounded text-slate-500 border border-gray-200">{players.length} Players</span>
            </h3>
            <div className="overflow-y-auto pr-2 space-y-2">
              {[...players].sort((a, b) => b.score - a.score).map((p, idx) => (
                <motion.div 
                  layout
                  key={p.id} 
                  className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${idx === 0 ? 'text-orange-500' : 'text-slate-400'}`}>#{idx + 1}</span>
                    <span className="font-bold text-slate-900 truncate max-w-[120px]">{p.name}</span>
                  </div>
                  <span className="text-game-cyan font-bold">{p.score}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Host Controls */}
          <div className="glass-card p-4 md:p-6 border-game-purple/30 shrink-0">
            <h3 className="text-xs md:text-sm font-bold text-game-purple mb-3 tracking-widest text-center">HOST CONTROLS</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                disabled={timeRemaining === 0 || isAnswerRevealed}
                className="bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 text-slate-800 p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {isTimerRunning ? <Pause size={20} className="text-game-cyan" /> : <Play size={20} className="text-game-cyan" />}
                <span className="text-xs font-bold">{isTimerRunning ? 'PAUSE' : 'START'} TIMER</span>
              </button>
              
              <button
                onClick={() => { setTimeRemaining(30); setIsTimerRunning(false); }}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-slate-800 p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <RotateCcw size={20} className="text-game-purple" />
                <span className="text-xs font-bold">RESET TIMER</span>
              </button>
            </div>

            <button
              onClick={handleReveal}
              disabled={isAnswerRevealed}
              className="w-full bg-game-purple hover:bg-game-purple/80 disabled:opacity-50 text-white p-3 md:p-4 rounded-lg flex items-center justify-center gap-2 font-bold mb-3 transition-colors"
            >
              <Eye size={20} /> REVEAL ANSWER
            </button>

            <button
              onClick={handleNextQuestion}
              className="w-full bg-game-cyan text-black hover:bg-white p-3 md:p-4 rounded-lg flex items-center justify-center gap-2 font-bold transition-colors"
            >
              NEXT QUESTION <ArrowRight size={20} />
            </button>
            
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
               <button
                  onClick={() => setGameState('leaderboard')}
                  className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-bold transition-colors"
                >
                  <Trophy size={14} /> LEADERBOARD
                </button>
                <button
                  onClick={() => setGameState('home')}
                  className="text-xs text-slate-400 hover:text-red-600 flex items-center gap-1 font-bold transition-colors"
                >
                  <X size={14} /> END GAME
                </button>
            </div>
            
            <div className="mt-4 text-[10px] text-slate-400 text-center uppercase tracking-wider font-bold">
              [SPACE] Timer &nbsp; [A/B/C/D] Answer &nbsp; [V] Reveal &nbsp; [N] Next
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
