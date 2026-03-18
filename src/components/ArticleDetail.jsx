import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBlogs } from '../context/BlogContext';
import { ArrowLeft, User, Calendar, Edit, Trash2 } from 'lucide-react';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { blogs, news, adminLoggedIn, removeBlog } = useBlogs();

  const article = useMemo(() => {
    return [...blogs, ...news].find(a => a.id === id);
  }, [id, blogs, news]);

  if (!article) {
    return (
      <div className="not-found fade-in">
        <h2>Article not found</h2>
        <Link to="/" className="btn btn-outline" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Back to Feed
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      await removeBlog(article.id);
      navigate('/');
    }
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(new Date(article.timestamp));

  return (
    <article className="article-detail fade-in">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back
      </Link>
      
      {article.image && (
        <div className="hero-image">
          <img src={article.image} alt={article.title} />
        </div>
      )}
      
      <div className="article-container">
        <header className="article-header">
          <div className="badge badge-primary">{article.category}</div>
          <h1 className="article-title">{article.title}</h1>
          
          <div className="article-meta info-bar">
            <span><User size={16} /> {article.author}</span>
            <span><Calendar size={16} /> {formattedDate}</span>
            {article.source === 'news' && (
              <span className="source-label">Fetched via Global News API</span>
            )}
          </div>
        </header>

        {adminLoggedIn && article.source === 'admin' && (
          <div className="admin-toolbar">
            <Link to={`/edit/${article.id}`} className="btn btn-outline">
               <Edit size={16} /> Edit Post
            </Link>
            <button onClick={handleDelete} className="btn btn-danger">
               <Trash2 size={16} /> Delete
            </button>
          </div>
        )}

        <div className="article-content" style={{ whiteSpace: 'pre-wrap' }}>
          {article.content}
        </div>
      </div>
    </article>
  );
};

export default ArticleDetail;
