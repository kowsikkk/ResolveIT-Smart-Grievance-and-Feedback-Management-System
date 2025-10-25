import React, { useState } from 'react';
import api from '../utils/axiosConfig';
import './ComplaintForm.css';

const ComplaintForm = ({ userId, onBack }) => {
  const [submissionType, setSubmissionType] = useState('Public');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
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
      formData.append('subject', subject);
      formData.append('description', description);
      formData.append('submissionType', submissionType);
      
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
      setSubject('');
      setDescription('');
      setFiles([]);
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
          <div className="submission-type">
            <h3>Submission Type</h3>
            <div className="radio-group">
              <label className={submissionType === 'Public' ? 'active' : ''}>
                <input
                  type="radio"
                  value="Public"
                  checked={submissionType === 'Public'}
                  onChange={(e) => setSubmissionType(e.target.value)}
                />
                Public
              </label>
              <label className={submissionType === 'Anonymous' ? 'active' : ''}>
                <input
                  type="radio"
                  value="Anonymous"
                  checked={submissionType === 'Anonymous'}
                  onChange={(e) => setSubmissionType(e.target.value)}
                />
                Anonymous
              </label>
            </div>
          </div>

          <div className="complaint-details">
            <h3>Complaint Details</h3>
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="6"
              required
            />
          </div>

          <div className="attachments">
            <h3>Attachments (Optional)</h3>
            <div className="upload-area" onClick={() => document.getElementById('file-input').click()}>
              <div className="upload-icon">📎</div>
              <p>Add Media</p>
              <p className="upload-text">Attach images or videos to support your complaint.</p>
              <button type="button" className="upload-btn">Upload</button>
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
                    <span className="file-name">{file.name}</span>
                    <button
                      type="button"
                      className="remove-file"
                      onClick={() => removeFile(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {success && <div className="success">{success}</div>}

          <button type="submit" className="submit-btn">Submit Complaint</button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;