import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ComplaintForm from './components/ComplaintForm';
import Profile from './components/Profile';
import ComplaintStatus from './components/ComplaintStatus';
import AdminDashboard from './components/AdminDashboard';
import AdminComplaintDetail from './components/AdminComplaintDetail';
import EscalationDetail from './components/EscalationDetail';
import ReportsExports from './components/ReportsExports';
import OfficerDashboard from './components/OfficerDashboard';
import OfficerComplaintDetail from './components/OfficerComplaintDetail';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/complaint" element={<ComplaintForm />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/complaint-status/:id" element={
            <ProtectedRoute>
              <ComplaintStatus />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/complaint/:id" element={
            <ProtectedRoute>
              <AdminComplaintDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/escalation/:id" element={
            <ProtectedRoute>
              <EscalationDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute>
              <ReportsExports />
            </ProtectedRoute>
          } />
          <Route path="/officer/dashboard" element={
            <ProtectedRoute>
              <OfficerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/officer/complaint/:id" element={
            <ProtectedRoute>
              <OfficerComplaintDetail />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;