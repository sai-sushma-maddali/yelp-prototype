import React, { useState } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signup as signupApi } from '../services/api';

function SignupPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'user'
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const res = await signupApi({
        name:     formData.name,
        email:    formData.email,
        password: formData.password,
        role:     formData.role
      });
      const { access_token, role, user_id, name } = res.data;
      login({ id: user_id, name, role }, access_token);
      if (role === 'owner') navigate('/owner/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card className="auth-card">
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <h2 style={{ color: '#d32323' }}>🍽️ Join Yelp Prototype</h2>
            <p className="text-muted">Create your account to get started</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>I am a...</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check
                  type="radio"
                  name="role"
                  id="role-user"
                  label="🍴 Food Lover (Reviewer)"
                  value="user"
                  checked={formData.role === 'user'}
                  onChange={handleChange}
                />
                <Form.Check
                  type="radio"
                  name="role"
                  id="role-owner"
                  label="🏪 Restaurant Owner"
                  value="owner"
                  checked={formData.role === 'owner'}
                  onChange={handleChange}
                />
              </div>
            </Form.Group>

            <Button
              variant="danger"
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Form>

          <hr />
          <p className="text-center mb-0">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#d32323' }}>
              Log in
            </Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default SignupPage;