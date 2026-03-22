import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Spinner, Modal } from 'react-bootstrap';
import { FaTrash, FaPlus, FaExpand } from 'react-icons/fa';
import {
  getRestaurantPhotos,
  uploadRestaurantPhoto,
  deleteRestaurantPhoto
} from '../services/api';
import { useAuth } from '../context/AuthContext';

function RestaurantPhotos({ restaurantId, ownerId }) {
  const { user }                      = useAuth();
  const [photos, setPhotos]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [uploading, setUploading]     = useState(false);
  const [lightbox, setLightbox]       = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const isOwner = user && user.id === ownerId;

  useEffect(() => {
    fetchPhotos();
  }, [restaurantId]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await getRestaurantPhotos(restaurantId);
      setPhotos(res.data);
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const res = await uploadRestaurantPhoto(restaurantId, file);
        setPhotos(prev => [...prev, res.data]);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (photoId) => {
    try {
      await deleteRestaurantPhoto(restaurantId, photoId);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (loading) return (
    <div className="text-center py-3">
      <Spinner animation="border" size="sm" variant="danger" />
    </div>
  );

  return (
    <div>
      {/* Upload button — only for owner */}
      {isOwner && (
        <div className="mb-3">
          <label htmlFor="photo-upload">
            <Button
              as="span"
              variant="outline-danger"
              size="sm"
              style={{ cursor: 'pointer' }}
              disabled={uploading}
            >
              {uploading
                ? <><Spinner size="sm" className="me-1" />Uploading...</>
                : <><FaPlus className="me-1" />Add Photos</>}
            </Button>
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleUpload}
          />
          <span className="text-muted ms-2" style={{ fontSize: '0.8rem' }}>
            You can select multiple photos at once
          </span>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div
          className="text-center py-5 rounded"
          style={{ background: '#f8f9fa', border: '2px dashed #dee2e6' }}
        >
          <div style={{ fontSize: '2.5rem' }}>📷</div>
          <p className="text-muted mb-0">
            {isOwner
              ? 'No photos yet. Click Add Photos to upload.'
              : 'No photos available for this restaurant.'}
          </p>
        </div>
      ) : (
        <Row className="g-2">
          {photos.map((photo, index) => (
            <Col key={photo.id} xs={6} md={4} lg={3}>
              <div
                className="position-relative"
                style={{ paddingTop: '75%', overflow: 'hidden', borderRadius: 8 }}
              >
                <img
                  src={`${API_URL}${photo.photo_url}`}
                  alt={`Restaurant photo ${index + 1}`}
                  style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onClick={() => setLightbox(photo)}
                  onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                  onMouseOut={e => e.target.style.transform = 'scale(1)'}
                />
                {/* Overlay buttons */}
                <div
                  className="position-absolute d-flex gap-1"
                  style={{ top: 6, right: 6 }}
                >
                  <button
                    onClick={() => setLightbox(photo)}
                    style={{
                      background: 'rgba(0,0,0,0.5)', border: 'none',
                      borderRadius: 4, color: 'white', padding: '3px 6px',
                      cursor: 'pointer', fontSize: '0.75rem'
                    }}
                  >
                    <FaExpand />
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(photo.id)}
                      style={{
                        background: 'rgba(211,35,35,0.8)', border: 'none',
                        borderRadius: 4, color: 'white', padding: '3px 6px',
                        cursor: 'pointer', fontSize: '0.75rem'
                      }}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* Photo count */}
      {photos.length > 0 && (
        <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.8rem' }}>
          {photos.length} photo{photos.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Lightbox Modal */}
      <Modal
        show={!!lightbox}
        onHide={() => setLightbox(null)}
        size="lg"
        centered
      >
        <Modal.Header closeButton style={{ border: 'none', padding: '8px 16px' }} />
        <Modal.Body className="p-0 text-center" style={{ background: '#000' }}>
          {lightbox && (
            <img
              src={`${API_URL}${lightbox.photo_url}`}
              alt="Restaurant"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default RestaurantPhotos;