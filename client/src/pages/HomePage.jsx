import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import '../styles/HomePage.css';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/posts')
      .then((res) => {
        setPosts(res.data.posts || []);
      })
      .catch((err) => {
        console.error('Failed to load posts:', err);
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="hero-eyebrow">Welcome to</div>
        <h1 className="hero-heading">
          <span>Your Minimal</span>
          <span className="hero-heading-strong">BlogIt .</span>
        </h1>
        <p className="hero-subtitle">
          A calm place on the internet where you can write, publish, and share your creativity.
        </p>
      </section>

      <section className="hero-feed">
        <div className="card card-muted">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem' }}>Latest posts</h2>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '500', color: 'var(--fg-muted)', letterSpacing: '0.01em', lineHeight: '1.5' }}>
                Fresh stories from writers across BlogIt.
              </p>
            </div>
            <div className="badge">{posts.length} published</div>
          </div>
        </div>

        {loading ? (
          <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Loading posts…</p>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <h3>No posts yet</h3>
            <p>Be the first to publish an amazing story on BlogIt.</p>
          </div>
        ) : (
          <div className="post-list">
            {posts.map((post) => (
              <div key={post._id} className="post-card">
                <div className="post-card-content">
                  <Link to={`/posts/${post._id}`} className="post-link">
                    <h2 className="post-title">{post.title}</h2>
                    {post.content && (
                      <p className="post-excerpt">{post.content.substring(0, 150)}...</p>
                    )}
                  </Link>
                </div>
                <div className="post-meta">
                  {post.author && post.author._id && (
                    <div className="post-meta-author">
                      <div className="post-meta-avatar">{post.author.username?.charAt(0).toUpperCase()}</div>
                      <Link to={`/profile/${post.author._id}`} className="author-link">
                        {post.author.username}
                      </Link>
                    </div>
                  )}
                  <span className="post-meta-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default HomePage;
