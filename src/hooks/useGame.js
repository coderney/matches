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
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const catches = [
    { dir: 'left',  label: '←', numbers: nums.slice(0, 3) },
    { dir: 'right', label: '→', numbers: nums.slice(3, 6) },
    { dir: 'top',   label: '↑', numbers: nums.slice(6, 9) },
  ];
  // one anchor card per catch (first number), shown in intro
  const anchorCards = catches.map(c => ({
    id: `anchor-${c.dir}`,
    value: c.numbers[0],
    target: c.dir,
  }));
  // full play deck: all 9 catch cards + 3 trash
  const trashNums = nums.slice(9, 12);
  const playDeck = shuffle([
    ...catches.flatMap(c => c.numbers.map(n => ({ id: `${c.dir}-${n}`, value: n, target: c.dir }))),
    ...trashNums.map(n => ({ id: `trash-${n}`, value: n, target: 'trash' })),
  ]);
  return { catches, anchorCards: shuffle(anchorCards), playDeck };
}

export default function useGame() {
  const [game, setGame] = useState(() => generateGame());
  const [phase, setPhase] = useState('intro'); // 'intro' | 'play'
  const [introIndex, setIntroIndex] = useState(0);
  const [introFlash, setIntroFlash] = useState(false);

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

  const swipeIntro = useCallback((dir) => {
    const card = game.anchorCards[introIndex];
    if (!card) return;
    if (dir !== card.target) {
      setIntroFlash(true);
      setTimeout(() => setIntroFlash(false), 500);
      return;
    }
    const next = introIndex + 1;
    if (next >= game.anchorCards.length) {
      setPhase('play');
    } else {
      setIntroIndex(next);
    }
  }, [game, introIndex]);

  const swipeCard = useCallback((dir) => {
    if (done || penalty > 0) return;
    const card = game.playDeck[cardIndex];
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
    if (next >= game.playDeck.length) {
      setDone(true);
      clearInterval(timerRef.current);
    }
    setCardIndex(next);
  }, [done, penalty, game, cardIndex]);

  const restart = useCallback(() => {
    clearInterval(timerRef.current);
    setGame(generateGame());
    setPhase('intro');
    setIntroIndex(0);
    setIntroFlash(false);
    setCardIndex(0);
    setElapsed(0);
    setPenalty(0);
    penaltyRef.current = 0;
    setErrors(0);
    setDone(false);
  }, []);

  const currentIntroCard = game.anchorCards[introIndex] || null;
  const currentCard = game.playDeck[cardIndex] || null;
  const progress = game.playDeck.length ? cardIndex / game.playDeck.length : 0;
  const totalTime = elapsed + errors * PENALTY_SECONDS;

  return {
    phase,
    catches: game.catches,
    // intro
    currentIntroCard, introIndex, introTotal: game.anchorCards.length,
    introFlash, swipeIntro,
    // play
    currentCard, progress,
    elapsed, penalty, penaltyFlash, errors,
    done, totalTime,
    swipeCard, restart,
  };
}
