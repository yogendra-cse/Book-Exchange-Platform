import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const AddBook = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    condition: 'good',
    description: '',
    images: [] // Store multiple image URLs
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.location?.coordinates?.some(c => c !== 0)) {
      toast.error('Please set your location on the dashboard before listing a book.');
      setError('Please set your location on the dashboard before listing a book.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/books', formData);
      toast.success('Book listed successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to list book');
      setError(err.response?.data?.message || 'Failed to list book');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = () => {
    window.cloudinary.openUploadWidget(
      {
        cloudName: "drfp9vied",
        uploadPreset: "bookexchangeplatform",
        folder: "books",
        multiple: true,
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, result.info.secure_url],
          }));
        }
      }
    );
  };
  const generateSummary = async () => {
  if (!formData.title) return;

  try {
    setAiLoading(true);

    const res = await api.post("/ai/summary", {
      title: formData.title
    });

    setFormData({
      ...formData,
      description: res.data.summary
    });

  } catch {
    setError("AI summary failed");
  } finally {
    setAiLoading(false);
  }
};

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>List a New Book</h2>
        
        <form onSubmit={handleSubmit} className="grid" style={{ gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Book Title</label>
            <input
              type="text"
              required
              placeholder="e.g. The Great Gatsby"
              style={{ borderRadius: '0.375rem' }}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Author</label>
            <input
              type="text"
              required
              placeholder="e.g. F. Scott Fitzgerald"
              style={{ borderRadius: '0.375rem' }}
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Condition</label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              style={{ padding: '0.75rem', borderRadius: '0.375rem', background: '#ffffff', border: '1px solid var(--border)' }}
            >
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Description</label>
              <button
                type="button"
                onClick={generateSummary}
                disabled={aiLoading}
                style={{ background: 'transparent', color: 'var(--primary)', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                {aiLoading ? "Generating..." : "✨ Auto Write Summary"}
              </button>
            </div>

            <textarea
              rows="4"
              placeholder="Tell others about the edition, quality, or what you're looking for..."
              style={{ borderRadius: '0.375rem', border: '1px solid var(--border)', padding: '0.75rem' }}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Book Images</label>
            <button
              type="button"
              onClick={handleUpload}
              className="btn-secondary"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '2px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)' }}
            >
              Upload Images (Multiple)
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
              {formData.images.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', paddingTop: '100%' }}>
                  <img
                    src={img}
                    alt="Preview"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.375rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                    style={{ position: 'absolute', top: '-0.25rem', right: '-0.25rem', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '1.25rem', height: '1.25rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', padding: '0.875rem', borderRadius: '0.375rem' }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><PlusCircle size={20} /> List Book</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
