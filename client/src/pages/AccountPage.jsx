import React, { useEffect, useState } from 'react';
import api from '../api';

const AccountPage = ({ user, setUser }) => {
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [theme, setTheme] = useState('light');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
      setTheme(user.theme || 'light');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      const res = await api.put('/auth/me', { bio, avatarUrl, theme });
      setUser(res.data.user);
      document.body.setAttribute('data-theme', res.data.user.theme || 'light');
      localStorage.setItem('blogit_theme', res.data.user.theme || 'light');
      setStatus('Saved');
    } catch (err) {
      setStatus('Could not save changes');
    }
  };

  if (!user) {
    return (
      <main style={{ maxWidth: 660, margin: '0 auto' }}>
        <div className="card">
          <h2>Access Denied</h2>
          <p>You need to be logged in to manage your account settings.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 660, margin: '0 auto' }}>
      <div className="card card-muted">
        <h1 style={{ marginTop: 0, marginBottom: '0.6rem' }}>Account settings</h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--fg-muted)' }}>
          Customize your account and preferences
        </p>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <form onSubmit={handleSave}>
          <h3 style={{ marginTop: 0 }}>Profile</h3>

          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Bio</label>
          <textarea
            style={{
              width: '100%',
              minHeight: 80,
              padding: '0.5rem',
              border: '1px solid var(--border)',
              borderRadius: 2,
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              color: 'var(--fg)',
              backgroundColor: 'var(--bg)',
              resize: 'vertical'
            }}
            value={bio}
            onChange={(e) => setBio(e.target.value.substring(0, 200))}
            placeholder="Tell other users about yourself"
            maxLength={200}
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)', margin: '0.2rem 0 0.7rem 0' }}>
            {bio.length}/200 characters
          </p>

          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.2rem', marginTop: '0.5rem' }}>
            Avatar URL
          </label>
          <input
            className="input"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
          />

          <h3 style={{ marginTop: '1rem' }}>Appearance</h3>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Theme</label>
          <select
            className="input"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>

          {status && (
            <p
              style={{
                marginTop: '0.6rem',
                fontSize: '0.9rem',
                color: status.includes('Saved') ? '#16a34a' : '#b91c1c'
              }}
            >
              {status}
            </p>
          )}

          <button
            className="button button-primary"
            type="submit"
            style={{ marginTop: '1rem' }}
          >
            Save changes
          </button>
        </form>
      </div>
    </main>
  );
};

export default AccountPage;
