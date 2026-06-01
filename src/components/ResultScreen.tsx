import React, { useEffect, useRef, useState } from 'react';
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
        <h2
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(16px, 2.8vw, 24px)',
            color: '#39FF88',
            textShadow: '0 0 20px #39FF88, 0 0 40px #39FF88',
            textAlign: 'center',
            lineHeight: 1.8,
          }}
        >
          你成功地<br />失败了！
        </h2>

        {/* Rank badge */}
        <div
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '60px',
            color: rankColor,
            textShadow: `0 0 30px ${rankColor}, 0 0 60px ${rankColor}`,
            lineHeight: 1,
          }}
        >
          {rank}
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-3 items-center">
          <StatRow label="归零用时" value={`${time.toFixed(2)}s`} color="#F5F3FF" />
          {best !== null && (
            <StatRow
              label="最佳成绩"
              value={`${best.toFixed(2)}s`}
              color="#FFD700"
              extra={isNewBest ? '★ 新纪录' : undefined}
            />
          )}
          <StatRow label="评级" value={rank} color={rankColor} />
        </div>

        {/* Rank guide */}
        <div
          className="flex gap-4 mt-1"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
          }}
        >
          {(['S','A','B','C'] as const).map(r => (
            <span key={r} style={{ color: getRankColor(r) }}>
              {r}: {r === 'S' ? '<6s' : r === 'A' ? '6-8s' : r === 'B' ? '8-11s' : '11-15s'}
            </span>
          ))}
        </div>

        <Buttons onPrimary={onRestart} primaryLabel="再来一次" onHome={onHome} />
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
            fontSize: 'clamp(18px, 3.2vw, 28px)',
            color: '#FF4D4D',
            textShadow: '0 0 20px #FF4D4D, 0 0 40px #FF4D4D',
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          你活下来了。
        </h2>

        <p
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '11px',
            color: '#A8A3C7',
            textAlign: 'center',
            lineHeight: 2.2,
          }}
        >
          你撑过了 15 秒。
          <br />
          挑战失败。
        </p>

        <StatRow label="剩余 HP" value={String(remainingHp)} color="#FF4D4D" />

        <p
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#5DA9FF',
            textAlign: 'center',
            lineHeight: 2.2,
          }}
        >
          提示：冲向地刺，注意躲开<br />加血池和回血瓶！
        </p>

        <Buttons onPrimary={onRestart} primaryLabel="重新开始" onHome={onHome} />
        <Hint />
      </div>
    </Overlay>
  );
}

// ─── Rule-break screen ────────────────────────────────────────────────────

interface RuleBreakProps {
  time: number;
  onRestart: () => void;
  onHome: () => void;
}

export function RuleBreakScreen({ time, onRestart, onHome }: RuleBreakProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 80);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') onRestart();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onRestart]);

  const glitch = tick % 3 === 0;
  const colors = ['#B380FF', '#5DA9FF', '#FF4D4D', '#FFD700'];
  const titleColor = colors[tick % colors.length];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(10, 8, 20, 0.97)', backdropFilter: 'blur(2px)' }}
    >
      {/* Edge glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        boxShadow: 'inset 0 0 120px rgba(124,58,237,0.35), inset 0 0 60px rgba(93,169,255,0.2)',
      }} />

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
      }} />

      <div className="relative z-10 flex flex-col items-center gap-6 px-10 py-8"
        style={{ minWidth: 360, maxWidth: 560 }}
      >
        {/* Title */}
        <div style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 'clamp(22px, 4vw, 32px)',
          color: titleColor,
          textShadow: `0 0 30px ${titleColor}, 0 0 60px ${titleColor}`,
          textAlign: 'center',
          letterSpacing: '0.05em',
          transform: glitch ? `translate(${(Math.random()-0.5)*6}px, 0)` : 'none',
          transition: 'color 0.08s',
        }}>
          规则崩坏
        </div>

        {/* Glitch divider */}
        <div style={{
          width: '100%',
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${titleColor}, #FF4D4D, transparent)`,
          boxShadow: `0 0 8px ${titleColor}`,
        }} />

        {/* Stats */}
        <div className="flex flex-col gap-4 items-center w-full">
          <RuleStatRow label="归零用时" value={`${time.toFixed(2)} 秒`} color="#FFD700" glitch={glitch} />
          <RuleStatRow label="评级" value="无法评级" color="#FF4D4D" glitch={glitch} />
          <div className="w-full rounded px-4 py-3 text-center" style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '11px',
            color: '#B380FF',
            border: '1px solid #3D1A7A',
            background: '#110820',
            lineHeight: 2.2,
            textShadow: '0 0 8px #B380FF',
          }}>
            解锁称号<br />
            <span style={{ fontSize: '13px', color: '#FFD700', textShadow: '0 0 12px #FFD700' }}>
              比规则更快的人
            </span>
          </div>
        </div>

        {/* Glitch divider */}
        <div style={{
          width: '100%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #FF4D4D44, #7C3AED44, transparent)',
        }} />

        {/* Buttons */}
        <div className="flex gap-4">
          <ArcadeBtn onClick={onRestart} primary>再来一次</ArcadeBtn>
          <ArcadeBtn onClick={onHome}>返回首页</ArcadeBtn>
        </div>

        <p style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '10px',
          color: '#3A2860',
          marginTop: -8,
        }}>
          R 键重新开始
        </p>
      </div>
    </div>
  );
}

function RuleStatRow({ label, value, color, glitch }: {
  label: string; value: string; color: string; glitch: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '11px', color: '#6A5A9A' }}>
        {label}:
      </span>
      <span style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '13px',
        color,
        textShadow: `0 0 8px ${color}`,
        transform: glitch ? 'translate(2px, 0)' : 'none',
        display: 'inline-block',
      }}>
        {value}
      </span>
    </div>
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
        style={{ minWidth: 340, maxWidth: 520 }}
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
          fontSize: '11px',
          color: '#A8A3C7',
        }}
      >
        {label}:
      </span>
      <span
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '13px',
          color,
        }}
      >
        {value}
      </span>
      {extra && (
        <span
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
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
        主页
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

  return (
    <button
      onClick={onClick}
      className="px-6 py-3 rounded transition-all duration-75 active:scale-95"
      style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
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
        fontSize: '10px',
        color: '#3A3560',
        marginTop: 4,
      }}
    >
      R 键重新开始
    </p>
  );
}
