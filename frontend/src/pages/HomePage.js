import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Form, Button,
  InputGroup, Spinner, Alert
} from 'react-bootstrap';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { getRestaurants, addFavorite, removeFavorite, getMyFavorites } from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import AIChatbot from '../components/AIChatbot';

function HomePage() {
  const { user }                          = useAuth();
  const [restaurants, setRestaurants]     = useState([]);
  const [favorites, setFavorites]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [totalCount, setTotalCount]       = useState(0);

  // Search & filter state
  const [search, setSearch]               = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');
  const [priceFilter, setPriceFilter]     = useState('');
  const [cityFilter, setCityFilter]       = useState('');
  const [page, setPage]                   = useState(0);
  const LIMIT = 9;

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        skip: page * LIMIT,
        limit: LIMIT,
        ...(search       && { name: search }),
        ...(cuisineFilter && { cuisine_type: cuisineFilter }),
        ...(priceFilter   && { price_tier: priceFilter }),
        ...(cityFilter    && { city: cityFilter }),
      };
      const res = await getRestaurants(params);
      setRestaurants(res.data.restaurants);
      setTotalCount(res.data.total);
    } catch {
      setError('Failed to load restaurants. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [search, cuisineFilter, priceFilter, cityFilter, page]);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getMyFavorites();
      setFavorites(res.data.map(f => f.restaurant_id));
    } catch { /* not logged in */ }
  }, [user]);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);
  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchRestaurants();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCuisineFilter('');
    setPriceFilter('');
    setCityFilter('');
    setPage(0);
  };

  const handleToggleFavorite = async (restaurantId) => {
    if (!user) return;
    try {
      if (favorites.includes(restaurantId)) {
        await removeFavorite(restaurantId);
        setFavorites(prev => prev.filter(id => id !== restaurantId));
      } else {
        await addFavorite(restaurantId);
        setFavorites(prev => [...prev, restaurantId]);
      }
    } catch (err) {
      console.error('Favorite toggle error:', err);
    }
  };

  const totalPages = Math.ceil(totalCount / LIMIT);

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
              <h1>Find Your Next Favourite Restaurant 🍽️</h1>
              <p className="lead mb-4">
                Discover great places to eat, read reviews, and get AI-powered recommendations.
              </p>
              {/* Main Search Bar */}
              <Form onSubmit={handleSearch}>
                <InputGroup size="lg">
                  <Form.Control
                    placeholder="Search restaurants, cuisines, or keywords..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ borderRadius: '30px 0 0 30px' }}
                  />
                  <Button
                    variant="dark"
                    type="submit"
                    style={{ borderRadius: '0 30px 30px 0' }}
                  >
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        <Row>
          {/* Left — Restaurant Listings */}
          <Col lg={8}>
            {/* Filters Row */}
            <div className="d-flex gap-2 mb-4 flex-wrap align-items-center">
              <FaFilter className="text-muted" />
              <Form.Select
                size="sm"
                style={{ width: 'auto' }}
                value={cuisineFilter}
                onChange={(e) => { setCuisineFilter(e.target.value); setPage(0); }}
              >
                <option value="">All Cuisines</option>
                <option>Italian</option>
                <option>Mexican</option>
                <option>Chinese</option>
                <option>Japanese</option>
                <option>Indian</option>
                <option>American</option>
                <option>French</option>
                <option>Mediterranean</option>
              </Form.Select>

              <Form.Select
                size="sm"
                style={{ width: 'auto' }}
                value={priceFilter}
                onChange={(e) => { setPriceFilter(e.target.value); setPage(0); }}
              >
                <option value="">Any Price</option>
                <option value="$">$ Budget</option>
                <option value="$$">$$ Moderate</option>
                <option value="$$$">$$$ Upscale</option>
                <option value="$$$$">$$$$ Fine Dining</option>
              </Form.Select>

              <Form.Control
                size="sm"
                placeholder="City..."
                style={{ width: '130px' }}
                value={cityFilter}
                onChange={(e) => { setCityFilter(e.target.value); setPage(0); }}
              />

              {(search || cuisineFilter || priceFilter || cityFilter) && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Clear ✕
                </Button>
              )}

              <span className="text-muted ms-auto" style={{ fontSize: '0.85rem' }}>
                {totalCount} restaurant{totalCount !== 1 ? 's' : ''} found
              </span>
            </div>

            {/* Error */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Loading */}
            {loading ? (
              <div className="loading-container">
                <Spinner animation="border" variant="danger" />
              </div>
            ) : restaurants.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div style={{ fontSize: '3rem' }}>🍽️</div>
                <h5>No restaurants found</h5>
                <p>Try adjusting your search or filters</p>
                <Button variant="outline-danger" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <Row className="g-4">
                  {restaurants.map(restaurant => (
                    <Col key={restaurant.id} md={6} xl={4}>
                      <RestaurantCard
                        restaurant={restaurant}
                        isFavorite={favorites.includes(restaurant.id)}
                        onToggleFavorite={handleToggleFavorite}
                        showFavorite={!!user}
                      />
                    </Col>
                  ))}
                </Row>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center gap-2 mt-4">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage(p => p - 1)}
                    >
                      ← Previous
                    </Button>
                    <span className="align-self-center text-muted">
                      Page {page + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next →
                    </Button>
                  </div>
                )}
              </>
            )}
          </Col>

          {/* Right — AI Chatbot */}
          <Col lg={4}>
            <div style={{ position: 'sticky', top: '80px' }}>
              <AIChatbot />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default HomePage;