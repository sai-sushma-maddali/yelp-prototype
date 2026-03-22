import RestaurantPhotos from '../components/RestaurantPhotos';
import React, { useState, useEffect } from 'react';
import {
  Container, Card, Form, Button,
  Row, Col, Alert, Spinner
} from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { getRestaurant, updateRestaurant, deleteRestaurant } from '../services/api';
import { useAuth } from '../context/AuthContext';

function EditRestaurantPage() {
  const { id }      = useParams();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

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

  const [selectedAmenities, setSelectedAmenities] = useState([]);

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

  // Load existing restaurant data
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchRestaurant();
  }, [id, user]);

  const fetchRestaurant = async () => {
    setLoading(true);
    try {
      const res = await getRestaurant(id);
      const r   = res.data;

      // Check ownership
      if (r.owner_id !== user.id) {
        setError('You are not authorized to edit this restaurant.');
        setLoading(false);
        return;
      }

      setForm({
        name:         r.name         || '',
        cuisine_type: r.cuisine_type || '',
        description:  r.description  || '',
        address:      r.address      || '',
        city:         r.city         || '',
        state:        r.state        || '',
        zip_code:     r.zip_code     || '',
        phone:        r.phone        || '',
        email:        r.email        || '',
        website:      r.website      || '',
        price_tier:   r.price_tier   || '',
        amenities:    r.amenities    || '',
        hours:        r.hours        || ''
      });

      // Parse existing amenities into selected list
      if (r.amenities) {
        setSelectedAmenities(r.amenities.split(',').map(a => a.trim()).filter(Boolean));
      }
    } catch {
      setError('Restaurant not found.');
    } finally {
      setLoading(false);
    }
  };

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
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        amenities: selectedAmenities.join(','),
        hours: form.hours || null
      };
      // Remove empty strings
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      await updateRestaurant(id, payload);
      setSuccess('Restaurant updated successfully!');
      setTimeout(() => navigate(`/restaurants/${id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update restaurant.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRestaurant(id);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete restaurant.');
      setShowConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <Spinner animation="border" variant="danger" />
    </div>
  );

  if (error && !form.name) return (
    <Container className="mt-5">
      <Alert variant="danger">{error}</Alert>
      <Button variant="outline-danger" onClick={() => navigate('/')}>
        Back to Explore
      </Button>
    </Container>
  );

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>✏️ Edit Restaurant</h2>
          <p className="text-muted mb-0">Update your restaurant listing</p>
        </div>
        <Button
          variant="outline-danger"
          onClick={() => navigate(`/restaurants/${id}`)}
        >
          ← Back to Restaurant
        </Button>
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
                      <Form.Label>
                        Restaurant Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        name="name"
                        value={form.name}
                        onChange={handleChange}
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
                      type="button"
                      variant={
                        selectedAmenities.includes(amenity)
                          ? 'danger'
                          : 'outline-secondary'
                      }
                      size="sm"
                      style={{ borderRadius: '20px' }}
                      onClick={() => handleAmenityToggle(amenity)}
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

            {/* Contact */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-3">📞 Contact Info</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Photo Management */}
            <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
                <h5 className="mb-3">📷 Restaurant Photos</h5>
                <RestaurantPhotos
                restaurantId={parseInt(id)}
                ownerId={user?.id}
                />
            </Card.Body>
            </Card>
            {/* Hours */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body>
                <h5 className="mb-3">🕐 Hours</h5>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="hours"
                  value={form.hours}
                  onChange={handleChange}
                  placeholder='{"mon":"9am-10pm","tue":"9am-10pm"}'
                  style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}
                />
              </Card.Body>
            </Card>

            {/* Action Buttons */}
            <div className="d-grid gap-2">
              <Button
                variant="danger"
                type="submit"
                size="lg"
                disabled={saving}
              >
                {saving
                  ? <><Spinner size="sm" className="me-2" />Saving...</>
                  : '💾 Save Changes'}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => navigate(`/restaurants/${id}`)}
                type="button"
              >
                Cancel
              </Button>
            </div>

            {/* Delete Section */}
            <Card className="border-0 mt-4"
              style={{ border: '1px solid #ffcdd2 !important', background: '#fff5f5' }}>
              <Card.Body>
                <h6 className="text-danger mb-2">⚠️ Danger Zone</h6>
                <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>
                  Permanently delete this restaurant and all its reviews.
                  This cannot be undone.
                </p>
                {!showConfirm ? (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="w-100"
                    onClick={() => setShowConfirm(true)}
                  >
                    🗑️ Delete Restaurant
                  </Button>
                ) : (
                  <div>
                    <p className="text-danger mb-2" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      Are you sure? This will delete all reviews too.
                    </p>
                    <div className="d-flex gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-grow-1"
                      >
                        {deleting ? 'Deleting...' : 'Yes, Delete'}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setShowConfirm(false)}
                        className="flex-grow-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default EditRestaurantPage;