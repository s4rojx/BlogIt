import React, { useState, useEffect } from 'react';
import api from '../api';

const DashboardPage = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    avatarUrl: '',
    avatarFile: null,
    location: '',
    website: '',
    profession: '',
    theme: 'light'
  });

  const [savedMessage, setSavedMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        location: user.location || '',
        website: user.website || '',
        profession: user.profession || '',
        theme: user.theme || 'light'
      });
      setAvatarPreview(user.avatarUrl || '');
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatarFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSavedMessage('');

    try {
      // If a new avatar file was selected, use the preview (data URL); otherwise use existing URL
      const updateData = {
        bio: formData.bio,
        avatarUrl: avatarPreview || formData.avatarUrl,
        location: formData.location,
        website: formData.website,
        profession: formData.profession,
        theme: formData.theme
      };

      const response = await api.put('/auth/me', updateData);
      setUser(response.data.user);
      // Reset avatar file after save
      setFormData(prev => ({ ...prev, avatarFile: null }));
      setSavedMessage('Profile updated successfully!');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.details 
        ? err.response.data.details.map(d => d.message).join(', ')
        : err.response?.data?.message || 'Failed to update profile';
      setSavedMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 660, margin: '0 auto' }}>
      <div className="card card-muted">
        <h1 style={{ marginTop: 0, marginBottom: '0.6rem' }}>Edit profile</h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--fg-muted)' }}>
          Update your profile information
        </p>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <form onSubmit={handleSaveProfile}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
            Username
          </label>
          <input
            className="input"
            type="text"
            value={formData.username}
            disabled
            style={{ opacity: 0.6 }}
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', margin: '0.2rem 0 0.7rem 0' }}>
            Cannot be changed
          </p>

          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
            Email
          </label>
          <input
            className="input"
            type="email"
            value={formData.email}
            disabled
            style={{ opacity: 0.6 }}
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', margin: '0.2rem 0 0.7rem 0' }}>
            Cannot be changed
          </p>

          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.2rem', marginTop: '0.5rem' }}>
            Bio
          </label>
          <textarea
            style={{
              width: '100%',
              minHeight: 100,
              padding: '0.5rem',
              border: '1px solid var(--border)',
              borderRadius: 2,
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              color: 'var(--fg)',
              backgroundColor: 'var(--bg)',
              resize: 'vertical'
            }}
            value={formData.bio}
            onChange={handleInputChange}
            name="bio"
            placeholder="Tell us about yourself"
            maxLength="500"
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', margin: '0.2rem 0 0.7rem 0' }}>
            {formData.bio.length}/500
          </p>

          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
            Location
          </label>
          <input
            className="input"
            type="text"
            value={formData.location}
            onChange={handleInputChange}
            name="location"
            placeholder="e.g., San Francisco, CA"
            maxLength="50"
          />

          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.2rem', marginTop: '0.7rem' }}>
            Website
          </label>
          <input
            className="input"
            type="url"
            value={formData.website}
            onChange={handleInputChange}
            name="website"
            placeholder="https://example.com"
            maxLength="100"
          />

          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.2rem', marginTop: '0.7rem' }}>
            Profession
          </label>
          <input
            className="input"
            type="text"
            value={formData.profession}
            onChange={handleInputChange}
            name="profession"
            placeholder="e.g., Software Engineer"
            maxLength="50"
          />

          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.2rem', marginTop: '0.7rem' }}>
            Profile Picture
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '2px',
              backgroundColor: 'var(--bg)',
              color: 'var(--fg)',
              marginBottom: '0.75rem',
              cursor: 'pointer'
            }}
          />
          {avatarPreview && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', margin: '0.3rem 0' }}>
                Preview:
              </p>
              <img
                src={avatarPreview}
                alt="Avatar preview"
                style={{
                  maxWidth: '120px',
                  height: '120px',
                  objectFit: 'cover',
                  border: '1px solid var(--border)',
                  borderRadius: '2px'
                }}
              />
            </div>
          )}

          {savedMessage && (
            <div
              style={{
                marginTop: '0.6rem',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                backgroundColor: savedMessage.includes('successfully') ? '#dbeafe' : '#fee2e2',
                color: savedMessage.includes('successfully') ? '#1e40af' : '#7f1d1d',
                border: `1px solid ${savedMessage.includes('successfully') ? '#bfdbfe' : '#fecaca'}`
              }}
            >
              {savedMessage}
            </div>
          )}

          <button
            className="button button-primary"
            type="submit"
            style={{ marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default DashboardPage;
