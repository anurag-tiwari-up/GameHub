import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getLeaderboardData } from '../services/api';
import './Leaderboard.css';

const Leaderboard = () => {
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('winRate');

  const games = [
    { id: 'all', name: 'All Games', icon: '🎮' },
    { id: 'tictactoe', name: 'Tic Tac Toe', icon: '❌' },
    { id: 'rps', name: 'Rock Paper Scissors', icon: '✌️' },
    { id: 'snake', name: 'Snake', icon: '🐍' }
  ];

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const data = await getLeaderboardData(token);
        setLeaderboardData(data);
      } catch (err) {
        setError('Failed to load leaderboard data');
        console.error('Error fetching leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  // Filter stats based on selected game
  const getFilteredStats = () => {
    if (selectedGame === 'all') return leaderboardData;
    return leaderboardData.filter(player => player.gameStats?.[selectedGame]?.gamesPlayed > 0);
  };

  // Calculate win rate based on selected game
  const calculateWinRate = (player) => {
    if (selectedGame === 'all') {
      const totalGames = Object.values(player.gameStats || {}).reduce(
        (sum, game) => sum + (game.gamesPlayed || 0), 0
      );
      const totalWins = Object.values(player.gameStats || {}).reduce(
        (sum, game) => sum + (game.wins || 0), 0
      );
      return totalGames ? ((totalWins / totalGames) * 100) : 0;
    }

    const gameStats = player.gameStats?.[selectedGame];
    if (!gameStats?.gamesPlayed) return 0;
    return ((gameStats.wins / gameStats.gamesPlayed) * 100);
  };

  // Calculate total games played
  const calculateTotalGames = (player) => {
    if (selectedGame === 'all') {
      return Object.values(player.gameStats || {}).reduce(
        (sum, game) => sum + (game.gamesPlayed || 0), 0
      );
    }
    return player.gameStats?.[selectedGame]?.gamesPlayed || 0;
  };

  // Sort players based on selected criteria
  const sortedPlayers = getFilteredStats().sort((a, b) => {
    if (selectedGame === 'snake') {
      const aHighScore = a.gameStats?.snake?.highScore || 0;
      const bHighScore = b.gameStats?.snake?.highScore || 0;
      return bHighScore - aHighScore;
    }
    if (sortBy === 'totalGames') {
      return calculateTotalGames(b) - calculateTotalGames(a);
    }
    // Default sort by win rate
    const aWinRate = calculateWinRate(a);
    const bWinRate = calculateWinRate(b);
    return bWinRate - aWinRate;
  });

  const getPlayerStats = (player) => {
    if (selectedGame === 'snake') {
      return {
        highScore: player.gameStats?.snake?.highScore || 0,
        gamesPlayed: player.gameStats?.snake?.gamesPlayed || 0
      };
    }
    if (selectedGame === 'all') {
      const totalStats = Object.values(player.gameStats || {}).reduce(
        (acc, game) => ({
          wins: acc.wins + (game.wins || 0),
          draws: acc.draws + (game.draws || 0),
          gamesPlayed: acc.gamesPlayed + (game.gamesPlayed || 0)
        }),
        { wins: 0, draws: 0, gamesPlayed: 0 }
      );
      return {
        wins: totalStats.wins,
        draws: totalStats.draws,
        losses: totalStats.gamesPlayed - totalStats.wins - totalStats.draws
      };
    }

    const gameStats = player.gameStats?.[selectedGame] || { wins: 0, draws: 0, gamesPlayed: 0 };
    return {
      wins: gameStats.wins || 0,
      draws: gameStats.draws || 0,
      losses: (gameStats.gamesPlayed || 0) - (gameStats.wins || 0) - (gameStats.draws || 0)
    };
  };

  if (loading) {
    return (
      <div className="leaderboard">
        <h1>Game Leaderboard</h1>
        <div className="loading">Loading leaderboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard">
        <h1>Game Leaderboard</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h1>Game Leaderboard</h1>
      
      <div className="game-filters">
        {games.map(game => (
          <button
            key={game.id}
            className={`game-filter-btn ${selectedGame === game.id ? 'active' : ''}`}
            onClick={() => setSelectedGame(game.id)}
          >
            <span className="game-icon">{game.icon}</span>
            {game.name}
          </button>
        ))}
      </div>

      <div className="sort-buttons">
        <button
          className={`sort-btn ${sortBy === 'winRate' ? 'active' : ''}`}
          onClick={() => setSortBy('winRate')}
        >
          Sort by Win Rate 📊
        </button>
        <button
          className={`sort-btn ${sortBy === 'totalGames' ? 'active' : ''}`}
          onClick={() => setSortBy('totalGames')}
        >
          Sort by Games Played 🎮
        </button>
        {selectedGame === 'snake' && (
          <button
            className={`sort-btn ${sortBy === 'highScore' ? 'active' : ''}`}
            onClick={() => setSortBy('highScore')}
          >
            Sort by High Score 🏆
          </button>
        )}
      </div>

      <div className="leaderboard-content">
        <div className="leaderboard-header">
          <span className="rank">#</span>
          <span className="player">Player</span>
          <span className="stats">
            {selectedGame === 'snake' ? 'High Score' : 'W/L/D'}
          </span>
          {selectedGame === 'snake' ? (
            <span className="games-played">Games Played</span>
          ) : (
            <span className="win-rate">Win Rate</span>
          )}
        </div>

        <div className="leaderboard-body">
          {sortedPlayers.map((player, index) => {
            const stats = getPlayerStats(player);
            const winRate = calculateWinRate(player);
            const isCurrentUser = player.username === user?.username;
            
            return (
              <div 
                key={player.username} 
                className={`leaderboard-row ${index < 3 ? 'top-three' : ''} ${isCurrentUser ? 'current-user' : ''}`}
              >
                <span className="rank">
                  {index + 1}
                  {index < 3 && <span className="medal">🏆</span>}
                </span>
                <span className="player">
                  {player.username}
                  {isCurrentUser && <span className="current-user-tag">You</span>}
                </span>
                <span className="stats">
                  {selectedGame === 'snake' ? (
                    stats.highScore
                  ) : (
                    `${stats.wins}/${stats.losses}/${stats.draws}`
                  )}
                </span>
                {selectedGame === 'snake' ? (
                  <span className="games-played">{stats.gamesPlayed}</span>
                ) : (
                  <span className="win-rate">{winRate.toFixed(1)}%</span>
                )}
              </div>
            );
          })}

          {sortedPlayers.length === 0 && (
            <div className="no-data">
              No players found for {selectedGame === 'all' ? 'any game' : games.find(g => g.id === selectedGame)?.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 