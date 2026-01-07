import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const FriendRequests = () => {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [pendingRes, sentRes] = await Promise.all([
        api.get('/friends/pending'),
        api.get('/friends/sent')
      ]);
      setPendingRequests(pendingRes.data.requests);
      setSentRequests(sentRes.data.requests);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.post(`/friends/${requestId}/accept`);
      setPendingRequests(pendingRequests.filter(r => r._id !== requestId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.post(`/friends/${requestId}/reject`);
      setPendingRequests(pendingRequests.filter(r => r._id !== requestId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await api.delete(`/friends/${requestId}`);
      setSentRequests(sentRequests.filter(r => r._id !== requestId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request');
    }
  };

  if (loading) return <main style={{ maxWidth: 660, margin: '0 auto', marginTop: '2rem' }}><div className="card">Loading...</div></main>;

  return (
    <main style={{ maxWidth: 660, margin: '0 auto' }}>
      <div className="card card-muted">
        <h1 style={{ marginTop: 0, marginBottom: '0.6rem' }}>Friend requests</h1>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          <button
            className={activeTab === 'received' ? 'button button-primary' : 'button'}
            onClick={() => setActiveTab('received')}
          >
            Received ({pendingRequests.length})
          </button>
          <button
            className={activeTab === 'sent' ? 'button button-primary' : 'button'}
            onClick={() => setActiveTab('sent')}
          >
            Sent ({sentRequests.length})
          </button>
        </div>

        {activeTab === 'received' && (
          <div>
            {pendingRequests.length === 0 ? (
              <p style={{ color: 'var(--fg-muted)', textAlign: 'center', margin: '1rem 0' }}>No pending requests</p>
            ) : (
              pendingRequests.map(request => (
                <div key={request._id} style={{ padding: '0.8rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500, cursor: 'pointer', color: 'var(--accent)' }} onClick={() => navigate(`/profile/${request.sender._id}`)}>
                      {request.sender.username}
                    </p>
                    {request.sender.bio && <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--fg-muted)' }}>{request.sender.bio}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button
                      className="button button-primary"
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                      onClick={() => handleAcceptRequest(request._id)}
                    >
                      Accept
                    </button>
                    <button
                      className="button"
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                      onClick={() => handleRejectRequest(request._id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'sent' && (
          <div>
            {sentRequests.length === 0 ? (
              <p style={{ color: 'var(--fg-muted)', textAlign: 'center', margin: '1rem 0' }}>No sent requests</p>
            ) : (
              sentRequests.map(request => (
                <div key={request._id} style={{ padding: '0.8rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500, cursor: 'pointer', color: 'var(--accent)' }} onClick={() => navigate(`/profile/${request.recipient._id}`)}>
                      {request.recipient.username}
                    </p>
                    {request.recipient.bio && <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--fg-muted)' }}>{request.recipient.bio}</p>}
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--fg-muted)' }}>Pending</p>
                  </div>
                  <button
                    className="button"
                    style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                    onClick={() => handleCancelRequest(request._id)}
                  >
                    Cancel
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default FriendRequests;
