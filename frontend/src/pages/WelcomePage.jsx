import { Link } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
  return (
    <div className="welcome-container">
      <h1>Welcome to GameHub</h1>
      <p className="welcome-text">
        Play exciting games, compete with friends, and climb the leaderboard!
      </p>
      <div className="welcome-buttons">
        <Link to="/login" className="button primary-button">
          Login
        </Link>
        <Link to="/signup" className="button primary-button">
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default WelcomePage; 