import React, { useState } from 'react';
import { useBlogs } from '../context/BlogContext';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useBlogs();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(password);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid admin password. (Hint: default is admin123)');
    }
  };

  return (
    <div className="auth-container fade-in">
      <div className="auth-card">
        <div className="auth-header">
          <div className="icon-wrapper">
            <Lock size={24} />
          </div>
          <h1>Admin Access</h1>
          <p>Sign in to manage blog posts</p>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
