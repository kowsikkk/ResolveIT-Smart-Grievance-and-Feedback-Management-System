import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('userId');

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
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
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
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="header-actions">
          <button onClick={() => {
            sessionStorage.setItem('loginRole', 'user');
            navigate('/profile');
          }} className="profile-btn">Profile</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <button onClick={() => navigate('/complaint')} className="create-complaint-btn">
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
                <div key={complaint.id} className="complaint-item" onClick={() => navigate(`/complaint-status/${complaint.id}`)}>
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



export default Dashboard;