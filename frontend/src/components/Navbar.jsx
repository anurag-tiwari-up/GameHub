import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const isLoginPage = location.pathname === '/login';
  const isSignupPage = location.pathname === '/signup';
  const menuRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleClickOutside = (event) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="App-header">
      <div className="container">
        <div className="navbar-content">
          <div className="navbar-logo">
            <h1 className="site-logo">
              <span className="logo-first">Game</span>
              <span className="logo-second">Hub</span>
            </h1>
          </div>
          
          <div className="navbar-links">
            {user ? (
              <>
                <Link to="/" className="button primary-button">Choose Game</Link>
                <Link to="/leaderboard" className="button primary-button">Leaderboard</Link>
                <Link to="/profile" className="button primary-button">Profile</Link>
              </>
            ) : null}
          </div>

          <div className="navbar-controls">
            <button 
              className="button primary-button theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            {isMobile && (
              <button 
                className="button primary-button hamburger-button"
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? '✕' : '☰'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && (
        <div 
          className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsMenuOpen(false);
            }
          }}
        >
          <div 
            className="mobile-menu-content"
            ref={menuRef}
          >
            {user ? (
              <>
                <Link to="/" className="button primary-button" onClick={toggleMenu}>Choose Game</Link>
                <Link to="/leaderboard" className="button primary-button" onClick={toggleMenu}>Leaderboard</Link>
                <Link to="/profile" className="button primary-button" onClick={toggleMenu}>Profile</Link>
              </>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar; 