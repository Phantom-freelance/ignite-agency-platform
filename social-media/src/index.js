const express = require('express');
const app = express();
app.use(require('cors')());
app.use(express.json());

const DEMO_MODE = true;

const logPost = (platform, content) => {
  console.log(`[DEMO] Posted to ${platform}:`, content?.substring(0, 80));
  return { id: `demo_${Date.now()}`, platform, content, posted_at: new Date().toISOString() };
};

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'social-media', mode: 'demo' }));

app.post('/tweet', (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'content required' });
  const result = logPost('twitter', content);
  res.json({ success: true, ...result, note: 'Add real Twitter keys to go live' });
});

app.post('/linkedin-post', (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'content required' });
  const result = logPost('linkedin', content);
  res.json({ success: true, ...result, note: 'Add real LinkedIn token to go live' });
});

app.post('/auto-post-success', (req, res) => {
  const { vaName, projectTitle, amount } = req.body;
  const content = `🎉 Success Story! Our VA ${vaName || 'team member'} just completed "${projectTitle || 'a project'}" earning $${amount || '500'}! #VirtualAssistant #IgniteAgency #Success`;
  const twitter = logPost('twitter', content);
  const linkedin = logPost('linkedin', content);
  res.json({ success: true, twitter, linkedin });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Social media service running on port ${PORT} | DEMO MODE`));
