import { useState, useEffect, useRef, useCallback } from 'react';

const PENALTY_SECONDS = 5;
const DIRECTIONS = ['left', 'right', 'top', 'trash'];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(catches) {
  const cards = [];
  catches.forEach((c, idx) => {
    const dir = DIRECTIONS[idx];
    c.numbers.forEach(n => cards.push({ id: `${dir}-${n}`, value: n, target: dir }));
  });
  const usedNumbers = new Set(catches.flatMap(c => c.numbers));
  const trashNumbers = [];
  for (let i = 1; i <= 20; i++) {
    if (!usedNumbers.has(i)) trashNumbers.push(i);
  }
  shuffle(trashNumbers).slice(0, 6).forEach(n => {
    cards.push({ id: `trash-${n}`, value: n, target: 'trash' });
  });
  return shuffle(cards);
}

export default function useGame() {
  const [phase, setPhase] = useState('setup');
  const [catches, setCatches] = useState([
    { dir: 'left', label: '', numbers: [] },
    { dir: 'right', label: '', numbers: [] },
    { dir: 'top', label: '', numbers: [] },
  ]);
  const [deck, setDeck] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [penaltyFlash, setPenaltyFlash] = useState(false);
  const [errors, setErrors] = useState(0);
  const [done, setDone] = useState(false);

  const timerRef = useRef(null);
  const penaltyRef = useRef(0);

  useEffect(() => {
    if (phase !== 'play' || done) return;
    timerRef.current = setInterval(() => {
      if (penaltyRef.current > 0) {
        penaltyRef.current -= 1;
        setPenalty(p => p - 1);
      } else {
        setElapsed(e => e + 1);
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, done]);

  const startGame = useCallback(() => {
    const built = buildDeck(catches);
    setDeck(built);
    setCardIndex(0);
    setElapsed(0);
    setPenalty(0);
    penaltyRef.current = 0;
    setErrors(0);
    setDone(false);
    setPhase('play');
  }, [catches]);

  const swipeCard = useCallback((direction) => {
    if (done || penalty > 0) return;
    const current = deck[cardIndex];
    if (!current) return;
    if (current.target !== direction) {
      setErrors(e => e + 1);
      setPenaltyFlash(true);
      setTimeout(() => setPenaltyFlash(false), 600);
      penaltyRef.current = PENALTY_SECONDS;
      setPenalty(PENALTY_SECONDS);
      return;
    }
    const next = cardIndex + 1;
    if (next >= deck.length) {
      setDone(true);
      clearInterval(timerRef.current);
      setCardIndex(next);
    } else {
      setCardIndex(next);
    }
  }, [done, penalty, deck, cardIndex]);

  const restart = useCallback(() => {
    setCatches([
      { dir: 'left', label: '', numbers: [] },
      { dir: 'right', label: '', numbers: [] },
      { dir: 'top', label: '', numbers: [] },
    ]);
    setPhase('setup');
  }, []);

  const updateCatch = useCallback((idx, field, value) => {
    setCatches(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  }, []);

  const totalTime = elapsed + (errors * PENALTY_SECONDS);
  const currentCard = deck[cardIndex] || null;
  const progress = deck.length ? cardIndex / deck.length : 0;

  return {
    phase, catches, updateCatch, startGame,
    deck, cardIndex, currentCard, progress,
    elapsed, penalty, penaltyFlash, errors,
    done, totalTime, swipeCard, restart,
  };
}
