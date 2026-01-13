import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './DonationList.css'; // Import the CSS file

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const DonationList = ({ currentUserId, userType }) => {
  const [donations, setDonations] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/donations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userType === 'donor') {
          const donorDonations = response.data.filter(
            donation => donation.donor._id === currentUserId
          );
          setDonations(donorDonations);
        } else {
          setDonations(response.data);
        }
      } catch (error) {
        console.error('Error fetching donations:', error);
        setError('Failed to fetch donations.');
      }
    };

    fetchDonations();
  }, [currentUserId, userType]);

  const handleDonationClick = (donationId) => {
    navigate(`/donation/${donationId}`);
  };

  return (
    <div className="donation-list-container">
      <h2 className="donation-list-header">
        {userType === 'donor' ? 'Your Donations' : 'Available Donations'}
      </h2>

      {error && <div className="error-message">{error}</div>}

      <ul className="donations-grid">
        {donations.length === 0 ? (
          <li className="empty-state">No donations found.</li>
        ) : (
          donations.map((donation) => (
            <li
              key={donation._id}
              className="donation-card"
              onClick={() => handleDonationClick(donation._id)}
            >
              <div className="donation-image-container">
                {donation.images && donation.images.length > 0 ? (
                  <img
                    src={donation.images[0]}
                    alt={donation.itemName}
                    className="donation-image"
                  />
                ) : (
                  <div className="donation-image-placeholder">📦</div>
                )}
              </div>
              <div className="donation-card-content">
                <h3 className="donation-item-name">{donation.itemName}</h3>
                <p className="donation-location">{donation.location}</p>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default DonationList;