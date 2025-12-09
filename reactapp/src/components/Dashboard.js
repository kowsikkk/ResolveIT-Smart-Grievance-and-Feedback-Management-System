import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [escalatedComplaints, setEscalatedComplaints] = useState([]);
  const [message, setMessage] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('userId');

  const isComplaintEscalated = (complaint) => {
    const daysSinceCreated = Math.floor((new Date() - new Date(complaint.createdAt)) / (1000 * 60 * 60 * 24));
    const escalationDays = complaint.escalationDays || 30;
    return complaint.status === 'IN PROGRESS' && daysSinceCreated > escalationDays;
  };

  useEffect(() => {
    fetchUserData();
    fetchComplaints();
    
    const successMsg = sessionStorage.getItem('successMessage');
    if (successMsg) {
      setMessage(successMsg);
      sessionStorage.removeItem('successMessage');
      setTimeout(() => setMessage(''), 3000);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      setUser(response.data);
      
      if (response.data.role === 'admin') {
        navigate('/admin/dashboard');
        return;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);

      const userData = { 
        username: sessionStorage.getItem('username') || 'Demo User', 
        email: 'demo@example.com', 
        role: 'user' 
      };
      setUser(userData);
      
      const loginRole = sessionStorage.getItem('loginRole');
      if (loginRole === 'admin') {
        navigate('/admin/dashboard');
        return;
      }
    }
  };

  const fetchComplaints = async () => {
    try {
      const response = await api.get(`/api/complaints/user/${userId}`);
      setComplaints(response.data);
      const escalated = response.data.filter(isComplaintEscalated);
      setEscalatedComplaints(escalated);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
      setEscalatedComplaints([]);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('loginRole');
    navigate('/login');
  };

  const getSortedComplaints = () => {
    let sorted = [...complaints];
    
    switch(sortBy) {
      case 'status':
        const statusOrder = { 'NEW': 1, 'IN PROGRESS': 2, 'Resolved': 3, 'WITHDRAWN': 4 };
        sorted.sort((a, b) => (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5));
        break;
      case 'priority':
        const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
        sorted.sort((a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4));
        break;
      case 'escalated':
        sorted.sort((a, b) => {
          const aEscalated = isComplaintEscalated(a) ? 1 : 0;
          const bEscalated = isComplaintEscalated(b) ? 1 : 0;
          return bEscalated - aEscalated;
        });
        break;
      default:
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    return sorted;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="header-actions">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
          <div className="profile-avatar" onClick={() => {
            sessionStorage.setItem('loginRole', 'user');
            navigate('/profile');
          }}>
            <span>{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
          </div>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      
      {escalatedComplaints.length > 0 && (
        <div className="escalation-notification">
          <div className="escalation-alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/>
            </svg>
            <span> {escalatedComplaints.length} of your complaint{escalatedComplaints.length > 1 ? 's have' : ' has'} been escalated to admin due to delay!</span>
          </div>
        </div>
      )}
      
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <button onClick={() => navigate('/complaint')} className="create-complaint-btn">
            Create New Complaint
          </button>
        </div>

        <div className="dashboard-card">
          <div className="card-header-with-sort">
            <h2>My Complaints ({complaints.length})</h2>
            <div className="sort-controls">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                <option value="date">Date (Newest)</option>
                <option value="status">Status</option>
                <option value="priority">Priority</option>
                <option value="escalated">Escalated First</option>
              </select>
            </div>
          </div>
          <div className="complaints-list">
            {complaints.length === 0 ? (
              <p>No complaints found</p>
            ) : (
              getSortedComplaints().map(complaint => (
                <div key={complaint.id} className={`complaint-item ${isComplaintEscalated(complaint) ? 'escalated-complaint' : ''}`} onClick={() => navigate(`/complaint-status/${complaint.id}`)}>
                  <div className="complaint-title-row">
                    <h3>{complaint.subject}</h3>
                    {isComplaintEscalated(complaint) && (
                      <div className="escalation-warning">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/>
                        </svg>
                        ESCALATED
                      </div>
                    )}
                  </div>
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

export default Dashboard;