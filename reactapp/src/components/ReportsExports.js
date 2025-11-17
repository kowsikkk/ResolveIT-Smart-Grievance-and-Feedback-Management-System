import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import './ReportsExports.css';

const ReportsExports = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [exportFormat, setExportFormat] = useState('CSV');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const categories = [
    'Water', 'Roads', 'Electricity', 'Sanitation', 'Traffic', 'Noise', 'Other'
  ];

  useEffect(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSelectAllCategories = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([...categories]);
    }
  };

  const handleGenerateReport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setMessage('Please select both start and end dates');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
      setMessage('Start date cannot be after end date');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        categories: selectedCategories.length > 0 ? selectedCategories.join(',') : '',
        format: exportFormat.toLowerCase()
      };

      const response = await api.get('/api/admin/reports/generate', {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const fileName = `complaints_report_${dateRange.startDate}_to_${dateRange.endDate}.${exportFormat.toLowerCase()}`;
      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage(`Report generated successfully and downloaded as ${fileName}`);
    } catch (error) {
      console.error('Error generating report:', error);
      setMessage('Error generating report. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <button onClick={() => navigate('/admin/dashboard')} className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <h1>Reports & Exports</h1>
      </div>

      {message && (
        <div className={`alert-message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="reports-content">
        <div className="report-card">
          <h2>Report Parameters</h2>
          
          <div className="form-section">
            <h3>Date Range</h3>
            <div className="date-inputs">
              <div className="input-group">
                <label htmlFor="startDate">From</label>
                <input
                  type="date"
                  id="startDate"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({...prev, startDate: e.target.value}))}
                  className="date-input"
                />
              </div>
              <div className="input-group">
                <label htmlFor="endDate">To</label>
                <input
                  type="date"
                  id="endDate"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({...prev, endDate: e.target.value}))}
                  className="date-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Complaint Categories</h3>
              <button 
                onClick={handleSelectAllCategories}
                className="select-all-btn"
              >
                {selectedCategories.length === categories.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="categories-grid">
              {categories.map(category => (
                <label key={category} className="category-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  <span className="checkmark"></span>
                  {category}
                </label>
              ))}
            </div>
            <p className="form-help">
              {selectedCategories.length === 0 
                ? 'All categories will be included' 
                : `${selectedCategories.length} categories selected`}
            </p>
          </div>

          <div className="form-section">
            <h3>Export Options</h3>
            <div className="export-options">
              <label className="export-option">
                <input
                  type="radio"
                  name="exportFormat"
                  value="CSV"
                  checked={exportFormat === 'CSV'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <div className="option-content">
                  <div className="option-icon">📊</div>
                  <div className="option-text">
                    <strong>CSV</strong>
                    <span>Comma-separated values for spreadsheet analysis</span>
                  </div>
                </div>
              </label>
              <label className="export-option">
                <input
                  type="radio"
                  name="exportFormat"
                  value="PDF"
                  checked={exportFormat === 'PDF'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                <div className="option-content">
                  <div className="option-icon">📄</div>
                  <div className="option-text">
                    <strong>PDF</strong>
                    <span>Formatted document for reports and presentations</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="generate-section">
            <button 
              onClick={handleGenerateReport}
              disabled={loading}
              className="generate-report-btn"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Generating Report...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Generate Report
                </>
              )}
            </button>
            <p className="generate-help">
              Report will be automatically downloaded to your device
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsExports;