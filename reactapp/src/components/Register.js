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

  useEffect(() => {
    const message = sessionStorage.getItem('successMessage');
    if (message) {
      setSuccessMessage(message);
      sessionStorage.removeItem('successMessage');
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/register', {
        username,
        password,
        email,
        role
      });
      
      if (response.data.userId && response.data.token) {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('userId', response.data.userId);
        sessionStorage.setItem('username', username);
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
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
        <h2>Complaint Portal</h2>
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
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
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
          
          {error && <div className="error">{error}</div>}
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