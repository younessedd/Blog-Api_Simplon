import React, { useState } from 'react';
import { useBlogs } from '../context/BlogContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

const NewArticleForm = () => {
  const { addBlog, adminLoggedIn } = useBlogs();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'technology',
    author: 'Admin',
    image: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!adminLoggedIn) {
    return (
      <div className="alert alert-error">
        Access Denied. You must be an admin to view this page.
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic size validation (e.g., max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB.");
        e.target.value = null; // reset
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.author || !formData.category) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      await addBlog(formData);
      navigate('/');
    } catch (err) {
      setError("Failed to create blog post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page fade-in">
      <div className="form-header">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back
        </Link>
        <h1>Create New Post</h1>
      </div>

      <div className="card form-card">
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="standard-form">
          <div className="form-group">
            <label htmlFor="title">Post Title</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="e.g. React 19 is here!"
            />
          </div>
          <div className="form-group">
            <label htmlFor="image">Featured Image (Upload from PC or enter URL)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                id="image" 
                name="image" 
                value={formData.image} 
                onChange={handleChange} 
                placeholder="https://example.com/image.jpg"
                style={{ flex: 1, minWidth: '200px' }}
              />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>OR</span>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                style={{ flex: 1, minWidth: '200px', cursor: 'pointer', padding: '0.6rem' }}
              />
            </div>
            {formData.image && formData.image.startsWith('data:image') && (
              <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>✓ Local image attached successfully</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="author">Author</label>
              <input 
                type="text" 
                id="author" 
                name="author" 
                value={formData.author} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group flex-1">
              <label htmlFor="category">Category</label>
              <input 
                type="text"
                id="category" 
                name="category" 
                value={formData.category} 
                onChange={handleChange}
                list="category-suggestions"
                placeholder="Type or select a category"
              />
              <datalist id="category-suggestions">
                <option value="technology" />
                <option value="science" />
                <option value="lifestyle" />
                <option value="general" />
              </datalist>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea 
              id="content" 
              name="content" 
              rows="12" 
              value={formData.content} 
              onChange={handleChange} 
              placeholder="Write your blog content here..."
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/')} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} style={{ marginRight: '6px' }} />
              {loading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewArticleForm;
