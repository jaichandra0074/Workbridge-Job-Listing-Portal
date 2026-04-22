import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState(searchParams.get('role') || 'seeker');
  const [form, setForm] = useState({ name:'', email:'', password:'', company:'', title:'' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, role });
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">⚡ WorkBridge</div>
        <h2>Create your account</h2>
        <p>Join thousands of professionals on WorkBridge</p>

        {/* Role selector */}
        <div className="role-tabs">
          <button type="button" className={`role-tab ${role==='seeker' ? 'active' : ''}`}
            onClick={() => setRole('seeker')}>👤 Job Seeker</button>
          <button type="button" className={`role-tab ${role==='employer' ? 'active' : ''}`}
            onClick={() => setRole('employer')}>🏢 Employer</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" required placeholder="Your full name" value={form.name} onChange={set('name')} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" required placeholder="you@email.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required minLength={6} placeholder="Min 6 characters" value={form.password} onChange={set('password')} />
          </div>

          {role === 'employer' && (
            <div className="form-group">
              <label>Company Name</label>
              <input type="text" required placeholder="Your company" value={form.company} onChange={set('company')} />
            </div>
          )}

          {role === 'seeker' && (
            <div className="form-group">
              <label>Professional Title <span style={{ color:'var(--text3)' }}>(optional)</span></label>
              <input type="text" placeholder="e.g. Full Stack Developer" value={form.title} onChange={set('title')} />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
