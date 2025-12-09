import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './EmailVerification.css';

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [decision, setDecision] = useState(null);
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const handleAccept = () => {
    setDecision('accepted');
    localStorage.setItem(`verified_${email}`, 'true');
    setTimeout(() => {
      window.close();
    }, 2000);
  };

  const handleDecline = () => {
    setDecision('declined');
    setTimeout(() => {
      navigate('/register');
    }, 2000);
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="verification-header">
          <div className="brand-logo">
            <div className="logo-circle">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="brand-text">
              <h1>ResolveIT</h1>
              <span>Email Verification</span>
            </div>
          </div>
        </div>
        
        <div className="verification-body">
          <div className="verification-content">
            <div className="email-info">
              <div className="email-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span>{email}</span>
              </div>
            </div>
            
            <div className="verification-message">
              <h2>Verify Your Email Address</h2>
              <p>To complete your registration and secure your account, please confirm that you own this email address.</p>
            </div>
            
            <div className="terms-section">
              <div className="terms-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>What happens when you verify:</span>
              </div>
              <div className="terms-list">
                <div className="term-item">
                  <span className="term-dot"></span>
                  <span>Receive important account notifications</span>
                </div>
                <div className="term-item">
                  <span className="term-dot"></span>
                  <span>Get updates on your complaint status</span>
                </div>
                <div className="term-item">
                  <span className="term-dot"></span>
                  <span>Enhanced account security</span>
                </div>
                <div className="term-item">
                  <span className="term-dot"></span>
                  <span>Your privacy is protected</span>
                </div>
              </div>
            </div>

            {decision === null && (
              <div className="action-buttons">
                <button onClick={handleAccept} className="verify-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Verify Email
                </button>
                <button onClick={handleDecline} className="cancel-btn">
                  Cancel
                </button>
              </div>
            )}

            {decision === 'accepted' && (
              <div className="result-message success">
                <div className="result-animation">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3>Email Verified Successfully!</h3>
                <p>Please return to the application to complete your registration.</p>
              </div>
            )}

            {decision === 'declined' && (
              <div className="result-message declined">
                <div className="result-animation">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 7 9.5 10.5 12 7 14.5 8.5 16 12 13.5 15.5 16 17 14.5 13.5 12 17 9.5 15.5 8z"/>
                  </svg>
                </div>
                <h3>Verification Cancelled</h3>
                <p>Redirecting back to registration...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;