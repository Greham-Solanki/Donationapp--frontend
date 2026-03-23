// Profile.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Profile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Profile = ({ user }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/users/${user.email}`);
        setProfileData(response.data);
      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-error">{error}</div>;
  }

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="profile-container">
      <h2 className="profile-header">User Profile</h2>

      {profileData ? (
        <>
          {/* Avatar with initials */}
          <div className="profile-avatar">
            {getInitials(profileData.name)}
          </div>

          {/* Info rows */}
          <div className="profile-info-card">
            <div className="profile-info-row">
              <span className="profile-info-label">Name</span>
              <span className="profile-info-value">{profileData.name}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Email</span>
              <span className="profile-info-value">{profileData.email}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">User Type</span>
              <span className={`profile-badge ${profileData.userType}`}>
                {profileData.userType}
              </span>
            </div>
          </div>
        </>
      ) : (
        <p className="profile-empty">No profile data available.</p>
      )}
    </div>
  );
};

export default Profile;