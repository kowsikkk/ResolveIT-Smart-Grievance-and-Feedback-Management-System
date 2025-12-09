import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import './Dashboard.css';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total: 0, new: 0, inProgress: 0, resolved: 0 });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    fetchUserData();
    fetchUserStats();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      setUser(response.data);
      setEditedUsername(response.data.username);
      setEditedEmail(response.data.email);
    } catch (error) {
      console.error('Error fetching user data:', error);
      const userData = { 
        username: sessionStorage.getItem('username') || 'Demo User', 
        email: 'demo@example.com', 
        role: 'user' 
      };
      setUser(userData);
      setEditedUsername(userData.username);
      setEditedEmail(userData.email);
    }
  };

  const fetchUserStats = async () => {
    const role = sessionStorage.getItem('loginRole') || user?.role;
    
    try {
      let response;
      if (role === 'officer') {
        response = await api.get(`/api/officer/complaints/${userId}`);
      } else if (role === 'admin') {
        response = await api.get('/api/admin/complaints');
      } else {
        response = await api.get(`/api/complaints/user/${userId}`);
      }
      
      const complaints = response.data;
      
      if (role === 'officer') {
        setStats({
          total: complaints.length,
          inProgress: complaints.filter(c => c.status === 'IN PROGRESS').length,
          resolved: complaints.filter(c => c.status === 'Resolved').length
        });
      } else {
        setStats({
          total: complaints.length,
          new: complaints.filter(c => c.status === 'NEW').length,
          inProgress: complaints.filter(c => c.status === 'IN PROGRESS').length,
          resolved: complaints.filter(c => c.status === 'Resolved').length
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };



  const handleEditClick = () => {
    setEditedUsername(user.username);
    setEditedEmail(user.email);
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditedUsername(user.username);
    setEditedEmail(user.email);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/users/${userId}/profile`, {
        username: editedUsername,
        email: editedEmail
      });
      setUser(prev => ({ ...prev, username: editedUsername, email: editedEmail }));
      sessionStorage.setItem('username', editedUsername);
      setMessage('Profile updated successfully');
      setMessageType('success');
      setIsEditingProfile(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Error updating profile');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/users/reset-password', {
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
      setMessage(error.response?.data?.message || 'Error updating password');
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

  const getRoleBadgeClass = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin': return 'role-admin';
      case 'officer': return 'role-officer';
      default: return 'role-user';
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button onClick={() => navigate(getDashboardRoute())} className="back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <h1>My Profile</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {message && <div className={`alert-message ${messageType}`}>{message}</div>}

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-avatar-card">
            <div className="avatar-circle">
              <span>{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            <h2>{user?.username || 'User'}</h2>
            <span className={`role-badge ${getRoleBadgeClass(user?.role)}`}>
              {user?.role || 'User'}
            </span>
          </div>

          <div className="profile-stats-card">
            <h3>📊 My Statistics</h3>
            <div className="stats-list">
              <div className="stat-row">
                <span className="stat-label">Total Complaints</span>
                <span className="stat-value">{stats.total}</span>
              </div>
              {stats.new !== undefined && (
                <div className="stat-row">
                  <span className="stat-label">New</span>
                  <span className="stat-value new">{stats.new}</span>
                </div>
              )}
              <div className="stat-row">
                <span className="stat-label">In Progress</span>
                <span className="stat-value progress">{stats.inProgress}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Resolved</span>
                <span className="stat-value resolved">{stats.resolved}</span>
              </div>
            </div>
          </div>

          <div className="status-chart-card">
            <h3>📊 Status Distribution</h3>
            <div className="chart-container">
              <svg viewBox="0 0 200 200" className="donut-chart">
                <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="40"/>
                {stats.total > 0 && (
                  <>
                    {stats.new !== undefined && (
                      <circle 
                        cx="100" cy="100" r="80" 
                        fill="none" 
                        stroke="#4299e1" 
                        strokeWidth="40"
                        strokeDasharray={`${(stats.new / stats.total) * 502.65} 502.65`}
                        strokeDashoffset="0"
                        transform="rotate(-90 100 100)"
                      />
                    )}
                    <circle 
                      cx="100" cy="100" r="80" 
                      fill="none" 
                      stroke="#ed8936" 
                      strokeWidth="40"
                      strokeDasharray={`${(stats.inProgress / stats.total) * 502.65} 502.65`}
                      strokeDashoffset={stats.new !== undefined ? `-${(stats.new / stats.total) * 502.65}` : "0"}
                      transform="rotate(-90 100 100)"
                    />
                    <circle 
                      cx="100" cy="100" r="80" 
                      fill="none" 
                      stroke="#48bb78" 
                      strokeWidth="40"
                      strokeDasharray={`${(stats.resolved / stats.total) * 502.65} 502.65`}
                      strokeDashoffset={stats.new !== undefined ? `-${((stats.new + stats.inProgress) / stats.total) * 502.65}` : `-${(stats.inProgress / stats.total) * 502.65}`}
                      transform="rotate(-90 100 100)"
                    />
                  </>
                )}
                <text x="100" y="95" textAnchor="middle" className="chart-total-label">Total</text>
                <text x="100" y="115" textAnchor="middle" className="chart-total-value">{stats.total}</text>
              </svg>
              <div className="chart-legend">
                {stats.new !== undefined && (
                  <div className="legend-item">
                    <span className="legend-color" style={{background: '#4299e1'}}></span>
                    <span className="legend-label">New</span>
                    <span className="legend-value">{stats.new}</span>
                  </div>
                )}
                <div className="legend-item">
                  <span className="legend-color" style={{background: '#ed8936'}}></span>
                  <span className="legend-label">In Progress</span>
                  <span className="legend-value">{stats.inProgress}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{background: '#48bb78'}}></span>
                  <span className="legend-label">Resolved</span>
                  <span className="legend-value">{stats.resolved}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-main">
          <div className="profile-info-card">
            <div className="card-header-with-action">
              <h2>👤 Personal Information</h2>
              {!isEditingProfile && (
                <button onClick={handleEditClick} className="edit-profile-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>
            
            {!isEditingProfile ? (
              <div className="info-grid">
                <div className="info-item">
                  <label>Username</label>
                  <div className="info-value">{user?.username || 'Not available'}</div>
                </div>
                <div className="info-item">
                  <label>Email Address</label>
                  <div className="info-value">{user?.email || 'Not available'}</div>
                </div>
                <div className="info-item">
                  <label>Account Role</label>
                  <div className="info-value">
                    <span className={`role-badge ${getRoleBadgeClass(user?.role)}`}>
                      {user?.role || 'User'}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <label>Member Since</label>
                  <div className="info-value">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="edit-form">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={editedUsername}
                    onChange={(e) => setEditedUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role (Cannot be changed)</label>
                  <input
                    type="text"
                    value={user?.role || 'User'}
                    readOnly
                    disabled
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    Save Changes
                  </button>
                  <button type="button" onClick={handleCancelEdit} className="cancel-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="profile-security-card">
            <h2>🔒 Security Settings</h2>
            <form onSubmit={handlePasswordReset} className="security-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="update-password-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;