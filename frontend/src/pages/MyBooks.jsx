import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { BookOpen, Loader2, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const MyBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBooks = async () => {
    try {
      const res = await api.get('/books/my');
      setBooks(res.data.books);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      await api.delete(`/books/${id}`);
      toast.success('Book deleted successfully');
      fetchMyBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete book');
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BookOpen size={32} color="var(--primary)" />
          My Books
        </h1>
        <Link to="/books/add" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}>
          <Plus size={18} /> Add New Book
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={32} /></div>
      ) : books.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>You haven't listed any books yet.</p>
          <Link to="/books/add" className="btn-primary">List Your First Book</Link>
        </div>
      ) : (
        <div className="grid grid-cols-3" style={{ gap: '1.5rem' }}>
          {books.map(book => (
            <Link 
              to={`/books/${book._id}`} 
              key={book._id} 
              className="glass-card" 
              style={{ 
                padding: '1.25rem', 
                textDecoration: 'none', 
                color: 'inherit',
                display: 'block',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              <div style={{ position: 'relative', marginBottom: '1rem', borderRadius: '0.375rem', overflow: 'hidden', paddingTop: '100%' }}>
                <img
                  src={(book.images && book.images.length > 0) ? book.images[0] : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000&auto=format&fit=crop'}
                  alt={book.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.25rem' }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    background: 'rgba(255,255,255,0.9)', 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '0.25rem', 
                    border: '1px solid var(--border)',
                    color: '#475569',
                    textTransform: 'uppercase',
                    fontWeight: 700
                  }}>
                    {book.condition}
                  </span>
                  {!book.isAvailable && (
                    <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '0.25rem', fontWeight: 700 }}>IN TRADE</span>
                  )}
                </div>
              </div>
              <h3 style={{ marginBottom: '0.25rem', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)' }}>{book.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>{book.author}</p>
              
              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto' }}>
                {book.tradeStatus === 'none' ? (
                  <>
                    <Link 
                      to={`/books/edit/${book._id}`}
                      className="btn-secondary"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.5rem', borderRadius: '0.25rem' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Edit size={14} /> Edit
                    </Link>
                    <button 
                      onClick={(e) => handleDelete(e, book._id)}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.75rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '0.25rem', padding: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b', fontSize: '0.7rem', fontWeight: 600, background: '#fee2e2', padding: '0.5rem', borderRadius: '0.25rem', width: '100%' }}>
                    <AlertCircle size={14} />
                    <span>Cannot edit/delete: In trade ({book.tradeStatus})</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBooks;
