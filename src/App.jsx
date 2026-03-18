import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BlogProvider } from './context/BlogContext';
import Layout from './components/Layout';
import ArticleList from './components/ArticleList';
import ArticleDetail from './components/ArticleDetail';
import NewArticleForm from './components/NewArticleForm';
import EditArticleForm from './components/EditArticleForm';
import Login from './components/Login';
import './index.css';

function App() {
  return (
    <Router>
      <BlogProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<ArticleList />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/new" element={<NewArticleForm />} />
            <Route path="/edit/:id" element={<EditArticleForm />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Layout>
      </BlogProvider>
    </Router>
  );
}

export default App;
