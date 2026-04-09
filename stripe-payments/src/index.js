const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('./config/database');

const app = express();
app.use(require('cors')());
app.use(express.json());
app.use(express.raw({ type: 'application/json' }));

// Create Connected Account for VA
app.post('/create-va-account', async (req, res) => {
  try {
    const { email, country } = req.body;
    
    const account = await stripe.accounts.create({
      type: 'express',
      country: country || 'US',
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      }
    });

    await db.saveVAAccount({
      stripe_account_id: account.id,
      email: email,
      status: 'pending'
    });

    res.json({ success: true, accountId: account.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Escrow Payment
app.post('/create-escrow', async (req, res) => {
  try {
    const { amount, vaAccountId, projectId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      transfer_data: {
        destination: vaAccountId
      },
      metadata: {
        project_id: projectId,
        type: 'escrow'
      }
    });

    await db.saveEscrow({
      payment_intent_id: paymentIntent.id,
      amount: amount,
      va_account_id: vaAccountId,
      project_id: projectId,
      status: 'held'
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Release Milestone Payment
app.post('/release-milestone', async (req, res) => {
  try {
    const { escrowId, milestoneAmount } = req.body;

    const escrow = await db.getEscrow(escrowId);
    
    const transfer = await stripe.transfers.create({
      amount: milestoneAmount * 100,
      currency: 'usd',
      destination: escrow.va_account_id
    });

    await db.updateMilestone({
      escrow_id: escrowId,
      amount: milestoneAmount,
      transfer_id: transfer.id,
      released_at: new Date()
    });

    res.json({ success: true, transferId: transfer.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook handler
app.post('/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await db.updateEscrowStatus(event.data.object.id, 'confirmed');
        break;
      case 'transfer.created':
        console.log('Transfer created:', event.data.object.id);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'running', service: 'stripe-payments' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Stripe service on ${PORT}`));
