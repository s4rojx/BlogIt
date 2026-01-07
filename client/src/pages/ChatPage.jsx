import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const ChatPage = ({ user }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversation();
    const interval = setInterval(fetchConversation, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      const [messagesRes, userRes] = await Promise.all([
        api.get(`/messages/with/${userId}`),
        api.get(`/users/${userId}`)
      ]);

      setMessages(messagesRes.data.messages);
      setOtherUser(userRes.data.user);
    } catch (err) {
      console.error('Failed to fetch conversation:', err.response?.data || err.message);
      if (err.response?.status === 403) {
        alert('You can only message friends');
        navigate('/friends');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      const response = await api.post('/messages/send', {
        recipientId: userId,
        content: newMessage
      });

      setMessages([...messages, response.data.message]);
      setNewMessage('');
    } catch (err) {
      console.error('Send message error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to send message');
    }
  };

  if (loading) return <main style={{ maxWidth: 660, margin: '0 auto', marginTop: '2rem' }}><div className="card">Loading chat...</div></main>;

  if (!otherUser) return <main style={{ maxWidth: 660, margin: '0 auto', marginTop: '2rem' }}><div className="card">User not found</div></main>;

  return (
    <main style={{ maxWidth: 660, margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="card" style={{ marginBottom: 0, borderRadius: '0' }}>
        <div
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => navigate(`/profile/${userId}`)}
        >
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: 'var(--bg-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            color: 'var(--accent)',
            flexShrink: 0
          }}>
            {otherUser.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 500 }}>{otherUser.username}</p>
            {otherUser.profession && <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--fg-muted)' }}>{otherUser.profession}</p>}
          </div>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        backgroundColor: 'var(--bg-muted)'
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--fg-muted)', margin: 'auto' }}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message._id}
              style={{
                alignSelf: (message.sender._id === user?._id || message.sender._id === user?.id) ? 'flex-end' : 'flex-start',
                maxWidth: '70%'
              }}
            >
              <div style={{
                backgroundColor: (message.sender._id === user?._id || message.sender._id === user?.id) ? 'var(--accent)' : 'var(--bg)',
                color: (message.sender._id === user?._id || message.sender._id === user?.id) ? '#fff' : 'var(--fg)',
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                wordWrap: 'break-word'
              }}>
                <p style={{ margin: 0, lineHeight: 1.4 }}>{message.content}</p>
                <span style={{ fontSize: '0.75rem', opacity: 0.7, display: 'block', marginTop: '0.3rem' }}>
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem', padding: '1rem', backgroundColor: 'var(--bg)' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="input"
          style={{ flex: 1 }}
        />
        <button type="submit" className="button button-primary">
          Send
        </button>
      </form>
    </main>
  );
};

export default ChatPage;
