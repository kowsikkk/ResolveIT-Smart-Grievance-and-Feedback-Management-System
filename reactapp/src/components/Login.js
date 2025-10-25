import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username,
        password,
        role
      });
      
      if (response.data.userId) {
        onLogin(response.data.userId);
      }
    } catch (error) {
      setError('Invalid credentials');
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
          
          {error && <div className="error">{error}</div>}
          
          <div className="forgot-password">
            <a href="#forgot">Forgot Password?</a>
          </div>
          
          <button type="submit" className="login-btn">Login</button>
          
          <div className="switch-form">
            Don't have an account? 
            <button type="button" onClick={onSwitchToRegister} className="link-btn">
              Register here
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