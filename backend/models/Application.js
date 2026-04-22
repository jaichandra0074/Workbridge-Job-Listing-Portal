const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job:         { type: mongoose.Schema.Types.ObjectId, ref: 'Job',  required: true },
  applicant:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:      { type: String, enum: ['applied','review','interview','offered','rejected'], default: 'applied' },
  coverLetter: { type: String },
  portfolioUrl:{ type: String },
  resume:      { type: String },
  notes:       { type: String },               // employer notes
  interviews:  [{
    scheduledAt: Date,
    type: { type: String, enum: ['phone','video','onsite'] },
    notes: String,
  }],
}, { timestamps: true });

// One application per user per job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
