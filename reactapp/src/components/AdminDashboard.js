import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import './Dashboard.css';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, inProgress: 0, resolved: 0 });
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
    fetchOfficers();
    fetchStats();
  }, [filter]);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/api/admin/complaints');
      if (filter === 'all') {
        setComplaints(response.data);
      } else {
        setComplaints(response.data.filter(c => c.status === filter));
      }
    } catch (error) {
      console.error('Error fetching complaints from database:', error);
      
      const demoComplaints = [
        {
          id: 1,
          subject: 'Water Supply Issue',
          description: 'No water supply for 3 days in our area',
          category: 'Water',
          priority: 'High',
          status: 'New',
          submissionType: 'Public',
          createdAt: new Date().toISOString(),
          assignedTo: null,
          user: { username: 'john_doe', email: 'john@example.com' }
        },
        {
          id: 2,
          subject: 'Road Repair Needed on Main Street',
          description: 'Multiple potholes causing traffic issues',
          category: 'Roads',
          priority: 'Medium',
          status: 'IN PROGRESS',
          submissionType: 'Public',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: { id: 1, username: 'officer1' },
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
          assignedTo: { id: 2, username: 'officer2' },
          user: null
        },
        {
          id: 4,
          subject: 'Garbage Collection Issue',
          description: 'Garbage not collected for 5 days',
          category: 'Sanitation',
          priority: 'High',
          status: 'Resolved',
          submissionType: 'Public',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: { id: 1, username: 'officer1' },
          user: { username: 'mike_wilson', email: 'mike@example.com' }
        },
        {
          id: 5,
          subject: 'Traffic Signal Malfunction',
          description: 'Traffic light stuck on red for 2 hours',
          category: 'Traffic',
          priority: 'High',
          status: 'New',
          submissionType: 'Public',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          assignedTo: null,
          user: { username: 'sarah_jones', email: 'sarah@example.com' }
        }
      ];
      
      if (filter === 'all') {
        setComplaints(demoComplaints);
      } else {
        setComplaints(demoComplaints.filter(c => c.status === filter));
      }
    }
  };

  const fetchOfficers = async () => {
    try {
      const response = await api.get('/api/admin/officers');
      setOfficers(response.data);
    } catch (error) {
      console.error('Error fetching officers from database:', error);
      setOfficers([
        { id: 1, username: 'officer1', email: 'officer1@example.com' },
        { id: 2, username: 'officer2', email: 'officer2@example.com' },
        { id: 3, username: 'officer3', email: 'officer3@example.com' }
      ]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/admin/complaints/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats from database:', error);
      setStats({
        total: 5,
        new: 2,
        inProgress: 1,
        resolved: 1
      });
    }
  };

  const handleAssignComplaint = async (complaintId, officerId) => {
    try {
      await api.put(`/api/admin/complaints/${complaintId}/assign`, { officerId });
      const officer = officers.find(o => o.id == officerId);
      setMessage(`Complaint #${complaintId} assigned to ${officer?.username || 'Officer'}`);
      
      fetchComplaints();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error assigning complaint:', error);
      setMessage('Error assigning complaint. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await api.put(`/api/admin/complaints/${complaintId}/status`, { status: newStatus });
      setMessage(`Complaint #${complaintId} status updated to ${newStatus}`);
      
      fetchComplaints();
      fetchStats();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating complaint status:', error);
      setMessage('Error updating status. Please try again.');
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
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/profile')} className="profile-btn">Profile</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Statistics Overview</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total</span>
              <span className="stat-value">{stats.total || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">New</span>
              <span className="stat-value new">{stats.new || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">IN PROGRESS</span>
              <span className="stat-value assigned">{stats.inProgress || stats.assigned || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Resolved</span>
              <span className="stat-value resolved">{stats.resolved || 0}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>All Complaints ({complaints.length})</h2>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
              <option value="all">All Status</option>
              <option value="NEW">NEW</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          
          <div className="complaints-list">
            {complaints.length === 0 ? (
              <p>No complaints found</p>
            ) : (
              complaints.map(complaint => (
                <div key={complaint.id} className="complaint-item admin-complaint-item">
                  <div className="complaint-header" onClick={() => navigate(`/admin/complaint/${complaint.id}`)}>
                    <h3>#{complaint.id} - {complaint.subject}</h3>
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
                    <div className="meta-right">
                      <span>Assigned to: {complaint.assignedTo?.username || 'Unassigned'}</span>
                    </div>
                  </div>
                  
                  <div className="admin-actions">
                    <select 
                      onChange={(e) => handleAssignComplaint(complaint.id, e.target.value)}
                      defaultValue=""
                      className="action-select"
                    >
                      <option value="">Assign Officer...</option>
                      {officers.map(officer => (
                        <option key={officer.id} value={officer.id}>
                          {officer.username}
                        </option>
                      ))}
                    </select>
                    <button 
                      onClick={() => handleStatusUpdate(complaint.id, 'Resolved')}
                      className="resolve-btn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      Mark as Resolved
                    </button>
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

export default AdminDashboard;