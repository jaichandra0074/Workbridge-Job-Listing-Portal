const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, minlength: 6, select: false },
  role:      { type: String, enum: ['seeker', 'employer', 'admin'], default: 'seeker' },
  // Seeker fields
  title:     { type: String },
  skills:    [{ type: String }],
  bio:       { type: String },
  linkedin:  { type: String },
  resume:    { type: String },
  location:  { type: String },
  // Employer fields
  company:   { type: String },
  website:   { type: String },
  // Shared
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  avatar:    { type: String },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
