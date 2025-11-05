import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/axiosConfig';
import './ComplaintStatus.css';

const ComplaintStatus = () => {
  const navigate = useNavigate();
  const { id: complaintId } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedComplaint, setEditedComplaint] = useState({});
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchComplaintDetails();
    fetchMessages();
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      const response = await api.get(`/api/complaints/${complaintId}`);
      setComplaint(response.data);
    } catch (error) {
      console.error('Error fetching complaint details:', error);

      setComplaint({
        id: complaintId,
        title: 'Water Supply Disruption in Sector 15',
        description: 'There has been no water supply in our area for the past 3 days. Multiple households are affected and we need immediate attention to resolve this issue.',
        category: 'Water',
        priority: 'High',
        status: 'IN PROGRESS',
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
            status: 'IN PROGRESS',
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

  const fetchMessages = async () => {
    try {
      const userId = sessionStorage.getItem('userId');
      const response = await api.get(`/api/messages/complaint/${complaintId}/user/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        complaintId: complaintId,
        senderId: sessionStorage.getItem('userId'),
        content: newMessage,
        messageType: 'PUBLIC'
      };

      await api.post('/api/messages/send', messageData);
      fetchMessages();
      setMessage('Message sent successfully');
      setNewMessage('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage('Failed to send message');
      setTimeout(() => setMessage(''), 3000);
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

  const getTimelineSteps = () => {
    const steps = [];
    const currentStatus = complaint?.status?.toUpperCase() || 'NEW';
    

    steps.push({
      status: 'NEW',
      title: 'Complaint submitted by user.',
      date: formatDate(complaint?.createdAt || new Date()),
      color: '#2196F3',
      icon: '✓'
    });
    

    if (['IN PROGRESS', 'RESOLVED', 'CLOSED'].includes(currentStatus)) {
      steps.push({
        status: 'IN PROGRESS',
        title: 'Assigned to officer and work in progress.',
        date: formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
        color: '#FF9800',
        icon: '🔧'
      });
    }
    

    if (['RESOLVED', 'CLOSED'].includes(currentStatus)) {
      steps.push({
        status: 'RESOLVED',
        title: 'Issue has been fixed successfully.',
        date: formatDate(new Date()),
        color: '#4CAF50',
        icon: '✓'
      });
    }
    

    if (currentStatus === 'WITHDRAWN') {
      steps.push({
        status: 'WITHDRAWN',
        title: 'Complaint withdrawn by user.',
        date: formatDate(new Date()),
        color: '#F44336',
        icon: '❌'
      });
    }
    
    return steps;
  };

  const handleEdit = () => {
    setEditedComplaint({
      title: complaint.title || complaint.subject,
      description: complaint.description,
      category: complaint.category,
      priority: complaint.priority
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/api/complaints/${complaintId}`, editedComplaint);
      setComplaint(prev => ({ ...prev, ...editedComplaint }));
      setMessage('Complaint updated successfully!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating complaint:', error);
      setMessage('Failed to update complaint. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedComplaint({});
  };

  const handleWithdraw = async () => {
    if (window.confirm('Are you sure you want to withdraw this complaint? This action cannot be undone.')) {
      try {
        await api.put(`/api/complaints/${complaintId}/withdraw`);
        setComplaint(prev => ({ ...prev, status: 'WITHDRAWN' }));
        setMessage('Complaint withdrawn successfully!');
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (error) {
        console.error('Error withdrawing complaint:', error);
        setMessage('Failed to withdraw complaint. Please try again.');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const canEdit = complaint?.status === 'NEW';
  const canWithdraw = complaint?.status !== 'RESOLVED' && complaint?.status !== 'WITHDRAWN' && complaint?.status !== 'CLOSED';

  if (loading) {
    return <div className="loading">Loading complaint details...</div>;
  }

  if (!complaint) {
    return <div className="error">Complaint not found</div>;
  }

  return (
    <div className="complaint-status-container">
      <div className="status-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>Complaint Status</h1>
      </div>

      <div className="status-content">
        <div className="complaint-form-section">
          <div className="section-header">
            <h3>📋 Complaint Details</h3>
            <div className="action-buttons">
              {!isEditing && canEdit && (
                <button onClick={handleEdit} className="edit-btn">
                  ✏️ Edit Details
                </button>
              )}
              {canWithdraw && (
                <button onClick={handleWithdraw} className="withdraw-btn">
                  🗑️ Withdraw Complaint
                </button>
              )}
            </div>
          </div>
          
          {message && <div className="message success">{message}</div>}
          
          <div className="complaint-details-grid">
            <div className="form-field">
              <label>Complaint Title</label>
              <input 
                type="text" 
                value={isEditing ? editedComplaint.title : (complaint.title || complaint.subject)} 
                onChange={(e) => setEditedComplaint(prev => ({ ...prev, title: e.target.value }))}
                readOnly={!isEditing}
              />
            </div>

            <div className="form-field">
              <label>Description</label>
              <textarea 
                value={isEditing ? editedComplaint.description : complaint.description} 
                onChange={(e) => setEditedComplaint(prev => ({ ...prev, description: e.target.value }))}
                readOnly={!isEditing} 
                rows="4" 
              />
            </div>

            <div className="form-field">
              <label>Category</label>
              <select 
                value={isEditing ? editedComplaint.category : (complaint.category || '')} 
                onChange={(e) => setEditedComplaint(prev => ({ ...prev, category: e.target.value }))}
                disabled={!isEditing}
              >
                <option value="Water">Water</option>
                <option value="Electricity">Electricity</option>
                <option value="Roads">Roads</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Traffic">Traffic</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-field">
              <label>Priority Level</label>
              <select 
                value={isEditing ? editedComplaint.priority : (complaint.priority || '')} 
                onChange={(e) => setEditedComplaint(prev => ({ ...prev, priority: e.target.value }))}
                disabled={!isEditing}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-field">
              <label>Submitted On</label>
              <input type="text" value={formatDate(complaint.createdAt)} readOnly />
            </div>

            <div className="form-field">
              <label>Current Status</label>
              <input 
                type="text" 
                value={complaint.status || 'NEW'} 
                readOnly 
                style={{
                  color: complaint.status === 'RESOLVED' ? '#4CAF50' : 
                         complaint.status === 'IN PROGRESS' ? '#FF9800' : 
                         complaint.status === 'WITHDRAWN' ? '#F44336' : '#2196F3',
                  fontWeight: 'bold'
                }}
              />
            </div>
          </div>

          {isEditing && (
            <div className="edit-actions">
              <button onClick={handleSaveEdit} className="save-btn">
                💾 Save Changes
              </button>
              <button onClick={handleCancelEdit} className="cancel-btn">
                ❌ Cancel
              </button>
            </div>
          )}

          {complaint.files && complaint.files.length > 0 && (
            <div className="form-field">
              <label>📎 Attached Files</label>
              <div className="file-list">
                {complaint.files.map((file, index) => (
                  <div key={index} className="file-item">
                    <span>📎 {file}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="progress-communication-wrapper">
          <div className="timeline-section">
            <div className="timeline-header">
              <h3>Progress Timeline</h3>
            </div>
            
            <div className="timeline-container">
              {getTimelineSteps().map((step, index) => (
                <div key={index} className="timeline-step">
                  <div className="timeline-marker" style={{backgroundColor: step.color}}>
                    {step.icon}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-status" style={{color: step.color}}>
                      {step.status}
                    </div>
                    <div className="timeline-title">{step.title}</div>
                    <div className="timeline-date">
                      {step.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="messages-section">
            <div className="messages-header">
              <span className="messages-icon">💬</span>
              <h3>Communication</h3>
            </div>
            
            <div className="messages-container">
              {messages.length === 0 ? (
                <p className="no-messages">No messages yet</p>
              ) : (
                messages.map(msg => (
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
                ))
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="send-message-form">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a message..."
                rows="3"
                required
              />
              <button type="submit" className="send-btn">
                📤 Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintStatus;