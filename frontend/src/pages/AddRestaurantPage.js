import React, { useState } from 'react';
import {
  Container, Card, Form, Button,
  Row, Col, Alert, Spinner
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { createRestaurant } from '../services/api';
import { useAuth } from '../context/AuthContext';

function AddRestaurantPage() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name:         '',
    cuisine_type: '',
    description:  '',
    address:      '',
    city:         '',
    state:        '',
    zip_code:     '',
    phone:        '',
    email:        '',
    website:      '',
    price_tier:   '',
    amenities:    '',
    hours:        ''
  });

  const CUISINES = [
    'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian',
    'American', 'French', 'Mediterranean', 'Thai', 'Greek',
    'Korean', 'Vietnamese', 'Spanish', 'Middle Eastern', 'Other'
  ];

  const AMENITIES_OPTIONS = [
    'wifi', 'outdoor_seating', 'parking', 'bar',
    'vegan_friendly', 'halal', 'family_friendly',
    'romantic', 'live_music', 'delivery', 'takeout',
    'reservations', 'wheelchair_accessible'
  ];

  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        amenities: selectedAmenities.join(','),
        // Build hours JSON string if any hours entered
        hours: form.hours ? form.hours : null
      };

      // Remove empty strings
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      const res = await createRestaurant(payload);
      setSuccess('Restaurant added successfully!');

      // Redirect to the new restaurant page after 1.5 seconds
      setTimeout(() => {
        navigate(`/restaurants/${res.data.id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add restaurant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Container className="py-4">
      <div className="page-header mb-4">
        <h2>🍽️ Add a Restaurant</h2>
        <p className="text-muted mb-0">
          Share a great restaurant with the community
        </p>
      </div>

      {error   && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          {/* Left Column */}
          <Col lg={8}>

            {/* Basic Info */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-3">Basic Information</h5>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Restaurant Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Pasta Paradise"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price Range</Form.Label>
                      <Form.Select
                        name="price_tier"
                        value={form.price_tier}
                        onChange={handleChange}
                      >
                        <option value="">Select...</option>
                        <option value="$">$ — Budget</option>
                        <option value="$$">$$ — Moderate</option>
                        <option value="$$$">$$$ — Upscale</option>
                        <option value="$$$$">$$$$ — Fine Dining</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cuisine Type</Form.Label>
                      <Form.Select
                        name="cuisine_type"
                        value={form.cuisine_type}
                        onChange={handleChange}
                      >
                        <option value="">Select cuisine...</option>
                        {CUISINES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Tell people what makes this restaurant special..."
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Location */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-3">📍 Location</h5>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Street Address</Form.Label>
                      <Form.Control
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="123 Main Street"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="San Jose"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>State</Form.Label>
                      <Form.Control
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        placeholder="CA"
                        maxLength={2}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>ZIP Code</Form.Label>
                      <Form.Control
                        name="zip_code"
                        value={form.zip_code}
                        onChange={handleChange}
                        placeholder="95101"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Amenities */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-3">✨ Amenities</h5>
                <div className="d-flex flex-wrap gap-2">
                  {AMENITIES_OPTIONS.map(amenity => (
                    <Button
                      key={amenity}
                      variant={
                        selectedAmenities.includes(amenity)
                          ? 'danger'
                          : 'outline-secondary'
                      }
                      size="sm"
                      style={{ borderRadius: '20px' }}
                      onClick={() => handleAmenityToggle(amenity)}
                      type="button"
                    >
                      {amenity.replace(/_/g, ' ')}
                    </Button>
                  ))}
                </div>
                {selectedAmenities.length > 0 && (
                  <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.85rem' }}>
                    Selected: {selectedAmenities.join(', ')}
                  </p>
                )}
              </Card.Body>
            </Card>

          </Col>

          {/* Right Column */}
          <Col lg={4}>

            {/* Contact Info */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-3">📞 Contact Info</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="408-555-0001"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="contact@restaurant.com"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://restaurant.com"
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Hours */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-3">🕐 Hours of Operation</h5>
                <Form.Group>
                  <Form.Label style={{ fontSize: '0.85rem' }} className="text-muted">
                    Enter as JSON e.g.<br />
                    <code>{'{"mon":"9am-10pm","fri":"9am-12am"}'}</code>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="hours"
                    value={form.hours}
                    onChange={handleChange}
                    placeholder='{"mon":"9am-10pm","tue":"9am-10pm"}'
                    style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Submit */}
            <div className="d-grid gap-2">
              <Button
                variant="danger"
                type="submit"
                size="lg"
                disabled={loading || !form.name}
              >
                {loading
                  ? <><Spinner size="sm" className="me-2" />Adding...</>
                  : '🍽️ Add Restaurant'}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/')}
                type="button"
              >
                Cancel
              </Button>
            </div>

          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default AddRestaurantPage;