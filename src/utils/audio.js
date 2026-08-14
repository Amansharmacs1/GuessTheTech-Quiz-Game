// Simple sound synthesis using Web Audio API to avoid external assets and copyright issues

let audioCtx = null;
let soundEnabled = false;

export const setGlobalSoundEnabled = (enabled) => {
  soundEnabled = enabled;
};

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
};

const playTone = (frequency, type, duration, vol) => {
  if (!audioCtx || !soundEnabled) return;
  
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  
  gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
};

export const playSound = (soundName) => {
  if (!soundEnabled) return;

  initAudio();
  if (!audioCtx) return;
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  switch (soundName) {
    case 'tick':
      playTone(600, 'sine', 0.05, 0.05);
      break;
    case 'tick-urgent':
      playTone(800, 'sine', 0.1, 0.1);
      break;
    case 'times-up':
      // Melodic descending chime (C5, Ab4, F4, C4)
      playTone(523.25, 'triangle', 0.3, 0.2); 
      setTimeout(() => playTone(415.30, 'triangle', 0.3, 0.2), 150);
      setTimeout(() => playTone(349.23, 'triangle', 0.5, 0.2), 300);
      setTimeout(() => playTone(261.63, 'triangle', 0.8, 0.2), 450);
      break;
    case 'score':
      playTone(600, 'sine', 0.1, 0.1);
      setTimeout(() => playTone(800, 'sine', 0.2, 0.1), 100);
      break;
    case 'reveal':
      playTone(400, 'sine', 0.2, 0.1);
      setTimeout(() => playTone(600, 'sine', 0.2, 0.15), 150);
      setTimeout(() => playTone(1000, 'sine', 0.4, 0.2), 300);
      break;
    case 'start':
      playTone(300, 'sine', 0.2, 0.2);
      setTimeout(() => playTone(400, 'sine', 0.2, 0.2), 200);
      setTimeout(() => playTone(500, 'sine', 0.4, 0.2), 400);
      break;
    case 'wrong':
      playTone(150, 'sawtooth', 0.2, 0.2);
      setTimeout(() => playTone(120, 'sawtooth', 0.3, 0.2), 100);
      break;
    case 'winner':
      [400, 500, 600, 800, 1000, 1200].forEach((freq, i) => {
        setTimeout(() => playTone(freq, 'sine', 0.3, 0.2), i * 150);
      });
      break;
    default:
      break;
  }
};
