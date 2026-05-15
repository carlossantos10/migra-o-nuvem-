export default async function handler(req, res) {
  const cookies = Object.fromEntries(
    (req.headers.cookie || '').split('; ').filter(Boolean).map(c => c.split('='))
  );
  const token = cookies.ns_token;
  const storeId = cookies.ns_store_id;

  if (!token || !storeId) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const { endpoint } = req.query;
  if (!endpoint) {
    return res.status(400).json({ error: 'Parâmetro endpoint obrigatório' });
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const url = `https://api.nuvemshop.com.br/v1/${storeId}/${endpoint}`;
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