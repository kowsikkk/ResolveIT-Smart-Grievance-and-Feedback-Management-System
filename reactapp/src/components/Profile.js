import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import './Dashboard.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser({ 
        username: sessionStorage.getItem('username') || 'Demo User', 
        email: 'demo@example.com', 
        role: 'user' 
      });
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/users/reset-password', {
        currentPassword,
        newPassword
      });
      setMessage('Password updated successfully');
      setMessageType('success');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessageType('error');
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Error updating password');
      }
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getDashboardRoute = () => {
    const role = sessionStorage.getItem('loginRole') || user?.role;
    switch(role) {
      case 'admin':
        return '/admin/dashboard';
      case 'officer':
        return '/officer/dashboard';
      default:
        return '/dashboard';
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('loginRole');
    navigate('/login');
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button onClick={() => navigate(getDashboardRoute())} className="back-btn">← Back</button>
        <h1>Profile</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <h2>User Information</h2>
          <div className="user-info">
            <p><strong>Username:</strong> {user?.username || 'Not available'}</p>
            <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
            <p><strong>Role:</strong> {user?.role || 'User'}</p>
          </div>
        </div>

        <div className="profile-card">
          <h2>Reset Password</h2>
          <form onSubmit={handlePasswordReset}>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button type="submit">Update Password</button>
          </form>
          {message && <p className={`message ${messageType}`}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default Profile;