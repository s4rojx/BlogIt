import React, { useState } from 'react';
import api from '../api';

const RegisterPage = ({ onAuthSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { username, email, password });
      onAuthSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 460, margin: '0 auto' }}>
      <div className="card card-muted">
        <h1 style={{ marginTop: 0, marginBottom: '0.6rem' }}>Create a writer account</h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--fg-muted)' }}>
          Your words, your space. Publish to the open feed with one click.
        </p>
      </div>
      <div className="card" style={{ marginTop: '1rem' }}>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Username</label>
          <input
            className="input"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label
            style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.2rem', marginTop: '0.7rem' }}
          >
            Email
          </label>
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label
            style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.2rem', marginTop: '0.7rem' }}
          >
            Password
          </label>
          <input
            className="input"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p style={{ color: '#b91c1c', fontSize: '0.85rem', marginTop: '0.6rem' }}>{error}</p>
          )}

          <button
            className="button button-primary"
            type="submit"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default RegisterPage;
