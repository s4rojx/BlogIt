import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const renderContent = (raw) => {
  const lines = raw.split('\n');
  return lines.map((line, idx) => {
    if (line.startsWith('## ')) {
      return (
        <h3 key={idx} style={{ marginTop: '1.1rem', marginBottom: '0.3rem' }}>
          {line.replace(/^##\s+/, '')}
        </h3>
      );
    }
    if (line.startsWith('# ')) {
      return (
        <h2 key={idx} style={{ marginTop: '1.3rem', marginBottom: '0.3rem' }}>
          {line.replace(/^#\s+/, '')}
        </h2>
      );
    }
    if (line.startsWith('> ')) {
      return (
        <blockquote
          key={idx}
          style={{
            margin: '0.6rem 0',
            padding: '0.4rem 0.8rem',
            borderLeft: '3px solid var(--border)',
            color: 'var(--fg-muted)',
            fontStyle: 'italic',
          }}
        >
          {line.replace(/^>\s+/, '')}
        </blockquote>
      );
    }

    let children = [];
    let buffer = '';
    let i = 0;
    while (i < line.length) {
      if (line[i] === '*' && line[i + 1] === '*') {
        if (buffer) {
          children.push(buffer);
          buffer = '';
        }
        const end = line.indexOf('**', i + 2);
        if (end !== -1) {
          const boldText = line.slice(i + 2, end);
          children.push(
            <strong key={`${idx}-b-${i}`}>{boldText}</strong>
          );
          i = end + 2;
          continue;
        }
      }
      if (line[i] === '*' && line[i + 1] !== '*') {
        if (buffer) {
          children.push(buffer);
          buffer = '';
        }
        const end = line.indexOf('*', i + 1);
        if (end !== -1) {
          const italicText = line.slice(i + 1, end);
          children.push(
            <em key={`${idx}-i-${i}`}>{italicText}</em>
          );
          i = end + 1;
          continue;
        }
      }
      buffer += line[i];
      i += 1;
    }
    if (buffer) {
      children.push(buffer);
    }

    return (
      <p key={idx} style={{ marginTop: '0.45rem', marginBottom: 0, lineHeight: 1.6 }}>
        {children}
      </p>
    );
  });
};

const PostDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/posts/${id}`)
      .then((res) => setPost(res.data.post))
      .catch(() => setError('Post not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main style={{ maxWidth: 660, margin: '0 auto' }}>
        <div className="card">
          <h2>Loading post…</h2>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main style={{ maxWidth: 660, margin: '0 auto' }}>
        <div className="card">
          <h2>Post Not Found</h2>
          <p>{error || 'The post you are looking for does not exist.'}</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 660, margin: '0 auto' }}>
      <div className="card">
        <h1 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{post.title}</h1>
        <div style={{ fontSize: '0.85rem', color: 'var(--fg-muted)', marginBottom: '1rem' }}>
          {post.author && <span>{post.author.username}</span>}
          {' — '}
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <div style={{ lineHeight: 1.6, color: 'var(--fg)' }}>
          {renderContent(post.content)}
        </div>
      </div>
    </main>
  );
};

export default PostDetailPage;
