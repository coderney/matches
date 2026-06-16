import React from 'react';
import useGame from './hooks/useGame';
import IntroScreen from './components/IntroScreen';
import PlayScreen from './components/PlayScreen';

function App() {
  const game = useGame();

  if (game.phase === 'intro') {
    return (
      <IntroScreen
        card={game.currentIntroCard}
        introIndex={game.introIndex}
        introTotal={game.introTotal}
        flash={game.introFlash}
        onSwipe={game.swipeIntro}
      />
    );
  }

  return (
    <PlayScreen
      catches={game.catches}
      currentCard={game.currentCard}
      elapsed={game.elapsed}
      penalty={game.penalty}
      penaltyFlash={game.penaltyFlash}
      errors={game.errors}
      progress={game.progress}
      done={game.done}
      totalTime={game.totalTime}
      swipeCard={game.swipeCard}
      onRestart={game.restart}
    />
  );
}

export default App;
