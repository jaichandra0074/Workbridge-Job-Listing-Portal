const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Job  = require('../models/Job');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany();
  await Job.deleteMany();

  const hash = await bcrypt.hash('pass123', 10);

  const [alice, bob] = await User.insertMany([
    { name: 'Alice Chen',     email: 'alice@email.com', password: hash, role: 'seeker',   title: 'Full Stack Developer', skills: ['React','Node.js','TypeScript'] },
    { name: 'Bob Williams',   email: 'bob@email.com',   password: hash, role: 'employer', company: 'TechCorp' },
    { name: 'Sara Kim',       email: 'sara@email.com',  password: hash, role: 'seeker',   title: 'UX Designer', skills: ['Figma','Sketch','CSS'] },
  ]);

  await Job.insertMany([
    { title:'Senior Frontend Engineer', company:'Stripe',     logo:'💳', location:'San Francisco, CA', type:'Full-time', remote:true,  salary:'$160k–$200k', exp:'5+ years', tags:['React','TypeScript','GraphQL','CSS'],         description:'Build the next generation of payment UIs used by millions.',  category:'Engineering', postedBy: bob._id },
    { title:'Product Designer',         company:'Figma',      logo:'🎨', location:'New York, NY',       type:'Full-time', remote:false, salary:'$130k–$165k', exp:'3+ years', tags:['Figma','Prototyping','Design Systems','UX Research'], description:'Shape the future of collaborative design tools.',              category:'Design',      postedBy: bob._id },
    { title:'Backend Engineer – Node',  company:'Vercel',     logo:'▲',  location:'Remote',             type:'Full-time', remote:true,  salary:'$140k–$180k', exp:'4+ years', tags:['Node.js','PostgreSQL','Redis','Docker'],      description:'Power the infrastructure behind millions of deployments.',    category:'Engineering', postedBy: bob._id },
    { title:'Data Scientist',           company:'OpenAI',     logo:'🤖', location:'San Francisco, CA', type:'Full-time', remote:true,  salary:'$180k–$250k', exp:'3+ years', tags:['Python','PyTorch','Statistics','SQL'],          description:'Drive research and product improvements through data.',       category:'Data',        postedBy: bob._id },
    { title:'DevOps Engineer',          company:'Cloudflare', logo:'☁️', location:'Austin, TX',         type:'Full-time', remote:true,  salary:'$135k–$170k', exp:'4+ years', tags:['Kubernetes','Terraform','AWS','CI/CD'],        description:'Scale infrastructure to serve hundreds of millions of users.',category:'Engineering', postedBy: bob._id },
    { title:'Growth Marketing Manager', company:'Linear',     logo:'📐', location:'Remote',             type:'Full-time', remote:true,  salary:'$110k–$145k', exp:'3+ years', tags:['SEO','Analytics','Email','GTM'],               description:'Drive user acquisition and retention for a fast-growing SaaS.',category:'Marketing', postedBy: bob._id },
  ]);

  console.log('✅ Database seeded successfully!');
  process.exit();
};

seed().catch(err => { console.error(err); process.exit(1); });
