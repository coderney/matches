import React, { useRef, useState } from 'react';

const CATCH_META = {
  left:  { icon: '←', color: 'var(--catch-left-color)',  pos: { left: 12, top: '50%', transform: 'translateY(-50%)' } },
  right: { icon: '→', color: 'var(--catch-right-color)', pos: { right: 12, top: '50%', transform: 'translateY(-50%)' } },
  top:   { icon: '↑', color: 'var(--catch-top-color)',   pos: { top: 12, left: '50%', transform: 'translateX(-50%)' } },
};

function formatTime(s) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

function CatchZone({ dir, onSwipe }) {
  const m = CATCH_META[dir];
  return (
    <div onClick={() => onSwipe(dir)} style={{
      position: 'absolute', ...m.pos,
      width: 72, height: 72, borderRadius: '50%',
      background: 'rgba(255,255,255,0.08)',
      border: `2.5px solid ${m.color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', zIndex: 10, fontSize: 22, userSelect: 'none',
    }}>
      {m.icon}
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

  const onPointerDown = (e) => { if (!blocked) startRef.current = { x: e.clientX, y: e.clientY }; };
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
      onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
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

function HintOverlay({ catches, penalty }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80,
      background: 'rgba(10,10,20,0.92)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      pointerEvents: 'none',
    }}>
      <p style={{ fontSize: 13, color: '#aaa', marginBottom: 4 }}>Matching Cards</p>
      <div style={{ display: 'flex', gap: 20 }}>
        {catches.map(c => (
          <div key={c.dir} style={{
            width: 90, height: 120, background: '#fff', borderRadius: 14,
            boxShadow: `0 0 0 3px ${c.color}`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <span style={{ fontSize: 44, fontWeight: 800, color: '#1a1a2e' }}>{c.number}</span>
            <span style={{ fontSize: 18, color: c.color, fontWeight: 700 }}>{c.icon}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 48, fontWeight: 900, color: '#dc1e1e', marginTop: 8 }}>{penalty}</div>
    </div>
  );
}

export default function PlayScreen({ catches, currentCard, elapsed, penalty, penaltyFlash, showHint, errors, progress, done, totalTime, swipeCard, triggerHint, onRestart }) {
  if (done) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', gap: 16 }}>
        <div style={{ fontSize: 64 }}>🎉</div>
        <h2 style={{ fontSize: 28, fontWeight: 800 }}>Fertig!</h2>
        <div style={{ fontSize: 48, fontWeight: 800, color: '#4fcf70' }}>{formatTime(totalTime)}</div>
        <p style={{ color: '#aaa' }}>{errors} Fehler × 5s Strafe</p>
        <button onClick={onRestart} style={actionBtn}>Nochmal</button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden' }}>
      {penaltyFlash && !showHint && (
        <div style={{
          position: 'absolute', inset: 0, background: 'var(--penalty-red)',
          zIndex: 100, pointerEvents: 'none', animation: 'flashIn 0.6s ease-out forwards',
        }} />
      )}

      {showHint
        ? <HintOverlay catches={catches} penalty={penalty} />
        : penalty > 0 && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 90, pointerEvents: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 96, fontWeight: 900, color: '#dc1e1e', textShadow: '0 2px 24px #00000099' }}>
              {penalty}
            </div>
          </div>
        )
      }

      {/* HUD */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: '#aaa' }}>{errors} Fehler</div>
        <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: penalty > 0 ? '#dc1e1e' : '#fff' }}>
          {formatTime(elapsed)}
        </div>
        <div style={{ fontSize: 13, color: '#aaa' }}>{Math.round(progress * 100)}%</div>
      </div>

      {/* Progress bar */}
      <div style={{ position: 'absolute', top: 52, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.1)', zIndex: 30 }}>
        <div style={{ height: '100%', width: `${progress * 100}%`, background: 'linear-gradient(90deg, #4f8ef7, #4fcf70)', transition: 'width 0.3s' }} />
      </div>

      {/* Catch zones (left, right, top) */}
      {Object.keys(CATCH_META).map(dir => (
        <CatchZone key={dir} dir={dir} onSwipe={swipeCard} />
      ))}

      {/* Bottom bar: Hinweis | Trash | Neustart */}
      <div style={{
        position: 'absolute', bottom: 16, left: 0, right: 0, zIndex: 10,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20,
      }}>
        <button
          onClick={triggerHint}
          disabled={penalty > 0 || done}
          style={{ ...sideBtn, opacity: penalty > 0 ? 0.35 : 1 }}
        >
          💡 Hinweis
        </button>

        <div onClick={() => swipeCard('trash')} style={trashZone}>🗑</div>

        <button onClick={onRestart} style={sideBtn}>
          ↺ Neustart
        </button>
      </div>

      {/* Play card */}
      {currentCard && (
        <PlayCard key={currentCard.id} card={currentCard} onSwipe={swipeCard} blocked={penalty > 0} />
      )}

      <style>{`
        @keyframes flashIn { from { opacity: 1; } to { opacity: 0; } }
      `}</style>
    </div>
  );
}

const actionBtn = {
  padding: '13px 40px', fontSize: 17, fontWeight: 700,
  background: 'linear-gradient(135deg, #4f8ef7, #4fcf70)',
  border: 'none', borderRadius: 50, color: '#fff', cursor: 'pointer',
};

const sideBtn = {
  padding: '10px 16px', fontSize: 13, fontWeight: 600,
  background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.2)',
  borderRadius: 24, color: '#fff', cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const trashZone = {
  width: 64, height: 64, borderRadius: '50%',
  background: 'rgba(255,255,255,0.08)',
  border: '2.5px solid #888',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', fontSize: 22, userSelect: 'none', flexShrink: 0,
};
