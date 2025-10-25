import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import './Dashboard.css';

const Dashboard = ({ userId, onLogout, onCreateComplaint }) => {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchComplaints();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchComplaints = async () => {
    try {
      const response = await api.get(`/api/complaints/user/${userId}`);
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
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
          <button onClick={() => setShowProfile(true)} className="profile-btn">Profile</button>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>

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
                  <p>{complaint.description.substring(0, 100)}...</p>
                  <div className="complaint-meta">
                    <span>Type: {complaint.submissionType}</span>
                    <span>Date: {new Date(complaint.createdAt).toLocaleDateString()}</span>
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

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/users/reset-password', {
        currentPassword,
        newPassword
      });
      setMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      setMessage('Error updating password');
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button onClick={onBack} className="back-btn">← Back</button>
        <h1>Profile</h1>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <h2>User Information</h2>
          <div className="user-info">
            <p><strong>Username:</strong> {user?.username}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
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
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;