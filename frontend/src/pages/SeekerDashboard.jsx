import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyApps, withdrawApp, updateProfile } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import JobCard from '../components/JobCard';

const STATUS_COLORS = {
  applied:   'status-applied',
  review:    'status-review',
  interview: 'status-interview',
  offered:   'status-offered',
  rejected:  'status-rejected',
};

const SeekerDashboard = () => {
  const { user, refreshUser } = useAuth();
  const [tab,  setTab]  = useState('overview');
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    title: user?.title || '', bio: user?.bio || '',
    linkedin: user?.linkedin || '', location: user?.location || '',
    skills: (user?.skills || []).join(', '),
  });

  useEffect(() => {
    fetchMyApps()
      .then(r => setApps(r.data.applications))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      await withdrawApp(appId);
      setApps(a => a.filter(x => x._id !== appId));
      toast.success('Application withdrawn');
    } catch { toast.error('Failed to withdraw'); }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ ...profileForm, skills: profileForm.skills.split(',').map(s => s.trim()).filter(Boolean) });
      await refreshUser();
      toast.success('Profile updated ✅');
    } catch { toast.error('Update failed'); }
  };

  const statusCount = (s) => apps.filter(a => a.status === s).length;
  const savedJobs   = user?.savedJobs || [];

  const TABS = [
    { id:'overview',      icon:'📊', label:'Overview' },
    { id:'applications',  icon:'📋', label:'Applications' },
    { id:'saved',         icon:'🔖', label:'Saved Jobs' },
    { id:'profile',       icon:'👤', label:'Profile' },
  ];

  return (
    <div className="dash-layout">
      <aside className="sidebar">
        <div className="sidebar-user">
          <div className="avatar lg">{user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.title || 'Job Seeker'}</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {TABS.map(t => (
            <button key={t.id} className={`menu-item ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
          <Link to="/jobs" className="menu-item"><span>🔍</span> Browse Jobs</Link>
        </nav>
      </aside>

      <main className="dash-content">
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div className="dash-header">
              <h2>Good morning, {user?.name?.split(' ')[0]}! 👋</h2>
              <p>Here's your job search at a glance.</p>
            </div>
            <div className="metrics-grid">
              {[
                { label:'Applications', val: apps.length,            color:'var(--accent)' },
                { label:'Interviews',   val: statusCount('interview'),color:'var(--accent2)' },
                { label:'Offers',       val: statusCount('offered'),  color:'var(--success)' },
                { label:'Saved Jobs',   val: savedJobs.length,        color:'var(--warn)' },
              ].map(m => (
                <div key={m.label} className="metric-card">
                  <div className="metric-val" style={{ color: m.color }}>{m.val}</div>
                  <div className="metric-lbl">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="section-card">
              <div className="section-card-header">
                <h3>Application Pipeline</h3>
                <Link to="/jobs" className="btn btn-outline btn-sm">Find Jobs ↗</Link>
              </div>
              <div className="pipeline-grid">
                {[['Applied','applied'],['Review','review'],['Interview','interview'],['Offered','offered']].map(([label, s]) => (
                  <div key={s} className="pipeline-cell">
                    <div className={`pipeline-num status-${s}`}>{statusCount(s)}</div>
                    <div className="pipeline-lbl">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card">
              <div className="section-card-header"><h3>Recent Applications</h3></div>
              {apps.slice(0,3).map(a => (
                <div key={a._id} className="activity-row">
                  <span className="activity-logo">{a.job?.logo || '🏢'}</span>
                  <div className="activity-info">
                    <strong>{a.job?.title}</strong>
                    <span>{a.job?.company}</span>
                  </div>
                  <span className={`status-badge ${STATUS_COLORS[a.status]}`}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                  </span>
                </div>
              ))}
              {apps.length === 0 && <p style={{ color:'var(--text3)', fontSize:'14px' }}>No applications yet. <Link to="/jobs">Browse jobs →</Link></p>}
            </div>
          </>
        )}

        {/* APPLICATIONS */}
        {tab === 'applications' && (
          <>
            <div className="dash-header"><h2>My Applications</h2><p>{apps.length} submitted</p></div>
            <div className="section-card table-wrap">
              {loading ? <div className="spinner" /> : apps.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p>No applications yet. <Link to="/jobs">Browse jobs</Link></p>
                </div>
              ) : (
                <table>
                  <thead><tr><th>Role</th><th>Company</th><th>Applied</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {apps.map(a => (
                      <tr key={a._id}>
                        <td><strong>{a.job?.title || '—'}</strong></td>
                        <td>{a.job?.company}</td>
                        <td style={{ fontFamily:'monospace', fontSize:'12px' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                        <td><span className={`status-badge ${STATUS_COLORS[a.status]}`}>{a.status.charAt(0).toUpperCase()+a.status.slice(1)}</span></td>
                        <td>
                          {a.status === 'applied' && (
                            <button className="btn-danger btn-sm" onClick={() => handleWithdraw(a._id)}>Withdraw</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* SAVED JOBS */}
        {tab === 'saved' && (
          <>
            <div className="dash-header"><h2>Saved Jobs</h2><p>{savedJobs.length} saved</p></div>
            {savedJobs.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🏷️</div><p>No saved jobs. <Link to="/jobs">Browse jobs</Link></p></div>
            ) : (
              <div className="jobs-grid">
                {savedJobs.map(job => <JobCard key={job._id||job} job={job} onSaveToggle={refreshUser} />)}
              </div>
            )}
          </>
        )}

        {/* PROFILE */}
        {tab === 'profile' && (
          <>
            <div className="dash-header"><h2>My Profile</h2></div>
            <div className="section-card post-form">
              <form onSubmit={handleProfileSave}>
                <div className="form-group"><label>Professional Title</label>
                  <input type="text" value={profileForm.title} onChange={e => setProfileForm(f=>({...f,title:e.target.value}))} /></div>
                <div className="form-row">
                  <div className="form-group"><label>Location</label>
                    <input type="text" value={profileForm.location} placeholder="City, Country" onChange={e => setProfileForm(f=>({...f,location:e.target.value}))} /></div>
                  <div className="form-group"><label>LinkedIn</label>
                    <input type="url" value={profileForm.linkedin} placeholder="https://linkedin.com/in/…" onChange={e => setProfileForm(f=>({...f,linkedin:e.target.value}))} /></div>
                </div>
                <div className="form-group"><label>Skills (comma-separated)</label>
                  <input type="text" value={profileForm.skills} onChange={e => setProfileForm(f=>({...f,skills:e.target.value}))} /></div>
                <div className="form-group"><label>Bio</label>
                  <textarea rows={4} value={profileForm.bio} placeholder="Tell employers about yourself…" onChange={e => setProfileForm(f=>({...f,bio:e.target.value}))} /></div>
                <button type="submit" className="btn btn-primary" style={{ padding:'11px 24px' }}>Save Changes</button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SeekerDashboard;
