import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJobs } from '../utils/api';
import JobCard from '../components/JobCard';

const CATEGORIES = ['Engineering','Design','Data','Marketing','HR','Operations'];

const Home = () => {
  const [search, setSearch]   = useState('');
  const [jobs,   setJobs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs({ limit: 6 })
      .then(r => setJobs(r.data.jobs))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <h1>Find Your <span className="gradient-text">Dream Job</span><br />Start Today</h1>
        <p>Connect with top companies. Smart filters. Real opportunities.</p>
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Job title, skill, or company…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search Jobs</button>
        </form>
        <div className="stats-row">
          <div className="stat"><span className="stat-num">500+</span><span className="stat-lbl">Open Roles</span></div>
          <div className="stat"><span className="stat-num">200+</span><span className="stat-lbl">Companies</span></div>
          <div className="stat"><span className="stat-num">12k+</span><span className="stat-lbl">Hired This Month</span></div>
        </div>
      </section>

      {/* Categories */}
      <section className="section categories-section">
        <div className="container">
          <h2 className="section-title">Browse by Category</h2>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <div key={cat} className="category-card"
                onClick={() => navigate(`/jobs?category=${cat}`)}>
                <span className="cat-icon">
                  {cat==='Engineering'?'💻':cat==='Design'?'🎨':cat==='Data'?'📊':cat==='Marketing'?'📣':cat==='HR'?'👥':'⚙️'}
                </span>
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Jobs</h2>
            <a href="/jobs" className="see-all">See all jobs →</a>
          </div>
          {loading ? (
            <div className="loading-grid">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : (
            <div className="jobs-grid">
              {jobs.map(job => <JobCard key={job._id} job={job} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div>
            <h2>Are you hiring?</h2>
            <p>Post your job and reach thousands of qualified candidates today.</p>
          </div>
          <a href="/register?role=employer" className="btn btn-primary btn-lg">Post a Job →</a>
        </div>
      </section>
    </div>
  );
};

export default Home;
