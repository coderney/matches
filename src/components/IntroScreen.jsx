import React, { useRef, useState } from 'react';

const DIR_META = {
  left:  { icon: '←', color: 'var(--catch-left-color)',  pos: { left: 12, top: '50%', transform: 'translateY(-50%)' } },
  right: { icon: '→', color: 'var(--catch-right-color)', pos: { right: 12, top: '50%', transform: 'translateY(-50%)' } },
  top:   { icon: '↑', color: 'var(--catch-top-color)',   pos: { top: 12, left: '50%', transform: 'translateX(-50%)' } },
  trash: { icon: '🗑', color: '#888',                    pos: { bottom: 12, left: '50%', transform: 'translateX(-50%)' } },
};

function CatchZone({ dir, isTarget, onSwipe }) {
  const meta = DIR_META[dir];
  return (
    <div
      onClick={() => onSwipe(dir)}
      style={{
        position: 'absolute', ...meta.pos,
        width: 72, height: 72, borderRadius: '50%',
        background: isTarget ? `${meta.color}33` : 'rgba(255,255,255,0.06)',
        border: `2.5px solid ${isTarget ? meta.color : 'rgba(255,255,255,0.15)'}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer',
        zIndex: 10, fontSize: 26, userSelect: 'none',
        boxShadow: isTarget ? `0 0 20px ${meta.color}66` : 'none',
        animation: isTarget ? 'pulse 1s ease-in-out infinite alternate' : 'none',
      }}
    >
      {meta.icon}
    </div>
  );
}

function IntroCard({ card, onSwipe, flash }) {
  const startRef = useRef(null);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const meta = DIR_META[card.target];

  const getDir = (dx, dy) => {
    const adx = Math.abs(dx), ady = Math.abs(dy);
    if (Math.max(adx, ady) < 60) return null;
    if (ady > adx) return dy < 0 ? 'top' : 'trash';
    return dx < 0 ? 'left' : 'right';
  };

  const onPointerDown = (e) => { startRef.current = { x: e.clientX, y: e.clientY }; };
  const onPointerMove = (e) => {
    if (!startRef.current) return;
    setDrag({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y });
  };
  const onPointerUp = (e) => {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const dir = getDir(dx, dy);
    startRef.current = null;
    setDrag({ x: 0, y: 0 });
    if (dir) onSwipe(dir);
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(calc(-50% + ${drag.x}px), calc(-50% + ${drag.y}px)) rotate(${drag.x * 0.08}deg)`,
        width: 160, height: 220,
        background: flash ? '#fff0f0' : '#fff',
        borderRadius: 20,
        boxShadow: flash
          ? '0 0 0 4px #dc1e1e, 0 8px 40px rgba(0,0,0,0.45)'
          : `0 0 0 3px ${meta.color}, 0 8px 40px rgba(0,0,0,0.45)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 8,
        cursor: 'grab', touchAction: 'none',
        transition: drag.x === 0 && drag.y === 0 ? 'transform 0.25s, box-shadow 0.15s' : 'none',
        zIndex: 20, userSelect: 'none',
      }}
    >
      <div style={{ fontSize: 72, fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>
        {card.value}
      </div>
      <div style={{ fontSize: 22, color: meta.color, fontWeight: 700 }}>
        {meta.icon}
      </div>
    </div>
  );
}

export default function IntroScreen({ card, introIndex, introTotal, flash, onSwipe }) {
  const meta = DIR_META[card.target];
  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
        padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      }}>
        <div style={{ fontSize: 13, color: '#aaa' }}>{introIndex + 1} / {introTotal}</div>
        <div style={{ fontSize: 14, color: meta.color, fontWeight: 600 }}>
          Swipe zur richtigen Zone
        </div>
      </div>

      {Object.keys(DIR_META).map(dir => (
        <CatchZone key={dir} dir={dir} isTarget={dir === card.target} onSwipe={onSwipe} />
      ))}

      <IntroCard key={card.id} card={card} onSwipe={onSwipe} flash={flash} />

      <style>{`
        @keyframes pulse { from { opacity: 0.7; transform: scale(1); } to { opacity: 1; transform: scale(1.08); } }
      `}</style>
    </div>
  );
}
