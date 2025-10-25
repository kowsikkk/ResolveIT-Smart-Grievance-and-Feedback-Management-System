import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ComplaintForm from './components/ComplaintForm';
import './App.css';

function App() {
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [showComplaintForm, setShowComplaintForm] = useState(localStorage.getItem('userId'));
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (id) => {
    setUserId(id);
    localStorage.setItem('userId', id);
    setShowComplaintForm(true);
  };

  const handleRegister = (id) => {
    setUserId(id);
    localStorage.setItem('userId', id);
    setShowComplaintForm(true);
  };

  const handleBack = () => {
    setShowComplaintForm(false);
    setUserId(null);
    localStorage.removeItem('userId');
  };

  const switchToRegister = () => {
    setShowRegister(true);
  };

  const switchToLogin = () => {
    setShowRegister(false);
  };

  return (
    <div className="App">
      {showComplaintForm ? (
        <ComplaintForm userId={userId} onBack={handleBack} />
      ) : showRegister ? (
        <Register onRegister={handleRegister} onSwitchToLogin={switchToLogin} />
      ) : (
        <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} />
      )}
    </div>
  );
}

export default App;