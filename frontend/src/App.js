import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppNavbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';
import ProfilePage from './pages/ProfilePage';
import AddRestaurantPage from './pages/AddRestaurantPage';
import EditRestaurantPage from './pages/EditRestaurantPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';

function App() {
  return (
    <Router>
      <AppNavbar />
      <Routes>
        {/* Public */}
        <Route path="/"                    element={<HomePage />} />
        <Route path="/login"               element={<LoginPage />} />
        <Route path="/signup"              element={<SignupPage />} />
        <Route path="/restaurants/:id"     element={<RestaurantDetailsPage />} />

        {/* Protected — logged in */}
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/add-restaurant" element={
          <ProtectedRoute><AddRestaurantPage /></ProtectedRoute>
        } />
        <Route path="/restaurants/:id/edit" element={
          <ProtectedRoute><EditRestaurantPage /></ProtectedRoute>
        } />

        {/* Owner only */}
        <Route path="/owner/dashboard" element={
          <ProtectedRoute ownerOnly={true}>
            <OwnerDashboardPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;