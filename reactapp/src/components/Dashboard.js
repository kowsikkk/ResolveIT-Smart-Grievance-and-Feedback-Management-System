import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import './Dashboard.css';

const Dashboard = ({ userId, onLogout, onCreateComplaint, successMessage, initialView }) => {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [showProfile, setShowProfile] = useState(() => {
    return sessionStorage.getItem('currentView') === 'profile';
  });
  const [message, setMessage] = useState(successMessage || '');

  useEffect(() => {
    fetchUserData();
    fetchComplaints();
    if (message) {
      setTimeout(() => setMessage(''), 3000);
    }
  }, [message]);

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Use fallback data if API fails
      setUser({ 
        username: sessionStorage.getItem('username') || 'Demo User', 
        email: 'demo@example.com', 
        role: 'user' 
      });
    }
  };

  const fetchComplaints = async () => {
    try {
      const response = await api.get(`/api/complaints/user/${userId}`);
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
    }
  };

  if (showProfile) {
    return <Profile user={user} onBack={() => setShowProfile(false)} onLogout={onLogout} />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="header-actions">
          <button onClick={() => {
            setShowProfile(true);
            sessionStorage.setItem('currentView', 'profile');
          }} className="profile-btn">Profile</button>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <button onClick={onCreateComplaint} className="create-complaint-btn">
            Create New Complaint
          </button>
        </div>

        <div className="dashboard-card">
          <h2>My Complaints ({complaints.length})</h2>
          <div className="complaints-list">
            {complaints.length === 0 ? (
              <p>No complaints found</p>
            ) : (
              complaints.map(complaint => (
                <div key={complaint.id} className="complaint-item">
                  <h3>{complaint.subject}</h3>
                  <div className="complaint-meta">
                    <div className="meta-left">
                      <span>Date: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                      <span>Time: {new Date(complaint.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="meta-right">
                      <span>Priority: {complaint.priority || 'Medium'}</span>
                      <span>Status: {complaint.status || 'New'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = ({ user, onBack, onLogout }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

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

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button onClick={() => {
          sessionStorage.setItem('currentView', 'dashboard');
          onBack();
        }} className="back-btn">← Back</button>
        <h1>Profile</h1>
        <button onClick={onLogout} className="logout-btn">Logout</button>
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

export default Dashboard;