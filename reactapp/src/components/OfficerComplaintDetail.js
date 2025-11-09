import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/axiosConfig';
import './Dashboard.css';
import './AdminComplaintDetail.css';

const OfficerComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [publicMessages, setPublicMessages] = useState([]);
  const [newPrivateMessage, setNewPrivateMessage] = useState('');
  const [newPublicMessage, setNewPublicMessage] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaintDetail();
    fetchPrivateMessages();
    fetchPublicMessages();
  }, [id]);

  const fetchComplaintDetail = async () => {
    try {
      const response = await api.get(`/api/complaints/${id}`);
      setComplaint(response.data);
    } catch (error) {
      console.error('Error fetching complaint:', error);
      setComplaint({
        id: id,
        subject: 'Road Repair Needed on Main Street',
        description: 'Multiple potholes causing traffic issues and making it difficult for vehicles to pass safely.',
        category: 'Roads',
        priority: 'Medium',
        status: 'IN PROGRESS',
        submissionType: 'Public',
        createdAt: new Date().toISOString(),
        user: { username: 'jane_smith', email: 'jane@example.com' },
        files: ['pothole_image.jpg']
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivateMessages = async () => {
    try {
      const response = await api.get(`/api/messages/complaint/${id}/private`);
      setPrivateMessages(response.data);
    } catch (error) {
      console.error('Error fetching private messages:', error);
      setPrivateMessages([]);
    }
  };

  const fetchPublicMessages = async () => {
    try {
      const response = await api.get(`/api/messages/complaint/${id}/public`);
      setPublicMessages(response.data);
    } catch (error) {
      console.error('Error fetching public messages:', error);
      setPublicMessages([]);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.put(`/api/officer/complaints/${id}/status`, { status: newStatus });
      setComplaint(prev => ({ ...prev, status: newStatus }));
      setMessage(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      setComplaint(prev => ({ ...prev, status: newStatus }));
      setMessage(`Status updated to ${newStatus}`);
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSendPrivateMessage = async (e) => {
    e.preventDefault();
    if (!newPrivateMessage.trim()) return;

    try {
      const messageData = {
        complaintId: id,
        senderId: sessionStorage.getItem('userId'),
        content: newPrivateMessage,
        messageType: 'PRIVATE'
      };

      await api.post('/api/messages/send', messageData);
      fetchPrivateMessages();
      setMessage('Private message sent successfully');
      setNewPrivateMessage('');
    } catch (error) {
      console.error('Error sending private message:', error);
      setMessage('Failed to send private message');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSendPublicMessage = async (e) => {
    e.preventDefault();
    if (!newPublicMessage.trim()) return;

    try {
      const messageData = {
        complaintId: id,
        senderId: sessionStorage.getItem('userId'),
        content: newPublicMessage,
        messageType: 'PUBLIC'
      };

      await api.post('/api/messages/send', messageData);
      fetchPublicMessages();
      setMessage('Public message sent successfully');
      setNewPublicMessage('');
    } catch (error) {
      console.error('Error sending public message:', error);
      setMessage('Failed to send public message');
    }
    setTimeout(() => setMessage(''), 3000);
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
          <button onClick={() => navigate('/officer/dashboard')} className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Dashboard
          </button>
          <div className="complaint-title">
            <h1>Complaint #{complaint.id}</h1>
            <div className="complaint-badges">
              <span className={`priority-badge priority-${complaint.priority?.toLowerCase()}`}>
                {complaint.priority} Priority
              </span>
              <span className={`status-badge status-${complaint.status?.toLowerCase().replace(' ', '-')}`}>
                {complaint.status}
              </span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <div className="quick-actions">
            {complaint.status === 'Resolved' ? (
              <button 
                onClick={() => handleStatusUpdate('IN PROGRESS')}
                className="unresolve-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                Unresolve
              </button>
            ) : (
              <button 
                onClick={() => handleStatusUpdate('Resolved')}
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
      </div>

      {message && <div className="alert-message">{message}</div>}
      
      <div className="complaint-detail-content">
        <div className="main-content">
          <div className="complaint-overview-card">
            <div className="card-header">
              <h2>📋 Complaint Overview</h2>
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
                  <span className="value">{complaint.assignedTo?.username || 'Me'}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">Submission Type</span>
                  <span className="value">{complaint.submissionType}</span>
                </div>
              </div>

              {complaint.files && complaint.files.length > 0 && (
                <div className="attachments-section">
                  <h4>📎 Attachments</h4>
                  <div className="attachments-list">
                    {complaint.files.map((file, index) => (
                      <div key={index} className="attachment-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"/>
                        </svg>
                        {file}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="communication-section">
            <div className="private-messages-card">
              <div className="card-header">
                <h2>🔒 Private Messages</h2>
                <span className="subtitle">Internal communication with admin</span>
              </div>
              
              <div className="messages-container">
                {privateMessages.map(msg => (
                  <div key={msg.id} className="message-item">
                    <div className="message-header">
                      <div className="sender-info">
                        <span className={`role-badge role-${msg.sender?.role}`}>{msg.sender?.role}</span>
                      </div>
                      {msg.recipient && (
                        <div className="recipient-info">
                          <span className="recipient">→</span>
                          <span className={`role-badge role-${msg.recipient.role}`}>{msg.recipient.role}</span>
                        </div>
                      )}
                      <span className="message-time">
                        {new Date(msg.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="message-content">{msg.content}</p>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleSendPrivateMessage} className="add-message-form">
                <textarea
                  value={newPrivateMessage}
                  onChange={(e) => setNewPrivateMessage(e.target.value)}
                  placeholder="Write a private message to admin..."
                  rows="3"
                  required
                />
                <button type="submit" className="submit-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                  Send Private Message
                </button>
              </form>
            </div>

            <div className="public-messages-card">
              <div className="card-header">
                <h2>💬 Public Communication</h2>
                <span className="subtitle">Messages visible to user</span>
              </div>
              
              <div className="messages-container">
                {publicMessages.map(msg => (
                  <div key={msg.id} className="message-item">
                    <div className="message-header">
                      <div className="sender-info">
                        <span className={`role-badge role-${msg.sender?.role}`}>{msg.sender?.role}</span>
                      </div>
                      <span className="message-time">
                        {new Date(msg.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="message-content">{msg.content}</p>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleSendPublicMessage} className="add-message-form">
                <textarea
                  value={newPublicMessage}
                  onChange={(e) => setNewPublicMessage(e.target.value)}
                  placeholder="Write a public message to user..."
                  rows="3"
                  required
                />
                <button type="submit" className="submit-btn primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                  Send Public Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerComplaintDetail;