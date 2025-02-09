import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import theme from './theme';
import Dashboard from './pages/Dashboard/Dashboard';
import Appraisal from './pages/Appraisal/Appraisal';
import Summary from './pages/Summary/Summary';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Root component to handle initial routing
const Root = () => {
  const { isAuthenticated } = useAuth();
  
  // If not authenticated and not on login page, redirect to login
  if (!isAuthenticated && window.location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/:id"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/appraisal/:id"
        element={
          <PrivateRoute>
            <Appraisal />
          </PrivateRoute>
        }
      />
      <Route
        path="/summary/:id"
        element={
          <PrivateRoute>
            <Summary />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Root />
        </Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={true}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          limit={3}
        />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App; 