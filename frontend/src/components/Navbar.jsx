import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Book, User, LogOut, MessageSquare, MapPin, Repeat } from 'lucide-react';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav style={{ background: '#ffffff', borderBottom: '1px solid var(--border)', padding: '0.75rem 0', sticky: 'top', zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)', fontFamily: "'Sora', sans-serif", letterSpacing: '-0.02em' }}>
          <Book size={24} />
          <span>BookEx</span>
        </Link>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/books/my" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <Book size={18} /> My Books
            </Link>
            <Link to="/books/search" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <MapPin size={18} /> Nearby
            </Link>
            <Link to="/trades" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <Repeat size={18} /> Trades
            </Link>
            <Link to="/matches" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <MessageSquare size={18} /> Matches
            </Link>
            <div style={{ width: '1px', height: '20px', background: 'var(--border)' }}></div>
            <span style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</span>
            <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/login" style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9375rem' }}>Login</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9375rem' }}>Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
