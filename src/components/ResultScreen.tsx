import React, { useEffect, useRef } from 'react';
import { getRank, getRankColor, getBestTime } from '../game/storage';

interface WinProps {
  time: number;
  onRestart: () => void;
  onHome: () => void;
}

interface LoseProps {
  remainingHp: number;
  onRestart: () => void;
  onHome: () => void;
}

// ─── Win screen ───────────────────────────────────────────────────────────

export function WinScreen({ time, onRestart, onHome }: WinProps) {
  const rank = getRank(time);
  const rankColor = getRankColor(rank);
  const best = getBestTime();
  const isNewBest = best !== null && Math.abs(best - time) < 0.002;

  // R key shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') onRestart();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onRestart]);

  return (
    <Overlay flash="green">
      <div className="flex flex-col items-center gap-5">
        {/* Title */}
        <h2
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(14px, 2.5vw, 22px)',
            color: '#39FF88',
            textShadow: '0 0 20px #39FF88, 0 0 40px #39FF88',
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          YOU SUCCESSFULLY<br />FAILED!
        </h2>

        {/* Rank badge */}
        <div
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '56px',
            color: rankColor,
            textShadow: `0 0 30px ${rankColor}, 0 0 60px ${rankColor}`,
            lineHeight: 1,
          }}
        >
          {rank}
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-2 items-center">
          <StatRow label="TIME TO ZERO" value={`${time.toFixed(2)}s`} color="#F5F3FF" />
          {best !== null && (
            <StatRow
              label="BEST TIME"
              value={`${best.toFixed(2)}s`}
              color="#FFD700"
              extra={isNewBest ? '★ NEW RECORD' : undefined}
            />
          )}
          <StatRow label="RANK" value={rank} color={rankColor} />
        </div>

        {/* Rank guide */}
        <div
          className="flex gap-4 mt-1"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '7px',
          }}
        >
          {(['S','A','B','C'] as const).map(r => (
            <span key={r} style={{ color: getRankColor(r) }}>
              {r}: {r === 'S' ? '<6s' : r === 'A' ? '6-8s' : r === 'B' ? '8-11s' : '11-15s'}
            </span>
          ))}
        </div>

        <Buttons onPrimary={onRestart} primaryLabel="TRY AGAIN" onHome={onHome} />

        <Hint />
      </div>
    </Overlay>
  );
}

// ─── Lose screen ──────────────────────────────────────────────────────────

export function LoseScreen({ remainingHp, onRestart, onHome }: LoseProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') onRestart();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onRestart]);

  return (
    <Overlay flash="red">
      <div className="flex flex-col items-center gap-5">
        <h2
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(16px, 3vw, 26px)',
            color: '#FF4D4D',
            textShadow: '0 0 20px #FF4D4D, 0 0 40px #FF4D4D',
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          YOU SURVIVED.
        </h2>

        <p
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '9px',
            color: '#A8A3C7',
            textAlign: 'center',
            lineHeight: 2,
          }}
        >
          You lasted over 15 seconds.
          <br />
          Challenge failed.
        </p>

        <StatRow label="REMAINING HP" value={String(remainingHp)} color="#FF4D4D" />

        <p
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#5DA9FF',
            textAlign: 'center',
            lineHeight: 2,
          }}
        >
          Tip: Go for the spikes first,<br />then the poison pool.
        </p>

        <Buttons onPrimary={onRestart} primaryLabel="RESTART" onHome={onHome} />

        <Hint />
      </div>
    </Overlay>
  );
}

// ─── Shared components ────────────────────────────────────────────────────

function Overlay({
  children,
  flash,
}: {
  children: React.ReactNode;
  flash: 'green' | 'red';
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: 'rgba(20, 17, 31, 0.92)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Flash rim */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          boxShadow:
            flash === 'green'
              ? 'inset 0 0 80px rgba(57,255,136,0.18)'
              : 'inset 0 0 80px rgba(255,77,77,0.22)',
        }}
      />
      <div
        className="relative z-10 rounded border border-[#2B2740] bg-[#1A1728] px-10 py-8 flex flex-col items-center"
        style={{ minWidth: 320, maxWidth: 480 }}
      >
        {children}
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  color,
  extra,
}: {
  label: string;
  value: string;
  color: string;
  extra?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
          color: '#A8A3C7',
        }}
      >
        {label}:
      </span>
      <span
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '11px',
          color,
        }}
      >
        {value}
      </span>
      {extra && (
        <span
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '7px',
            color: '#FFD700',
          }}
        >
          {extra}
        </span>
      )}
    </div>
  );
}

function Buttons({
  onPrimary,
  primaryLabel,
  onHome,
}: {
  onPrimary: () => void;
  primaryLabel: string;
  onHome: () => void;
}) {
  return (
    <div className="flex gap-4 mt-2">
      <ArcadeBtn onClick={onPrimary} primary>
        {primaryLabel}
      </ArcadeBtn>
      <ArcadeBtn onClick={onHome}>
        HOME
      </ArcadeBtn>
    </div>
  );
}

function ArcadeBtn({
  onClick,
  primary,
  children,
}: {
  onClick: () => void;
  primary?: boolean;
  children: React.ReactNode;
}) {
  const base = primary
    ? { bg: '#7C3AED', hover: '#9F67FF', border: '#5DA9FF', shadow: '#7C3AED' }
    : { bg: '#2B2740', hover: '#3A3460', border: '#4A4560', shadow: '#000' };

  const ref = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={ref}
      onClick={onClick}
      className="px-5 py-3 rounded transition-all duration-75 active:scale-95"
      style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px',
        background: `linear-gradient(180deg, ${base.hover} 0%, ${base.bg} 100%)`,
        color: '#F5F3FF',
        border: `2px solid ${base.border}`,
        boxShadow: `0 0 12px ${base.shadow}55, 0 3px 0 rgba(0,0,0,0.6)`,
        cursor: 'pointer',
        letterSpacing: '0.08em',
      }}
    >
      {children}
    </button>
  );
}

function Hint() {
  return (
    <p
      style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px',
        color: '#3A3560',
        marginTop: 4,
      }}
    >
      R  to restart
    </p>
  );
}
