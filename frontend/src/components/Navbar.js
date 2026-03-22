import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../services/api';

function AppNavbar() {
  const { user, logout }       = useAuth();
  const navigate               = useNavigate();
  const [profilePic, setProfilePic] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Fetch profile pic whenever user changes
  useEffect(() => {
    if (user) {
      getProfile()
        .then(res => setProfilePic(res.data.profile_pic))
        .catch(() => setProfilePic(null));
    } else {
      setProfilePic(null);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setProfilePic(null);
    navigate('/');
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          🍽️ Yelp<span>Prototype</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Explore</Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/add-restaurant">
                  Add Restaurant
                </Nav.Link>
                {user.role === 'owner' && (
                  <Nav.Link as={Link} to="/owner/dashboard">
                    Owner Dashboard
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>

          <Nav className="align-items-center">
            {user ? (
              <>
                <Nav.Link
                  as={Link}
                  to="/profile"
                  className="d-flex align-items-center gap-2"
                >
                  {/* Profile picture or initial avatar */}
                  {profilePic ? (
                    <img
                      src={`${API_URL}${profilePic}`}
                      alt="Profile"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #d32323'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#d32323',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}>
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span>{user.name}</span>
                </Nav.Link>

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleLogout}
                  className="ms-2"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/signup">
                  <Button variant="danger" size="sm">Sign Up</Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;