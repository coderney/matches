import React from 'react';

const POS = {
  left:  { left: '8%',  top: '50%',  transform: 'translateY(-50%)' },
  right: { right: '8%', top: '50%',  transform: 'translateY(-50%)' },
  top:   { top: '10%',  left: '50%', transform: 'translateX(-50%)' },
};

function MatchingCard({ catchDef }) {
  return (
    <div style={{
      position: 'absolute',
      ...POS[catchDef.dir],
      width: 100, height: 140,
      background: '#fff',
      borderRadius: 16,
      boxShadow: `0 0 0 3px ${catchDef.color}, 0 6px 24px rgba(0,0,0,0.5)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 6,
      userSelect: 'none',
    }}>
      <div style={{ fontSize: 52, fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>
        {catchDef.number}
      </div>
      <div style={{ fontSize: 20, color: catchDef.color, fontWeight: 700 }}>
        {catchDef.icon}
      </div>
    </div>
  );
}

export default function IntroScreen({ catches, onStart }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        paddingTop: '3%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>Matching Cards</h2>
        <p style={{ fontSize: 13, color: '#aaa' }}>Merke dir welche Zahl wohin gehört</p>
      </div>

      {catches.map(c => <MatchingCard key={c.dir} catchDef={c} />)}

      <div style={{
        position: 'absolute', bottom: '14%', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}>
        <div style={{ fontSize: 13, color: '#666' }}>
          Alle anderen Karten → 🗑 Trash
        </div>
        <button onClick={onStart} style={startBtn}>Los geht’s!</button>
      </div>
    </div>
  );
}

const startBtn = {
  padding: '14px 48px', fontSize: 18, fontWeight: 700,
  background: 'linear-gradient(135deg, #4f8ef7, #4fcf70)',
  border: 'none', borderRadius: 50, color: '#fff',
  cursor: 'pointer', letterSpacing: 0.5,
};
