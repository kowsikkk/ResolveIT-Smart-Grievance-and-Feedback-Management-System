import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ComplaintForm from './components/ComplaintForm';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [currentView, setCurrentView] = useState(localStorage.getItem('userId') && localStorage.getItem('token') ? 'dashboard' : 'login');
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (id) => {
    setUserId(id);
    localStorage.setItem('userId', id);
    setCurrentView('dashboard');
  };

  const handleRegister = (id) => {
    setUserId(id);
    localStorage.setItem('userId', id);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentView('login');
    setUserId(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
  };

  const handleCreateComplaint = () => {
    setCurrentView('complaint');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const switchToRegister = () => {
    setShowRegister(true);
  };

  const switchToLogin = () => {
    setShowRegister(false);
  };

  return (
    <div className="App">
      {currentView === 'dashboard' ? (
        <Dashboard userId={userId} onLogout={handleLogout} onCreateComplaint={handleCreateComplaint} />
      ) : currentView === 'complaint' ? (
        <ComplaintForm userId={userId} onBack={handleBackToDashboard} />
      ) : showRegister ? (
        <Register onRegister={handleRegister} onSwitchToLogin={switchToLogin} />
      ) : (
        <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} />
      )}
    </div>
  );
}

export default App;