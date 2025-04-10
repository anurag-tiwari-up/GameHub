import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import GamesSelection from './components/GamesSelection';
import TicTacToeMode from './components/TicTacToeMode';
import RockPaperScissors from './components/RockPaperScissors';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import WelcomePage from './pages/WelcomePage';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const AppContent = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isWelcomePage = location.pathname === '/' && !user;
  const isLoginPage = location.pathname === '/login';
  const isSignupPage = location.pathname === '/signup';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-container">
              <h1 className="site-logo">
                <span className="logo-first">Game</span>
                <span className="logo-second">Hub</span>
              </h1>
            </div>
            {!isWelcomePage ? (
              <div className="nav-buttons">
                {user ? (
                  <div className="header-buttons">
                    <button 
                      className="button primary-button theme-toggle"
                      onClick={toggleTheme}
                      aria-label="Toggle dark mode"
                    >
                      {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    <Link to="/profile" className="button primary-button" onClick={() => setIsMenuOpen(false)}>
                      Profile
                    </Link>
                  </div>
                ) : (
                  <div className="auth-buttons">
                    <button 
                      className="button primary-button theme-toggle"
                      onClick={toggleTheme}
                      aria-label="Toggle dark mode"
                    >
                      {isDarkMode ? '☀️' : '🌙'}
                    </button>
                    {!isLoginPage && (
                      <Link to="/login" className="button primary-button" onClick={() => setIsMenuOpen(false)}>
                        Login
                      </Link>
                    )}
                    {!isSignupPage && (
                      <Link to="/signup" className="button primary-button" onClick={() => setIsMenuOpen(false)}>
                        Sign Up
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="header-controls">
                <button 
                  className="button primary-button theme-toggle"
                  onClick={toggleTheme}
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main>
        <div className="container">
          <Routes>
            <Route path="/" element={user ? <GamesSelection /> : <WelcomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/tictactoe"
              element={
                <ProtectedRoute>
                  <TicTacToeMode />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rps"
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
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
