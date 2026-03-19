import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useBlogs } from '../context/BlogContext';
import { Link } from 'react-router-dom';
import { Trash2, Edit, Calendar, User, Newspaper, Search, ChevronLeft, ChevronRight, Tag } from 'lucide-react';

const ArticleList = () => {
  const { 
    blogs, news, loading, error, adminLoggedIn, removeBlog, 
    publicCategories, publicTotal, publicLimit, loadPublicNews 
  } = useBlogs();
  
  // App filters and page state
  const [feedMode, setFeedMode] = useState('all'); // all, admin, news
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // We debounce the load via API so it triggers gracefully when params change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // Only call public news fetching if we're actually showing news or all
      if (feedMode === 'all' || feedMode === 'news') {
        loadPublicNews(currentPage, searchTerm, activeCategory);
      }
    }, 350);
    return () => clearTimeout(debounceTimer);
    // eslint-disable-next-line
  }, [currentPage, activeCategory, feedMode, searchTerm]);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Close suggestions if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    
    let available = [];
    if (feedMode === 'admin') available = blogs;
    else if (feedMode === 'news') available = news;
    else available = [...blogs, ...news];
    
    const startsWithMatches = Array.from(new Set(available
      .filter(a => a?.title?.toLowerCase().startsWith(term))
      .map(a => a.title)
      .filter(Boolean)
    ));
    
    if (startsWithMatches.length < 5) {
      const includesMatches = Array.from(new Set(available
        .filter(a => a?.title?.toLowerCase().includes(term) && !a?.title?.toLowerCase().startsWith(term))
        .map(a => a.title)
        .filter(Boolean)
      ));
      startsWithMatches.push(...includesMatches);
    }
    return startsWithMatches.slice(0, 6);
  }, [searchTerm, blogs, news]);

  const triggerSearch = (term) => {
    setSearchTerm(term);
    setShowSuggestions(false);
    setCurrentPage(1);
    setActiveCategory('all');
    loadPublicNews(1, term, 'all');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    triggerSearch(searchTerm);
  };

  const allArticles = useMemo(() => {
    let combined = [];
    
    // Sort Admin blogs to float them to top locally if relevant
    const sortedAdmin = [...blogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Optional Local filtering of Dev blogs based on the API search term so Everything matches
    const filteredAdmin = sortedAdmin.filter(b => {
      const titleTarget = b?.title ? b.title.toLowerCase() : '';
      const contentTarget = b?.content ? b.content.toLowerCase() : '';
      const searchTarget = searchTerm.toLowerCase();
      
      const matchesSearch = titleTarget.includes(searchTarget) || contentTarget.includes(searchTarget);
      const matchesCategory = activeCategory === 'all' || 
                              (b?.category && b.category.toLowerCase() === activeCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });

    if (feedMode === 'all' || feedMode === 'admin') combined = [...combined, ...filteredAdmin];
    if (feedMode === 'all' || feedMode === 'news') combined = [...combined, ...news]; // news maintains API sort/filter
    
    return combined;
  }, [blogs, news, feedMode, searchTerm]);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this blog?")) {
      await removeBlog(id);
    }
  };

  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
    } catch {
      return "Unknown Date";
    }
  };

  const totalPages = Math.ceil(publicTotal / publicLimit) || 1;

  return (
    <div className="article-list-page fade-in">
      <div className="page-header">
        <h1 className="hero-title">Latest Articles</h1>
        <p className="subtitle">Discover the newest insights and stories from across the web</p>
        
        {/* Top Feed Toggles */}
        <div className="filters main-tabs">
          <button 
            className={`badge ${feedMode === 'all' ? 'badge-primary' : 'badge-outline'}`}
            onClick={() => { 
              setFeedMode('all'); setCurrentPage(1); 
              setActiveCategory('all'); setSearchTerm(''); 
            }}
          >
            All Updates
          </button>
          <button 
            className={`badge ${feedMode === 'admin' ? 'badge-primary' : 'badge-outline'}`}
            onClick={() => { 
              setFeedMode('admin'); setCurrentPage(1); 
              setActiveCategory('all'); setSearchTerm(''); 
            }}
          >
            Dev Blogs
          </button>
          <button 
            className={`badge ${feedMode === 'news' ? 'badge-primary' : 'badge-outline'}`}
            onClick={() => { 
              setFeedMode('news'); setCurrentPage(1); 
              setActiveCategory('all'); setSearchTerm(''); 
            }}
          >
            <Newspaper size={14} style={{ marginRight: '4px' }}/> Global News
          </button>
        </div>
      </div>

      {/* Tools Section: Search & Category Scroll */}
      <div className="tools-bar">
        <div className="search-wrapper" ref={searchRef}>
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search articles..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1rem' }}>Search</button>
          </form>
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="autocomplete-dropdown fade-in">
              {suggestions.map((s, idx) => {
                const termLower = searchTerm.toLowerCase();
                const startIndex = s.toLowerCase().indexOf(termLower);
                if (startIndex === -1) return null;
                const beforeStr = s.substring(0, startIndex);
                const matchStr = s.substring(startIndex, startIndex + searchTerm.length);
                const afterStr = s.substring(startIndex + searchTerm.length);
                return (
                  <div 
                    key={idx} 
                    className="autocomplete-item"
                    onClick={(e) => { e.preventDefault(); triggerSearch(s); }}
                  >
                    <Search size={14} style={{ marginRight: '8px', opacity: 0.5 }} />
                    {beforeStr}
                    <strong style={{ color: 'var(--primary)', fontWeight: 700 }}>{matchStr}</strong>
                    {afterStr}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!searchTerm && (
          <div className="category-scroll-container">
            <div className="category-scroll">
              <span className="cat-label"><Tag size={14}/> Top Tags:</span>
              {Array.from(new Set([
                ...(feedMode === 'admin' ? [] : publicCategories), 
                ...(feedMode === 'news' ? [] : blogs.map(b => b.category).filter(c => c && c.toLowerCase() !== 'all'))
              ])).map(cat => (
                <button 
                  key={cat} 
                  className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="grid" style={{ minHeight: '40vh', opacity: loading ? 0.6 : 1, transition: 'opacity 0.3s' }}>
        {allArticles.length === 0 && !loading ? (
          <div className="empty-state">No articles found for this search. Try clearing your filters!</div>
        ) : (
          allArticles.map((article) => (
            <Link key={article.id} to={`/article/${article.id}`} className="card article-card">
              {article.image && (
                <div className="card-image-wrapper">
                  <img src={article.image} alt={article.title} className="card-image" loading="lazy" />
                  <span className="source-tag">{article.source === 'admin' ? 'Dev Blog' : article.source}</span>
                </div>
              )}
              
              <div className="card-content">
                {!article.image && (
                  <span className="source-tag inside">{article.source === 'admin' ? 'Dev Blog' : article.source}</span>
                )}
                <h3 className="card-title">{article.title}</h3>
                <p className="card-excerpt">
                  {article.content?.substring(0, 120)}...
                </p>
                <div className="card-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                  <span>
                    <User size={14} /> {article.author || 'Unknown'}
                  </span>
                  <span>
                    <Calendar size={14} /> {formatDate(article.timestamp)}
                  </span>
                  {article.category && (
                    <button 
                      className="card-category-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveCategory(article.category);
                        setCurrentPage(1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <Tag size={12} style={{ marginRight: '4px' }} /> {article.category}
                    </button>
                  )}
                </div>
              </div>
              
              {adminLoggedIn && article.source === 'admin' && (
                <div className="card-actions" onClick={(e) => e.preventDefault()}>
                  <Link to={`/edit/${article.id}`} className="btn-icon">
                    <Edit size={16} />
                  </Link>
                  <button onClick={(e) => handleDelete(e, article.id)} className="btn-icon text-danger">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </Link>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {(feedMode === 'all' || feedMode === 'news') && totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn btn-outline" 
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} /> Prev
          </button>
          
          <span className="page-indicator">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            className="btn btn-outline" 
            disabled={currentPage === totalPages || loading}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ArticleList;
