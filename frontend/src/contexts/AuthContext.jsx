/**
 * AuthContext - Simplified Session-Based Authentication
 * Enterprise Mode - VPN-based Internal System
 * 
 * SIMPLIFIED APPROACH:
 * - State: { user: null | User }
 * - Init: Call /session/me once, set user, done
 * - NO redirects
 * - NO complex state machines
 * - Router handles navigation
 */

import PropTypes from 'prop-types';
import { createContext, useEffect, useState } from 'react';

// Project imports
import authService from 'services/api/auth.service';
import { useRBACStore } from 'api/rbac';

// Simple state - just user data
const initialState = {
  user: null
};

const SET_USER = 'SET_USER';
const CLEAR_USER = 'CLEAR_USER';

// Context
const AuthContext = createContext(null);

// Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  /**
   * Multi-tab logout synchronization
   */
  useEffect(() => {
    const channel = new BroadcastChannel('tba-auth-channel');
    
    channel.onmessage = (event) => {
      if (event.data?.type === 'LOGOUT') {
        console.info('🔄 Logout detected in another tab');
        setUser(null);
        useRBACStore.getState().clear();
        window.location.href = '/login';
      }
    };
    
    return () => {
      channel.close();
    };
  }, []);

  /**
   * Initialize auth state on app startup
   * SIMPLIFIED: Call /session/me once, set user, done
   */
  useEffect(() => {
    const init = async () => {
      console.info('🔐 Checking session...');
      
      try {
        const response = await authService.me();
        
        if (response.status === 'success' && response.data) {
          setUser(response.data);
          useRBACStore.getState().initialize(response.data);
          console.info('✅ Session restored:', response.data.username);
        } else {
          console.info('ℹ️ No active session');
        }
      } catch (error) {
        console.info('ℹ️ No active session');
      }
    };

    init();
  }, []);

  /**
   * Login
   */
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    
    if (response.status === 'success' && response.data) {
      setUser(response.data);
      useRBACStore.getState().initialize(response.data);
      return response.data;
    } else {
      throw new Error('Login failed');
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    await authService.logout();
    setUser(null);
    useRBACStore.getState().clear();
    
    // Notify other tabs
    const channel = new BroadcastChannel('tba-auth-channel');
    channel.postMessage({ type: 'LOGOUT' });
    channel.close();
  };

  /**
   * Refresh user data
   */
  const refreshUser = async () => {
    try {
      const response = await authService.me();
      
      if (response.status === 'success' && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      setUser(null);
    }
  };

  // NO LOADER - always render immediately
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node
};

export default AuthContext;
export { AuthContext };
