import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft, User, Book as BookIcon, MapPin, RefreshCw, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(null); // ID of book being requested
  const [showTradeModal, setShowTradeModal] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const [bookRes, myBooksRes] = await Promise.all([
          api.get(`/books/${id}`),
          api.get('/books/my')
        ]);
        setBook(bookRes.data.book);
        setMyBooks(myBooksRes.data.books);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load book details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, navigate]);

  const handleSendRequest = async (senderBookId) => {
    setRequesting(book._id);
    try {
      await api.post('/trades', {
        receiverId: book.owner._id,
        senderBookId,
        receiverBookId: book._id
      });
      toast.success('Trade request sent!');
      setShowTradeModal(false);
      navigate('/trades');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setRequesting(null);
    }
  };

  const handleRequestTrade = () => {
    setShowTradeModal(true);
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!book) return null;

  const isOwner = book.owner._id === user?._id;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', color: 'var(--text-muted)', marginBottom: '1.5rem', cursor: 'pointer', border: 'none' }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '3rem' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{ width: '100%', height: '400px', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                <img
                  id="mainImage"
                  src={(book.images && book.images.length > 0) ? book.images[0] : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000&auto=format&fit=crop'}
                  alt={book.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              {book.images && book.images.length > 1 && (
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {book.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${book.title} ${idx + 1}`}
                      onClick={() => document.getElementById('mainImage').src = img}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.5rem', cursor: 'pointer', border: '2px solid var(--border)' }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>{book.title}</h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 600 }}>by {book.author}</p>
              </div>
              <span style={{ 
                fontSize: '0.75rem', 
                background: '#f1f5f9', 
                color: '#475569',
                padding: '0.3rem 0.75rem', 
                borderRadius: '0.25rem', 
                border: '1px solid var(--border)',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {book.condition}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', color: '#64748b', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Description</h3>
            <p style={{ lineHeight: '1.7', color: '#334155', fontSize: '1.125rem' }}>
              {book.description || 'No description provided'}
            </p>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>
                <User size={18} />
                <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Owner Info</span>
              </div>
              <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>{book.owner.name}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{book.owner.email}</p>
            </div>
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>
                <MapPin size={18} />
                <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Location</span>
              </div>
              <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>Local exchange available</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Based on owner's location</p>
            </div>
          </div>

          {!isOwner && book.isAvailable && (
            <button 
              onClick={handleRequestTrade}
              className="btn-primary" 
              style={{ width: '100%', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.125rem', borderRadius: '0.5rem' }}
            >
              <RefreshCw size={22} /> Request Trade
            </button>
          )}

          {isOwner && (
            <div style={{ textAlign: 'center', padding: '1.25rem', background: '#f1f5f9', border: '1px solid var(--border)', borderRadius: '0.5rem', color: '#64748b', fontWeight: 500 }}>
              This is your book listing. You can manage it from "My Books".
            </div>
          )}
        </div>
      </div>

      {showTradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', border: '1px solid var(--border)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Request Trade</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Choose which of your books you'd like to offer for <b>{book.title}</b>.</p>
            
            {myBooks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p style={{ color: 'var(--error)', marginBottom: '1.5rem' }}>You haven't listed any books to trade yet!</p>
                <Link to="/books/add" className="btn-primary" style={{ display: 'inline-block' }}>Add a Book First</Link>
                <button onClick={() => setShowTradeModal(false)} style={{ display: 'block', margin: '1rem auto', color: 'var(--text-muted)', background: 'none', border: 'none' }}>Cancel</button>
              </div>
            ) : (
              <div className="grid" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem', gap: '0.75rem' }}>
                {myBooks.map(myBook => (
                  <div 
                    key={myBook._id} 
                    onClick={() => handleSendRequest(myBook._id)}
                    style={{ 
                      padding: '0.75rem', 
                      background: requesting === book._id ? '#f1f5f9' : '#ffffff', 
                      borderRadius: '0.5rem', 
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <img
                      src={(myBook.images && myBook.images.length > 0) ? myBook.images[0] : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000&auto=format&fit=crop'}
                      alt={myBook.title}
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '0.25rem' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.1rem' }}>{myBook.title}</h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{myBook.author}</p>
                    </div>
                    {requesting === book._id ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} color="var(--primary)" />}
                  </div>
                ))}
              </div>
            )}
            
            {myBooks.length > 0 && (
              <button 
                onClick={() => setShowTradeModal(false)} 
                style={{ width: '100%', padding: '0.75rem', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '0.375rem', color: 'var(--text-main)', fontWeight: 600 }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
