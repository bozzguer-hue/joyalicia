// Vercel Serverless function to proxy form submissions to Formspree
// Expects environment variable FORMSPREE_ENDPOINT (full URL, e.g. https://formspree.io/f/{id})
module.exports = async (req, res) => {
  const endpoint = process.env.FORMSPREE_ENDPOINT;
  if (!endpoint) {
    res.status(500).json({ error: 'Formspree endpoint not configured (FORMSPREE_ENDPOINT).' });
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const payload = req.body || {};
    // simple honeypot
    if (payload._gotcha) {
      // silently accept bots
      res.status(200).json({ ok: true });
      return;
    }

    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await r.text();
    if (r.ok) {
      res.status(200).json({ ok: true, data: data });
    } else {
      res.status(r.status).json({ error: 'Upstream error', data: data });
    }
  } catch (err) {
    res.status(500).json({ error: 'Proxy error', details: String(err) });
  }
};
