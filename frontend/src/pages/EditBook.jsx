import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const EditBook = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    condition: 'good',
    description: '',
    images: []
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await api.get(`/books/${id}`);
        const book = res.data.book;
        
        if (book.owner._id !== user._id) {
          setError('Not authorized to edit this book');
          return;
        }

        if (book.tradeStatus !== 'none') {
          setError('Cannot edit book because it is involved in a trade');
        }

        setFormData({
          title: book.title,
          author: book.author,
          condition: book.condition,
          description: book.description,
          images: book.images || []
        });
      } catch (err) {
        setError('Failed to load book data');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, user._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.put(`/books/${id}`, formData);
      toast.success('Book updated successfully!');
      navigate('/books/my');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update book');
      setError(err.response?.data?.message || 'Failed to update book');
    } finally {
      setSubmitting(false);
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
      const res = await api.post("/ai/summary", { title: formData.title });
      setFormData({ ...formData, description: res.data.summary });
    } catch {
      setError("AI summary failed");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <Link to="/books/my" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        <ArrowLeft size={18} /> Back to My Books
      </Link>

      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>Edit Book</h2>
        
        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="grid" style={{ gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Book Title</label>
            <input
              type="text"
              required
              disabled={error.includes('trade')}
              style={{ borderRadius: '0.375rem', width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Author</label>
            <input
              type="text"
              required
              disabled={error.includes('trade')}
              style={{ borderRadius: '0.375rem', width: '100%', padding: '0.75rem', border: '1px solid var(--border)' }}
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Condition</label>
            <select
              value={formData.condition}
              disabled={error.includes('trade')}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              style={{ padding: '0.75rem', borderRadius: '0.375rem', background: '#ffffff', border: '1px solid var(--border)', width: '100%' }}
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
                disabled={aiLoading || error.includes('trade')}
                style={{ background: 'transparent', color: 'var(--primary)', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                {aiLoading ? "Generating..." : "✨ Auto Write Summary"}
              </button>
            </div>
            <textarea
              rows="4"
              disabled={error.includes('trade')}
              style={{ borderRadius: '0.375rem', border: '1px solid var(--border)', padding: '0.75rem', width: '100%' }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Book Images</label>
            {!error.includes('trade') && (
              <button
                type="button"
                onClick={handleUpload}
                className="btn-secondary"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '2px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)', marginBottom: '1rem', cursor: 'pointer' }}
              >
                Upload More Images
              </button>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {formData.images.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', paddingTop: '100%' }}>
                  <img
                    src={img}
                    alt="Preview"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.375rem' }}
                  />
                  {!error.includes('trade') && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                      style={{ position: 'absolute', top: '-0.25rem', right: '-0.25rem', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '1.25rem', height: '1.25rem', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {!error.includes('trade') && (
            <button type="submit" className="btn-primary" disabled={submitting} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', padding: '0.875rem', borderRadius: '0.375rem', cursor: 'pointer' }}>
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditBook;
