require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const path = require('path');
const app = express();
const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey || !/^sk_(test|live)_/.test(secretKey) || secretKey.includes('replace')) {
  console.error('STRIPE_SECRET_KEY must be configured securely before starting the server.');
  process.exit(1);
}
const stripe = new Stripe(secretKey);
const port = Number(process.env.PORT || 4242);
const domain = process.env.DOMAIN || 'http://localhost:4242';

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const prices = {
  essential: process.env.STRIPE_PRICE_ESSENTIAL,
  plus: process.env.STRIPE_PRICE_PLUS,
  elite: process.env.STRIPE_PRICE_ELITE,
};

app.post('/create-checkout-session', async (req, res) => {
  const tier = String(req.body.tier || '').toLowerCase();
  const price = prices[tier];
  if (!['essential', 'plus', 'elite'].includes(tier) || !price || !price.startsWith('price_') || price.includes('replace')) {
    return res.status(400).send('Invalid membership or Stripe Price ID not configured.');
  }
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      ui_mode: 'hosted_page',
      success_url: `${domain}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/`,
      line_items: [{ price, quantity: 1 }],
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      automatic_tax: { enabled: false },
      allow_promotion_codes: false,
      payment_method_collection: 'always',
      submit_type: 'auto',
      tax_id_collection: { enabled: true, required: 'if_supported' },
      consent_collection: { terms_of_service: 'required' },
      custom_text: {
        terms_of_service_acceptance: {
          message: 'Welcome to LOVE FEMMIE GLOBAL! By subscribing, you agree to our Terms of Service and Privacy Policy. Paid memberships renew automatically at the selected subscription rate unless canceled. Eligible introductory trials convert to paid subscriptions unless canceled before the trial ends. You can manage or cancel your subscription through your account. Membership benefits vary by plan.',
        },
      },
      integration_identifier: 'hosted_web_0002',
      origin_context: 'web',
      branding_settings: {
        background_color: '#5f963a',
        button_color: '#2f6127',
        font_family: 'default',
        border_style: 'rounded',
        logo: { type: 'file', file: 'file_1UbgWwQ6WV33OqxE5xgqwYYF' },
      },
    });
    return res.redirect(303, session.url);
  } catch (err) {
    console.error('Stripe Checkout Session creation failed:', err.type || 'StripeError');
    return res.status(502).send('Checkout is temporarily unavailable.');
  }
});

app.listen(port, () => console.log(`LOVE FEMMIE server listening on port ${port}`));
