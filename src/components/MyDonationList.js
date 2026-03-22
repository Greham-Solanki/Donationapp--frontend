import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MyDonationList.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MyDonationList = () => {
  const [donations, setDonations] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const donorId = localStorage.getItem('donorId');

  useEffect(() => {
    console.log("Retrieved donorId:", donorId);
    const fetchDonations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/donations/donor/${donorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDonations(response.data);
      } catch (error) {
        console.error('Error fetching donations:', error);
        setError('Failed to fetch donations.');
      }
    };

    fetchDonations();
  }, [donorId]);

  const handleDonationClick = (donationId) => {
    navigate(`/mydonationdetails/${donationId}`);
  };

  const handleEdit = (e, donationId) => {
    e.stopPropagation(); // Prevent card click from firing
    navigate(`/editdonation/${donationId}`);
  };

  const handleDelete = async (e, donationId) => {
    e.stopPropagation(); // Prevent card click from firing
    if (!window.confirm('Are you sure you want to delete this donation?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/donations/${donationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonations((prev) => prev.filter((d) => d._id !== donationId));
    } catch (error) {
      console.error('Error deleting donation:', error);
      setError('Failed to delete donation.');
    }
  };

  return (
    <div className="my-donation-list-container">
      {/* Header row with title and Add button */}
      <div className="my-donation-list-header-row">
        <h2 className="my-donation-list-header">My Donations</h2>
        <button
          className="my-donation-list-add-btn"
          onClick={() => navigate('/adddonation')}
        >
          + Add New Donation
        </button>
      </div>

      {error && <p className="my-donation-list-error-message">{error}</p>}

      <ul className="my-donation-list-grid">
        {donations.length === 0 ? (
          <li className="my-donation-list-empty-state">
            You haven't added any donations yet.
          </li>
        ) : (
          donations.map((donation) => (
            <li
              key={donation._id}
              className="my-donation-list-card"
              onClick={() => handleDonationClick(donation._id)}
            >
              {/* Image */}
              <div className="my-donation-list-image-container">
                {donation.imageUrl ? (
                  <img
                    src={donation.imageUrl}
                    alt={donation.itemName}
                    className="my-donation-list-image"
                  />
                ) : (
                  <div className="my-donation-list-image-placeholder">🎁</div>
                )}

                {/* Status badge */}
                {donation.status && (
                  <span className={`my-donation-list-status ${donation.status}`}>
                    {donation.status}
                  </span>
                )}
              </div>

              {/* Card content */}
              <div className="my-donation-list-card-content">
                <p className="my-donation-list-item-name">{donation.itemName}</p>
                <p className="my-donation-list-location">{donation.location}</p>

                {/* Edit / Delete buttons */}
                <div className="my-donation-list-card-actions">
                  <button
                    className="my-donation-list-edit-btn"
                    onClick={(e) => handleEdit(e, donation._id)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="my-donation-list-delete-btn"
                    onClick={(e) => handleDelete(e, donation._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default MyDonationList;