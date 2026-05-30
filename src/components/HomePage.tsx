import React from 'react';
import { getBestTime } from '../game/storage';

interface Props {
  onStart: () => void;
}

export function HomePage({ onStart }: Props) {
  const best = getBestTime();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#14111F] px-4 select-none">

      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
        }}
      />

      {/* Main card */}
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-2xl w-full">

        {/* Skull icon */}
        <div className="text-5xl mb-2 animate-bounce" style={{ animationDuration: '2s' }}>
          💀
        </div>

        {/* Title */}
        <h1
          className="text-center leading-tight"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(24px, 5vw, 40px)',
            color: '#F5F3FF',
            textShadow: '0 0 20px #7C3AED, 0 0 40px #5DA9FF, 3px 3px 0 #2B2740',
            letterSpacing: '0.05em',
          }}
        >
          DIE THE<br />FASTEST
        </h1>

        {/* Subtitle */}
        <p
          className="text-center mt-2"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(8px, 1.5vw, 11px)',
            color: '#E5484D',
            textShadow: '0 0 10px #E5484D',
            lineHeight: 2,
          }}
        >
          在 15 秒内让 HP 归零。
          <br />
          活得太久，就算失败。
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#5DA9FF44] to-transparent my-2" />

        {/* Description box */}
        <div
          className="rounded border border-[#2B2740] bg-[#1A1728] px-6 py-4 w-full"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 'clamp(7px, 1.2vw, 9px)',
            color: '#A8A3C7',
            lineHeight: 2.4,
          }}
        >
          <p>这<span style={{ color: '#FF4D4D' }}>不是</span>一个生存游戏。</p>
          <p className="mt-2">
            你的目标是精准地踩上危险物，尽快让 HP 归零。
          </p>
          <p className="mt-2">
            小心{' '}
            <span style={{ color: '#37E6D0' }}>回血瓶</span>{' '}和{' '}
            <span style={{ color: '#8A8F98' }}>保命柱</span>
            {' '}——它们会拼命让你活着。
          </p>
        </div>

        {/* Legend row */}
        <div className="flex flex-wrap justify-center gap-4 w-full">
          <LegendItem color="#E5484D" label="地刺 -2" />
          <LegendItem color="#FF7A1A" label="爆裂刺 -3" />
          <LegendItem color="#39FF88" label="毒池 -1/s" />
          <LegendItem color="#37E6D0" label="回血瓶 +2 ⚠" />
          <LegendItem color="#8A8F98" label="保命柱 阻挡" />
        </div>

        {/* Best time */}
        {best !== null && (
          <p
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '9px',
              color: '#FFD700',
              textShadow: '0 0 8px #FFD700',
            }}
          >
            ⭐ BEST: {best.toFixed(2)}s
          </p>
        )}

        {/* Start button */}
        <button
          onClick={onStart}
          className="mt-2 px-10 py-4 rounded transition-all duration-100 active:scale-95"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '14px',
            background: 'linear-gradient(180deg, #9F67FF 0%, #7C3AED 100%)',
            color: '#F5F3FF',
            border: '2px solid #5DA9FF',
            boxShadow: '0 0 20px #7C3AED, 0 4px 0 #4C1D95, inset 0 1px 0 rgba(255,255,255,0.15)',
            cursor: 'pointer',
            letterSpacing: '0.1em',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'linear-gradient(180deg, #B380FF 0%, #9F67FF 100%)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 0 30px #9F67FF, 0 4px 0 #4C1D95, inset 0 1px 0 rgba(255,255,255,0.2)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'linear-gradient(180deg, #9F67FF 0%, #7C3AED 100%)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 0 20px #7C3AED, 0 4px 0 #4C1D95, inset 0 1px 0 rgba(255,255,255,0.15)';
          }}
        >
          开始游戏
        </button>

        {/* Footer hint */}
        <p
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '7px',
            color: '#4A4560',
          }}
        >
          WASD / 方向键移动  ·  R 键重新开始
        </p>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-3 h-3 rounded-sm flex-shrink-0"
        style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }}
      />
      <span
        style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '7px',
          color: '#A8A3C7',
        }}
      >
        {label}
      </span>
    </div>
  );
}
