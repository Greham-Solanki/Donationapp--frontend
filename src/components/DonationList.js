import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './DonationList.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const DonationList = ({ currentUserId, userType }) => {
  const [donations, setDonations] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/donations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("📦 Fetched donations:", response.data);

        if (userType === 'donor') {
          const donorDonations = response.data.filter(
            donation => donation.donor._id === currentUserId
          );
          setDonations(donorDonations);
        } else {
          setDonations(response.data);
        }
      } catch (error) {
        console.error('❌ Error fetching donations:', error);
        setError('Failed to fetch donations.');
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [currentUserId, userType]);

  const handleDonationClick = (donationId) => {
    navigate(`/donation/${donationId}`);
  };

  const handleImageError = (e) => {
    console.error("❌ Image failed to load");
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  const handleImageLoad = (e, itemName) => {
    console.log(`✅ Image loaded for: ${itemName}`);
    e.target.nextSibling.style.display = 'none';
  };

  if (loading) {
    return (
      <div className="donation-list-container">
        <div className="loading-state">Loading donations...</div>
      </div>
    );
  }

  return (
    <div className="donation-list-container">
      <h2 className="donation-list-header">
        {userType === 'donor' ? 'Your Donations' : 'Available Donations'}
      </h2>

      {error && <div className="error-message">{error}</div>}

      <ul className="donations-grid">
        {donations.length === 0 ? (
          <li className="empty-state">
            {userType === 'donor' 
              ? 'You haven\'t posted any donations yet.' 
              : 'No donations available at the moment.'}
          </li>
        ) : (
          donations.map((donation) => (
            <li
              key={donation._id}
              className="donation-card"
              onClick={() => handleDonationClick(donation._id)}
            >
              <div className="donation-image-container">
                {/* Status badge */}
                {donation.status && (
                  <div className={`donation-status ${donation.status}`}>
                    {donation.status}
                  </div>
                )}
                
                {/* Actual image from imageUrl */}
                {donation.imageUrl ? (
                  <>
                    <img
                      src={donation.imageUrl}
                      alt={donation.itemName}
                      className="donation-image"
                      onError={handleImageError}
                      onLoad={(e) => handleImageLoad(e, donation.itemName)}
                    />
                    <div className="donation-image-placeholder" style={{ display: 'none' }}>
                      📦
                    </div>
                  </>
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