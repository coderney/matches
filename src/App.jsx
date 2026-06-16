import React from 'react';
import useGame from './hooks/useGame';
import IntroScreen from './components/IntroScreen';
import PlayScreen from './components/PlayScreen';

function App() {
  const game = useGame();

  if (game.phase === 'memorize') {
    return <IntroScreen catches={game.catches} onStart={game.startPlay} />;
  }

  return (
    <PlayScreen
      catches={game.catches}
      currentCard={game.currentCard}
      elapsed={game.elapsed}
      penalty={game.penalty}
      penaltyFlash={game.penaltyFlash}
      showHint={game.showHint}
      errors={game.errors}
      progress={game.progress}
      done={game.done}
      totalTime={game.totalTime}
      swipeCard={game.swipeCard}
      triggerHint={game.triggerHint}
      onRestart={game.restart}
    />
  );
}

export default App;
