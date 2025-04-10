import { useNavigate } from 'react-router-dom';
import './GamesSelection.css';

const GamesSelection = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 'tictactoe',
      name: 'Tic Tac Toe',
      description: 'Classic game of Xs and Os',
      image: '🎮'
    },
    {
      id: 'rps',
      name: 'Rock Paper Scissors',
      description: 'Test your luck against the computer',
      image: '✊'
    }
  ];

  const handleGameSelect = (gameId) => {
    navigate(`/${gameId}`);
  };

  return (
    <div className="games-selection">
      <h1>Choose a Game</h1>
      <div className="games-grid">
        {games.map((game) => (
          <div 
            key={game.id} 
            className="game-card"
            onClick={() => handleGameSelect(game.id)}
          >
            <div className="game-icon">{game.image}</div>
            <h2>{game.name}</h2>
            <p>{game.description}</p>
          </div>
        ))}
      </div>
      <footer className="games-footer">
        <button 
          className="leaderboard-button"
          onClick={() => navigate('/leaderboard')}
        >
          View Leaderboard 🏆
        </button>
      </footer>
    </div>
  );
};

export default GamesSelection; 