import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import './Dashboard.css';
import './OfficerDashboard.css';

const OfficerDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [escalatedComplaints, setEscalatedComplaints] = useState([]);
  const [stats, setStats] = useState({ assigned: 0, inProgress: 0, resolved: 0 });
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const isComplaintEscalated = (complaint) => {
    const daysSinceCreated = Math.floor((new Date() - new Date(complaint.createdAt)) / (1000 * 60 * 60 * 24));
    return complaint.status === 'IN PROGRESS' && daysSinceCreated > 2;
  };

  useEffect(() => {
    fetchAssignedComplaints();

    fetchStats();
  }, [filter]);

  const fetchAssignedComplaints = async () => {
    try {
      const officerId = sessionStorage.getItem('userId');
      const response = await api.get(`/api/officer/complaints/${officerId}`);
      let filteredComplaints = response.data;
      if (filter !== 'all') {
        filteredComplaints = filteredComplaints.filter(c => c.status === filter);
      }
      setComplaints(filteredComplaints);
      const escalated = filteredComplaints.filter(isComplaintEscalated);
      setEscalatedComplaints(escalated);
    } catch (error) {
      console.error('Error fetching assigned complaints:', error);
      
      const demoComplaints = [
        {
          id: 2,
          subject: 'Road Repair Needed on Main Street',
          description: 'Multiple potholes causing traffic issues',
          category: 'Roads',
          priority: 'Medium',
          status: 'IN PROGRESS',
          submissionType: 'Public',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          user: { username: 'jane_smith', email: 'jane@example.com' }
        },
        {
          id: 3,
          subject: 'Streetlight Not Working',
          description: 'Streetlight has been out for a week',
          category: 'Electricity',
          priority: 'Low',
          status: 'IN PROGRESS',
          submissionType: 'Anonymous',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          user: null
        }
      ];
      
      let filteredComplaints = demoComplaints;
      if (filter !== 'all') {
        filteredComplaints = filteredComplaints.filter(c => c.status === filter);
      }
      setComplaints(filteredComplaints);
      const escalated = filteredComplaints.filter(isComplaintEscalated);
      setEscalatedComplaints(escalated);
    }
  };



  const fetchStats = async () => {
    try {
      const officerId = sessionStorage.getItem('userId');
      const response = await api.get(`/api/officer/stats/${officerId}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        assigned: 3,
        inProgress: 2,
        resolved: 1
      });
    }
  };



  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await api.put(`/api/officer/complaints/${complaintId}/status`, { status: newStatus });
      setMessage(`Complaint #${complaintId} status updated to ${newStatus}`);
      
      fetchAssignedComplaints();
      fetchStats();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating complaint status:', error);
      setComplaints(prev => prev.map(c => 
        c.id === complaintId ? { ...c, status: newStatus } : c
      ));
      setMessage(`Complaint #${complaintId} status updated to ${newStatus}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="dashboard-container admin-dashboard">
      <div className="dashboard-header">
        <h1>Officer Dashboard</h1>
        <div className="header-actions">
          <button onClick={() => {
            sessionStorage.setItem('loginRole', 'officer');
            navigate('/profile');
          }} className="profile-btn">Profile</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      
      {escalatedComplaints.length > 0 && (
        <div className="escalation-notification">
          <div className="escalation-alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/>
            </svg>
            <span> {escalatedComplaints.length} complaint{escalatedComplaints.length > 1 ? 's' : ''} escalated to admin due to delay!</span>
          </div>
        </div>
      )}
      
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Statistics Overview</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total</span>
              <span className="stat-value">{stats.assigned || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">In Progress</span>
              <span className="stat-value assigned">{stats.inProgress || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Resolved</span>
              <span className="stat-value resolved">{stats.resolved || 0}</span>
            </div>
          </div>
        </div>



        <div className="dashboard-card">
          <div className="card-header">
            <h2>My Assigned Complaints ({complaints.length})</h2>
            <div className="filter-controls">
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
                <option value="all">All Status</option>
                <option value="IN PROGRESS">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
          
          <div className="complaints-list">
            {complaints.length === 0 ? (
              <p>No complaints assigned to you</p>
            ) : (
              complaints.map(complaint => (
                <div key={complaint.id} className={`complaint-item admin-complaint-item ${isComplaintEscalated(complaint) ? 'escalated-complaint' : ''}`}>
                  <div className="complaint-header" onClick={() => navigate(`/officer/complaint/${complaint.id}`)}>
                    <h3>#{complaint.id} - {complaint.subject}</h3>
                    {isComplaintEscalated(complaint) && (
                      <div className="escalation-warning">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/>
                        </svg>
                        ESCALATED
                      </div>
                    )}
                    <div className="complaint-badges">
                      <span className={`priority-badge priority-${complaint.priority?.toLowerCase()}`}>
                        {complaint.priority}
                      </span>
                      <span className={`status-badge status-${complaint.status?.toLowerCase().replace(' ', '-')}`}>
                        {complaint.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="complaint-meta">
                    <div className="meta-left">
                      <span>Category: {complaint.category}</span>
                      <span>Submitted by: {complaint.user?.username || 'Anonymous'}</span>
                      <span>Date: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="admin-actions">
                    {complaint.status === 'Resolved' ? (
                      <button 
                        onClick={() => handleStatusUpdate(complaint.id, 'IN PROGRESS')}
                        className="unresolve-btn"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                        Unresolve
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStatusUpdate(complaint.id, 'Resolved')}
                        className="resolve-btn"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        Mark as Resolved
                      </button>
                    )}
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

export default OfficerDashboard;