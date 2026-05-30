import React, { useState, useCallback } from 'react';
import { GamePhase } from './game/types';
import { GameCanvas } from './game/GameCanvas';
import { HomePage } from './components/HomePage';
import { WinScreen, LoseScreen } from './components/ResultScreen';

type GameResult =
  | { type: 'win'; time: number }
  | { type: 'lose'; hp: number };

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('home');
  const [result, setResult] = useState<GameResult | null>(null);
  // Key forces GameCanvas remount on full restart (new key = new instance)
  const [gameKey, setGameKey] = useState(0);

  const handleStart = useCallback(() => {
    setResult(null);
    setPhase('playing');
  }, []);

  const handleWin = useCallback((time: number) => {
    setResult({ type: 'win', time });
    setPhase('win');
  }, []);

  const handleLose = useCallback((hp: number) => {
    setResult({ type: 'lose', hp });
    setPhase('lose');
  }, []);

  // Full restart — remount canvas so game state is completely fresh
  const handleRestart = useCallback(() => {
    setResult(null);
    setPhase('playing');
    setGameKey(k => k + 1);
  }, []);

  const handleHome = useCallback(() => {
    setResult(null);
    setPhase('home');
    setGameKey(k => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-[#14111F] flex items-center justify-center overflow-hidden">
      {phase === 'home' && <HomePage onStart={handleStart} />}

      {(phase === 'playing' || phase === 'win' || phase === 'lose') && (
        <div className="relative">
          {/* Canvas always rendered while in game to avoid flicker */}
          <div
            style={{
              boxShadow: '0 0 60px rgba(93,169,255,0.2), 0 0 120px rgba(124,58,237,0.15)',
              border: '2px solid #2B2740',
            }}
          >
            <GameCanvas
              key={gameKey}
              onWin={handleWin}
              onLose={handleLose}
            />
          </div>

          {/* Result overlays */}
          {phase === 'win' && result?.type === 'win' && (
            <WinScreen
              time={result.time}
              onRestart={handleRestart}
              onHome={handleHome}
            />
          )}
          {phase === 'lose' && result?.type === 'lose' && (
            <LoseScreen
              remainingHp={result.hp}
              onRestart={handleRestart}
              onHome={handleHome}
            />
          )}
        </div>
      )}
    </div>
  );
}
