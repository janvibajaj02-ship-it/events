import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      // Check for token in URL (from Google OAuth)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      
      if (urlToken) {
        localStorage.setItem('token', urlToken);
        // Clean up URL to remove token
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        if (urlToken) {
          toast.success('Successfully logged in with Google!');
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data.user);
      localStorage.setItem('token', data.token);
      toast.success('Welcome back!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const signup = async (formData) => {
    try {
      const { data } = await api.post('/auth/signup', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(data.user);
      localStorage.setItem('token', data.token);
      toast.success('Registration successful!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
      return false;
    }
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); // eslint-disable-line react-refresh/only-export-components
