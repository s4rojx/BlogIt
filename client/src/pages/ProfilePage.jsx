import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const ProfilePage = ({ currentUser }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [friendStatus, setFriendStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const [showFriends, setShowFriends] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      setUser(response.data.user);
      setFriendStatus(response.data.friendStatus);
      setFriends(response.data.user.friends || []);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    try {
      const response = await api.post('/friends/send', { recipientId: userId });
      setFriendStatus('request_sent');
      alert('Friend request sent!');
    } catch (err) {
      console.error('Friend request error:', err);
      alert(err.response?.data?.message || 'Failed to send friend request');
    }
  };

  const cancelFriendRequest = async () => {
    try {
      const requests = await api.get('/friends/sent');
      const request = requests.data.requests.find(r => r.recipient._id === userId);
      if (request) {
        await api.delete(`/friends/${request._id}`);
        setFriendStatus(null);
      }
    } catch (err) {
      console.error('Failed to cancel request:', err);
    }
  };

  const startChat = () => {
    navigate(`/chat/${userId}`);
  };

  if (loading) return <main style={{ maxWidth: 660, margin: '0 auto', marginTop: '2rem' }}><div className="card">Loading...</div></main>;
  if (!user) return <main style={{ maxWidth: 660, margin: '0 auto', marginTop: '2rem' }}><div className="card">User not found</div></main>;

  const isOwnProfile = currentUser && (currentUser._id === userId || currentUser.id === userId);

  return (
    <main style={{ maxWidth: 660, margin: '0 auto' }}>
      <div className="card">
        <h1 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{user.username}</h1>
        {user.profession && <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: 'var(--fg-muted)' }}>{user.profession}</p>}

        {user.bio && <p style={{ margin: '0.5rem 0', lineHeight: 1.6 }}>{user.bio}</p>}

        {user.location && (
          <p style={{ margin: '0.3rem 0', fontSize: '0.9rem', color: 'var(--fg-muted)' }}>
            Location: {user.location}
          </p>
        )}
        {user.website && (
          <p style={{ margin: '0.3rem 0', fontSize: '0.9rem' }}>
            <a href={user.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
              {user.website}
            </a>
          </p>
        )}

        <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--fg-muted)' }}>
          {user.friendsCount || 0} friends
        </p>

        {!isOwnProfile && (
          <div style={{ marginTop: '1rem' }}>
            {friendStatus === 'friends' && (
              <button className="button button-primary" onClick={startChat}>
                Message
              </button>
            )}
            {!friendStatus && (
              <button className="button button-primary" onClick={sendFriendRequest}>
                Add Friend
              </button>
            )}
            {friendStatus === 'request_sent' && (
              <button className="button button-secondary" onClick={cancelFriendRequest} disabled>
                Request Sent
              </button>
            )}
            {friendStatus === 'request_received' && (
              <p style={{ color: 'var(--accent)', marginTop: '0.5rem' }}>Friend request pending</p>
            )}
          </div>
        )}

        {isOwnProfile && (
          <button
            className="button button-primary"
            style={{ marginTop: '1rem' }}
            onClick={() => navigate('/dashboard')}
          >
            Edit Profile
          </button>
        )}
      </div>

      {friends.length > 0 && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 style={{ marginTop: 0 }}>Friends ({friends.length})</h3>
          <button
            className="button"
            style={{ marginBottom: '0.5rem' }}
            onClick={() => setShowFriends(!showFriends)}
          >
            {showFriends ? 'Hide' : 'Show'} Friends
          </button>

          {showFriends && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              {friends.map(friend => (
                <div
                  key={friend._id}
                  className="card"
                  style={{
                    padding: '0.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onClick={() => navigate(`/profile/${friend._id}`)}
                >
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-muted)',
                    margin: '0 auto 0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: 'var(--accent)'
                  }}>
                    {friend.username.charAt(0).toUpperCase()}
                  </div>
                  <p style={{ margin: '0.3rem 0', fontSize: '0.85rem', fontWeight: 500 }}>
                    {friend.username}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default ProfilePage;
