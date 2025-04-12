import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import GamesSelection from './components/GamesSelection';
import TicTacToeMode from './components/TicTacToeMode';
import RockPaperScissors from './components/RockPaperScissors';
import SnakeGame from './components/SnakeGame';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import WelcomePage from './pages/WelcomePage';
import Navbar from './components/Navbar';
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
  const location = useLocation();
  const isWelcomePage = location.pathname === '/' && !user;

  return (
    <div className="App">
      <Navbar />
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
              path="/snake"
              element={
                <ProtectedRoute>
                  <SnakeGame onBack={() => navigate('/')} />
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
