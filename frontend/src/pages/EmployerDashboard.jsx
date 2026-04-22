import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyJobs, deleteJob, fetchJobApps, updateAppStatus, createJob } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const STATUS_COLORS = { applied:'status-applied', review:'status-review', interview:'status-interview', offered:'status-offered', rejected:'status-rejected' };
const STATUSES = ['applied','review','interview','offered','rejected'];

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [tab,  setTab]  = useState('overview');
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postForm, setPostForm] = useState({
    title:'', company: user?.company||'', location:'', type:'Full-time',
    remote:false, salary:'', exp:'', category:'Engineering', tags:'', description:'',
  });

  useEffect(() => {
    fetchMyJobs()
      .then(r => setJobs(r.data.jobs))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadCandidates = async (jobId) => {
    setSelectedJob(jobId);
    try {
      const r = await fetchJobApps(jobId);
      setCandidates(r.data.applications);
    } catch { toast.error('Failed to load candidates'); }
  };

  const handleStatusChange = async (appId, status) => {
    try {
      await updateAppStatus(appId, { status });
      setCandidates(c => c.map(a => a._id === appId ? { ...a, status } : a));
      toast.success(`Status updated to ${status}`);
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Delete this job listing?')) return;
    try {
      await deleteJob(jobId);
      setJobs(j => j.filter(x => x._id !== jobId));
      toast.success('Job deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...postForm, tags: postForm.tags.split(',').map(t=>t.trim()).filter(Boolean) };
      const r = await createJob(payload);
      setJobs(j => [r.data.job, ...j]);
      toast.success('Job posted! 📋');
      setTab('jobs');
      setPostForm({ title:'', company:user?.company||'', location:'', type:'Full-time', remote:false, salary:'', exp:'', category:'Engineering', tags:'', description:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post job'); }
  };

  const set = k => e => setPostForm(f => ({ ...f, [k]: e.target.value }));

  const totalApplicants = jobs.reduce((s, j) => s + (j.applicants || 0), 0);

  const TABS = [
    { id:'overview',   icon:'📊', label:'Overview' },
    { id:'jobs',       icon:'💼', label:'My Jobs' },
    { id:'candidates', icon:'👥', label:'Candidates' },
    { id:'post',       icon:'➕', label:'Post a Job' },
  ];

  return (
    <div className="dash-layout">
      <aside className="sidebar">
        <div className="sidebar-user">
          <div className="avatar lg">{user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.company || 'Employer'}</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {TABS.map(t => (
            <button key={t.id} className={`menu-item ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="dash-content">
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div className="dash-header"><h2>Employer Dashboard</h2><p>Manage your listings and candidates.</p></div>
            <div className="metrics-grid">
              {[
                { label:'Active Jobs',    val: jobs.length,          color:'var(--accent)' },
                { label:'Total Applicants',val: totalApplicants,     color:'var(--accent2)' },
                { label:'Active Listings', val: jobs.filter(j=>j.open).length, color:'var(--success)' },
              ].map(m => (
                <div key={m.label} className="metric-card">
                  <div className="metric-val" style={{ color: m.color }}>{m.val}</div>
                  <div className="metric-lbl">{m.label}</div>
                </div>
              ))}
            </div>
            <div className="section-card">
              <div className="section-card-header">
                <h3>Top Listings</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setTab('post')}>+ Post Job</button>
              </div>
              {loading ? <div className="spinner" /> : (
                <table>
                  <thead><tr><th>Role</th><th>Applicants</th><th>Status</th></tr></thead>
                  <tbody>
                    {jobs.slice(0,5).map(j => (
                      <tr key={j._id} style={{ cursor:'pointer' }} onClick={() => { setTab('candidates'); loadCandidates(j._id); }}>
                        <td><strong>{j.title}</strong></td>
                        <td>{j.applicants}</td>
                        <td><span className={`status-badge ${j.open?'status-active':'status-closed'}`}>{j.open?'Active':'Closed'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* MY JOBS */}
        {tab === 'jobs' && (
          <>
            <div className="dash-header"><h2>My Job Listings</h2></div>
            <div className="section-card table-wrap">
              <div className="section-card-header">
                <h3>{jobs.length} listings</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setTab('post')}>+ Post New</button>
              </div>
              {jobs.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📋</div><p>No jobs posted yet.</p></div>
              ) : (
                <table>
                  <thead><tr><th>Title</th><th>Category</th><th>Applicants</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {jobs.map(j => (
                      <tr key={j._id}>
                        <td><strong>{j.title}</strong></td>
                        <td>{j.category}</td>
                        <td style={{ cursor:'pointer', color:'var(--accent)', fontWeight:600 }}
                          onClick={() => { setTab('candidates'); loadCandidates(j._id); }}>
                          {j.applicants} →
                        </td>
                        <td><span className={`status-badge ${j.open?'status-active':'status-closed'}`}>{j.open?'Active':'Closed'}</span></td>
                        <td style={{ display:'flex', gap:'6px' }}>
                          <button className="btn-danger btn-sm" onClick={() => handleDelete(j._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* CANDIDATES */}
        {tab === 'candidates' && (
          <>
            <div className="dash-header"><h2>Candidates</h2></div>
            <div className="section-card" style={{ marginBottom:'1rem' }}>
              <label style={{ fontSize:'13px', color:'var(--text2)', marginRight:'10px' }}>View candidates for:</label>
              <select style={{ width:'auto', padding:'7px 12px', borderRadius:'8px', fontSize:'13px' }}
                value={selectedJob||''} onChange={e => loadCandidates(e.target.value)}>
                <option value="">Select a job…</option>
                {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
              </select>
            </div>
            {candidates.length > 0 ? (
              <div className="section-card table-wrap">
                <table>
                  <thead><tr><th>Candidate</th><th>Applied</th><th>Status</th><th>Change Status</th></tr></thead>
                  <tbody>
                    {candidates.map(a => (
                      <tr key={a._id}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                            <div className="avatar sm">{a.applicant?.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
                            <div>
                              <strong style={{ fontSize:'13.5px' }}>{a.applicant?.name}</strong>
                              <div style={{ fontSize:'12px', color:'var(--text3)' }}>{a.applicant?.title}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize:'12px', fontFamily:'monospace' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                        <td><span className={`status-badge ${STATUS_COLORS[a.status]}`}>{a.status.charAt(0).toUpperCase()+a.status.slice(1)}</span></td>
                        <td>
                          <select style={{ width:'auto', padding:'5px 8px', borderRadius:'6px', fontSize:'12px' }}
                            value={a.status} onChange={e => handleStatusChange(a._id, e.target.value)}>
                            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : selectedJob ? (
              <div className="empty-state"><div className="empty-icon">👥</div><p>No applicants yet for this job.</p></div>
            ) : (
              <div className="empty-state"><div className="empty-icon">👆</div><p>Select a job listing above to view candidates.</p></div>
            )}
          </>
        )}

        {/* POST A JOB */}
        {tab === 'post' && (
          <>
            <div className="dash-header"><h2>Post a Job</h2><p>Reach thousands of qualified candidates.</p></div>
            <div className="section-card post-form">
              <form onSubmit={handlePost}>
                <div className="form-row">
                  <div className="form-group"><label>Job Title *</label>
                    <input required placeholder="e.g. Senior React Developer" value={postForm.title} onChange={set('title')} /></div>
                  <div className="form-group"><label>Company *</label>
                    <input required placeholder="Your company name" value={postForm.company} onChange={set('company')} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Location *</label>
                    <input required placeholder="City, State or Remote" value={postForm.location} onChange={set('location')} /></div>
                  <div className="form-group"><label>Salary Range</label>
                    <input placeholder="e.g. $120k–$160k" value={postForm.salary} onChange={set('salary')} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Job Type</label>
                    <select value={postForm.type} onChange={set('type')}>
                      {['Full-time','Part-time','Contract','Internship'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Category</label>
                    <select value={postForm.category} onChange={set('category')}>
                      {['Engineering','Design','Data','Marketing','HR','Operations','Other'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Experience Level</label>
                    <input placeholder="e.g. 3+ years" value={postForm.exp} onChange={set('exp')} /></div>
                  <div className="form-group"><label>Remote</label>
                    <select value={postForm.remote} onChange={e => setPostForm(f=>({...f,remote:e.target.value==='true'}))}>
                      <option value="false">On-site</option>
                      <option value="true">Remote</option>
                    </select>
                  </div>
                </div>
                <div className="form-group"><label>Skills / Tags (comma-separated)</label>
                  <input placeholder="React, TypeScript, Node.js" value={postForm.tags} onChange={set('tags')} /></div>
                <div className="form-group"><label>Job Description *</label>
                  <textarea required rows={5} placeholder="Describe the role, responsibilities, and what makes this opportunity great…"
                    value={postForm.description} onChange={set('description')} /></div>
                <div style={{ display:'flex', gap:'10px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setPostForm({ title:'', company:user?.company||'', location:'', type:'Full-time', remote:false, salary:'', exp:'', category:'Engineering', tags:'', description:'' })}>Clear</button>
                  <button type="submit" className="btn btn-primary" style={{ flex:1, padding:'12px' }}>Publish Job Listing →</button>
                </div>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default EmployerDashboard;
