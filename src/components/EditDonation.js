import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './EditDonation.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const EditDonation = () => {
  const { donationId } = useParams();
  const navigate = useNavigate();

  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch existing donation data and pre-fill form
  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/donations/${donationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = response.data;
        setItemName(d.itemName || '');
        setDescription(d.description || '');
        setCategory(d.category || '');
        setLocation(d.location || '');
        setExistingImageUrl(d.imageUrl || '');
      } catch (error) {
        console.error('Error fetching donation:', error);
        setIsSuccess(false);
        setMessage('Failed to load donation details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDonation();
  }, [donationId]);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setIsSuccess(false);
      setMessage('No token found. Please log in again.');
      return;
    }

    const formData = new FormData();
    formData.append('itemName', itemName);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('location', location);
    if (image) {
      formData.append('image', image);
    }

    try {
      await axios.put(`${API_URL}/api/donations/${donationId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setIsSuccess(true);
      setMessage('Donation updated successfully!');
      setTimeout(() => navigate('/mydonations'), 1500);
    } catch (error) {
      console.error('Error updating donation:', error);
      setIsSuccess(false);
      setMessage(error.response?.data?.msg || 'Error updating donation. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="edit-donation-container">
        <p className="edit-donation-loading">Loading donation details...</p>
      </div>
    );
  }

  return (
    <div className="edit-donation-container">
      {/* Header row */}
      <div className="edit-donation-header-row">
        <h2 className="edit-donation-header">Edit Donation</h2>
        <button
          className="edit-donation-back-btn"
          onClick={() => navigate('/mydonations')}
        >
          ← Back to My Donations
        </button>
      </div>

      <form className="edit-donation-form" onSubmit={handleSubmit}>
        <input
          className="edit-donation-input"
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />
        <input
          className="edit-donation-input"
          type="text"
          placeholder="Item Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          className="edit-donation-input"
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          className="edit-donation-input"
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        {/* Show existing image preview */}
        {existingImageUrl && !image && (
          <div className="edit-donation-image-preview">
            <p className="edit-donation-file-label">Current Image</p>
            <img
              src={existingImageUrl}
              alt="Current donation"
              className="edit-donation-preview-img"
            />
          </div>
        )}

        <div>
          <label className="edit-donation-file-label">
            {existingImageUrl ? 'Replace Image (optional)' : 'Upload Image (optional)'}
          </label>
          <input
            className="edit-donation-file-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        {/* New image preview */}
        {image && (
          <div className="edit-donation-image-preview">
            <p className="edit-donation-file-label">New Image Preview</p>
            <img
              src={URL.createObjectURL(image)}
              alt="New donation preview"
              className="edit-donation-preview-img"
            />
          </div>
        )}

        <button className="edit-donation-submit-btn" type="submit">
          Save Changes
        </button>

        {message && (
          <p className={isSuccess ? 'edit-donation-message-success' : 'edit-donation-message-error'}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default EditDonation;