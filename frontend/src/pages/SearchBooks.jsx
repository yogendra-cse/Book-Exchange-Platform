import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Loader2, RefreshCw, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const SearchBooks = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(null); // ID of book being requested
  const [showTradeModal, setShowTradeModal] = useState(null); // Book object

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.location?.coordinates?.some(c => c !== 0)) {
        setLoading(false);
        return;
      }
      try {
        const [booksRes, myBooksRes] = await Promise.all([
          api.get(`/books/nearby?lat=${user.location.coordinates[1]}&lng=${user.location.coordinates[0]}`),
          api.get('/books/my') 
        ]);
        
        setBooks(booksRes.data.books);
        setMyBooks(myBooksRes.data.books);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendRequest = async (receiverBookId, senderBookId, receiverId) => {
    setRequesting(receiverBookId);
    try {
      await api.post('/trades', {
        receiverId,
        senderBookId,
        receiverBookId
      });
      toast.success('Trade request sent!');
      setShowTradeModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setRequesting(null);
    }
  };

  if (!user?.location?.coordinates?.some(c => c !== 0)) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <MapPin size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
        <h2>Location Required</h2>
        <p style={{ color: 'var(--text-muted)' }}>Please set your location on the dashboard to find books near you.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>Find Nearby Books</h1>
        <div style={{ position: 'relative', width: '350px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by title or author..." 
            style={{ paddingLeft: '2.75rem', borderRadius: '0.5rem' }} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={32} /></div>
      ) : filteredBooks.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>{searchTerm ? 'No books match your search.' : 'No books found within 5km of your location.'}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>(Note: Your own books are not shown in this search results)</p>
        </div>
      ) : (
        <div className="grid grid-cols-3" style={{ gap: '1.5rem' }}>
          {filteredBooks.map(book => (
            <div key={book._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.25rem' }}>
              <Link to={`/books/${book._id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                <div style={{ position: 'relative', marginBottom: '1rem', borderRadius: '0.375rem', overflow: 'hidden', paddingTop: '100%' }}>
                  <img
                    src={(book.images && book.images.length > 0) ? book.images[0] : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000&auto=format&fit=crop'}
                    alt={book.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.9)', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {book.condition}
                    </span>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.9)', color: 'var(--text-muted)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      <MapPin size={10} /> {(book.distance / 1000).toFixed(1)} km
                    </span>
                  </div>
                </div>
                <h3 style={{ marginBottom: '0.25rem', fontSize: '1.125rem', fontWeight: 600 }}>{book.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{book.author}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                   <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>{book.owner.name[0]}</div>
                   <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{book.owner.name}</span>
                </div>
              </Link>
              <button 
                onClick={() => setShowTradeModal(book)}
                className="btn-primary" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem' }}
              >
                <RefreshCw size={18} /> Request Trade
              </button>
            </div>
          ))}
        </div>
      )}

      {showTradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', border: '1px solid var(--border)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Request Trade</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Choose which of your books you'd like to offer for <b>{showTradeModal.title}</b>.</p>
            
            {myBooks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p style={{ color: 'var(--error)', marginBottom: '1.5rem' }}>You haven't listed any books to trade yet!</p>
                <Link to="/books/add" className="btn-primary" style={{ display: 'inline-block' }}>Add a Book First</Link>
                <button onClick={() => setShowTradeModal(null)} style={{ display: 'block', margin: '1rem auto', color: 'var(--text-muted)', background: 'none', border: 'none' }}>Cancel</button>
              </div>
            ) : (
              <div className="grid" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem', gap: '0.75rem' }}>
                {myBooks.map(myBook => (
                  <div 
                    key={myBook._id} 
                    onClick={() => handleSendRequest(showTradeModal._id, myBook._id, showTradeModal.owner._id)}
                    style={{ 
                      padding: '0.75rem', 
                      background: requesting === showTradeModal._id ? '#f1f5f9' : '#ffffff', 
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
                    {requesting === showTradeModal._id ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} color="var(--primary)" />}
                  </div>
                ))}
              </div>
            )}
            
            {myBooks.length > 0 && (
              <button 
                onClick={() => setShowTradeModal(null)} 
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

export default SearchBooks;
