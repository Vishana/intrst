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
// import Advisor from './pages/Advisor';
// import Betting from './pages/Betting';
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
              user.onboardingComplete ? (
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
              user.onboardingComplete ? (
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
              user.onboardingComplete ? (
                <>
                  <div>Advisor Coming Soon</div>
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
          path="/betting" 
          element={
            user ? (
              user.onboardingComplete ? (
                <>
                  <div>Betting Coming Soon</div>
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
              user.onboardingComplete ? (
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
