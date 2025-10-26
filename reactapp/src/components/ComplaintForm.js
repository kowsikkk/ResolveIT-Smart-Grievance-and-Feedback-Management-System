import React, { useState } from 'react';
import api from '../utils/axiosConfig';
import './ComplaintForm.css';

const ComplaintForm = ({ userId, onBack }) => {
  const [submissionType, setSubmissionType] = useState('Public');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [success, setSuccess] = useState('');
  const [files, setFiles] = useState([]);

  const handleFileUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('subject', title);
      formData.append('description', description);
      formData.append('submissionType', submissionType);
      formData.append('category', category);
      formData.append('priority', priority);
      
      if (submissionType === 'Public' && userId) {
        formData.append('userId', userId);
      }
      
      files.forEach(file => {
        formData.append('files', file);
      });
      
      await api.post('/api/complaints/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess('Complaint submitted successfully!');
      setTitle('');
      setDescription('');
      setCategory('');
      setPriority('');
      setFiles([]);
      setTimeout(() => {
        setSuccess('');
        onBack();
      }, 2000);
    } catch (error) {
      console.error('Error submitting complaint:', error);
    }
  };

  return (
    <div className="complaint-container">
      <div className="complaint-form">
        <div className="header">
          <button className="back-btn" onClick={onBack}>←</button>
          <h2>Submit Complaint</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Create complaint with:</h3>
            
            <div className="field-group">
              <input
                type="text"
                placeholder="Enter complaint title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Describe your complaint in detail"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                required
              />
            </div>

            <div className="field-group">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select category (Sanitation, Traffic, Water, etc.)</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Traffic">Traffic</option>
                <option value="Water">Water</option>
                <option value="Electricity">Electricity</option>
                <option value="Roads">Roads</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="field-group">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                required
              >
                <option value="">Select priority level (Low, Medium, High)</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="field-group">
              <div className="upload-area" onClick={() => document.getElementById('file-input').click()}>
                <span>Click to upload files or images</span>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="file-input"
                />
              </div>
              {files.length > 0 && (
                <div className="uploaded-files">
                  {files.map((file, index) => (
                    <div key={index} className="file-item">
                      <span>{file.name}</span>
                      <button type="button" onClick={() => removeFile(index)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="field-group">
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="Public"
                    checked={submissionType === 'Public'}
                    onChange={(e) => setSubmissionType(e.target.value)}
                  />
                  <span>Public</span>
                </label>
                <label>
                  <input
                    type="radio"
                    value="Anonymous"
                    checked={submissionType === 'Anonymous'}
                    onChange={(e) => setSubmissionType(e.target.value)}
                  />
                  <span>Anonymous</span>
                </label>
              </div>
            </div>
          </div>

          {success && <div className="success">{success}</div>}
          <button type="submit" className="submit-btn">Submit Complaint</button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;