import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notifications from './Notifications';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchUnreadCount();
    // Poll every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // Refresh count when notifications are opened/closed
  useEffect(() => {
    if (!showNotifications) {
      fetchUnreadCount();
    }
  }, [showNotifications]);

  const fetchUnreadCount = async () => {
    try {
      if (!user) return;
      const response = await axios.get(`${API_URL}/notifications/unread-count`);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getHomePath = () => {
    if (user?.role === 'business') return '/business/home';
    if (user?.role === 'data_science') return '/datascience/home';
    if (user?.role === 'admin') return '/admin';
    return '/login';
  };

  const getThreadsPath = () => {
    if (user?.role === 'business') return '/business/threads';
    if (user?.role === 'data_science') return '/datascience/threads';
    return '#';
  };

  const handleCloseNotifications = async () => {
    try {
      await axios.patch(`${API_URL}/notifications/read-all`);
      setShowNotifications(false);
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      setShowNotifications(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img src="/assets/kra-logo.png" alt="KRA Logo" className="h-12 w-auto" />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to={getHomePath()}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname.includes('/home') || location.pathname === '/admin'
                    ? 'border-kra-red-600 text-kra-black-900'
                    : 'border-transparent text-gray-600 hover:border-kra-red-300 hover:text-kra-black-900'
                    }`}
                >
                  Home
                </Link>
                {(user?.role === 'business' || user?.role === 'data_science') && (
                  <Link
                    to={getThreadsPath()}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname.includes('/threads')
                      ? 'border-kra-red-600 text-kra-black-900'
                      : 'border-transparent text-gray-600 hover:border-kra-red-300 hover:text-kra-black-900'
                      }`}
                  >
                    Threads
                  </Link>
                )}
                {user?.role === 'data_science' && (
                  <Link
                    to="/datascience/contact-admin"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location.pathname.includes('/contact-admin')
                      ? 'border-kra-red-600 text-kra-black-900'
                      : 'border-transparent text-gray-600 hover:border-kra-red-300 hover:text-kra-black-900'
                      }`}
                  >
                    Contact Admin
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  if (showNotifications) {
                    handleCloseNotifications();
                  } else {
                    setShowNotifications(true);
                  }
                }}
                className="relative p-2 text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">{user?.name}</span>
                <span className="text-xs text-kra-black-700 bg-kra-red-50 px-2 py-1 rounded border border-kra-red-200">
                  {user?.role === 'business' ? 'Business' : user?.role === 'data_science' ? 'Data Science' : 'Admin'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-kra-red-600 hover:text-kra-red-700 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {showNotifications && (
        <Notifications onClose={handleCloseNotifications} />
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;

