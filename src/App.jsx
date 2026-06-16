import React from 'react';
import useGame from './hooks/useGame';
import SetupScreen from './components/SetupScreen';
import PlayScreen from './components/PlayScreen';

function App() {
  const game = useGame();

  if (game.phase === 'setup') {
    return (
      <SetupScreen
        catches={game.catches}
        updateCatch={game.updateCatch}
        onStart={game.startGame}
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
