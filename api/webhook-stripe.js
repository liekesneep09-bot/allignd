import Stripe from 'stripe';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// We need raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to read raw body from Next.js / Vercel req stream
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let body = [];
    req.on('data', (chunk) => body.push(chunk));
    req.on('end', () => resolve(Buffer.concat(body)));
    req.on('error', (err) => reject(err));
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error("No STRIPE_WEBHOOK_SECRET configured.");
    return res.status(400).send("Webhook secret not configured.");
  }

  let event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const customerEmail = session.customer_details?.email;

    if (userId) {
      console.log(`Payment successful for user ${userId}`);
      
      // Update Supabase Profile
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_status: 'active' })
        .eq('id', userId);

      if (error) {
        console.error('Failed to update Supabase profile:', error);
      } else {
        console.log('Successfully updated Supabase profile to active.');
      }

      // Send Resend Welcome Email
      if (customerEmail) {
        try {
            await resend.emails.send({
                from: 'Allignd <info@allignd.fit>', // Must use verified domain
                to: customerEmail,
                subject: 'Welkom bij Allignd PRO! 🎉',
                html: '<h3>Gefeliciteerd met je abonnement!</h3><p>Je hebt nu onbeperkt toegang tot alle cyclus en fitness tools in Allignd.</p><p>We wensen je heel veel succes!</p><br/><p>Groetjes,<br/>Team Allignd</p>'
            });
            console.log(`Welcome email sent to ${customerEmail}`);
        } catch (emailError) {
            console.error('Failed to send Resend email:', emailError);
        }
      }
    } else {
      console.warn("Checkout session completed, but no client_reference_id found.");
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).send('Event received');
}
