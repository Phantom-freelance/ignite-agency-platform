const express = require('express');
const app = express();
app.use(require('cors')());
app.use(express.json());

const DEMO_MODE = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes('demo') || process.env.ANTHROPIC_API_KEY.includes('placeholder');

const generateDemoProposal = (jobDescription, clientName, budget, skills) => `
Dear ${clientName || 'Hiring Manager'},

I am excited to apply for this opportunity. Having reviewed your requirements carefully, I am confident I can deliver exceptional results.

Regarding your project: "${jobDescription?.substring(0, 100)}..."

My relevant skills include: ${Array.isArray(skills) ? skills.join(', ') : skills || 'project management, communication, organization'}.

**What I bring to the table:**
- 5+ years of virtual assistant experience
- Proven track record of meeting deadlines
- Excellent communication and organizational skills
- Proficiency in all major productivity tools

**My Approach:**
1. Initial consultation to understand your exact needs
2. Set up streamlined workflows and systems
3. Regular check-ins and progress reports
4. Continuous improvement based on your feedback

Regarding the budget of $${budget || 'your stated amount'} - I believe this is fair for the value I will deliver.

I am available to start immediately and can dedicate full attention to your project.

Looking forward to discussing how I can help!

Best regards,
Ignite Agency VA Team
`.trim();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'proposal-engine', mode: DEMO_MODE ? 'demo' : 'live' });
});

app.post('/generate-proposal', async (req, res) => {
  try {
    const { jobDescription, clientName, budget, skills } = req.body;
    if (!jobDescription) return res.status(400).json({ error: 'jobDescription is required' });

    if (DEMO_MODE) {
      console.log('[DEMO MODE] Generating demo proposal for:', clientName);
      return res.json({
        success: true,
        mode: 'demo',
        proposal: generateDemoProposal(jobDescription, clientName, budget, skills),
        note: 'Add real ANTHROPIC_API_KEY to .env for AI-powered proposals'
      });
    }

    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Write a professional Upwork proposal for this job:
Job: ${jobDescription}
Client: ${clientName}
Budget: $${budget}
Skills needed: ${Array.isArray(skills) ? skills.join(', ') : skills}

Write a compelling, personalized proposal that highlights relevant experience and value.`
      }]
    });
    res.json({ success: true, mode: 'live', proposal: message.content[0].text });
  } catch (error) {
    console.error('Proposal error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Proposal engine running on port ${PORT} | Demo mode: ${DEMO_MODE}`));
