import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const DonationDetails = ({ currentUserId, setDonationId }) => {
  const { donationId } = useParams();
  const [donation, setDonation] = useState(null);
  const [initialMessage, setInitialMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [chatGroupId, setChatGroupId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setDonationId(donationId);

    const fetchDonationDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/donations/${donationId}`);
        console.log("📦 Donation data:", response.data);
        
        if (response.data.imageUrl) {
          console.log("✅ Image URL found:", response.data.imageUrl);
        } else if (response.data.image) {
          console.warn("⚠️ Only image key found, no imageUrl:", response.data.image);
        }
        
        setDonation(response.data);
        setError("");
      } catch (error) {
        console.error("❌ Error fetching donation data:", error);
        setError("Failed to load donation details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDonationDetails();
  }, [donationId, setDonationId]);

  // Check if chat already exists for this donation
  useEffect(() => {
    const checkExistingChat = async () => {
      if (!donation?.donor?._id || !currentUserId) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/chats/existence/${currentUserId}/${donation.donor._id}/${donationId}`
        );
        
        if (response.data.exists) {
          console.log("💬 Chat already exists");
          // Optionally, you could fetch the chatGroupId here if your API returns it
        }
      } catch (error) {
        console.error("Error checking chat existence:", error);
      }
    };

    checkExistingChat();
  }, [donation, currentUserId, donationId]);

  const handleSendMessage = async () => {
    if (!initialMessage.trim()) {
      setError("Please enter a message before sending.");
      return;
    }

    try {
      const donorId = donation?.donor?._id;
      if (!currentUserId || !donorId) {
        console.error("❌ Missing currentUserId or donorId");
        setError("Unable to send message due to missing user information.");
        return;
      }

      console.log("📤 Initiating chat...");

      // Create chat group and send initial message
      const response = await axios.post('http://localhost:5000/api/chats/initiate', {
        doneeId: currentUserId,
        donorId,
        donationId,
        itemName: donation.itemName,
        initialMessage,
      });

      console.log("✅ Chat initiated:", response.data);

      setMessageSent(true);
      setInitialMessage("");
      setChatGroupId(response.data.chatGroupId);

      // Navigate to chat using the chatGroupId (NOT donorId/donationId)
      navigate(`/chat/${response.data.chatGroupId}`);
    } catch (error) {
      console.error("❌ Error initiating chat:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to send message. Please try again.");
    }
  };

  const handleGoToChat = () => {
    if (chatGroupId) {
      navigate(`/chat/${chatGroupId}`);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        Loading donation details...
      </div>
    );
  }

  if (error && !donation) {
    return (
      <div style={{ color: 'red', textAlign: 'center', padding: '40px' }}>
        Error: {error}
      </div>
    );
  }

  if (!donation) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        No donation found.
      </div>
    );
  }

  const donor = donation.donor || {};

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h2>{donation.itemName}</h2>

      {donation.imageUrl ? (
        <div style={{ marginBottom: '20px' }}>
          <img 
            src={donation.imageUrl} 
            alt={donation.itemName} 
            style={{ 
              width: '100%', 
              maxWidth: '400px', 
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onError={(e) => {
              console.error("❌ Image failed to load:", donation.imageUrl);
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div style="width: 100%; max-width: 400px; height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #666; border-radius: 8px;">Image failed to load</div>';
            }}
            onLoad={() => console.log("✅ Image loaded successfully")}
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
          color: '#666',
          marginBottom: '20px',
          borderRadius: '8px'
        }}>
          No image available
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <p><strong>Description:</strong> {donation.description}</p>
        <p><strong>Category:</strong> {donation.category}</p>
        <p><strong>Location:</strong> {donation.location}</p>
        <p><strong>Status:</strong> <span style={{ 
          color: donation.status === 'available' ? 'green' : 'orange',
          fontWeight: 'bold'
        }}>{donation.status}</span></p>
      </div>
      
      <div style={{ 
        backgroundColor: '#f9f9f9', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>Donor Information</h3>
        <p><strong>Name:</strong> {donor.name || 'Not provided'}</p>
        <p><strong>Email:</strong> {donor.email || 'Not provided'}</p>
      </div>

      {error && (
        <div style={{ 
          color: 'red', 
          padding: '10px', 
          backgroundColor: '#ffe6e6',
          borderRadius: '5px',
          marginBottom: '15px'
        }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>Contact Donor</h3>
        <textarea
          placeholder="Type your message..."
          value={initialMessage}
          onChange={(e) => setInitialMessage(e.target.value)}
          disabled={messageSent}
          style={{ 
            width: '100%', 
            minHeight: '100px', 
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            fontSize: '14px',
            fontFamily: 'inherit'
          }}
        />
        
        <button
          onClick={messageSent ? handleGoToChat : handleSendMessage}
          disabled={!messageSent && !initialMessage.trim()}
          style={{ 
            marginTop: '10px', 
            padding: '12px 24px',
            backgroundColor: messageSent ? '#4CAF50' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: (!messageSent && !initialMessage.trim()) ? 'not-allowed' : 'pointer',
            opacity: (!messageSent && !initialMessage.trim()) ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (messageSent || initialMessage.trim()) {
              e.target.style.opacity = '0.9';
            }
          }}
          onMouseOut={(e) => {
            e.target.style.opacity = '1';
          }}
        >
          {messageSent ? "✓ Go to Chat" : "Send Message"}
        </button>

        {messageSent && (
          <div style={{ 
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            borderRadius: '5px'
          }}>
            ✓ Message sent successfully! Redirecting to chat...
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationDetails;