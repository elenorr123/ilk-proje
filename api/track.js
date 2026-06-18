module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const PIXEL_ID = '1994951467985604';
  const TOKEN = process.env.META_CAPI_TOKEN;

  const { event_name, event_source_url, client_user_agent, fbc, fbp } = req.body;

  const payload = {
    data: [{
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url,
      user_data: {
        client_user_agent,
        ...(fbc && { fbc }),
        ...(fbp && { fbp }),
      },
    }],
  };

  try {
    const r = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    const data = await r.json();
    console.log('CAPI response:', JSON.stringify(data));
    res.status(200).json(data);
  } catch (err) {
    console.error('CAPI error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
