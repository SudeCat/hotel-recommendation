import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
if (!API_URL) throw new Error('REACT_APP_API_URL is not defined!');

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState(localStorage.getItem('guest') === 'true');

  useEffect(() => {
    if (token) {
      axios.get(`${API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => setUser(res.data))
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    const form = new FormData();
    form.append('username', username);
    form.append('password', password);
    const res = await axios.post(`${API_URL}/api/login`, form);
    setToken(res.data.access_token);
    localStorage.setItem('token', res.data.access_token);
    setGuest(false);
    localStorage.removeItem('guest');
  };

  const signup = async (username, email, password) => {
    await axios.post(`${API_URL}/api/register`, { username, email, password });
  };

  const continueAsGuest = () => {
    setGuest(true);
    localStorage.setItem('guest', 'true');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setGuest(false);
    localStorage.removeItem('token');
    localStorage.removeItem('guest');
  };

  return (
    <UserContext.Provider value={{ user, token, login, signup, logout, loading, guest, continueAsGuest }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
} 