import React, { useRef, useState } from 'react';

const DIR_META = {
  left:  { icon: '←', color: 'var(--catch-left-color)',  style: { left: 12, top: '50%', transform: 'translateY(-50%)' } },
  right: { icon: '→', color: 'var(--catch-right-color)', style: { right: 12, top: '50%', transform: 'translateY(-50%)' } },
  top:   { icon: '↑', color: 'var(--catch-top-color)',   style: { top: 12, left: '50%', transform: 'translateX(-50%)' } },
  trash: { icon: '🗑', color: '#888',                    style: { bottom: 12, left: '50%', transform: 'translateX(-50%)' } },
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function CatchZone({ dir, label, onSwipe }) {
  const meta = DIR_META[dir];
  return (
    <div
      onClick={() => onSwipe(dir)}
      style={{
        position: 'absolute', ...meta.style,
        width: 72, height: 72, borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        border: `2.5px solid ${meta.color}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer',
        zIndex: 10, fontSize: 22, userSelect: 'none',
      }}
    >
      <span>{meta.icon}</span>
      {label && <span style={{ fontSize: 9, marginTop: 2, color: '#ffffffcc' }}>{label}</span>}
    </div>
  );
}

function PlayCard({ card, onSwipe, blocked }) {
  const startRef = useRef(null);
  const [drag, setDrag] = useState({ x: 0, y: 0 });

  const getDir = (dx, dy) => {
    const adx = Math.abs(dx), ady = Math.abs(dy);
    if (Math.max(adx, ady) < 60) return null;
    if (ady > adx) return dy < 0 ? 'top' : 'trash';
    return dx < 0 ? 'left' : 'right';
  };

  const onPointerDown = (e) => {
    if (blocked) return;
    startRef.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e) => {
    if (!startRef.current || blocked) return;
    setDrag({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y });
  };

  const onPointerUp = (e) => {
    if (!startRef.current || blocked) return;
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
        width: 160, height: 220, background: '#fff', borderRadius: 20,
        boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 72, fontWeight: 800, color: '#1a1a2e',
        cursor: blocked ? 'not-allowed' : 'grab',
        touchAction: 'none',
        transition: drag.x === 0 && drag.y === 0 ? 'transform 0.25s' : 'none',
        zIndex: 20, userSelect: 'none',
      }}
    >
      {card.value}
    </div>
  );
}

export default function PlayScreen({ catches, currentCard, elapsed, penalty, penaltyFlash, errors, progress, done, totalTime, swipeCard, onRestart }) {
  const catchMap = {};
  catches.forEach(c => { catchMap[c.dir] = c.label || c.dir; });

  if (done) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', gap: 16 }}>
        <div style={{ fontSize: 64 }}>🎉</div>
        <h2 style={{ fontSize: 28, fontWeight: 800 }}>Fertig!</h2>
        <div style={{ fontSize: 48, fontWeight: 800, color: '#4fcf70' }}>{formatTime(totalTime)}</div>
        <p style={{ color: '#aaa' }}>{errors} Fehler × 5s Strafe</p>
        <button onClick={onRestart} style={restartBtn}>Nochmal</button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden' }}>
      {penaltyFlash && (
        <div style={{
          position: 'absolute', inset: 0, background: 'var(--penalty-red)',
          zIndex: 100, pointerEvents: 'none', animation: 'flashIn 0.6s ease-out forwards',
        }} />
      )}
      {penalty > 0 && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 90, pointerEvents: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 96, fontWeight: 900, color: '#dc1e1e', textShadow: '0 2px 24px #00000099' }}>
            {penalty}
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: '#aaa' }}>{errors} Fehler</div>
        <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: penalty > 0 ? '#dc1e1e' : '#fff' }}>
          {formatTime(elapsed)}
        </div>
        <div style={{ fontSize: 13, color: '#aaa' }}>{Math.round(progress * 100)}%</div>
      </div>
      <div style={{ position: 'absolute', top: 52, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.1)', zIndex: 30 }}>
        <div style={{ height: '100%', width: `${progress * 100}%`, background: 'linear-gradient(90deg, #4f8ef7, #4fcf70)', transition: 'width 0.3s' }} />
      </div>
      {Object.keys(DIR_META).map(dir => (
        <CatchZone key={dir} dir={dir} label={dir !== 'trash' ? catchMap[dir] : ''} onSwipe={swipeCard} />
      ))}
      {currentCard && (
        <PlayCard key={currentCard.id} card={currentCard} onSwipe={swipeCard} blocked={penalty > 0} />
      )}
      <style>{`
        @keyframes flashIn { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
    </div>
  );
}

const restartBtn = {
  marginTop: 8, padding: '13px 40px', fontSize: 17, fontWeight: 700,
  background: 'linear-gradient(135deg, #4f8ef7, #4fcf70)',
  border: 'none', borderRadius: 50, color: '#fff', cursor: 'pointer',
};
