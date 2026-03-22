import React from 'react';

function StarRating({ rating, maxStars = 5, size = '1.2rem' }) {
  return (
    <span className="star-rating">
      {[...Array(maxStars)].map((_, i) => (
        <span
          key={i}
          className={`star ${i < Math.round(rating) ? 'filled' : ''}`}
          style={{ fontSize: size }}
        >
          ★
        </span>
      ))}
      <span
        className="ms-1 text-muted"
        style={{ fontSize: '0.9rem' }}
      >
        {rating > 0 ? rating.toFixed(1) : 'No ratings'}
      </span>
    </span>
  );
}

export default StarRating;