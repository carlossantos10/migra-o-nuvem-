export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Código de autorização ausente' });
  }

  try {
    const fetch = (await import('node-fetch')).default;

    const response = await fetch('https://www.tiendanube.com/apps/authorize/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: '31751',
        client_secret: '0444e54949b499909fcc0f293564ebb238db957876666d78',
        grant_type: 'authorization_code',
        code,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: 'Falha ao trocar código por token', detail: err });
    }

    const data = await response.json();

    res.setHeader('Set-Cookie', [
      `ns_token=${data.access_token}; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=31536000`,
      `ns_store_id=${data.user_id}; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=31536000`,
    ]);

    res.redirect(302, '/');
  } catch (error) {
    res.status(500).json({ error: 'Erro interno', detail: error.message });
  }
}