import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowLeft, Loader2, User } from 'lucide-react';
import { toast } from 'react-toastify';

const Chat = () => {
  const { matchId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const scrollRef = useRef();

  useEffect(() => {
    // Fetch initial chat history
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/chat/${matchId}`);
        setMessages(res.data.messages);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();

    // Initialize Socket.io
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('joinRoom', matchId);

    newSocket.on('newMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.emit('leaveRoom', matchId);
      newSocket.close();
    };
  }, [matchId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socket) return;

    socket.emit('sendMessage', {
      matchId,
      senderId: user._id,
      text: inputText
    });

    setInputText('');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="container" style={{ maxWidth: '800px', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', paddingTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <Link to="/matches" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--border)' }}><ArrowLeft size={20} /></Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Trade Chat</h1>
      </div>

      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden', border: '1px solid var(--border)', background: '#ffffff' }}>
        {/* Messages Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#f8fafc' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem', fontSize: '0.9rem' }}>
              <div style={{ background: '#ffffff', display: 'inline-block', padding: '1rem 2rem', borderRadius: '2rem', border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                No messages yet. Start a conversation!
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.sender._id === user._id || msg.sender === user._id;
              return (
                <div key={msg._id || i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{ 
                    background: isMe ? 'var(--primary)' : '#ffffff', 
                    color: isMe ? '#ffffff' : 'var(--text-main)', 
                    padding: '0.75rem 1.125rem', 
                    borderRadius: isMe ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
                    border: isMe ? 'none' : '1px solid var(--border)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    fontSize: '0.9375rem',
                    lineHeight: '1.5'
                  }}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {isMe ? 'You' : msg.sender.name} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} style={{ padding: '1.25rem', background: '#ffffff', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Write a message..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ flex: 1, background: '#f8fafc', borderRadius: '0.5rem' }}
          />
          <button type="submit" className="btn-primary" style={{ width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', flexShrink: 0 }}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
