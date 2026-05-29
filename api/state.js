import { createClient } from '@upstash/redis';

const redis = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  const { store_id } = req.query;

  if (!store_id) {
    return res.status(400).json({ error: 'store_id obrigatório' });
  }

  const key = `migration:${store_id}`;

  if (req.method === 'GET') {
    try {
      const data = await redis.get(key);
      return res.status(200).json(data || null);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao ler estado', detail: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      await redis.set(key, body);
      return res.status(200).json({ ok: true });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao salvar estado', detail: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}