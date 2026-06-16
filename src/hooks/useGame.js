import { useState, useEffect, useRef, useCallback } from 'react';

const PENALTY_SECONDS = 5;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateGame() {
  const nums = shuffle(Array.from({ length: 20 }, (_, i) => i + 1));
  const catches = [
    { dir: 'left',  icon: '←', color: 'var(--catch-left-color)',  number: nums[0] },
    { dir: 'right', icon: '→', color: 'var(--catch-right-color)', number: nums[1] },
    { dir: 'top',   icon: '↑', color: 'var(--catch-top-color)',   number: nums[2] },
  ];
  const matchCards = catches.map(c => ({ id: `match-${c.dir}`, value: c.number, target: c.dir }));
  const trashCards = nums.slice(3, 10).map(n => ({ id: `trash-${n}`, value: n, target: 'trash' }));
  return { catches, deck: shuffle([...matchCards, ...trashCards]) };
}

export default function useGame() {
  const [game, setGame] = useState(() => generateGame());
  const [phase, setPhase] = useState('memorize'); // 'memorize' | 'play'
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

  const startPlay = useCallback(() => setPhase('play'), []);

  const swipeCard = useCallback((dir) => {
    if (done || penalty > 0) return;
    const card = game.deck[cardIndex];
    if (!card) return;
    if (card.target !== dir) {
      setErrors(e => e + 1);
      setPenaltyFlash(true);
      setTimeout(() => setPenaltyFlash(false), 600);
      penaltyRef.current = PENALTY_SECONDS;
      setPenalty(PENALTY_SECONDS);
      return;
    }
    const next = cardIndex + 1;
    if (next >= game.deck.length) {
      setDone(true);
      clearInterval(timerRef.current);
    }
    setCardIndex(next);
  }, [done, penalty, game, cardIndex]);

  const restart = useCallback(() => {
    clearInterval(timerRef.current);
    setGame(generateGame());
    setPhase('memorize');
    setCardIndex(0);
    setElapsed(0);
    setPenalty(0);
    penaltyRef.current = 0;
    setErrors(0);
    setDone(false);
  }, []);

  const currentCard = game.deck[cardIndex] || null;
  const progress = game.deck.length ? cardIndex / game.deck.length : 0;
  const totalTime = elapsed + errors * PENALTY_SECONDS;

  return {
    phase, catches: game.catches,
    startPlay,
    currentCard, progress,
    elapsed, penalty, penaltyFlash, errors,
    done, totalTime,
    swipeCard, restart,
  };
}
