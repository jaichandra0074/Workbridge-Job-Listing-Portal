const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  company:     { type: String, required: true },
  logo:        { type: String, default: '🏢' },
  location:    { type: String, required: true },
  type:        { type: String, enum: ['Full-time','Part-time','Contract','Internship'], default: 'Full-time' },
  remote:      { type: Boolean, default: false },
  salary:      { type: String },
  exp:         { type: String },
  category:    { type: String, enum: ['Engineering','Design','Data','Marketing','HR','Operations','Other'], default: 'Engineering' },
  tags:        [{ type: String }],
  description: { type: String, required: true },
  requirements:[{ type: String }],
  benefits:    [{ type: String }],
  open:        { type: Boolean, default: true },
  postedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicants:  { type: Number, default: 0 },
  views:       { type: Number, default: 0 },
}, { timestamps: true });

// Full-text search index
jobSchema.index({ title: 'text', company: 'text', tags: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);
