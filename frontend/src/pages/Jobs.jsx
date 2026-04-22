import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchJobs, fetchMyApps } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';

const TYPES      = ['Full-time','Part-time','Contract','Internship'];
const CATEGORIES = ['Engineering','Design','Data','Marketing','HR','Operations'];

const Jobs = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs,    setJobs]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [appliedIds, setAppliedIds] = useState(new Set());

  const [filters, setFilters] = useState({
    search:   searchParams.get('search')   || '',
    type:     searchParams.get('type')     || '',
    category: searchParams.get('category') || '',
    remote:   searchParams.get('remote')   || '',
    page:     1,
  });

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (!params.search)   delete params.search;
      if (!params.type)     delete params.type;
      if (!params.category) delete params.category;
      if (!params.remote)   delete params.remote;

      const res = await fetchJobs(params);
      setJobs(res.data.jobs);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  // Load user's applied jobs
  useEffect(() => {
    if (user?.role === 'seeker') {
      fetchMyApps().then(r => {
        setAppliedIds(new Set(r.data.applications.map(a => a.job._id)));
      }).catch(() => {});
    }
  }, [user]);

  const setFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val, page: 1 }));
    setSearchParams(prev => { if (val) prev.set(key, val); else prev.delete(key); return prev; });
  };

  return (
    <div className="jobs-page">
      <div className="jobs-hero">
        <h1>Browse Jobs</h1>
        <p>{total} open positions</p>
      </div>

      <div className="jobs-layout container">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <h3>Filters</h3>

          <div className="filter-group">
            <label>Search</label>
            <input type="text" placeholder="Title, skill, company…"
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Job Type</label>
            {TYPES.map(t => (
              <label key={t} className="checkbox-label">
                <input type="radio" name="type" checked={filters.type===t}
                  onChange={() => setFilter('type', filters.type===t ? '' : t)} />
                {t}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select value={filters.category} onChange={e => setFilter('category', e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Work Mode</label>
            <label className="checkbox-label">
              <input type="radio" name="remote" checked={filters.remote==='true'}
                onChange={() => setFilter('remote', filters.remote==='true' ? '' : 'true')} />
              Remote Only
            </label>
            <label className="checkbox-label">
              <input type="radio" name="remote" checked={filters.remote==='false'}
                onChange={() => setFilter('remote', filters.remote==='false' ? '' : 'false')} />
              On-site Only
            </label>
          </div>

          <button className="btn btn-ghost btn-full"
            onClick={() => { setFilters({ search:'', type:'', category:'', remote:'', page:1 }); setSearchParams({}); }}>
            Clear Filters
          </button>
        </aside>

        {/* Job Results */}
        <main className="jobs-results">
          <div className="results-header">
            <span>{total} jobs found</span>
          </div>

          {loading ? (
            <div className="jobs-grid">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p>No jobs match your filters.</p>
              <button className="btn btn-outline" onClick={() => { setFilters({ search:'', type:'', category:'', remote:'', page:1 }); setSearchParams({}); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="jobs-grid">
                {jobs.map(job => (
                  <JobCard key={job._id} job={job} applied={appliedIds.has(job._id)} />
                ))}
              </div>
              {pages > 1 && (
                <div className="pagination">
                  {[...Array(pages)].map((_, i) => (
                    <button key={i}
                      className={`page-btn ${filters.page === i+1 ? 'active' : ''}`}
                      onClick={() => setFilters(f => ({ ...f, page: i+1 }))}>
                      {i+1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Jobs;
