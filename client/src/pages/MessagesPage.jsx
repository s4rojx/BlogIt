import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const MessagesPage = () => {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await api.get('/messages/conversations');
            setConversations(response.data.conversations);
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <main style={{ maxWidth: 660, margin: '0 auto', marginTop: '2rem' }}>
                <div className="card">Loading conversations...</div>
            </main>
        );
    }

    return (
        <main style={{ maxWidth: 660, margin: '0 auto' }}>
            <div className="card card-muted">
                <h1 style={{ marginTop: 0, marginBottom: '0.6rem' }}>Messages</h1>
            </div>

            <div className="card" style={{ marginTop: '1rem' }}>
                {conversations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--fg-muted)' }}>
                        <p>No conversations yet</p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            Start chatting with your friends from their profile page
                        </p>
                    </div>
                ) : (
                    conversations.map(conversation => (
                        <div
                            key={conversation.user._id}
                            style={{
                                padding: '1rem',
                                borderBottom: '1px solid var(--border)',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onClick={() => navigate(`/chat/${conversation.user._id}`)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-muted)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <div style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--bg-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    color: 'var(--accent)',
                                    flexShrink: 0
                                }}>
                                    {conversation.user.username.charAt(0).toUpperCase()}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.2rem' }}>
                                        <p style={{ margin: 0, fontWeight: conversation.isRead ? 400 : 600 }}>
                                            {conversation.user.username}
                                        </p>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--fg-muted)' }}>
                                            {new Date(conversation.lastMessageTime).toLocaleDateString([], {
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.85rem',
                                        color: 'var(--fg-muted)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        fontWeight: conversation.isRead ? 400 : 500
                                    }}>
                                        {conversation.lastMessage}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
};

export default MessagesPage;
