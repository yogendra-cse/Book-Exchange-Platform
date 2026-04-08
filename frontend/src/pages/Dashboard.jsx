import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { MapPin, BookOpen, Repeat, Map as MapIcon, Loader2, Book as BookIcon, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user, updateLocation } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locLoading, setLocLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllBooks = async () => {
    try {
      const res = await api.get('/books');
      setBooks(res.data.books);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBooks();
  }, []);

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateLocation = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await updateLocation(pos.coords.latitude, pos.coords.longitude);
          toast.success('Location updated successfully');
        } catch (err) {
          toast.error('Failed to update location on server');
        } finally {
          setLocLoading(false);
        }
      },
      (err) => {
        toast.error('Please enable location access in your browser');
        setLocLoading(false);
      }
    );
  };

  const hasLocation = user?.location?.coordinates?.some(c => c !== 0);

  return (
    <div className="container">
      <div style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Hello, {user?.name}!</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Welcome to your book exchange dashboard.</p>
          </div>
          <button 
            onClick={handleUpdateLocation} 
            disabled={locLoading}
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {locLoading ? <Loader2 className="animate-spin" size={18} /> : <MapPin size={18} />}
            {hasLocation ? 'Update Location' : 'Set Location'}
          </button>
        </div>

        <div className="grid grid-cols-3" style={{ gap: '1.5rem' }}>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}><BookOpen size={24} /></div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>My Books</h3>
            <Link to="/books/my" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>View your listings →</Link>
          </div>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}><Repeat size={24} /></div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Active Trades</h3>
            <Link to="/trades" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>View requests →</Link>
          </div>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}><MapIcon size={24} /></div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Exploration</h3>
            <Link to="/books/search" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>Find nearby →</Link>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
            <BookIcon size={24} color="var(--primary)" />
            Available Books
          </h2>
          <div style={{ position: 'relative', width: '350px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search available books..." 
              style={{ paddingLeft: '2.75rem', borderRadius: '0.5rem', width: '100%' }} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={32} /></div>
        ) : filteredBooks.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '5rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>{searchTerm ? 'No books match your search.' : 'No books available for exchange right now.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3">
            {filteredBooks.map(book => (
              <Link 
                to={`/books/${book._id}`} 
                key={book._id} 
                className="glass-card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                  color: 'inherit',
                  padding: '1.25rem',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{ position: 'relative', marginBottom: '1rem', borderRadius: '0.375rem', overflow: 'hidden', paddingTop: '100%' }}>
                  <img
                    src={(book.images && book.images.length > 0) ? book.images[0] : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000&auto=format&fit=crop'}
                    alt={book.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.9)', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {book.condition}
                    </span>
                    {book.owner._id === user?._id && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, marginLeft: '0.5rem', background: 'rgba(255,255,255,0.9)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)' }}>YOURS</span>
                    )}
                  </div>
                </div>
                <div>
                  <h3 style={{ marginBottom: '0.25rem', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>{book.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{book.author}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                   <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>{book.owner.name[0]}</div>
                   <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{book.owner.name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
