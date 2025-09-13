// Vercel Serverless function to proxy form submissions
// Handles both newsletter signups and contact form submissions
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const payload = req.body || {};
    
    // Simple honeypot check
    if (payload._gotcha) {
      // Silently accept bots
      res.status(200).json({ ok: true });
      return;
    }

    // Determine form type and handle accordingly
    const formType = payload.formType || 'newsletter';
    
    if (formType === 'contact') {
      // Handle contact form - send to joythyology@gmail.com
      const contactEndpoint = process.env.CONTACT_FORMSPREE_ENDPOINT;
      if (!contactEndpoint) {
        res.status(500).json({ error: 'Contact form endpoint not configured (CONTACT_FORMSPREE_ENDPOINT).' });
        return;
      }

      // Prepare contact form data
      const contactData = {
        name: payload.name,
        email: payload.email,
        subject: payload.subject,
        message: payload.message,
        _replyto: payload.email,
        _subject: `New Contact Form: ${payload.subject}`,
      };

      const response = await fetch(contactEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        },
        body: JSON.stringify(contactData),
      });

      const data = await response.text();
      if (response.ok) {
        res.status(200).json({ ok: true, data: data });
      } else {
        res.status(response.status).json({ error: 'Contact form submission failed', data: data });
      }
    } else {
      // Handle newsletter signup - use original endpoint
      const newsletterEndpoint = process.env.FORMSPREE_ENDPOINT;
      if (!newsletterEndpoint) {
        res.status(500).json({ error: 'Newsletter endpoint not configured (FORMSPREE_ENDPOINT).' });
        return;
      }

      const response = await fetch(newsletterEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        },
        body: JSON.stringify(payload),
      });

      const data = await response.text();
      if (response.ok) {
        res.status(200).json({ ok: true, data: data });
      } else {
        res.status(response.status).json({ error: 'Newsletter signup failed', data: data });
      }
    }
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', details: String(err) });
  }
};
