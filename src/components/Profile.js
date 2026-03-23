// Profile.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Profile = ({ user }) => {
  const [profileData, setProfileData]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // Edit mode state
  const [editMode, setEditMode]         = useState(false);
  const [newName, setNewName]           = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editMessage, setEditMessage]   = useState('');
  const [editSuccess, setEditSuccess]   = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/users/${user.email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileData(response.data);
        setNewName(response.data.name || '');
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

  // ── Helpers ──────────────────────────────────────────────
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleEditToggle = () => {
    setEditMode((prev) => !prev);
    setEditMessage('');
    // Reset fields to current values when cancelling
    if (editMode) {
      setNewName(profileData?.name || '');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  // ── Save edits ────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setEditMessage('');

    if (newPassword && newPassword !== confirmPassword) {
      setEditSuccess(false);
      setEditMessage('Passwords do not match.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = { name: newName };
      if (newPassword) payload.password = newPassword;

      const response = await axios.put(
        `${API_URL}/api/users/${user.email}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfileData((prev) => ({ ...prev, name: response.data.name || newName }));
      setEditSuccess(true);
      setEditMessage('Profile updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setEditMode(false);
    } catch (err) {
      setEditSuccess(false);
      setEditMessage(err.response?.data?.msg || 'Failed to update profile.');
    }
  };

  // ── Delete account ────────────────────────────────────────
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/users/${user.email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Clear local storage and redirect to home/login
      localStorage.clear();
      navigate('/login');
    } catch (err) {
      setEditSuccess(false);
      setEditMessage(err.response?.data?.msg || 'Failed to delete account.');
    }
  };

  // ── Render ────────────────────────────────────────────────
  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (error)   return <div className="profile-error">{error}</div>;

  return (
    <div className="profile-container">

      {/* Header row */}
      <div className="profile-header-row">
        <h2 className="profile-header">User Profile</h2>
        {profileData && (
          <button className="profile-edit-toggle-btn" onClick={handleEditToggle}>
            {editMode ? '✕ Cancel' : '✏️ Edit Profile'}
          </button>
        )}
      </div>

      {profileData ? (
        <>
          {/* Avatar */}
          <div className="profile-avatar">
            {getInitials(profileData.name)}
          </div>

          {/* ── VIEW MODE ── */}
          {!editMode && (
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
          )}

          {/* ── EDIT MODE ── */}
          {editMode && (
            <form className="profile-edit-form" onSubmit={handleSave}>
              {/* Name */}
              <div>
                <label className="profile-edit-section-label">Name</label>
                <input
                  className="profile-edit-input"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>

              {/* New password */}
              <div>
                <label className="profile-edit-section-label">New Password</label>
                <input
                  className="profile-edit-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                />
              </div>

              {/* Confirm password */}
              <div>
                <label className="profile-edit-section-label">Confirm New Password</label>
                <input
                  className="profile-edit-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                />
              </div>

              {/* Save / Cancel */}
              <div className="profile-edit-actions">
                <button className="profile-save-btn" type="submit">
                  Save Changes
                </button>
                <button
                  className="profile-cancel-btn"
                  type="button"
                  onClick={handleEditToggle}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Feedback message */}
          {editMessage && (
            <p className={editSuccess ? 'profile-message-success' : 'profile-message-error'}>
              {editMessage}
            </p>
          )}

          {/* Divider + Delete */}
          <hr className="profile-divider" />
          <button className="profile-delete-btn" onClick={handleDeleteAccount}>
            🗑️ Delete Account
          </button>
        </>
      ) : (
        <p className="profile-empty">No profile data available.</p>
      )}
    </div>
  );
};

export default Profile;