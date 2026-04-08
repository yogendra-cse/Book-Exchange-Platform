import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, CheckCircle, Loader2, ArrowRight, Repeat, Lock, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Matches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState({});

  const fetchMatches = async () => {
    try {
      const res = await api.get('/matches');
      setMatches(res.data.matches);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleGenerateOtp = async (matchId) => {
    try {
      await api.put(`/matches/${matchId}/generate-otp`);
      toast.success('OTP Generated! Share it with the other user.');
      fetchMatches();
    } catch (err) {
      toast.error('Failed to generate OTP');
    }
  };

  const handleVerifyOtp = async (matchId) => {
    const otp = otpInputs[matchId];
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const res = await api.put(`/matches/${matchId}/verify-otp`, { otp });
      toast.success(res.data.message);
      fetchMatches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleReturn = async (matchId) => {
    if (!window.confirm('Request to return books? This requires both users to agree. Once both agree, ownership will be restored.')) return;
    try {
      const res = await api.put(`/matches/${matchId}/return`);
      toast.success(res.data.message);
      fetchMatches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request return');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>Your Matches</h1>

      {matches.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No matches yet. Keep requesting trades!</p>
          <Link to="/books/search" className="btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.75rem 1.5rem' }}>Search Books</Link>
        </div>
      ) : (
        <div className="grid" style={{ gap: '1.5rem' }}>
          {matches.map(match => {
            const partner = match.users.find(u => u._id !== user._id);
            const myId = user._id;
            const hasRequestedReturn = match.returnRequests?.some(r => (r._id || r) === myId);
            const otherRequestedReturn = match.returnRequests?.some(r => (r._id || r) !== myId);
            const isReturned = match.status === 'returned' || match.status === 'reversed';
            const isActive = match.status === 'active';
            const isCompleted = match.status === 'completed';
            const isReturnInProgress = match.returnRequested && !isReturned;
            
            return (
              <div key={match._id} className="glass-card" style={{ padding: '1.25rem', opacity: isReturned ? 0.8 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>{partner?.name[0]}</div>
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{partner?.name}</h4>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{match.status}</span>
                        </div>
                    </div>
                    {isReturned && <span style={{ fontSize: '0.7rem', color: 'var(--error)', fontWeight: 700 }}>REVERSED</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{match.books[0]?.title}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Book 1</p>
                    </div>
                    <ArrowRight size={16} color="var(--primary)" />
                    <div style={{ flex: 1, textAlign: 'right' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{match.books[1]?.title}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Book 2</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                   {isReturned ? (
                        <div style={{ padding: '0.75rem', textAlign: 'center', background: '#ecfdf5', color: '#065f46', borderRadius: '0.375rem', fontWeight: 700, fontSize: '0.9rem', width: '100%' }}>
                            Trade Reversed Successfully
                        </div>
                   ) : (
                    <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <Link to={`/chat/${match._id}`} className="btn-primary" style={{ flex: 1, minWidth: '120px', padding: '0.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: 'auto' }}>
                             <MessageSquare size={16} /> Chat
                        </Link>
                        
                        {isActive && !match.otpGeneratedBy && (
                            <button onClick={() => handleGenerateOtp(match._id)} style={{ flex: 1, minWidth: '120px', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid var(--primary)', color: 'var(--primary)', background: '#fff', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Lock size={16} /> Generate OTP
                            </button>
                        )}

                        {isActive && match.otpGeneratedBy && !match.otpVerified && (
                            (match.otpGeneratedBy._id === user._id || match.otpGeneratedBy === user._id) ? (
                                <div style={{ flex: 1, minWidth: '120px', padding: '0.5rem', fontSize: '0.85rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '0.375rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px solid #bae6fd' }}>
                                    OTP: {match.otp}
                                </div>
                            ) : (
                                <div style={{ flex: 1, minWidth: '220px', display: 'flex', gap: '0.5rem' }}>
                                    <input 
                                        type="text" 
                                        maxLength="6"
                                        placeholder="Enter OTP"
                                        value={otpInputs[match._id] || ''}
                                        onChange={(e) => setOtpInputs({ ...otpInputs, [match._id]: e.target.value })}
                                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', border: '1px solid var(--border)', borderRadius: '0.375rem' }}
                                    />
                                    <button onClick={() => handleVerifyOtp(match._id)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'var(--primary)', color: '#fff', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <Key size={16} /> Verify
                                    </button>
                                </div>
                            )
                        )}

                        {(isActive || isCompleted || match.status === 'return-pending') && !hasRequestedReturn && (
                            <button onClick={() => handleReturn(match._id)} style={{ flex: 1, minWidth: '120px', padding: '0.5rem', fontSize: '0.85rem', color: '#991b1b', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                 <Repeat size={16} /> Return
                            </button>
                        )}
                        {isReturnInProgress && hasRequestedReturn && (
                            <div style={{ flex: 1, minWidth: '120px', padding: '0.5rem', fontSize: '0.85rem', color: '#64748b', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '0.375rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                 <Repeat size={16} /> Pending
                            </div>
                        )}
                    </div>
                    {isReturnInProgress && otherRequestedReturn && !hasRequestedReturn && (
                        <div style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 600, textAlign: 'center', padding: '0.5rem', background: '#fff1f2', borderRadius: '0.375rem', border: '1px dashed #fda4af' }}>
                            Return request initiated by other user
                        </div>
                    )}
                    </>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Matches;
