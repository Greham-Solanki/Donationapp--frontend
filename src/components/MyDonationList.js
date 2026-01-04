import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MyDonationList = () => {
  const [donations, setDonations] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const donorId = localStorage.getItem('donorId'); // Retrieve donorId from local storage

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

  return (
    <div>
      <h2>My Donations</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {donations.map((donation) => (
  <li key={donation._id}>
    {donation.imageUrl && (
      <img 
        src={donation.imageUrl} 
        alt={donation.itemName}
        style={{width: '50px', height: '50px', objectFit: 'cover'}}
      />
    )}
    <Link to={`/mydonationdetails/${donation._id}`}>
      {donation.itemName}
    </Link>
    {' - '}
    <span>{donation.location}</span>
  </li>
))}
      </ul>
    </div>
  );
};

export default MyDonationList;
