const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

const DEMO_JOBS = [
  { id: 1, platform: 'upwork', title: 'Virtual Assistant for Email Management', description: 'Need a VA to manage inbox, respond to emails, and organize folders.', budget: 500, client_name: 'Sarah Johnson', skills: ['email management', 'gmail', 'organization'], url: 'https://upwork.com/demo-job-1', status: 'new', fetched_at: new Date().toISOString() },
  { id: 2, platform: 'upwork', title: 'Social Media Manager VA', description: 'Looking for a VA to schedule posts, engage with followers, and create content.', budget: 800, client_name: 'Mike Chen', skills: ['social media', 'content creation', 'instagram', 'twitter'], url: 'https://upwork.com/demo-job-2', status: 'new', fetched_at: new Date().toISOString() },
  { id: 3, platform: 'fiverr', title: 'Data Entry & Research Specialist', description: 'Need someone to compile data, do market research and create reports.', budget: 300, client_name: 'Emily Rodriguez', skills: ['data entry', 'research', 'excel', 'google sheets'], url: 'https://fiverr.com/demo-job-3', status: 'new', fetched_at: new Date().toISOString() },
  { id: 4, platform: 'upwork', title: 'Customer Support VA - E-commerce', description: 'Handle customer inquiries, returns, and order tracking for our Shopify store.', budget: 1200, client_name: 'TechGear Store', skills: ['customer support', 'shopify', 'zendesk', 'communication'], url: 'https://upwork.com/demo-job-4', status: 'new', fetched_at: new Date().toISOString() },
  { id: 5, platform: 'fiverr', title: 'Calendar & Schedule Management', description: 'Busy executive needs VA to manage calendar, book appointments, and coordinate meetings.', budget: 600, client_name: 'David Park', skills: ['calendar management', 'scheduling', 'zoom', 'google calendar'], url: 'https://fiverr.com/demo-job-5', status: 'new', fetched_at: new Date().toISOString() }
];

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'job-acquisition', mode: 'demo', jobs_available: DEMO_JOBS.length });
});

app.get('/jobs', (req, res) => {
  const { platform, status, limit = 10 } = req.query;
  let jobs = [...DEMO_JOBS];
  if (platform) jobs = jobs.filter(j => j.platform === platform);
  if (status) jobs = jobs.filter(j => j.status === status);
  res.json({ success: true, count: jobs.length, jobs: jobs.slice(0, parseInt(limit)) });
});

app.post('/fetch-jobs', (req, res) => {
  const { platform = 'all', skills = [] } = req.body;
  let jobs = [...DEMO_JOBS];
  if (platform !== 'all') jobs = jobs.filter(j => j.platform === platform);
  if (skills.length > 0) jobs = jobs.filter(j => skills.some(s => j.skills.includes(s.toLowerCase())));
  res.json({ success: true, mode: 'demo', platform, fetched: jobs.length, jobs, note: 'Connect real Upwork API credentials to fetch live jobs' });
});

app.get('/stats', (req, res) => {
  const byPlatform = DEMO_JOBS.reduce((acc, j) => { acc[j.platform] = (acc[j.platform] || 0) + 1; return acc; }, {});
  res.json({ success: true, total_jobs: DEMO_JOBS.length, by_platform: byPlatform, avg_budget: Math.round(DEMO_JOBS.reduce((sum, j) => sum + j.budget, 0) / DEMO_JOBS.length) });
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log('Job acquisition running on port ' + PORT + ' | DEMO MODE'));
