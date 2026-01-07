import React, { useEffect, useState, useCallback } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import api from './api';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import FriendRequests from './pages/FriendRequests.jsx';
import ChatPage from './pages/ChatPage.jsx';
import NewPostPage from './pages/NewPostPage.jsx';
import PostDetailPage from './pages/PostDetailPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import './styles/App.css';
import ThemeToggle from './components/ThemeToggle.jsx';
import BackgroundAnimation from './components/BackgroundAnimation.jsx';

const App = () => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedTheme = localStorage.getItem('blogit_theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme);
      document.body.setAttribute('data-theme', storedTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      document.body.setAttribute('data-theme', next);
      localStorage.setItem('blogit_theme', next);
      return next;
    });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('blogit_token');
    if (!token) return;
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        if (res.data.user?.theme) {
          document.body.setAttribute('data-theme', res.data.user.theme);
          setTheme(res.data.user.theme);
        }
      })
      .catch(() => {
        localStorage.removeItem('blogit_token');
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('blogit_token');
    setUser(null);
    navigate('/');
  };

  const handleAuthSuccess = (payload) => {
    localStorage.setItem('blogit_token', payload.token);
    setUser(payload.user);
    if (payload.user?.theme) {
      document.body.setAttribute('data-theme', payload.user.theme);
      setTheme(payload.user.theme);
    }
    navigate('/dashboard');
  };

  return (
    <div className="app-shell">
      <BackgroundAnimation />
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo" />
          <div>
            <Link to="/" className="app-title display-heading" style={{ textDecoration: 'none', color: 'inherit' }}>
              BlogIt
            </Link>
            <div style={{ fontSize: '0.85rem', fontWeight: '500', letterSpacing: '0.02em', color: 'var(--fg-muted)' }}>Opinionated minimal blogging</div>
          </div>
        </div>
        <nav className="app-nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              'app-nav-link' + (isActive && location.pathname === '/' ? ' app-nav-link-active' : '')
            }
          >
            Home
          </NavLink>
          {user && (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => 'app-nav-link' + (isActive ? ' app-nav-link-active' : '')}
              >
                Profile
              </NavLink>
              <NavLink
                to="/friends"
                className={({ isActive }) => 'app-nav-link' + (isActive ? ' app-nav-link-active' : '')}
              >
                Friends
              </NavLink>
              <NavLink
                to="/new"
                className={({ isActive }) => 'app-nav-link' + (isActive ? ' app-nav-link-active' : '')}
              >
                New Post
              </NavLink>
            </>
          )}
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          {user ? (
            <>
              <button className="button" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="button button-ghost" type="button" onClick={() => navigate('/login')}>
                Log in
              </button>
              <button className="button button-primary" type="button" onClick={() => navigate('/register')}>
                Create account
              </button>
            </>
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage onAuthSuccess={handleAuthSuccess} />} />
        <Route path="/register" element={<RegisterPage onAuthSuccess={handleAuthSuccess} />} />
        <Route path="/dashboard" element={<DashboardPage user={user} setUser={setUser} />} />
        <Route path="/profile/:userId" element={<ProfilePage currentUser={user} />} />
        <Route path="/friends" element={<FriendRequests />} />
        <Route path="/chat/:userId" element={<ChatPage user={user} />} />
        <Route path="/new" element={<NewPostPage user={user} />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/account" element={<AccountPage user={user} setUser={setUser} />} />
      </Routes>
    </div>
  );
};

export default App;
