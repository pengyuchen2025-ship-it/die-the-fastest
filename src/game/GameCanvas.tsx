import React, { useRef, useEffect, useCallback } from 'react';
import { GameState } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { createInitialState, updateGame, resetState } from './gameLogic';
import { renderGame, drawRuleBreakAnim } from './renderer';
import { getBestTime, saveBestTime, saveRuleBreakUnlocked } from './storage';

interface Props {
  onWin: (time: number) => void;
  onLose: (remainingHp: number) => void;
  onRuleBreak: (time: number) => void;
}

export function GameCanvas({ onWin, onLose, onRuleBreak }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const stateRef   = useRef<GameState>(createInitialState());
  const lastTsRef  = useRef<number>(0);
  const rafRef     = useRef<number>(0);
  const bestRef    = useRef<number | null>(getBestTime());
  const animTRef   = useRef<number>(0); // monotonic time for visual animations

  const loop = useCallback((ts: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05); // cap at 50ms
    lastTsRef.current = ts;
    animTRef.current += dt;

    const state = stateRef.current;
    updateGame(state, dt);

    if (state.phase === 'rule_break_anim') {
      drawRuleBreakAnim(ctx, state, bestRef.current, animTRef.current);
    } else {
      renderGame(ctx, state, bestRef.current, animTRef.current);
    }

    if (state.phase === 'win') {
      saveBestTime(state.timeElapsed);
      bestRef.current = getBestTime();
      onWin(state.timeElapsed);
      return;
    }
    if (state.phase === 'lose') {
      onLose(state.player.hp);
      return;
    }
    if (state.phase === 'rule_break') {
      saveBestTime(state.timeElapsed);
      saveRuleBreakUnlocked();
      bestRef.current = getBestTime();
      onRuleBreak(state.timeElapsed);
      return;
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [onWin, onLose, onRuleBreak]);

  // Restart mid-game — reset state and continue loop
  const restart = useCallback(() => {
    resetState(stateRef.current);
    animTRef.current = 0;
    // Loop is already running; if it stopped (win/lose), restart it
    cancelAnimationFrame(rafRef.current);
    lastTsRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  useEffect(() => {
    lastTsRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);

    const onKeyDown = (e: KeyboardEvent) => {
      // Prevent arrow keys from scrolling the page
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'r' || e.key === 'R') {
        restart();
        return;
      }
      stateRef.current.keys.add(e.key);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys.delete(e.key);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [loop, restart]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  );
}
