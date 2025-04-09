import { useState } from 'react';
import Game from './Game';
import './TicTacToeMode.css';

const TicTacToeMode = () => {
  const [gameMode, setGameMode] = useState(null); // 'bot' or 'human'

  if (gameMode) {
    return <Game mode={gameMode} onBack={() => setGameMode(null)} />;
  }

  return (
    <div className="mode-selection">
      <h2>Select Game Mode</h2>
      <div className="mode-buttons">
        <button 
          className="mode-button"
          onClick={() => setGameMode('bot')}
        >
          <div className="mode-icon">🤖</div>
          <h3>Play vs Bot</h3>
          <p>Challenge our AI in a strategic battle</p>
        </button>
        <button 
          className="mode-button"
          onClick={() => setGameMode('human')}
        >
          <div className="mode-icon">👥</div>
          <h3>Play vs Human</h3>
          <p>Challenge a friend on the same device</p>
        </button>
      </div>
      <button 
        className="back-button"
        onClick={() => window.history.back()}
      >
        Back to Games
      </button>
    </div>
  );
};

export default TicTacToeMode; 