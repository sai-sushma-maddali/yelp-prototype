import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Form, Button,
  Alert, Spinner, Tab, Tabs, Badge
} from 'react-bootstrap';
import {
  FaUser, FaEdit, FaSave, FaCamera,
  FaHeart, FaHistory, FaStar
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import {
  getProfile, updateProfile, uploadProfilePic,
  getPreferences, updatePreferences,
  getMyFavorites, getMyHistory, getMyReviews
} from '../services/api';
import { useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';

function ProfilePage() {
  const { user, login, token, updateProfilePic } = useAuth();
  const navigate               = useNavigate();

  // Profile state
  const [profile, setProfile]       = useState(null);
  const [editMode, setEditMode]     = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [picLoading, setPicLoading] = useState(false);

  // Preferences state
  const [prefs, setPrefs]       = useState(null);
  const [prefsForm, setPrefsForm] = useState({});
  const [prefsMsg, setPrefsMsg] = useState('');
  const [prefsErr, setPrefsErr] = useState('');

  // History/Favorites state
  const [favorites, setFavorites]   = useState([]);
  const [history, setHistory]       = useState(null);
  const [myReviews, setMyReviews]   = useState([]);
  const [loading, setLoading]       = useState(true);

  const COUNTRIES = [
    'United States', 'Canada', 'United Kingdom', 'Australia',
    'India', 'Germany', 'France', 'Japan', 'China', 'Brazil',
    'Mexico', 'Spain', 'Italy', 'South Korea', 'Other'
  ];

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profileRes, favsRes, historyRes, reviewsRes] = await Promise.all([
        getProfile(),
        getMyFavorites(),
        getMyHistory(),
        getMyReviews()
      ]);
      setProfile(profileRes.data);
      setProfileForm(profileRes.data);
      setFavorites(favsRes.data);
      setHistory(historyRes.data);
      setMyReviews(reviewsRes.data);

      // Try to load preferences
      try {
        const prefsRes = await getPreferences();
        setPrefs(prefsRes.data);
        setPrefsForm(prefsRes.data);
      } catch {
        // No preferences set yet
        setPrefsForm({
          cuisine_preferences: '',
          price_range: '',
          preferred_location: '',
          search_radius_km: 10,
          dietary_needs: '',
          ambiance: '',
          sort_preference: 'rating'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    setProfileErr('');
    setProfileMsg('');
    try {
      const res = await updateProfile(profileForm);
      setProfile(res.data);
      setEditMode(false);
      setProfileMsg('Profile updated successfully!');
      // Update auth context with new name
      login({ ...user, name: res.data.name }, token);
    } catch (err) {
      setProfileErr(err.response?.data?.detail || 'Failed to update profile');
    }
  };

  const handlePicUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setPicLoading(true);
  try {
    const res = await uploadProfilePic(file);
    setProfile(res.data);
    updateProfilePic(res.data.profile_pic); // ← update navbar instantly
    setProfileMsg('Profile picture updated!');
  } catch {
    setProfileErr('Failed to upload picture');
  } finally {
    setPicLoading(false);
  }
};
  const handlePrefsChange = (e) => {
    setPrefsForm({ ...prefsForm, [e.target.name]: e.target.value });
  };

  const handlePrefsSave = async () => {
    setPrefsErr('');
    setPrefsMsg('');
    try {
      const res = await updatePreferences(prefsForm);
      setPrefs(res.data);
      setPrefsMsg('Preferences saved! The AI assistant will use these for recommendations.');
    } catch (err) {
      setPrefsErr(err.response?.data?.detail || 'Failed to save preferences');
    }
  };

  if (loading) return (
    <div className="loading-container">
      <Spinner animation="border" variant="danger" />
    </div>
  );

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  return (
    <Container className="py-4">
      <Row>
        {/* Left — Profile Card */}
        <Col lg={3} className="mb-4">
          <Card className="border-0 shadow-sm text-center p-3">
            {/* Profile Picture */}
            <div className="position-relative d-inline-block mx-auto mb-3">
              {profile?.profile_pic ? (
                <img
                  src={`${API_URL}${profile.profile_pic}`}
                  alt="Profile"
                  className="profile-pic"
                />
              ) : (
                <div className="profile-pic-placeholder mx-auto">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
              {/* Upload button */}
              <label
                htmlFor="pic-upload"
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  background: '#d32323', color: 'white',
                  borderRadius: '50%', width: 28, height: 28,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer'
                }}
              >
                {picLoading ? '...' : <FaCamera size={12} />}
              </label>
              <input
                id="pic-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePicUpload}
              />
            </div>

            <h5 className="mb-1">{profile?.name}</h5>
            <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
              {profile?.email}
            </p>
            <Badge bg={user?.role === 'owner' ? 'warning' : 'danger'} text="dark">
              {user?.role === 'owner' ? '🏪 Restaurant Owner' : '🍴 Food Lover'}
            </Badge>

            <hr />
            <div className="text-start" style={{ fontSize: '0.85rem' }}>
              {profile?.city && <p className="mb-1">📍 {profile.city}, {profile.state}</p>}
              {profile?.phone && <p className="mb-1">📞 {profile.phone}</p>}
              {profile?.languages && <p className="mb-1">🌐 {profile.languages}</p>}
              {profile?.about_me && <p className="mb-0 text-muted">{profile.about_me}</p>}
            </div>

            <div className="mt-3 d-flex justify-content-around text-center">
              <div>
                <div style={{ fontWeight: 700, color: '#d32323' }}>
                  {myReviews.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#999' }}>Reviews</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#d32323' }}>
                  {favorites.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#999' }}>Favorites</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#d32323' }}>
                  {history?.total_restaurants_added || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#999' }}>Added</div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right — Tabs */}
        <Col lg={9}>
          <Tabs defaultActiveKey="profile" className="mb-3">

            {/* ── Profile Tab ── */}
            <Tab eventKey="profile" title={<><FaUser className="me-1" />Profile</>}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-3">
                    <h5 className="mb-0">Personal Information</h5>
                    {!editMode ? (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setEditMode(true)}
                      >
                        <FaEdit className="me-1" /> Edit
                      </Button>
                    ) : (
                      <div className="d-flex gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={handleProfileSave}
                        >
                          <FaSave className="me-1" /> Save
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => {
                            setEditMode(false);
                            setProfileForm(profile);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {profileMsg && <Alert variant="success">{profileMsg}</Alert>}
                  {profileErr && <Alert variant="danger">{profileErr}</Alert>}

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          name="name"
                          value={profileForm.name || ''}
                          onChange={handleProfileChange}
                          disabled={!editMode}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          value={profile?.email || ''}
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          name="phone"
                          value={profileForm.phone || ''}
                          onChange={handleProfileChange}
                          disabled={!editMode}
                          placeholder="e.g. 408-555-1234"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Gender</Form.Label>
                        <Form.Select
                          name="gender"
                          value={profileForm.gender || ''}
                          onChange={handleProfileChange}
                          disabled={!editMode}
                        >
                          <option value="">Prefer not to say</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                          name="city"
                          value={profileForm.city || ''}
                          onChange={handleProfileChange}
                          disabled={!editMode}
                          placeholder="San Jose"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>State</Form.Label>
                        <Form.Control
                          name="state"
                          value={profileForm.state || ''}
                          onChange={handleProfileChange}
                          disabled={!editMode}
                          placeholder="CA"
                          maxLength={2}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Country</Form.Label>
                        <Form.Select
                          name="country"
                          value={profileForm.country || ''}
                          onChange={handleProfileChange}
                          disabled={!editMode}
                        >
                          <option value="">Select country</option>
                          {COUNTRIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Languages</Form.Label>
                        <Form.Control
                          name="languages"
                          value={profileForm.languages || ''}
                          onChange={handleProfileChange}
                          disabled={!editMode}
                          placeholder="English, Spanish"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>About Me</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="about_me"
                          value={profileForm.about_me || ''}
                          onChange={handleProfileChange}
                          disabled={!editMode}
                          placeholder="Tell us about yourself..."
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>

            {/* ── Preferences Tab ── */}
            <Tab eventKey="preferences" title="🤖 AI Preferences">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5 className="mb-1">AI Assistant Preferences</h5>
                  <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                    These settings personalise your AI chatbot recommendations.
                  </p>

                  {prefsMsg && <Alert variant="success">{prefsMsg}</Alert>}
                  {prefsErr && <Alert variant="danger">{prefsErr}</Alert>}

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Favourite Cuisines</Form.Label>
                        <Form.Control
                          name="cuisine_preferences"
                          value={prefsForm.cuisine_preferences || ''}
                          onChange={handlePrefsChange}
                          placeholder="e.g. Italian, Mexican, Japanese"
                        />
                        <Form.Text className="text-muted">
                          Comma-separated list
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Price Range</Form.Label>
                        <Form.Select
                          name="price_range"
                          value={prefsForm.price_range || ''}
                          onChange={handlePrefsChange}
                        >
                          <option value="">Any price</option>
                          <option value="$">$ — Budget</option>
                          <option value="$$">$$ — Moderate</option>
                          <option value="$$$">$$$ — Upscale</option>
                          <option value="$$$$">$$$$ — Fine Dining</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Preferred Location</Form.Label>
                        <Form.Control
                          name="preferred_location"
                          value={prefsForm.preferred_location || ''}
                          onChange={handlePrefsChange}
                          placeholder="e.g. San Jose, CA"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Search Radius: {prefsForm.search_radius_km || 10} km
                        </Form.Label>
                        <Form.Range
                          name="search_radius_km"
                          min={1} max={50}
                          value={prefsForm.search_radius_km || 10}
                          onChange={handlePrefsChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Dietary Needs</Form.Label>
                        <Form.Control
                          name="dietary_needs"
                          value={prefsForm.dietary_needs || ''}
                          onChange={handlePrefsChange}
                          placeholder="e.g. vegetarian, halal, gluten-free"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Ambiance Preference</Form.Label>
                        <Form.Control
                          name="ambiance"
                          value={prefsForm.ambiance || ''}
                          onChange={handlePrefsChange}
                          placeholder="e.g. casual, romantic, family-friendly"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Sort Results By</Form.Label>
                        <Form.Select
                          name="sort_preference"
                          value={prefsForm.sort_preference || 'rating'}
                          onChange={handlePrefsChange}
                        >
                          <option value="rating">Rating</option>
                          <option value="distance">Distance</option>
                          <option value="popularity">Popularity</option>
                          <option value="price">Price</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button variant="danger" onClick={handlePrefsSave}>
                    💾 Save Preferences
                  </Button>
                </Card.Body>
              </Card>
            </Tab>

            {/* ── Favorites Tab ── */}
            <Tab
              eventKey="favorites"
              title={<><FaHeart className="me-1" />Favorites ({favorites.length})</>}
            >
              {favorites.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <Card.Body className="text-center py-5 text-muted">
                    <div style={{ fontSize: '3rem' }}>❤️</div>
                    <h5>No favorites yet</h5>
                    <p>Click the heart icon on any restaurant to save it here</p>
                    <Button
                      variant="outline-danger"
                      onClick={() => navigate('/')}
                    >
                      Explore Restaurants
                    </Button>
                  </Card.Body>
                </Card>
              ) : (
                <Row className="g-3">
                  {favorites.map(fav => (
                    <Col md={6} key={fav.id}>
                      <Card
                        className="border-0 shadow-sm h-100"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/restaurants/${fav.restaurant_id}`)}
                      >
                        <Card.Body>
                          <div className="d-flex justify-content-between">
                            <div>
                              <h6 className="mb-1">{fav.restaurant?.name}</h6>
                              <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                {fav.restaurant?.cuisine_type} •{' '}
                                {fav.restaurant?.price_tier}
                              </div>
                              <StarRating
                                rating={fav.restaurant?.avg_rating || 0}
                                size="0.9rem"
                              />
                            </div>
                            <FaHeart color="#d32323" size={20} />
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Tab>

            {/* ── History Tab ── */}
            <Tab
              eventKey="history"
              title={<><FaHistory className="me-1" />History</>}
            >
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  {/* Reviews Written */}
                  <h6 className="mb-3">
                    <FaStar className="text-warning me-2" />
                    Reviews Written ({history?.total_reviews || 0})
                  </h6>
                  {history?.reviews?.length === 0 ? (
                    <p className="text-muted">No reviews written yet.</p>
                  ) : (
                    <div className="mb-4">
                      {history?.reviews?.map((r, i) => (
                        <div
                          key={i}
                          className="border-bottom pb-2 mb-2 d-flex justify-content-between align-items-center"
                          style={{ cursor: 'pointer' }}
                          onClick={() =>
                            navigate(`/restaurants/${r.restaurant_id}`)
                          }
                        >
                          <div>
                            <strong>{r.restaurant_name}</strong>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                              {r.comment?.slice(0, 60)}
                              {r.comment?.length > 60 ? '...' : ''}
                            </div>
                          </div>
                          <div className="text-end">
                            <StarRating rating={r.rating} size="0.85rem" />
                            <div style={{ fontSize: '0.75rem', color: '#999' }}>
                              {new Date(r.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <hr />

                  {/* Restaurants Added */}
                  <h6 className="mb-3">
                    🍽️ Restaurants Added ({history?.total_restaurants_added || 0})
                  </h6>
                  {history?.restaurants_added?.length === 0 ? (
                    <p className="text-muted">No restaurants added yet.</p>
                  ) : (
                    history?.restaurants_added?.map((r, i) => (
                      <div
                        key={i}
                        className="border-bottom pb-2 mb-2 d-flex justify-content-between"
                        style={{ cursor: 'pointer' }}
                        onClick={() =>
                          navigate(`/restaurants/${r.restaurant_id}`)
                        }
                      >
                        <div>
                          <strong>{r.restaurant_name}</strong>
                          <div style={{ fontSize: '0.85rem', color: '#666' }}>
                            {r.cuisine_type} • {r.city}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#999' }}>
                          {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </Card.Body>
              </Card>
            </Tab>

          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;