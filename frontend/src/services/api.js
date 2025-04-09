const API_URL = 'http://localhost:5000/api';

export const register = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  return response.json();
};

export const login = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
};

export const getCurrentUser = async (token) => {
  try {
    console.log('Fetching current user with token:', token);
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to get user data:', error);
      throw new Error(error.message || 'Failed to get user data');
    }

    const userData = await response.json();
    console.log('Received user data:', userData);
    return userData;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    throw error;
  }
};

export const updateUser = async (token, userData) => {
  const response = await fetch(`${API_URL}/auth/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user');
  }

  return response.json();
};

export const updateGameStats = async (token, gameType, result) => {
  console.log('Making API request:', { gameType, result });
  const response = await fetch(`${API_URL}/auth/stats`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ gameType, result }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('API error:', error);
    throw new Error(error.message || 'Failed to update game statistics');
  }

  const data = await response.json();
  console.log('API response:', data);
  return data;
};

export const initializeStats = async (token) => {
  const response = await fetch(`${API_URL}/auth/init-stats`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to initialize stats');
  }

  return response.json();
};

export const getLeaderboardData = async (token) => {
  try {
    console.log('Making leaderboard request with token:', token);
    const response = await fetch(`${API_URL}/auth/leaderboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Leaderboard response status:', response.status);
    if (!response.ok) {
      const error = await response.json();
      console.error('Leaderboard error response:', error);
      throw new Error(error.message || 'Failed to fetch leaderboard data');
    }

    const data = await response.json();
    console.log('Leaderboard data received:', data);
    return data;
  } catch (error) {
    console.error('Error in getLeaderboardData:', error);
    throw new Error(error.message || 'Failed to fetch leaderboard data');
  }
}; 