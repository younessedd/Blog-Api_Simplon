import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAdminBlogs, createBlog, updateBlog, deleteBlog } from '../api/myBlogApi';
import { getNews, getCategories } from '../api/newsApi';

const BlogContext = createContext();

export const useBlogs = () => useContext(BlogContext);

export const BlogProvider = ({ children }) => {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [news, setNews] = useState([]);
  
  // Public News API State
  const [publicCategories, setPublicCategories] = useState(['all']);
  const [publicTotal, setPublicTotal] = useState(0);
  const [publicLimit, setPublicLimit] = useState(9);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLogin = localStorage.getItem('admin_logged_in');
    if (checkLogin === 'true') {
      setAdminLoggedIn(true);
    }
    fetchInitData();
    // Intentionally empty array - we trigger loads specifically
  }, []);

  const fetchInitData = async () => {
    setLoading(true);
    try {
      const [adminData, cats] = await Promise.all([
        getAdminBlogs(),
        getCategories()
      ]);
      setBlogs(adminData || []);
      setPublicCategories(cats || ['all']);
    } catch (err) {
      console.error(err);
      setError("Could not load initial data.");
    } finally {
      setLoading(false);
    }
  };

  const loadPublicNews = async (page = 1, search = '', category = 'all') => {
    setLoading(true);
    try {
      const { articles, total, limit } = await getNews(page, search, category);
      setNews(articles);
      setPublicTotal(total);
      setPublicLimit(limit);
    } catch (err) {
      setError("Failed to fetch public blogs.");
    } finally {
      setLoading(false);
    }
  };

  const login = (password) => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (password === adminPassword) {
      setAdminLoggedIn(true);
      localStorage.setItem('admin_logged_in', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setAdminLoggedIn(false);
    localStorage.removeItem('admin_logged_in');
  };

  const addBlog = async (blogData) => {
    const newBlog = await createBlog(blogData);
    setBlogs([newBlog, ...blogs]);
  };

  const editBlog = async (id, updatedFields) => {
    await updateBlog(id, updatedFields);
    setBlogs(blogs.map(b => (b.id === id ? { ...b, ...updatedFields } : b)));
  };

  const removeBlog = async (id) => {
    await deleteBlog(id);
    setBlogs(blogs.filter(b => b.id !== id));
  };

  const value = {
    adminLoggedIn,
    login,
    logout,
    blogs,
    news,
    publicCategories,
    publicTotal,
    publicLimit,
    loading,
    error,
    addBlog,
    editBlog,
    removeBlog,
    loadPublicNews
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};
