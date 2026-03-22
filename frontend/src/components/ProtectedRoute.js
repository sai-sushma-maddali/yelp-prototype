import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from 'react-bootstrap';

function ProtectedRoute({ children, ownerOnly = false }) {
  const { user, loading } = useAuth();

  // Wait for auth to load from localStorage
  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  // Not logged in — redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Owner-only route but user is not an owner
  if (ownerOnly && user.role !== 'owner') {
    return (
      <div className="container mt-5 text-center">
        <div style={{ fontSize: '3rem' }}>🚫</div>
        <h4>Access Denied</h4>
        <p className="text-muted">
          This page is only accessible to restaurant owners.
        </p>
        <a href="/" className="btn btn-outline-danger">
          Back to Explore
        </a>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;