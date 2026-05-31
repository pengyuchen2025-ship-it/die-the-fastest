import React from 'react';
import { getBestTime } from '../game/storage';

interface Props {
  onStart: () => void;
}

export function HomePage({ onStart }: Props) {
  const best = getBestTime();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#14111F] px-6 select-none">

      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-7 max-w-2xl w-full">

        {/* Skull */}
        <div className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>
          💀
        </div>

        {/* Title */}
        <h1
          className="text-center leading-snug"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(28px, 5.5vw, 46px)',
            color: '#F5F3FF',
            textShadow: '0 0 20px #7C3AED, 0 0 40px #5DA9FF, 4px 4px 0 #2B2740',
          }}
        >
          DIE THE<br />FASTEST
        </h1>

        {/* Subtitle */}
        <p
          className="text-center"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(13px, 2vw, 16px)',
            color: '#E5484D',
            textShadow: '0 0 12px #E5484D',
            lineHeight: 2.2,
          }}
        >
          在 15 秒内让 HP 归零。
          <br />
          活得太久，就算失败。
        </p>

        {/* ── Controls ── 放在标题下方最显眼的位置 */}
        <div
          className="flex flex-col items-center gap-4 w-full rounded-lg px-6 py-5"
          style={{
            background: '#1A1728',
            border: '2px solid #2B2740',
          }}
        >
          <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '13px', color: '#5DA9FF' }}>
            操作方式
          </p>
          <div className="flex items-center gap-8 flex-wrap justify-center">

            {/* WASD */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex justify-center">
                <Key label="W" />
              </div>
              <div className="flex gap-2">
                <Key label="A" />
                <Key label="S" />
                <Key label="D" />
              </div>
            </div>

            <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '13px', color: '#4A4570' }}>
              或
            </span>

            {/* Arrow keys */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex justify-center">
                <Key label="↑" />
              </div>
              <div className="flex gap-2">
                <Key label="←" />
                <Key label="↓" />
                <Key label="→" />
              </div>
            </div>

            <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#A8A3C7', lineHeight: 1.8 }}>
              移动<br />角色
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#5DA9FF44] to-transparent" />

        {/* Description */}
        <div
          className="rounded-lg border border-[#2B2740] bg-[#1A1728] px-6 py-5 w-full"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(11px, 1.6vw, 13px)',
            color: '#A8A3C7',
            lineHeight: 2.8,
          }}
        >
          <p>这<span style={{ color: '#FF4D4D' }}>不是</span>一个生存游戏。</p>
          <p className="mt-1">你的目标是精准踩上危险物，尽快让 HP 归零。</p>
          <p className="mt-1">
            小心{' '}
            <span style={{ color: '#FF80AA' }}>加血池</span>{' '}、{' '}
            <span style={{ color: '#37E6D0' }}>回血瓶</span>{' '}和{' '}
            <span style={{ color: '#8A8F98' }}>保命柱</span>
            {' '}——它们会拼命让你活着。
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-5 w-full">
          <LegendItem color="#E5484D" label="地刺 -2" />
          <LegendItem color="#FF7A1A" label="爆裂刺 -3" />
          <LegendItem color="#FF80AA" label="加血池 +1/s ⚠" />
          <LegendItem color="#37E6D0" label="回血瓶 +2 ⚠" />
          <LegendItem color="#8A8F98" label="保命柱 阻挡" />
        </div>

        {/* Best time */}
        {best !== null && (
          <p style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '13px',
            color: '#FFD700',
            textShadow: '0 0 8px #FFD700',
          }}>
            ⭐ 最佳成绩: {best.toFixed(2)}s
          </p>
        )}

        {/* Start button */}
        <button
          onClick={onStart}
          className="px-12 py-5 rounded transition-all duration-100 active:scale-95"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '18px',
            background: 'linear-gradient(180deg, #9F67FF 0%, #7C3AED 100%)',
            color: '#F5F3FF',
            border: '2px solid #5DA9FF',
            boxShadow: '0 0 24px #7C3AED, 0 5px 0 #4C1D95, inset 0 1px 0 rgba(255,255,255,0.15)',
            cursor: 'pointer',
            letterSpacing: '0.1em',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'linear-gradient(180deg, #B380FF 0%, #9F67FF 100%)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 0 36px #9F67FF, 0 5px 0 #4C1D95, inset 0 1px 0 rgba(255,255,255,0.2)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'linear-gradient(180deg, #9F67FF 0%, #7C3AED 100%)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 0 24px #7C3AED, 0 5px 0 #4C1D95, inset 0 1px 0 rgba(255,255,255,0.15)';
          }}
        >
          开始游戏
        </button>

      </div>
    </div>
  );
}

// ─── Key cap component ────────────────────────────────────────────────────

function Key({ label }: { label: string }) {
  return (
    <div
      style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color: '#EAF2FF',
        background: 'linear-gradient(180deg, #3D3870 0%, #2B2655 100%)',
        border: '2px solid #6A65A0',
        borderBottom: '5px solid #14112A',
        borderRadius: '6px',
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 10px rgba(93,169,255,0.2)',
        userSelect: 'none',
      }}
    >
      {label}
    </div>
  );
}

// ─── Legend item ──────────────────────────────────────────────────────────

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-4 h-4 rounded-sm flex-shrink-0"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
      />
      <span
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '11px',
          color: '#A8A3C7',
        }}
      >
        {label}
      </span>
    </div>
  );
}
