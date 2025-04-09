import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import GamesSelection from './components/GamesSelection';
import TicTacToeMode from './components/TicTacToeMode';
import RockPaperScissors from './components/RockPaperScissors';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const AppContent = () => {
  const { user, logout } = useAuth();

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-container">
          <h1 className="site-logo">
            <span className="logo-first">Game</span>
            <span className="logo-second">Hub</span>
          </h1>
        </div>
        <div className="nav-buttons">
          {user ? (
            <div className="header-buttons">
              <Link to="/profile" className="profile-button">
                Profile
              </Link>
              <button onClick={logout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-button">
                Login
              </Link>
              <Link to="/signup" className="auth-button">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <GamesSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/play/tictactoe"
            element={
              <ProtectedRoute>
                <TicTacToeMode />
              </ProtectedRoute>
            }
          />
          <Route
            path="/play/rockpaperscissors"
            element={
              <ProtectedRoute>
                <RockPaperScissors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
