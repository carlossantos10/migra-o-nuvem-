export default async function handler(req, res) {
  const { store_id, endpoint } = req.query;

  const cookies = Object.fromEntries(
    (req.headers.cookie || '').split('; ').filter(Boolean).map(c => {
      const [k, ...v] = c.split('=');
      return [k, v.join('=')];
    })
  );
  const token = cookies.ns_token;

  if (!store_id || !token) {
    return res.status(401).json({ error: 'store_id ou token ausente', store_id, hasToken: !!token });
  }

  const ep = endpoint || 'products';

  try {
    const fetch = (await import('node-fetch')).default;
    const url = `https://api.nuvemshop.com.br/v1/${store_id}/${ep}`;
    const response = await fetch(url, {
      headers: {
        'Authentication': `bearer ${token}`,
        'User-Agent': 'MigrationReportApp/1.0',
      },
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao consultar API', detail: error.message });
  }
}