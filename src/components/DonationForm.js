import React, { useState } from 'react';
import axios from 'axios';
import './DonationForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const DonationForm = () => {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    console.log("Client-side token:", token);
    if (!token) {
      console.error('No token found');
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
      const response = await axios.post(
        `${API_URL}/api/donations/donate`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Donation submitted:', response.data);
      setIsSuccess(true);
      setMessage('Donation submitted successfully!');
      setItemName('');
      setDescription('');
      setCategory('');
      setLocation('');
      setImage(null);
    } catch (error) {
      console.error('Error submitting donation:', error);
      setIsSuccess(false);
      setMessage(error.response?.data?.msg || 'Error submitting donation. Please try again.');
    }
  };

  return (
    <div className="donation-form-container">
      <h2 className="donation-form-header">Donate an Item</h2>

      <form className="donation-form" onSubmit={handleSubmit}>
        <input
          className="donation-form-input"
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />
        <input
          className="donation-form-input"
          type="text"
          placeholder="Item Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          className="donation-form-input"
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          className="donation-form-input"
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <div>
          <label className="donation-form-file-label">Upload Image (optional)</label>
          <input
            className="donation-form-file-input"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <button className="donation-form-submit-btn" type="submit">
          Submit Donation
        </button>

        {message && (
          <p className={isSuccess ? 'donation-form-message-success' : 'donation-form-message-error'}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default DonationForm;