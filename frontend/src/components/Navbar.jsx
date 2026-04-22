import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const avatar = user
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '';

  return (
    <nav className="navbar">
      <Link to="/" className="logo">⚡ WorkBridge</Link>

      <div className="nav-links">
        <Link to="/jobs" className={location.pathname === '/jobs' ? 'active' : ''}>Browse Jobs</Link>
        {user?.role === 'employer' && (
          <Link to="/post-job" className={location.pathname === '/post-job' ? 'active' : ''}>Post a Job</Link>
        )}
      </div>

      <div className="nav-right">
        {user ? (
          <>
            <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
            <div className="avatar-menu">
              <div className="avatar" onClick={() => setMenuOpen(!menuOpen)}>{avatar}</div>
              {menuOpen && (
                <div className="dropdown">
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <Link to="/profile"   onClick={() => setMenuOpen(false)}>Profile</Link>
                  <button onClick={handleLogout} className="logout-btn">Sign out</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login"    className="btn btn-ghost btn-sm">Sign in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
