import React, { useState, useEffect } from 'react';
import { Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import StarRating from './StarRating';
import { getRestaurantPhotos } from '../services/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Placeholder gradients based on cuisine type
const CUISINE_GRADIENTS = {
  'Italian':       'linear-gradient(135deg, #f5e6d3, #e8c49a)',
  'Mexican':       'linear-gradient(135deg, #ffeaa7, #fdcb6e)',
  'Japanese':      'linear-gradient(135deg, #fd79a8, #e84393)',
  'Chinese':       'linear-gradient(135deg, #ff7675, #d63031)',
  'Indian':        'linear-gradient(135deg, #fddb92, #d1a054)',
  'American':      'linear-gradient(135deg, #a8edea, #fed6e3)',
  'French':        'linear-gradient(135deg, #c3cfe2, #c3cfe2)',
  'Mediterranean': 'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
  'Korean':        'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
  'Thai':          'linear-gradient(135deg, #84fab0, #8fd3f4)',
  'default':       'linear-gradient(135deg, #f5f7fa, #c3cfe2)'
};

const CUISINE_EMOJIS = {
  'Italian':       '🍝',
  'Mexican':       '🌮',
  'Japanese':      '🍣',
  'Chinese':       '🥟',
  'Indian':        '🍛',
  'American':      '🍔',
  'French':        '🥐',
  'Mediterranean': '🥙',
  'Korean':        '🥩',
  'Thai':          '🍜',
  'default':       '🍽️'
};

function RestaurantCard({ restaurant, isFavorite, onToggleFavorite, showFavorite = true }) {
  const navigate               = useNavigate();
  const [thumbnail, setThumbnail] = useState(null);
  const [imgError, setImgError]   = useState(false);

  const gradient = CUISINE_GRADIENTS[restaurant.cuisine_type] || CUISINE_GRADIENTS['default'];
  const emoji    = CUISINE_EMOJIS[restaurant.cuisine_type]    || CUISINE_EMOJIS['default'];

  // Fetch first photo as thumbnail
  useEffect(() => {
    let cancelled = false;
    getRestaurantPhotos(restaurant.id)
      .then(res => {
        if (!cancelled && res.data.length > 0) {
          setThumbnail(res.data[0].photo_url);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [restaurant.id]);

  const handleCardClick = () => navigate(`/restaurants/${restaurant.id}`);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(restaurant.id);
  };

  return (
    <Card className="restaurant-card h-100" onClick={handleCardClick}>

      {/* Thumbnail */}
      <div style={{
        height: '180px',
        borderRadius: '12px 12px 0 0',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {thumbnail && !imgError ? (
          <img
            src={`${API_URL}${thumbnail}`}
            alt={restaurant.name}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.target.style.transform = 'scale(1)'}
          />
        ) : (
          // Colourful fallback based on cuisine
          <div style={{
            width: '100%',
            height: '100%',
            background: gradient,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}>
            <span style={{ fontSize: '3rem' }}>{emoji}</span>
            <span style={{
              fontSize: '0.75rem',
              color: '#666',
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: 'uppercase'
            }}>
              {restaurant.cuisine_type || 'Restaurant'}
            </span>
          </div>
        )}

        {/* Claimed badge overlay */}
        {restaurant.is_claimed && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: 'rgba(45,106,79,0.9)',
            color: 'white', borderRadius: 20,
            padding: '2px 8px', fontSize: '0.72rem',
            fontWeight: 600
          }}>
            ✓ Claimed
          </div>
        )}
      </div>

      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <Card.Title className="mb-1" style={{ fontSize: '1.05rem' }}>
            {restaurant.name}
          </Card.Title>
          {showFavorite && (
            <button className="favorite-btn" onClick={handleFavoriteClick}>
              {isFavorite
                ? <FaHeart color="#d32323" />
                : <FaRegHeart color="#aaa" />}
            </button>
          )}
        </div>

        <div className="mb-2">
          <StarRating rating={restaurant.avg_rating || 0} />
          <span className="text-muted ms-1" style={{ fontSize: '0.85rem' }}>
            ({restaurant.review_count || 0} reviews)
          </span>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
          {restaurant.cuisine_type && (
            <span className="cuisine-badge">{restaurant.cuisine_type}</span>
          )}
          {restaurant.price_tier && (
            <span className="price-tier">{restaurant.price_tier}</span>
          )}
        </div>

        {restaurant.city && (
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
            📍 {restaurant.city}{restaurant.state ? `, ${restaurant.state}` : ''}
          </p>
        )}
      </Card.Body>
    </Card>
  );
}

export default RestaurantCard;