import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Repeat, Check, X, Loader2, ArrowRightLeft } from 'lucide-react';
import { toast } from 'react-toastify';

const TradeRequests = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchTrades = async () => {
    try {
      const res = await api.get('/trades');
      setTrades(res.data.trades);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handleAction = async (tradeId, action) => {
    setActionLoading(tradeId);
    try {
      await api.put(`/trades/${tradeId}/${action}`);
      toast.success(`Trade ${action}ed successfully!`);
      fetchTrades();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} trade`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={32} /></div>;

  const incoming = trades.filter(t => t.receiver._id === user._id);
  const outgoing = trades.filter(t => t.sender._id === user._id);

  const TradeCard = ({ trade, type }) => {
    const statusColors = {
      pending: { bg: '#f1f5f9', text: '#475569' },
      accepted: { bg: '#dcfce7', text: '#166534' },
      rejected: { bg: '#fee2e2', text: '#991b1b' }
    };

    const colors = statusColors[trade.status] || { bg: '#f8fafc', text: '#475569' };

    return (
      <div className="glass-card" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              fontSize: '0.65rem', 
              textTransform: 'uppercase', 
              fontWeight: 700,
              background: colors.bg,
              color: colors.text,
              padding: '0.2rem 0.5rem',
              borderRadius: '0.25rem'
            }}>
              {trade.status}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(trade.createdAt).toLocaleDateString()}</span>
          </div>
          {type === 'incoming' && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>FROM: {trade.sender.name}</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: type === 'incoming' && trade.status === 'pending' ? '1.25rem' : '0' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{trade.senderBook.title}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{type === 'incoming' ? 'Offered to you' : 'Your offer'}</p>
          </div>
          <div style={{ background: '#f1f5f9', padding: '0.35rem', borderRadius: '50%' }}>
            <ArrowRightLeft size={14} color="var(--primary)" />
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>{trade.receiverBook.title}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{type === 'incoming' ? 'Your book' : 'Requested'}</p>
          </div>
        </div>

        {type === 'incoming' && trade.status === 'pending' && (
          <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
            <button 
              disabled={actionLoading}
              onClick={() => handleAction(trade._id, 'accept')}
              className="btn-primary" 
              style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', gap: '0.25rem', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {actionLoading === trade._id ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Accept</>}
            </button>
            <button 
              disabled={actionLoading}
              onClick={() => handleAction(trade._id, 'reject')}
              style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', background: 'none', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
            >
              <X size={14} /> Reject
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <Repeat size={32} color="var(--primary)" /> Trade Requests
      </h1>

      <div className="grid grid-cols-2" style={{ alignItems: 'start', gap: '2.5rem' }}>
        <div>
          <h3 style={{ marginBottom: '1.25rem', color: 'var(--text-main)', fontSize: '1.125rem', fontWeight: 700 }}>Incoming ({incoming.length})</h3>
          {incoming.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>No incoming requests.</p> : incoming.map(t => <TradeCard key={t._id} trade={t} type="incoming" />)}
        </div>
        <div>
          <h3 style={{ marginBottom: '1.25rem', color: 'var(--text-main)', fontSize: '1.125rem', fontWeight: 700 }}>Outgoing ({outgoing.length})</h3>
          {outgoing.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>No outgoing requests sent yet.</p> : outgoing.map(t => <TradeCard key={t._id} trade={t} type="outgoing" />)}
        </div>
      </div>
    </div>
  );
};

export default TradeRequests;
