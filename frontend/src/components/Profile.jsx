import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  console.log('Current user in Profile:', user);
  console.log('User stats:', user?.stats);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear any previous error/success messages
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await updateUser(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setError(error.message || 'Failed to update profile. Please try again.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const calculateWinRate = (stats) => {
    if (!stats?.gamesPlayed) return 0;
    const totalGames = stats.gamesPlayed;
    return Math.round((stats.wins / totalGames) * 100);
  };

  const getTotalGames = () => {
    const tictactoeGames = user?.stats?.tictactoe?.gamesPlayed || 0;
    const rpsGames = user?.stats?.rps?.gamesPlayed || 0;
    return tictactoeGames + rpsGames;
  };

  const getTotalWins = () => {
    const tictactoeWins = user?.stats?.tictactoe?.wins || 0;
    const rpsWins = user?.stats?.rps?.wins || 0;
    return tictactoeWins + rpsWins;
  };

  const getOverallWinRate = () => {
    const totalGames = getTotalGames();
    const totalWins = getTotalWins();
    return totalGames ? Math.round((totalWins / totalGames) * 100) : 0;
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="header-buttons">
          <button 
            className="button primary-button"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
          <button 
            className="button danger-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {isEditing ? (
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={50}
              placeholder="Enter your name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="button primary-button">
              Save Changes
            </button>
            <button 
              type="button" 
              className="button danger-button"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: user?.name || '',
                  email: user?.email || '',
                });
                setError('');
                setSuccess('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-info">
          <div className="info-group">
            <h3>Name</h3>
            <p>{user?.name}</p>
          </div>
          <div className="info-group">
            <h3>Email</h3>
            <p>{user?.email}</p>
          </div>
        </div>
      )}

      <div className="game-stats">
        <h2>Game Statistics</h2>
        <div className="overall-stats">
          <div className="stat-summary">
            <div className="summary-item">
              <span>Total Games</span>
              <span>{getTotalGames()}</span>
            </div>
            <div className="summary-item">
              <span>Total Wins</span>
              <span>{getTotalWins()}</span>
            </div>
            <div className="summary-item">
              <span>Overall Win Rate</span>
              <span>{getOverallWinRate()}%</span>
            </div>
          </div>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Tic-Tac-Toe</h3>
            <div className="stat-item">
              <span>Games Played</span>
              <span>{user?.stats?.tictactoe?.gamesPlayed || 0}</span>
            </div>
            <div className="stat-item">
              <span>Wins</span>
              <span>{user?.stats?.tictactoe?.wins || 0}</span>
            </div>
            <div className="stat-item">
              <span>Draws</span>
              <span>{user?.stats?.tictactoe?.draws || 0}</span>
            </div>
            <div className="stat-item">
              <span>Losses</span>
              <span>{user?.stats?.tictactoe?.losses || 0}</span>
            </div>
            <div className="stat-item">
              <span>Win Rate</span>
              <span>{calculateWinRate(user?.stats?.tictactoe)}%</span>
            </div>
          </div>
          <div className="stat-card">
            <h3>Rock Paper Scissors</h3>
            <div className="stat-item">
              <span>Games Played</span>
              <span>{user?.stats?.rps?.gamesPlayed || 0}</span>
            </div>
            <div className="stat-item">
              <span>Wins</span>
              <span>{user?.stats?.rps?.wins || 0}</span>
            </div>
            <div className="stat-item">
              <span>Draws</span>
              <span>{user?.stats?.rps?.draws || 0}</span>
            </div>
            <div className="stat-item">
              <span>Losses</span>
              <span>{user?.stats?.rps?.losses || 0}</span>
            </div>
            <div className="stat-item">
              <span>Win Rate</span>
              <span>{calculateWinRate(user?.stats?.rps)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 