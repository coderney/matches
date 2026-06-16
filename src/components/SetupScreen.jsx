import React, { useState } from 'react';

const DIR_LABELS = {
  left:  { icon: '←', color: 'var(--catch-left-color)',  name: 'Links' },
  right: { icon: '→', color: 'var(--catch-right-color)', name: 'Rechts' },
  top:   { icon: '↑', color: 'var(--catch-top-color)',   name: 'Oben' },
};

function NumberInput({ value, onChange }) {
  const [input, setInput] = useState('');

  const addNumber = (e) => {
    e.preventDefault();
    const nums = input.split(/[\s,;]+/).map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n > 0);
    if (nums.length) {
      const next = [...new Set([...value, ...nums])].sort((a, b) => a - b);
      onChange(next);
      setInput('');
    }
  };

  const remove = (n) => onChange(value.filter(x => x !== n));

  return (
    <div style={{ marginTop: 8 }}>
      <form onSubmit={addNumber} style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="z.B. 3, 7, 12"
          style={inputStyle}
        />
        <button type="submit" style={btnSmall}>+</button>
      </form>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        {value.map(n => (
          <span key={n} style={chip} onClick={() => remove(n)}>
            {n} ✕
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SetupScreen({ catches, updateCatch, onStart }) {
  const allNumbers = catches.flatMap(c => c.numbers);
  const hasDuplicates = allNumbers.length !== new Set(allNumbers).size;
  const hasNumbers = catches.every(c => c.numbers.length > 0);
  const canStart = hasNumbers && !hasDuplicates;

  return (
    <div style={container}>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 4, letterSpacing: -1 }}>Matches</h1>
      <p style={{ color: '#aaa', marginBottom: 28, fontSize: 14 }}>Weise den Catches ihre Zahlen zu</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 420 }}>
        {catches.map((c, i) => {
          const meta = DIR_LABELS[c.dir];
          return (
            <div key={c.dir} style={{ ...card, borderLeft: `4px solid ${meta.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 22, color: meta.color }}>{meta.icon}</span>
                <input
                  type="text"
                  value={c.label}
                  onChange={e => updateCatch(i, 'label', e.target.value)}
                  placeholder={`${meta.name} (Label optional)`}
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
              <NumberInput value={c.numbers} onChange={nums => updateCatch(i, 'numbers', nums)} />
            </div>
          );
        })}
      </div>
      {hasDuplicates && (
        <p style={{ color: '#f74f4f', marginTop: 12, fontSize: 13 }}>
          ⚠ Gleiche Zahl in mehreren Catches
        </p>
      )}
      <button
        onClick={onStart}
        disabled={!canStart}
        style={{ ...startBtn, opacity: canStart ? 1 : 0.4, cursor: canStart ? 'pointer' : 'not-allowed' }}
      >
        Los geht's!
      </button>
    </div>
  );
}

const container = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', minHeight: '100dvh', padding: 20,
};
const card = { background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px' };
const inputStyle = {
  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 14, outline: 'none',
};
const btnSmall = {
  background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8,
  color: '#fff', padding: '8px 14px', fontSize: 16, cursor: 'pointer',
};
const chip = {
  background: 'rgba(255,255,255,0.12)', borderRadius: 20,
  padding: '3px 10px', fontSize: 13, cursor: 'pointer',
};
const startBtn = {
  marginTop: 28, padding: '14px 48px', fontSize: 18, fontWeight: 700,
  background: 'linear-gradient(135deg, #4f8ef7, #4fcf70)',
  border: 'none', borderRadius: 50, color: '#fff', letterSpacing: 0.5,
};
