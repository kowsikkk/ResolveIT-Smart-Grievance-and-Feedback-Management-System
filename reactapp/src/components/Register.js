import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', {
        username,
        password,
        email,
        role
      });
      
      if (response.data.userId) {
        onRegister(response.data.userId);
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
          
          <button type="submit" className="register-btn">Register</button>
          
          <div className="switch-form">
            Already have an account? 
            <button type="button" onClick={onSwitchToLogin} className="link-btn">
              Login here
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default Register;