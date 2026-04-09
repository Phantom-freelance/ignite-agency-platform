const express = require('express');
const sgMail = require('@sendgrid/mail');
const { Resend } = require('resend');
const cron = require('cron');
const db = require('./config/database');

const app = express();
app.use(require('cors')());
app.use(express.json());

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// Send welcome email to new VA
app.post('/send-welcome', async (req, res) => {
  try {
    const { vaEmail, vaName } = req.body;
    
    const msg = {
      to: vaEmail,
      from: process.env.FROM_EMAIL,
      subject: 'Welcome to Ignite Agency Platform',
      html: `
        <h1>Welcome ${vaName}!</h1>
        <p>You've been successfully onboarded to our platform.</p>
        <p>Next steps:</p>
        <ul>
          <li>Complete your profile</li>
          <li>Set up your payment account</li>
          <li>Browse available jobs</li>
        </ul>
      `
    };

    await sgMail.send(msg);
    await db.logEmail({ type: 'welcome', recipient: vaEmail, sent_at: new Date() });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send job notification
app.post('/notify-new-job', async (req, res) => {
  try {
    const { vaEmail, jobTitle, jobUrl } = req.body;

    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: vaEmail,
      subject: `New Job Match: ${jobTitle}`,
      html: `
        <h2>New Job Available!</h2>
        <p><strong>${jobTitle}</strong></p>
        <a href="${jobUrl}">View Job Details</a>
      `
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Follow-up email sequence
app.post('/trigger-followup', async (req, res) => {
  try {
    const { clientEmail, proposalId } = req.body;

    // Day 3 follow-up
    setTimeout(async () => {
      await sgMail.send({
        to: clientEmail,
        from: process.env.FROM_EMAIL,
        subject: 'Quick follow-up on our proposal',
        html: '<p>Just checking in on the proposal we sent...</p>'
      });
    }, 3 * 24 * 60 * 60 * 1000);

    res.json({ success: true, message: 'Follow-up scheduled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'running', service: 'email-automation' });
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`Email service on ${PORT}`));
