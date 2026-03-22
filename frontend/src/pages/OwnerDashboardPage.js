import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Badge, Button,
  Table, Alert, Spinner, Modal, Form, Tab, Tabs
} from 'react-bootstrap';
import {
  FaStar, FaEdit, FaChartBar, FaStore,
  FaEye, FaCheckCircle, FaPlus
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  getOwnerRestaurants, getOwnerDashboard,
  getOwnerReviews, updateOwnerRestaurant,
  claimRestaurant, getRestaurants
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

function OwnerDashboardPage() {
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const [restaurants, setRestaurants]       = useState([]);
  const [selectedRestaurant, setSelected]   = useState(null);
  const [dashboard, setDashboard]           = useState(null);
  const [reviews, setReviews]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [dashLoading, setDashLoading]       = useState(false);
  const [error, setError]                   = useState('');

  // Edit restaurant modal
  const [showEditModal, setShowEditModal]   = useState(false);
  const [editForm, setEditForm]             = useState({});
  const [editLoading, setEditLoading]       = useState(false);
  const [editMsg, setEditMsg]               = useState('');

  // Claim modal
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [claimId, setClaimId]               = useState('');
  const [claimMsg, setClaimMsg]             = useState('');
  const [claimErr, setClaimErr]             = useState('');
  const [claimLoading, setClaimLoading]     = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      navigate('/');
      return;
    }
    fetchOwnerRestaurants();
  }, [user]);

  const fetchOwnerRestaurants = async () => {
    setLoading(true);
    try {
      const res = await getOwnerRestaurants();
      setRestaurants(res.data);
      // Auto-select first restaurant
      if (res.data.length > 0) {
        selectRestaurant(res.data[0]);
      }
    } catch (err) {
      setError('Failed to load your restaurants.');
    } finally {
      setLoading(false);
    }
  };

  const selectRestaurant = async (restaurant) => {
    setSelected(restaurant);
    setDashLoading(true);
    try {
      const [dashRes, reviewsRes] = await Promise.all([
        getOwnerDashboard(restaurant.id),
        getOwnerReviews(restaurant.id)
      ]);
      setDashboard(dashRes.data);
      setReviews(reviewsRes.data);
    } catch {
      setDashboard(null);
    } finally {
      setDashLoading(false);
    }
  };

  const handleEditOpen = (restaurant) => {
    setEditForm({
      name:         restaurant.name,
      cuisine_type: restaurant.cuisine_type || '',
      description:  restaurant.description  || '',
      address:      restaurant.address      || '',
      city:         restaurant.city         || '',
      state:        restaurant.state        || '',
      zip_code:     restaurant.zip_code     || '',
      phone:        restaurant.phone        || '',
      email:        restaurant.email        || '',
      website:      restaurant.website      || '',
      price_tier:   restaurant.price_tier   || '',
      amenities:    restaurant.amenities    || '',
      hours:        restaurant.hours        || ''
    });
    setEditMsg('');
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    setEditMsg('');
    try {
      const res = await updateOwnerRestaurant(selectedRestaurant.id, editForm);
      // Update local list
      setRestaurants(prev =>
        prev.map(r => r.id === selectedRestaurant.id ? res.data : r)
      );
      setSelected(res.data);
      setEditMsg('Restaurant updated successfully!');
      setTimeout(() => setShowEditModal(false), 1200);
    } catch (err) {
      setEditMsg(err.response?.data?.detail || 'Failed to update restaurant.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleClaimOpen = async () => {
    setClaimMsg('');
    setClaimErr('');
    setClaimId('');
    try {
      const res = await getRestaurants({ limit: 50 });
      // Filter out already claimed ones
      const unclaimed = res.data.restaurants.filter(r => !r.is_claimed);
      setAllRestaurants(unclaimed);
    } catch { }
    setShowClaimModal(true);
  };

  const handleClaimSubmit = async () => {
    if (!claimId) return;
    setClaimLoading(true);
    setClaimErr('');
    setClaimMsg('');
    try {
      await claimRestaurant({
        restaurant_id: parseInt(claimId),
        message: 'I am the owner of this restaurant'
      });
      setClaimMsg('Restaurant claimed successfully! Refreshing...');
      setTimeout(() => {
        setShowClaimModal(false);
        fetchOwnerRestaurants();
      }, 1500);
    } catch (err) {
      setClaimErr(err.response?.data?.detail || 'Failed to claim restaurant.');
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <Spinner animation="border" variant="danger" />
    </div>
  );

  return (
    <Container fluid className="py-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-0">🏪 Owner Dashboard</h3>
          <p className="text-muted mb-0">
            Manage your restaurants and track performance
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-danger"
            onClick={handleClaimOpen}
          >
            <FaCheckCircle className="me-1" /> Claim Restaurant
          </Button>
          <Button
            variant="danger"
            onClick={() => navigate('/add-restaurant')}
          >
            <FaPlus className="me-1" /> Add New
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {restaurants.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <div style={{ fontSize: '3rem' }}>🏪</div>
            <h5>No restaurants yet</h5>
            <p className="text-muted">
              Add a new restaurant or claim an existing one to get started.
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <Button variant="danger" onClick={() => navigate('/add-restaurant')}>
                <FaPlus className="me-1" /> Add Restaurant
              </Button>
              <Button variant="outline-danger" onClick={handleClaimOpen}>
                <FaCheckCircle className="me-1" /> Claim Restaurant
              </Button>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {/* Left Sidebar — Restaurant List */}
          <Col lg={3} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <strong>My Restaurants ({restaurants.length})</strong>
              </Card.Header>
              <Card.Body className="p-0">
                {restaurants.map(r => (
                  <div
                    key={r.id}
                    onClick={() => selectRestaurant(r)}
                    className="p-3 border-bottom"
                    style={{
                      cursor: 'pointer',
                      background: selectedRestaurant?.id === r.id
                        ? '#fff5f5' : 'white',
                      borderLeft: selectedRestaurant?.id === r.id
                        ? '3px solid #d32323' : '3px solid transparent'
                    }}
                  >
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{r.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          {r.cuisine_type} • {r.price_tier}
                        </div>
                        <StarRating rating={r.avg_rating || 0} size="0.8rem" />
                      </div>
                      <Badge bg="success" style={{ fontSize: '0.7rem', height: 'fit-content' }}>
                        ✓
                      </Badge>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          </Col>

          {/* Right — Dashboard Content */}
          <Col lg={9}>
            {dashLoading ? (
              <div className="loading-container">
                <Spinner animation="border" variant="danger" />
              </div>
            ) : selectedRestaurant && dashboard ? (
              <>
                {/* Restaurant Header */}
                <Card className="border-0 shadow-sm mb-4">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h4 className="mb-1">{selectedRestaurant.name}</h4>
                        <div className="d-flex gap-2 flex-wrap mb-2">
                          {selectedRestaurant.cuisine_type && (
                            <span className="cuisine-badge">
                              {selectedRestaurant.cuisine_type}
                            </span>
                          )}
                          {selectedRestaurant.price_tier && (
                            <span className="price-tier">
                              {selectedRestaurant.price_tier}
                            </span>
                          )}
                          <Badge bg="success">✓ Claimed</Badge>
                        </div>
                        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                          📍 {selectedRestaurant.address}, {selectedRestaurant.city},{' '}
                          {selectedRestaurant.state}
                        </p>
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => navigate(`/restaurants/${selectedRestaurant.id}`)}
                        >
                          <FaEye className="me-1" /> View
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleEditOpen(selectedRestaurant)}
                        >
                          <FaEdit className="me-1" /> Edit
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Stats Row */}
                <Row className="g-3 mb-4">
                  <Col md={3}>
                    <Card className="border-0 shadow-sm text-center p-3">
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#d32323' }}>
                        {dashboard.avg_rating?.toFixed(1)}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                        Average Rating
                      </div>
                      <StarRating rating={dashboard.avg_rating || 0} size="0.9rem" />
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="border-0 shadow-sm text-center p-3">
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#d32323' }}>
                        {dashboard.total_reviews}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                        Total Reviews
                      </div>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="border-0 shadow-sm text-center p-3">
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2d6a4f' }}>
                        {dashboard.sentiment?.positive_pct}%
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                        Positive Reviews
                      </div>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="border-0 shadow-sm text-center p-3">
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#8B0000' }}>
                        {dashboard.sentiment?.negative_pct}%
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                        Negative Reviews
                      </div>
                    </Card>
                  </Col>
                </Row>

                <Tabs defaultActiveKey="analytics" className="mb-3">

                  {/* Analytics Tab */}
                  <Tab
                    eventKey="analytics"
                    title={<><FaChartBar className="me-1" />Analytics</>}
                  >
                    <Row>
                      {/* Rating Distribution */}
                      <Col md={6}>
                        <Card className="border-0 shadow-sm mb-4">
                          <Card.Body>
                            <h6 className="mb-3">Rating Distribution</h6>
                            {[5, 4, 3, 2, 1].map(star => {
                              const count = dashboard.rating_distribution?.[String(star)] || 0;
                              const pct = dashboard.total_reviews > 0
                                ? Math.round((count / dashboard.total_reviews) * 100)
                                : 0;
                              return (
                                <div key={star}
                                  className="d-flex align-items-center gap-2 mb-2">
                                  <span style={{ width: 25, fontSize: '0.85rem' }}>
                                    {star}★
                                  </span>
                                  <div className="flex-grow-1 bg-light rounded"
                                    style={{ height: 12 }}>
                                    <div style={{
                                      width: `${pct}%`,
                                      height: '100%',
                                      background: star >= 4 ? '#2d6a4f'
                                        : star === 3 ? '#f5a623' : '#d32323',
                                      borderRadius: 4,
                                      transition: 'width 0.5s ease'
                                    }} />
                                  </div>
                                  <span style={{ width: 55, fontSize: '0.8rem', color: '#666' }}>
                                    {count} ({pct}%)
                                  </span>
                                </div>
                              );
                            })}
                          </Card.Body>
                        </Card>
                      </Col>

                      {/* Sentiment Summary */}
                      <Col md={6}>
                        <Card className="border-0 shadow-sm mb-4">
                          <Card.Body>
                            <h6 className="mb-3">Sentiment Summary</h6>
                            <div className="d-flex flex-column gap-3">
                              <div className="d-flex justify-content-between align-items-center
                                p-3 rounded" style={{ background: '#e8f5e9' }}>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#2d6a4f' }}>
                                    😊 Positive
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    4–5 star reviews
                                  </div>
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700,
                                  color: '#2d6a4f' }}>
                                  {dashboard.sentiment?.positive}
                                </div>
                              </div>
                              <div className="d-flex justify-content-between align-items-center
                                p-3 rounded" style={{ background: '#fff8e1' }}>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#f5a623' }}>
                                    😐 Neutral
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    3 star reviews
                                  </div>
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700,
                                  color: '#f5a623' }}>
                                  {dashboard.sentiment?.neutral}
                                </div>
                              </div>
                              <div className="d-flex justify-content-between align-items-center
                                p-3 rounded" style={{ background: '#ffebee' }}>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#d32323' }}>
                                    😞 Negative
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                    1–2 star reviews
                                  </div>
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700,
                                  color: '#d32323' }}>
                                  {dashboard.sentiment?.negative}
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Tab>

                  {/* Reviews Tab */}
                  <Tab
                    eventKey="reviews"
                    title={<><FaStar className="me-1" />
                      Reviews ({reviews.length})</>}
                  >
                    <Card className="border-0 shadow-sm">
                      <Card.Body>
                        {reviews.length === 0 ? (
                          <div className="text-center py-4 text-muted">
                            <div style={{ fontSize: '2rem' }}>💬</div>
                            <p>No reviews yet for this restaurant.</p>
                          </div>
                        ) : (
                          <Table hover responsive style={{ fontSize: '0.9rem' }}>
                            <thead>
                              <tr>
                                <th>Reviewer</th>
                                <th>Rating</th>
                                <th>Comment</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reviews.map(review => (
                                <tr key={review.id}>
                                  <td>
                                    <div className="d-flex align-items-center gap-2">
                                      <div style={{
                                        width: 30, height: 30,
                                        borderRadius: '50%',
                                        background: '#d32323',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        flexShrink: 0
                                      }}>
                                        {review.user_name?.[0]?.toUpperCase() || '?'}
                                      </div>
                                      <span>{review.user_name || 'Anonymous'}</span>
                                    </div>
                                  </td>
                                  <td>
                                    <StarRating rating={review.rating} size="0.85rem" />
                                  </td>
                                  <td style={{ maxWidth: '300px' }}>
                                    <span style={{
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden'
                                    }}>
                                      {review.comment || '—'}
                                    </span>
                                  </td>
                                  <td style={{ whiteSpace: 'nowrap', color: '#999' }}>
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab>

                  {/* Restaurant Info Tab */}
                  <Tab
                    eventKey="info"
                    title={<><FaStore className="me-1" />Info</>}
                  >
                    <Card className="border-0 shadow-sm">
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <p><strong>Name:</strong> {selectedRestaurant.name}</p>
                            <p><strong>Cuisine:</strong> {selectedRestaurant.cuisine_type || '—'}</p>
                            <p><strong>Price:</strong> {selectedRestaurant.price_tier || '—'}</p>
                            <p><strong>Phone:</strong> {selectedRestaurant.phone || '—'}</p>
                            <p><strong>Email:</strong> {selectedRestaurant.email || '—'}</p>
                            <p><strong>Website:</strong>{' '}
                              {selectedRestaurant.website
                                ? <a href={selectedRestaurant.website}
                                    target="_blank" rel="noreferrer">
                                    Visit
                                  </a>
                                : '—'}
                            </p>
                          </Col>
                          <Col md={6}>
                            <p><strong>Address:</strong> {selectedRestaurant.address || '—'}</p>
                            <p><strong>City:</strong> {selectedRestaurant.city || '—'}</p>
                            <p><strong>State:</strong> {selectedRestaurant.state || '—'}</p>
                            <p><strong>ZIP:</strong> {selectedRestaurant.zip_code || '—'}</p>
                            <p><strong>Amenities:</strong>{' '}
                              {selectedRestaurant.amenities
                                ? selectedRestaurant.amenities.split(',').map((a, i) => (
                                    <span key={i} className="amenity-badge me-1">{a.trim()}</span>
                                  ))
                                : '—'}
                            </p>
                          </Col>
                          <Col md={12}>
                            <p><strong>Description:</strong>{' '}
                              {selectedRestaurant.description || '—'}
                            </p>
                          </Col>
                        </Row>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleEditOpen(selectedRestaurant)}
                        >
                          <FaEdit className="me-1" /> Edit Restaurant
                        </Button>
                      </Card.Body>
                    </Card>
                  </Tab>

                </Tabs>
              </>
            ) : null}
          </Col>
        </Row>
      )}

      {/* ── Edit Restaurant Modal ── */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}
        size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Restaurant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editMsg && (
            <Alert variant={editMsg.includes('success') ? 'success' : 'danger'}>
              {editMsg}
            </Alert>
          )}
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Restaurant Name</Form.Label>
                <Form.Control
                  value={editForm.name || ''}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Price Tier</Form.Label>
                <Form.Select
                  value={editForm.price_tier || ''}
                  onChange={e => setEditForm({ ...editForm, price_tier: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="$">$</option>
                  <option value="$$">$$</option>
                  <option value="$$$">$$$</option>
                  <option value="$$$$">$$$$</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea" rows={3}
                  value={editForm.description || ''}
                  onChange={e =>
                    setEditForm({ ...editForm, description: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  value={editForm.phone || ''}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Website</Form.Label>
                <Form.Control
                  value={editForm.website || ''}
                  onChange={e => setEditForm({ ...editForm, website: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Amenities (comma-separated)</Form.Label>
                <Form.Control
                  value={editForm.amenities || ''}
                  onChange={e =>
                    setEditForm({ ...editForm, amenities: e.target.value })}
                  placeholder="wifi,parking,outdoor_seating"
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Hours (JSON)</Form.Label>
                <Form.Control
                  as="textarea" rows={3}
                  value={editForm.hours || ''}
                  onChange={e => setEditForm({ ...editForm, hours: e.target.value })}
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  placeholder='{"mon":"9am-10pm","fri":"9am-12am"}'
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleEditSave} disabled={editLoading}>
            {editLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Claim Restaurant Modal ── */}
      <Modal show={showClaimModal} onHide={() => setShowClaimModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Claim a Restaurant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            Select an unclaimed restaurant to take ownership of it.
          </p>
          {claimMsg && <Alert variant="success">{claimMsg}</Alert>}
          {claimErr && <Alert variant="danger">{claimErr}</Alert>}
          <Form.Group>
            <Form.Label>Select Restaurant</Form.Label>
            <Form.Select
              value={claimId}
              onChange={e => setClaimId(e.target.value)}
            >
              <option value="">Choose a restaurant...</option>
              {allRestaurants.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.city} ({r.cuisine_type || 'N/A'})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClaimModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleClaimSubmit}
            disabled={!claimId || claimLoading}
          >
            {claimLoading ? 'Claiming...' : 'Claim Restaurant'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default OwnerDashboardPage;