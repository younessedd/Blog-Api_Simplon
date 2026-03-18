import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBlogs } from '../context/BlogContext';
import { PenTool, LogOut, Code } from 'lucide-react';

const Header = () => {
  const { adminLoggedIn, logout } = useBlogs();
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="container nav-content">
        <Link to="/" className="logo">
          <Code className="logo-icon" />
          <span>DevNews</span>
        </Link>
        <nav className="nav-links">
          {adminLoggedIn ? (
            <>
              {location.pathname !== '/new' && (
                <Link to="/new" className="btn btn-primary">
                  <PenTool size={18} /> New Post
                </Link>
              )}
              <button onClick={logout} className="btn btn-outline">
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            location.pathname !== '/login' && (
              <Link to="/login" className="btn btn-outline">
                Admin Login
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main className="container main-content">
        {children}
      </main>
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} DevNews. A Modern Blog App by Antigravity.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
