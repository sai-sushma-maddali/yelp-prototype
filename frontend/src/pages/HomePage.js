import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Form, Button,
  InputGroup, Spinner, Alert
} from 'react-bootstrap';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRestaurants, setFilters, clearFilters,
  selectRestaurants, selectRestaurantTotal,
  selectRestaurantLoading, selectRestaurantError,
  selectFilters
} from '../store/slices/restaurantSlice';
import {
  fetchFavorites, toggleFavorite,
  selectFavoriteIds
} from '../store/slices/favoriteSlice';
import { useAuth } from '../context/AuthContext';
import RestaurantCard from '../components/RestaurantCard';
import AIChatbot from '../components/AIChatbot';

const LIMIT = 9;

function HomePage() {
  const dispatch    = useDispatch();
  const { user }    = useAuth();
  const restaurants = useSelector(selectRestaurants);
  const total       = useSelector(selectRestaurantTotal);
  const loading     = useSelector(selectRestaurantLoading);
  const error       = useSelector(selectRestaurantError);
  const filters     = useSelector(selectFilters);
  const favoriteIds = useSelector(selectFavoriteIds);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchRestaurants({
      skip:  filters.page * LIMIT,
      limit: LIMIT,
      ...(filters.name         && { name:         filters.name }),
      ...(filters.cuisine_type && { cuisine_type: filters.cuisine_type }),
      ...(filters.price_tier   && { price_tier:   filters.price_tier }),
      ...(filters.city         && { city:          filters.city }),
    }));
  }, [dispatch, filters]);

  useEffect(() => {
    if (user) dispatch(fetchFavorites());
  }, [dispatch, user]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ name: search, page: 0 }));
  };

  const handleClearFilters = () => {
    setSearch('');
    dispatch(clearFilters());
  };

  const handleToggleFavorite = (restaurantId) => {
    if (!user) return;
    const isFav = favoriteIds.includes(restaurantId);
    dispatch(toggleFavorite({ restaurantId, isFavorite: isFav }));
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      <div className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
              <h1>Find Your Next Favourite Restaurant 🍽️</h1>
              <p className="lead mb-4">
                Discover great places to eat, read reviews, and get AI-powered recommendations.
              </p>
              <Form onSubmit={handleSearch}>
                <InputGroup size="lg">
                  <Form.Control
                    placeholder="Search restaurants, cuisines, or keywords..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ borderRadius: '30px 0 0 30px' }}
                  />
                  <Button variant="dark" type="submit"
                    style={{ borderRadius: '0 30px 30px 0' }}>
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
          <Col lg={8}>
            <div className="d-flex gap-2 mb-4 flex-wrap align-items-center">
              <FaFilter className="text-muted" />
              <Form.Select size="sm" style={{ width: 'auto' }}
                value={filters.cuisine_type}
                onChange={e => dispatch(setFilters({ cuisine_type: e.target.value, page: 0 }))}>
                <option value="">All Cuisines</option>
                {['Italian','Mexican','Chinese','Japanese','Indian','American',
                  'French','Mediterranean','Korean','Vietnamese','Spanish','Greek'].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </Form.Select>

              <Form.Select size="sm" style={{ width: 'auto' }}
                value={filters.price_tier}
                onChange={e => dispatch(setFilters({ price_tier: e.target.value, page: 0 }))}>
                <option value="">Any Price</option>
                <option value="$">$ Budget</option>
                <option value="$$">$$ Moderate</option>
                <option value="$$$">$$$ Upscale</option>
                <option value="$$$$">$$$$ Fine Dining</option>
              </Form.Select>

              <Form.Control size="sm" placeholder="City..."
                style={{ width: '130px' }}
                value={filters.city}
                onChange={e => dispatch(setFilters({ city: e.target.value, page: 0 }))} />

              {(search || filters.cuisine_type || filters.price_tier || filters.city) && (
                <Button variant="outline-secondary" size="sm"
                  onClick={handleClearFilters}>
                  Clear ✕
                </Button>
              )}
              <span className="text-muted ms-auto" style={{ fontSize: '0.85rem' }}>
                {total} restaurant{total !== 1 ? 's' : ''} found
              </span>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

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
                        isFavorite={favoriteIds.includes(restaurant.id)}
                        onToggleFavorite={handleToggleFavorite}
                        showFavorite={!!user}
                      />
                    </Col>
                  ))}
                </Row>

                {totalPages > 1 && (
                  <div className="d-flex justify-content-center gap-2 mt-4">
                    <Button variant="outline-danger" size="sm"
                      disabled={filters.page === 0}
                      onClick={() => dispatch(setFilters({ page: filters.page - 1 }))}>
                      ← Previous
                    </Button>
                    <span className="align-self-center text-muted">
                      Page {filters.page + 1} of {totalPages}
                    </span>
                    <Button variant="outline-danger" size="sm"
                      disabled={filters.page >= totalPages - 1}
                      onClick={() => dispatch(setFilters({ page: filters.page + 1 }))}>
                      Next →
                    </Button>
                  </div>
                )}
              </>
            )}
          </Col>

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