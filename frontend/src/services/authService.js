import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const authService = {
  // Send access token to backend for verification and user creation
  googleLogin: async (accessToken) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/google`, {
        access_token: accessToken,
      });

      // Save user data and token to localStorage
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('loggedIn', 'true');
      }

      return response.data;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  // Logout: clear localStorage
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('loggedIn');
  },

  // Get current user from localStorage
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return localStorage.getItem('loggedIn') === 'true';
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('token');
  },
};
