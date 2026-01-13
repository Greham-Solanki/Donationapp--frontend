import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MyDonationDetails = ({ currentUserId, setDonationId }) => {
  const { donationId } = useParams();
  const [donation, setDonation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set the current donationId in the parent state
    setDonationId(donationId);

    // Fetch donation details from the server
    const fetchDonationDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/donations/${donationId}`);
        console.log("Donation data:", response.data);
        
        // Check if imageUrl exists in response
        if (response.data.imageUrl) {
          console.log("Image URL:", response.data.imageUrl);
        } else {
          console.warn("No imageUrl in response. Check backend code.");
        }
        
        setDonation(response.data);
        setError("");
      } catch (error) {
        console.error("Error fetching donation data:", error);
        if (error.response) {
          // Server responded with error
          setError(`Failed to load donation details: ${error.response.data.message || error.response.statusText}`);
        } else if (error.request) {
          // Request made but no response
          setError("Failed to load donation details. Server not responding.");
        } else {
          // Something else happened
          setError("Failed to load donation details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDonationDetails();
  }, [donationId, setDonationId]);

  if (loading) return <div>Loading donation details...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!donation) return <div>No donation found.</div>;

  return (
    <div>
      <h2>{donation.itemName}</h2>
      
      {/* FIXED: Use imageUrl instead of image */}
      {donation.imageUrl ? (
        <div>
          <img
            src={donation.imageUrl}
            alt={donation.itemName}
            style={{ width: '100%', maxWidth: '400px' }}
            onError={(e) => {
              console.error("Image failed to load:", donation.imageUrl);
              e.target.style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div style={{ 
          width: '100%', 
          maxWidth: '400px', 
          height: '200px', 
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666'
        }}>
          No image available
        </div>
      )}

      <p><strong>Description:</strong> {donation.description}</p>
      <p><strong>Category:</strong> {donation.category}</p>
      <p><strong>Location:</strong> {donation.location}</p>
      <p><strong>Status:</strong> {donation.status}</p>
  );
};

export default MyDonationDetails;