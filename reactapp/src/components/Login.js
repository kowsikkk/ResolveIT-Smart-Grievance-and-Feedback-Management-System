import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axiosConfig';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      const response = await api.post('/api/auth/login', {
        username,
        password,
        role
      });
      
      if (response.data.userId && response.data.token) {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('userId', response.data.userId);
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('loginRole', role);
        
  
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Invalid username, password, or role.');
      } else if (error.response?.status === 404) {
        setError('User not found. Please check your credentials.');
      } else {
        setError('Login failed. Please try again.');
      }
      setTimeout(() => setError(''), 4000);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-form">
        <h2>Complaint Portal</h2>
        <h3>Welcome Back</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
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
          
          <div className="forgot-password">
            <a href="#forgot">Forgot Password?</a>
          </div>
          
          <button type="submit" className="login-btn">Login</button>
          
          <div className="switch-form">
            Don't have an account? 
            <Link to="/register" className="link-btn">
              Register here
            </Link>
          </div>
          
          <div className="anonymous-option">
            <p>Or submit a complaint without login:</p>
            <button type="button" onClick={() => navigate('/complaint', { state: { from: '/login' } })} className="anonymous-btn">
              Submit Anonymous Complaint
            </button>
          </div>
        </form>
        </div>
      </div>
      <div className="login-right">
        <div className="login-welcome">
          <h1>Welcome</h1>
          <p>Access your complaint portal to submit and track your grievances securely</p>
        </div>
      </div>
    </div>
  );
};

export default Login;