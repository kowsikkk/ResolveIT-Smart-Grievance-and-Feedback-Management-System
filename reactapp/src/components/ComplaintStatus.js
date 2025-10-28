import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import './ComplaintStatus.css';

const ComplaintStatus = ({ complaintId, onBack }) => {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaintDetails();
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      const response = await api.get(`/api/complaints/${complaintId}`);
      setComplaint(response.data);
    } catch (error) {
      console.error('Error fetching complaint details:', error);
      // Enhanced fallback data for demo
      setComplaint({
        id: complaintId,
        title: 'Water Supply Disruption in Sector 15',
        description: 'There has been no water supply in our area for the past 3 days. Multiple households are affected and we need immediate attention to resolve this issue.',
        category: 'Water',
        priority: 'High',
        status: 'Under Review',
        files: ['water_issue_photo.jpg', 'location_map.pdf'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updates: [
          {
            status: 'NEW',
            title: 'Complaint submitted by user.',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            color: '#2196F3'
          },
          {
            status: 'UNDER REVIEW',
            title: 'Assigned to the city maintenance team for inspection.',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            color: '#FF9800'
          },
          {
            status: 'RESOLVED',
            title: 'Issue fixed by the electrical department.',
            timestamp: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            color: '#4CAF50'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }) + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  if (loading) {
    return <div className="loading">Loading complaint details...</div>;
  }

  if (!complaint) {
    return <div className="error">Complaint not found</div>;
  }

  return (
    <div className="complaint-status-container">
      <div className="status-header">
        <button onClick={onBack} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>Complaint Status</h1>
      </div>

      <div className="status-content">
        <div className="complaint-form-section">
          <h3>Complaint Details</h3>
          
          <div className="form-field">
            <label>Complaint Title</label>
            <input type="text" value={complaint.title || complaint.subject} readOnly />
          </div>

          <div className="form-field">
            <label>Description</label>
            <textarea value={complaint.description} readOnly rows="4" />
          </div>

          <div className="form-field">
            <label>Category</label>
            <select value={complaint.category || ''} disabled>
              <option>{complaint.category || 'Not specified'}</option>
            </select>
          </div>

          <div className="form-field">
            <label>Priority Level</label>
            <select value={complaint.priority || ''} disabled>
              <option>{complaint.priority || 'Not specified'}</option>
            </select>
          </div>

          {complaint.files && complaint.files.length > 0 && (
            <div className="form-field">
              <label>Attached Files</label>
              <div className="file-list">
                {complaint.files.map((file, index) => (
                  <div key={index} className="file-item">
                    <span>📎 {file}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-field">
            <label>Submitted On</label>
            <input type="text" value={formatDate(complaint.createdAt)} readOnly />
          </div>
        </div>

        <div className="timeline-section">
          <div className="timeline-header">
            <span className="timeline-icon">📋</span>
            <h3>Complaint Timeline</h3>
          </div>
          
          <div className="timeline-container">
            <div className="timeline-step">
              <div className="timeline-marker" style={{backgroundColor: '#2196F3'}}>
                ✓
              </div>
              <div className="timeline-content">
                <div className="timeline-status" style={{color: '#2196F3'}}>
                  NEW
                </div>
                <div className="timeline-title">Complaint submitted by user.</div>
                <div className="timeline-date">
                  26 Oct 2025, 10:26 AM
                </div>
              </div>
            </div>
            
            <div className="timeline-step">
              <div className="timeline-marker" style={{backgroundColor: '#FF9800'}}>
                ⏳
              </div>
              <div className="timeline-content">
                <div className="timeline-status" style={{color: '#FF9800'}}>
                  UNDER REVIEW
                </div>
                <div className="timeline-title">Assigned to the city maintenance team for inspection.</div>
                <div className="timeline-date">
                  27 Oct 2025, 02:45 PM
                </div>
              </div>
            </div>
            
            <div className="timeline-step">
              <div className="timeline-marker" style={{backgroundColor: '#4CAF50'}}>
                ✓
              </div>
              <div className="timeline-content">
                <div className="timeline-status" style={{color: '#4CAF50'}}>
                  RESOLVED
                </div>
                <div className="timeline-title">Issue fixed by the electrical department.</div>
                <div className="timeline-date">
                  28 Oct 2025, 11:05 AM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintStatus;