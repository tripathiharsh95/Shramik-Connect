import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await getMe();
          const fetchedUser = res.data.data.user;
          // Attempt to get geolocation
          try {
            const position = await new Promise((resolve, reject) => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            } else {
              reject(new Error('Geolocation not supported'));
            }
          });
          const { latitude, longitude } = position.coords;
          // Reverse geocode using Nominatim to get city/district/block
          const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const revData = await revRes.json();
          const address = revData.address || {};
          const location = {
            latitude,
            longitude,
            city: address.city || address.town || address.village || address.state || '',
            district: address.state_district || address.county || '',
            block: address.suburb || address.neighbourhood || '',
          };
          const userWithLocation = { ...fetchedUser, location };
          setUser(userWithLocation);
          localStorage.setItem('user', JSON.stringify(userWithLocation));
          } catch (err) {
            console.error('Geolocation error on load:', err);
            setUser(fetchedUser);
            localStorage.setItem('user', JSON.stringify(fetchedUser));
          }
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const { token: t, data } = res.data;
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(t);
    // After successful login, get user geolocation and reverse geocode
    try {
      const position = await new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
          reject(new Error('Geolocation not supported'));
        }
      });
      const { latitude, longitude } = position.coords;
      const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
      const revData = await revRes.json();
      const address = revData.address || {};
      const location = {
        latitude,
        longitude,
        city: address.city || address.town || address.village || address.state || '',
        district: address.state_district || address.county || '',
        block: address.suburb || address.neighbourhood || '',
      };
      const userWithLocation = { ...data.user, location };
      setUser(userWithLocation);
      localStorage.setItem('user', JSON.stringify(userWithLocation));
    } catch (err) {
      console.error('Geolocation error:', err);
      setUser(data.user);
    }
    return data.user;
  };

  const establishSession = (t, userData) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(t);
    setUser(userData);
  };

  const register = async (formData) => {
    const res = await registerUser(formData);
    if (res.data && res.data.token) {
      const { token: t, data } = res.data;
      establishSession(t, data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Refresh or fetch location for the current user (if logged in)
  const refreshLocation = async () => {
    if (!token) return;
    try {
      const position = await new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
          reject(new Error('Geolocation not supported'));
        }
      });
      const { latitude, longitude } = position.coords;
      const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
      const revData = await revRes.json();
      const address = revData.address || {};
      const location = {
        latitude,
        longitude,
        city: address.city || address.town || address.village || address.state || '',
        district: address.state_district || address.county || '',
        block: address.suburb || address.neighbourhood || '',
      };
      // Merge into existing user data if present
      setUser(prev => {
        const updated = { ...(prev || {}), location };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error('Location refresh error:', err);
      // Clear any existing location data if geolocation fails
      setUser(prev => {
        const updated = { ...(prev || {}) };
        delete updated.location;
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateProfileState = (updatedUser) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshLocation, loading, isAuthenticated: !!user, updateProfileState, establishSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
