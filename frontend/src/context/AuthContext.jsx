import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getCurrentUser, updateUser as apiUpdateUser, updateGameStats as apiUpdateGameStats } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser(token)
        .then(userData => {
          setUser(userData);
        })
        .catch((error) => {
          console.error('Failed to get user data:', error);
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const { token, user: userData } = await apiLogin(credentials);
      localStorage.setItem('token', token);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const signup = async (userData) => {
    try {
      const { token, user: newUser } = await apiRegister(userData);
      localStorage.setItem('token', token);
      setUser(newUser);
      return newUser;
    } catch (error) {
      throw error;
    }
  };

  const updateUser = async (userData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const updatedUser = await apiUpdateUser(token, userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const updateGameStats = async (gameType, result, score = 0) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      console.log('Updating game stats:', { gameType, result, score });
      const updatedUser = await apiUpdateGameStats(token, gameType, result, score);
      console.log('Received updated user:', updatedUser);
      console.log('User stats after update:', updatedUser.stats);
      setUser(updatedUser);
      console.log('New user state:', updatedUser);
    } catch (error) {
      console.error('Failed to update game stats:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      signup, 
      updateUser,
      updateGameStats 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 