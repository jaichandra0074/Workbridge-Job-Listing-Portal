import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchJob, applyToJob, toggleSaveJob } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const JobDetail = () => {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [job,     setJob]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [applying,  setApplying]  = useState(false);
  const [form, setForm] = useState({ coverLetter: '', portfolioUrl: '' });

  useEffect(() => {
    fetchJob(id)
      .then(r => setJob(r.data.job))
      .catch(() => navigate('/jobs'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const isSaved = user?.savedJobs?.some(s => (s._id || s) === id);

  const handleSave = async () => {
    if (!user) { toast.info('Sign in to save jobs'); return; }
    await toggleSaveJob(id);
    await refreshUser();
    toast.success(isSaved ? 'Removed from saved' : 'Job saved! 🔖');
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setApplying(true);
    try {
      await applyToJob(id, form);
      toast.success('Application submitted! 🚀');
      setShowModal(false);
      setJob(j => ({ ...j, applicants: j.applicants + 1 }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally { setApplying(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!job)    return null;

  return (
    <div className="job-detail-page container">
      <button className="btn btn-ghost btn-sm back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="job-detail-layout">
        {/* Main content */}
        <div className="job-detail-main">
          <div className="job-detail-header">
            <div className="jd-logo">{job.logo || '🏢'}</div>
            <div>
              <h1>{job.title}</h1>
              <div className="jd-meta">
                <span className="company-name">{job.company}</span>
                <span>·</span>
                <span>📍 {job.location}</span>
                {job.remote && <><span>·</span><span>🌐 Remote OK</span></>}
              </div>
            </div>
          </div>

          <div className="job-badges" style={{ marginBottom: '1.5rem' }}>
            <span className="badge badge-type">{job.type}</span>
            {job.exp    && <span className="badge badge-exp">⚡ {job.exp}</span>}
            {job.salary && <span className="badge" style={{ background:'rgba(79,212,160,.1)', color:'var(--success)' }}>{job.salary}</span>}
            <span className="badge" style={{ background:'rgba(79,142,247,.1)', color:'var(--accent)' }}>👁 {job.views} views</span>
          </div>

          <section className="jd-section">
            <h2>About the Role</h2>
            <p>{job.description}</p>
          </section>

          {job.requirements?.length > 0 && (
            <section className="jd-section">
              <h2>Requirements</h2>
              <ul className="req-list">
                {job.requirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </section>
          )}

          {job.benefits?.length > 0 && (
            <section className="jd-section">
              <h2>Benefits</h2>
              <ul className="req-list">
                {job.benefits.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </section>
          )}

          <section className="jd-section">
            <h2>Tech Stack</h2>
            <div className="job-tags">
              {job.tags?.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="job-detail-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-stat"><span>📅 Posted</span><strong>{new Date(job.createdAt).toLocaleDateString()}</strong></div>
            <div className="sidebar-stat"><span>👥 Applicants</span><strong>{job.applicants}</strong></div>
            <div className="sidebar-stat"><span>📂 Category</span><strong>{job.category}</strong></div>
            <div className="sidebar-stat"><span>💼 Type</span><strong>{job.type}</strong></div>

            <button className="btn btn-primary btn-full" style={{ marginTop:'1.2rem' }}
              onClick={() => user ? setShowModal(true) : navigate('/login')}>
              Apply for this Role →
            </button>
            <button className={`btn btn-ghost btn-full ${isSaved ? 'saved' : ''}`}
              style={{ marginTop:'.6rem' }} onClick={handleSave}>
              {isSaved ? '🔖 Saved' : '🏷️ Save Job'}
            </button>
          </div>
        </aside>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply to {job.company}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-job-preview">
              <span className="jd-logo" style={{ fontSize:'24px' }}>{job.logo}</span>
              <div>
                <strong>{job.title}</strong>
                <span>{job.company} · {job.salary}</span>
              </div>
            </div>

            <form onSubmit={handleApply}>
              <div className="form-group">
                <label>Cover Letter <span style={{ color:'var(--text3)' }}>(optional)</span></label>
                <textarea rows={4} placeholder="Tell them why you're a great fit…"
                  value={form.coverLetter}
                  onChange={e => setForm(f => ({ ...f, coverLetter: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Portfolio / LinkedIn URL</label>
                <input type="url" placeholder="https://…"
                  value={form.portfolioUrl}
                  onChange={e => setForm(f => ({ ...f, portfolioUrl: e.target.value }))} />
              </div>
              <div style={{ display:'flex', gap:'10px', marginTop:'1rem' }}>
                <button type="button" className="btn btn-ghost" style={{ flex:1 }}
                  onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex:2 }} disabled={applying}>
                  {applying ? 'Submitting…' : 'Submit Application 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
