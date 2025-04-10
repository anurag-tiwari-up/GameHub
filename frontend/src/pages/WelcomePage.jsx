import { Link } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
  return (
    <div className="welcome-container">
      <h1>Welcome to GameHub</h1>
      <p className="welcome-text">
        Step into a world of classic games with a modern twist! Challenge friends in Tic Tac Toe, 
        test your luck in Rock Paper Scissors, and climb the leaderboard to become the ultimate champion. 
        Track your progress, compete with others, and enjoy endless gaming fun!
      </p>
      <Link to="/login" className="button primary-button continue-button">
        Start Playing
      </Link>
    </div>
  );
};

export default WelcomePage; 