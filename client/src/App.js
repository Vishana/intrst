import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/layout/Navbar';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Onboarding from './pages/auth/Onboarding';
import SimpleDashboard from './pages/SimpleDashboard';
import Advisor from './pages/Advisor';
import BettingSimple from './pages/BettingSimple';
// import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Helper function to check onboarding status more reliably
  const isOnboardingComplete = (user) => {
    return user && (user.onboardingComplete === true || user.onboarding?.isComplete === true);
  };

  return (
    <>
      {user && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/onboarding" 
          element={
            user ? (
              isOnboardingComplete(user) ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Onboarding />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            user ? (
              isOnboardingComplete(user) ? (
                <>
                  <SimpleDashboard />
                </>
              ) : (
                <Navigate to="/onboarding" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/advisor" 
          element={
            user ? (
              isOnboardingComplete(user) ? (
                <Advisor />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/betting" 
          element={
            user ? (
              isOnboardingComplete(user) ? (
                <BettingSimple />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            user ? (
              <>
                <div>Profile Coming Soon</div>
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Default Routes */}
        <Route 
          path="/" 
          element={
            user ? (
              isOnboardingComplete(user) ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/onboarding" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
