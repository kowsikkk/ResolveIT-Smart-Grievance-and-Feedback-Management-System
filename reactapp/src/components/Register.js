import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axiosConfig';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showVerifyButton, setShowVerifyButton] = useState(false);

  useEffect(() => {
    const message = sessionStorage.getItem('successMessage');
    if (message) {
      setSuccessMessage(message);
      sessionStorage.removeItem('successMessage');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, []);

  useEffect(() => {
    const checkVerification = () => {
      if (email && localStorage.getItem(`verified_${email}`) === 'true' && !emailVerified) {
        setEmailVerified(true);
        setSuccessMessage('Email verified successfully! You can now register.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    };
    
    if (email) {
      checkVerification();
      const interval = setInterval(checkVerification, 1000);
      return () => clearInterval(interval);
    }
  }, [email, emailVerified]);

  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    setShowVerifyButton(emailValue.includes('@') && emailValue.includes('.'));
    setEmailVerified(false);
    setVerificationSent(false);
    localStorage.removeItem(`verified_${emailValue}`);
  };

  const handleVerifyEmail = async () => {
    try {
      await api.post('/api/auth/send-verification', { email });
      setVerificationSent(true);
      setSuccessMessage('Verification email sent! Please check your inbox.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError('Failed to send verification email.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailVerified) {
      setError('Please verify your email before registering.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    try {
      const response = await api.post('/api/auth/register', {
        username,
        password,
        email,
        role
      });
      
      if (response.data.userId && response.data.token) {
        localStorage.removeItem(`verified_${email}`);
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('userId', response.data.userId);
        sessionStorage.setItem('username', username);
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setError('Username or email already exists.');
        localStorage.removeItem(`verified_${email}`);
        setEmailVerified(false);
        setVerificationSent(false);
      } else if (error.response?.status === 400) {
        setError('Invalid data. Please check all fields.');
      } else {
        setError('Registration failed. Please try again.');
      }
      setTimeout(() => setError(''), 4000);
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <div className="register-welcome">
          <h1>Join Us</h1>
          <p>Create your account to submit and track your complaints efficiently</p>
        </div>
      </div>
      <div className="register-right">
        <div className="register-form">
        <h2>ResolveIT</h2>
        <h3>Create Account</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <div className="email-input-container">
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={handleEmailChange}
                required
                className={emailVerified ? 'verified' : ''}
              />
              {showVerifyButton && !emailVerified && (
                <button
                  type="button"
                  onClick={handleVerifyEmail}
                  className="verify-btn"
                  disabled={verificationSent}
                >
                  {verificationSent ? 'Sent' : 'Verify'}
                </button>
              )}
              {emailVerified && (
                <span className="verified-icon">✓</span>
              )}
            </div>
            {verificationSent && !emailVerified && (
              <p className="verification-note">Check your email and click the verification link</p>
            )}
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="officer">Officer</option>
            </select>
          </div>
          
          {error && <div className="erroris">{error}</div>}
          {successMessage && <div className="success">{successMessage}</div>}
          
          <button type="submit" className="register-btn">Register</button>
          
          <div className="switch-form">
            Already have an account? 
            <Link to="/login" className="link-btn">
              Login here
            </Link>
          </div>
          
          <div className="anonymous-option">
            <p>Or submit a complaint without registration:</p>
            <button type="button" onClick={() => navigate('/complaint', { state: { from: '/register' } })} className="anonymous-btn">
              Submit Anonymous Complaint
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default Register;