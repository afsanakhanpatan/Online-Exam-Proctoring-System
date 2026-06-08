import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole) {
      navigate(userRole === 'admin' ? '/admin' : '/student');
    }
  }, [navigate]);
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = isLogin 
        ? await authAPI.login({ username: formData.username, password: formData.password })
        : await authAPI.register(formData);
      
      const { token, role, username } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role.toLowerCase());
      localStorage.setItem('username', username);
      localStorage.setItem('email', isLogin ? `${username}@student.com` : formData.email);
      
      navigate(role === 'ADMIN' ? '/admin' : '/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            🎓
          </div>
          <h1 className="login-title">StudySprint</h1>
          <p className="login-subtitle">AI-Powered Learning Management System</p>
        </div>
        
        <div className="auth-toggle">
          <button 
            type="button"
            className={isLogin ? 'active' : ''}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={!isLogin ? 'active' : ''}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group animate-slide-in">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group animate-slide-in">
              <label className="form-label">Account Type</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="STUDENT">👨‍🎓 Student Account</option>
                <option value="ADMIN">👨‍💼 Administrator Account</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary auth-btn" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-pulse">⏳</span>
                Processing...
              </>
            ) : (
              <>
                {isLogin ? '🔐 Sign In' : '✨ Create Account'}
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-secondary">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-primary-600 font-medium hover:text-primary-700 transition"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {isLogin ? 'Sign up here' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;