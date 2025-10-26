import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ComplaintForm from './components/ComplaintForm';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [userId, setUserId] = useState(sessionStorage.getItem('userId'));
  const [currentView, setCurrentView] = useState(() => {
    const hasAuth = sessionStorage.getItem('userId') && sessionStorage.getItem('token');
    const savedView = sessionStorage.getItem('currentView');
    
    if (hasAuth && savedView && (savedView === 'dashboard' || savedView === 'complaint' || savedView === 'profile')) {
      return savedView === 'profile' ? 'dashboard' : savedView;
    }
    return hasAuth ? 'dashboard' : 'login';
  });
  const [showRegister, setShowRegister] = useState(false);



  useEffect(() => {
    if (currentView !== 'login' && !showRegister && sessionStorage.getItem('userId')) {
      sessionStorage.setItem('currentView', currentView);
    }
  }, [currentView, showRegister]);

  const handleLogin = (id) => {
    setUserId(id);
    sessionStorage.setItem('userId', id);
    setCurrentView('dashboard');
  };

  const handleRegister = (id) => {
    setUserId(id);
    sessionStorage.setItem('userId', id);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentView('login');
    setUserId(null);
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('currentView');
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
        <Dashboard 
          userId={userId} 
          onLogout={handleLogout} 
          onCreateComplaint={handleCreateComplaint}
          initialView={sessionStorage.getItem('currentView')}
        />
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