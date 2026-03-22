import RestaurantPhotos from '../components/RestaurantPhotos';
import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Badge, Button,
  Form, Alert, Spinner, Modal
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaHeart, FaRegHeart, FaStar, FaPhone,
  FaGlobe, FaMapMarkerAlt, FaClock, FaEdit, FaTrash
} from 'react-icons/fa';
import {
  getRestaurant, getReviews, createReview, updateReview,
  deleteReview, addFavorite, removeFavorite, getMyFavorites
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

function RestaurantDetailsPage() {
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();

  // Data state
  const [restaurant, setRestaurant]   = useState(null);
  const [reviews, setReviews]         = useState([]);
  const [isFavorite, setIsFavorite]   = useState(false);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm]         = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError]       = useState('');
  const [reviewLoading, setReviewLoading]   = useState(false);
  const [editingReview, setEditingReview]   = useState(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // Fetch restaurant + reviews + favorites
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [restaurantRes, reviewsRes] = await Promise.all([
          getRestaurant(id),
          getReviews(id)
        ]);
        setRestaurant(restaurantRes.data);
        setReviews(reviewsRes.data);

        // Check if favorited
        if (user) {
          const favRes = await getMyFavorites();
          const favIds = favRes.data.map(f => f.restaurant_id);
          setIsFavorite(favIds.includes(parseInt(id)));
        }
      } catch {
        setError('Restaurant not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user) return navigate('/login');
    try {
      if (isFavorite) {
        await removeFavorite(id);
        setIsFavorite(false);
      } else {
        await addFavorite(id);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewLoading(true);
    try {
      if (editingReview) {
        // Update existing review
        const res = await updateReview(id, editingReview.id, reviewForm);
        setReviews(prev =>
          prev.map(r => r.id === editingReview.id ? res.data : r)
        );
        // Refresh restaurant to get updated avg_rating
        const rRes = await getRestaurant(id);
        setRestaurant(rRes.data);
      } else {
        // Create new review
        const res = await createReview(id, reviewForm);
        setReviews(prev => [res.data, ...prev]);
        const rRes = await getRestaurant(id);
        setRestaurant(rRes.data);
      }
      setShowReviewForm(false);
      setEditingReview(null);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      setReviewError(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({ rating: review.rating, comment: review.comment || '' });
    setShowReviewForm(true);
  };

  const handleDeleteReview = async () => {
    try {
      await deleteReview(id, deletingReviewId);
      setReviews(prev => prev.filter(r => r.id !== deletingReviewId));
      const rRes = await getRestaurant(id);
      setRestaurant(rRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setShowDeleteModal(false);
      setDeletingReviewId(null);
    }
  };

  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    setReviewForm({ rating: 5, comment: '' });
    setReviewError('');
  };

  const userReview = reviews.find(r => r.user_id === user?.id);

  if (loading) return (
    <div className="loading-container">
      <Spinner animation="border" variant="danger" />
    </div>
  );

  if (error) return (
    <Container className="mt-5">
      <Alert variant="danger">{error}</Alert>
      <Button variant="outline-danger" onClick={() => navigate('/')}>
        ← Back to Explore
      </Button>
    </Container>
  );

  const amenities = restaurant.amenities
    ? restaurant.amenities.split(',').map(a => a.trim())
    : [];

  return (
    <>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        color: 'white',
        padding: '40px 0'
      }}>
        <Container>
                <div className="d-flex gap-2 mb-3">
        <Button
            variant="outline-light"
            size="sm"
            onClick={() => navigate('/')}
        >
            ← Back to Explore
        </Button>
        {/* Show Edit button only to the restaurant creator */}
        {user && restaurant.owner_id === user.id && (
            <Button
            variant="warning"
            size="sm"
            onClick={() => navigate(`/restaurants/${id}/edit`)}
            >
            ✏️ Edit Restaurant
            </Button>
        )}
        </div>
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center gap-3 mb-2">
                <h1 className="mb-0">{restaurant.name}</h1>
                {restaurant.is_claimed && (
                  <Badge bg="success">✓ Claimed</Badge>
                )}
              </div>

              <div className="d-flex align-items-center gap-3 flex-wrap mb-3">
                <StarRating rating={restaurant.avg_rating || 0} size="1.4rem" />
                <span style={{ opacity: 0.8 }}>
                  ({restaurant.review_count || 0} reviews)
                </span>
                {restaurant.cuisine_type && (
                  <Badge bg="warning" text="dark">{restaurant.cuisine_type}</Badge>
                )}
                {restaurant.price_tier && (
                  <span className="price-tier" style={{ color: '#a8d8a8' }}>
                    {restaurant.price_tier}
                  </span>
                )}
              </div>

              {restaurant.address && (
                <p style={{ opacity: 0.8 }} className="mb-0">
                  <FaMapMarkerAlt className="me-2" />
                  {restaurant.address}, {restaurant.city}, {restaurant.state}
                </p>
              )}
            </Col>

            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <Button
                variant={isFavorite ? 'danger' : 'outline-light'}
                onClick={handleToggleFavorite}
                className="me-2"
              >
                {isFavorite
                  ? <><FaHeart className="me-1" /> Saved</>
                  : <><FaRegHeart className="me-1" /> Save</>}
              </Button>

              {user && !userReview && !showReviewForm && (
                <Button
                  variant="warning"
                  onClick={() => setShowReviewForm(true)}
                >
                  ✍️ Write Review
                </Button>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="mt-4">
        <Row>
          {/* Left Column — Details & Reviews */}
          <Col lg={8}>

            {/* Description */}
            {restaurant.description && (
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                  <h5>About</h5>
                  <p className="mb-0 text-muted">{restaurant.description}</p>
                </Card.Body>
              </Card>
            )}
            {/* Photos Section */}
            <Card className="mb-4 border-0 shadow-sm">
            <Card.Body>
                <h5 className="mb-3">📷 Photos</h5>
                <RestaurantPhotos
                restaurantId={parseInt(id)}
                ownerId={restaurant.owner_id}
                />
            </Card.Body>
            </Card>

            {/* Amenities */}
            {amenities.length > 0 && (
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                  <h5>Amenities</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {amenities.map((a, i) => (
                      <span key={i} className="amenity-badge">
                        {a.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Review Form */}
            {showReviewForm && (
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                  <h5>{editingReview ? 'Edit Your Review' : 'Write a Review'}</h5>
                  {reviewError && <Alert variant="danger">{reviewError}</Alert>}
                  <Form onSubmit={handleReviewSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Rating</Form.Label>
                      <div className="d-flex gap-2 align-items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <FaStar
                            key={star}
                            size={28}
                            color={star <= reviewForm.rating ? '#f5a623' : '#ccc'}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                          />
                        ))}
                        <span className="text-muted ms-2">
                          {reviewForm.rating}/5
                        </span>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Comment</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Share your experience..."
                        value={reviewForm.comment}
                        onChange={e =>
                          setReviewForm(f => ({ ...f, comment: e.target.value }))
                        }
                      />
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <Button
                        variant="danger"
                        type="submit"
                        disabled={reviewLoading}
                      >
                        {reviewLoading
                          ? 'Submitting...'
                          : editingReview ? 'Update Review' : 'Submit Review'}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={handleCancelReview}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            )}

            {/* Reviews Section */}
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">
                    Reviews ({reviews.length})
                  </h5>
                  {user && !userReview && !showReviewForm && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setShowReviewForm(true)}
                    >
                      + Add Review
                    </Button>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <div style={{ fontSize: '2rem' }}>💬</div>
                    <p>No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="border-bottom pb-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <div className="profile-pic-placeholder"
                              style={{ width: 36, height: 36, fontSize: '1rem' }}>
                              {review.user_name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <strong>{review.user_name || 'Anonymous'}</strong>
                              <div style={{ fontSize: '0.8rem', color: '#999' }}>
                                {new Date(review.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <StarRating rating={review.rating} size="1rem" />
                          {review.comment && (
                            <p className="mt-2 mb-0 text-muted">
                              {review.comment}
                            </p>
                          )}
                        </div>

                        {/* Edit/Delete — only for review author */}
                        {user?.id === review.user_id && (
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleEditReview(review)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setDeletingReviewId(review.id);
                                setShowDeleteModal(true);
                              }}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column — Info Sidebar */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm mb-3">
              <Card.Body>
                <h5 className="mb-3">Restaurant Info</h5>

                {restaurant.phone && (
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaPhone className="text-danger" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}

                {restaurant.website && (
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaGlobe className="text-danger" />
                    <a href={restaurant.website} target="_blank" rel="noreferrer">
                      Visit Website
                    </a>
                  </div>
                )}

                {restaurant.hours && (
                  <div className="d-flex align-items-start gap-2 mb-2">
                    <FaClock className="text-danger mt-1" />
                    <div>
                      <strong>Hours</strong>
                      <pre style={{
                        fontSize: '0.8rem',
                        background: '#f8f9fa',
                        padding: '8px',
                        borderRadius: '8px',
                        marginTop: '4px',
                        marginBottom: 0
                      }}>
                        {typeof restaurant.hours === 'string'
                          ? (() => {
                              try {
                                const h = JSON.parse(restaurant.hours);
                                return Object.entries(h)
                                  .map(([day, time]) => `${day}: ${time}`)
                                  .join('\n');
                              } catch {
                                return restaurant.hours;
                              }
                            })()
                          : restaurant.hours}
                      </pre>
                    </div>
                  </div>
                )}

                {restaurant.address && (
                  <div className="d-flex align-items-start gap-2">
                    <FaMapMarkerAlt className="text-danger mt-1" />
                    <div>
                      <div>{restaurant.address}</div>
                      <div className="text-muted">
                        {restaurant.city}, {restaurant.state} {restaurant.zip_code}
                      </div>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Rating Breakdown */}
            {reviews.length > 0 && (
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">Rating Breakdown</h5>
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviews.filter(r => r.rating === star).length;
                    const pct   = reviews.length > 0
                      ? Math.round((count / reviews.length) * 100)
                      : 0;
                    return (
                      <div key={star} className="d-flex align-items-center gap-2 mb-1">
                        <span style={{ width: 20, fontSize: '0.85rem' }}>{star}★</span>
                        <div className="flex-grow-1 bg-light rounded"
                          style={{ height: 8 }}>
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: '#f5a623',
                              borderRadius: 4
                            }}
                          />
                        </div>
                        <span style={{ width: 30, fontSize: '0.8rem', color: '#999' }}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete your review? This cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteReview}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default RestaurantDetailsPage;