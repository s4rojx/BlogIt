import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const NewPostPage = ({ user }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!user) {
    return (
      <main style={{ maxWidth: 660, margin: '0 auto' }}>
        <div className="card">
          <h2>Access Denied</h2>
          <p>You need to be logged in to create a post. Please log in first.</p>
        </div>
      </main>
    );
  }

  const applyFormat = (command) => {
    let syntaxBefore = '';
    let syntaxAfter = '';

    if (command === 'bold') {
      syntaxBefore = '**';
      syntaxAfter = '**';
    } else if (command === 'italic') {
      syntaxBefore = '*';
      syntaxAfter = '*';
    } else if (command === 'h1') {
      syntaxBefore = '# ';
    } else if (command === 'h2') {
      syntaxBefore = '## ';
    } else if (command === 'quote') {
      syntaxBefore = '> ';
    }

    const textarea = document.getElementById('editor-textarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);

    const before = content.slice(0, start);
    const after = content.slice(end);

    const nextContent = `${before}${syntaxBefore}${selected}${syntaxAfter}${after}`;
    setContent(nextContent);

    setTimeout(() => {
      textarea.focus();
      const cursorPos = start + syntaxBefore.length + selected.length + syntaxAfter.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/posts', { title, content, isPublished: true });
      navigate(`/posts/${res.data.post._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not publish post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 660, margin: '0 auto' }}>
      <div className="card card-muted">
        <h1 style={{ marginTop: 0, marginBottom: '0.6rem' }}>New post</h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--fg-muted)' }}>
          Share your thoughts with your followers
        </p>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Title</label>
          <input
            className="input"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
          />

          <label
            style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.2rem', marginTop: '0.7rem' }}
          >
            Content
          </label>
          <textarea
            style={{
              width: '100%',
              minHeight: 280,
              padding: '0.5rem',
              border: '1px solid var(--border)',
              borderRadius: 2,
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              color: 'var(--fg)',
              backgroundColor: 'var(--bg)',
              resize: 'vertical'
            }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post..."
            required
          />

          {error && (
            <p style={{ color: '#b91c1c', fontSize: '0.85rem', marginTop: '0.6rem' }}>{error}</p>
          )}

          <button
            className="button button-primary"
            type="submit"
            style={{ marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Publishing…' : 'Publish'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default NewPostPage;
