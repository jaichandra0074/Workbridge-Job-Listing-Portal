import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toggleSaveJob } from '../utils/api';
import { toast } from 'react-toastify';

const JobCard = ({ job, onSaveToggle, applied }) => {
  const { user } = useAuth();
  const isSaved = user?.savedJobs?.some(s => (s._id || s) === job._id);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) { toast.info('Sign in to save jobs'); return; }
    try {
      await toggleSaveJob(job._id);
      if (onSaveToggle) onSaveToggle(job._id);
      toast.success(isSaved ? 'Job removed from saved' : 'Job saved! 🔖');
    } catch { toast.error('Failed to save job'); }
  };

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div className="company-logo">{job.logo || '🏢'}</div>
        <div className="job-card-title">
          <h3>{job.title}</h3>
          <span className="company-name">{job.company}</span>
        </div>
      </div>

      <div className="job-badges">
        <span className="badge badge-type">{job.type}</span>
        <span className="badge badge-loc">📍 {job.location}</span>
        {job.remote && <span className="badge badge-remote">🌐 Remote</span>}
        {job.exp    && <span className="badge badge-exp">⚡ {job.exp}</span>}
      </div>

      {job.salary && <div className="job-salary">{job.salary}</div>}

      <div className="job-tags">
        {job.tags?.slice(0, 4).map(t => <span key={t} className="tag">{t}</span>)}
      </div>

      <div className="job-card-footer">
        <span className="posted-time">
          {job.applicants} applicants ·{' '}
          {new Date(job.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
        </span>
        <div className="job-actions">
          <button className={`save-btn ${isSaved ? 'saved' : ''}`} onClick={handleSave}
            title={isSaved ? 'Unsave' : 'Save'}>
            {isSaved ? '🔖' : '🏷️'}
          </button>
          {applied
            ? <span className="applied-badge">✓ Applied</span>
            : <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm">Apply Now</Link>
          }
        </div>
      </div>
    </div>
  );
};

export default JobCard;
