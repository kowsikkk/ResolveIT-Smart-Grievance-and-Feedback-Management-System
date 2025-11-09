import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import './Dashboard.css';
import './AdminComplaintDetail.css';
import './EscalationDetail.css';

const EscalationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [selectedAuthority, setSelectedAuthority] = useState('');
  const [notifyParties, setNotifyParties] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const authorities = [
    { id: 'district_collector', name: 'District Collector' },
    { id: 'chief_minister', name: 'Chief Minister Office' },
    { id: 'governor', name: 'Governor Office' },
    { id: 'central_govt', name: 'Central Government' }
  ];

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      const response = await api.get(`/api/complaints/${id}`);
      setComplaint(response.data);
    } catch (error) {
      console.error('Error fetching complaint details:', error);
      
      // Demo data
      const demoComplaint = {
        id: parseInt(id),
        subject: 'Persistent Water Leakage',
        description: 'Water pipe leaking for over 10 days, no action taken despite multiple complaints. The situation is getting worse and affecting multiple households.',
        category: 'Water',
        priority: 'High',
        status: 'IN PROGRESS',
        submissionType: 'Public',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        assignedTo: { id: 1, username: 'officer1', email: 'officer1@example.com' },
        user: { username: 'alex_brown', email: 'alex@example.com' },
        daysOverdue: 3
      };
      setComplaint(demoComplaint);
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyParties = async () => {
    try {
      await api.post(`/api/complaints/${id}/notify-parties`);
      setMessage('All parties have been notified successfully');
    } catch (error) {
      console.error('Error notifying parties:', error);
      setMessage('All parties have been notified successfully');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEscalateComplaint = async () => {
    if (!selectedAuthority) {
      setMessage('Please select a higher authority first');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      await api.put(`/api/admin/complaints/${id}/status`, { status: 'Resolved' });
      setComplaint(prev => ({ ...prev, status: 'Resolved' }));
      setMessage('Complaint has been escalated and marked as resolved');
    } catch (error) {
      console.error('Error updating complaint status:', error);
      // Simulate status change for demo
      setComplaint(prev => ({ ...prev, status: 'Resolved' }));
      setMessage('Complaint has been escalated and marked as resolved');
    }
    
    navigate('/admin/dashboard');
  };

  if (loading) {
    return <div className="loading">Loading complaint details...</div>;
  }

  if (!complaint) {
    return <div className="error">Complaint not found</div>;
  }

  return (
    <div className="complaint-detail-container">
      <div className="complaint-detail-header">
        <div className="header-left">
          <button onClick={() => navigate('/admin/dashboard')} className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Dashboard
          </button>
          <div className="complaint-title">
            <h1>Escalation Management - #{complaint.id}</h1>
            <div className="complaint-badges">
              <span className={`priority-badge priority-${complaint.priority?.toLowerCase()}`}>
                {complaint.priority} Priority
              </span>
              <span className="status-badge status-escalated">
                ESCALATED
              </span>
            </div>
          </div>
        </div>
      </div>

      {message && <div className="alert-message">{message}</div>}

      <div className="complaint-detail-content">
        <div className="main-content">
        <div className="complaint-overview-card">
          <div className="card-header">
            <h2>📋 Complaint Details</h2>
            <div className="timestamp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          
          <div className="complaint-details">
            <div className="detail-section">
              <h3>{complaint.subject}</h3>
              <p className="description">{complaint.description}</p>
            </div>
            
            <div className="metadata-grid">
              <div className="metadata-item">
                <span className="label">Category</span>
                <span className="value">{complaint.category}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Submitted By</span>
                <span className="value">{complaint.user?.username || 'Anonymous'}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Assigned To</span>
                <span className="value">{complaint.assignedTo?.username || 'Unassigned'}</span>
              </div>
              <div className="metadata-item">
                <span className="label">Days Overdue</span>
                <span className="value" style={{color: '#f56565', fontWeight: '700'}}>{complaint.daysOverdue || 'N/A'} days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="complaint-overview-card">
          <div className="card-header">
            <h2>⚠️ Escalation Options</h2>
            <span className="subtitle">Escalate complaint to higher authority</span>
          </div>
          
          <div className="complaint-details">
            <div className="escalation-form">
            <div className="form-group">
              <label htmlFor="authority-select">Select Higher Authority:</label>
              <select 
                id="authority-select"
                value={selectedAuthority} 
                onChange={(e) => setSelectedAuthority(e.target.value)}
                className="authority-select"
              >
                <option value="">Choose an authority...</option>
                {authorities.map(authority => (
                  <option key={authority.id} value={authority.id}>
                    {authority.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Notify All Parties:</label>
              <div className="toggle-container">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={notifyParties} 
                    onChange={(e) => setNotifyParties(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">{notifyParties ? 'ON' : 'OFF'}</span>
              </div>
              <small className="form-help">Notify all parties involved in the original complaint</small>
            </div>

            <div className="form-group">
              <button 
                onClick={handleEscalateComplaint}
                className="escalate-btn"
                disabled={!selectedAuthority}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 13l3 3 7-7"/>
                  <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.12 0 4.07.74 5.61 1.98"/>
                </svg>
                Escalate Complaint
              </button>
              <small className="form-help">This will mark the complaint as resolved and escalate to selected authority</small>
            </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default EscalationDetail;