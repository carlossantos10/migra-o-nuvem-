export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { storeName, week, overallPct, phaseStats, riskyTasks, observations } = req.body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada' });
  }

  try {
    const fetch = (await import('node-fetch')).default;

    const prompt = `Você é um analista sênior de onboarding da Nuvemshop. Gere um report semanal profissional de migração com base nos dados abaixo.

Loja: ${storeName}
Semana: ${week} de 8
Progresso geral: ${overallPct}%

Status por fase:
${phaseStats}

Tarefas em risco:
${riskyTasks || 'Nenhuma'}

Observações do analista:
${observations || 'Nenhuma'}

Gere dois textos:

1. Resumo para WhatsApp (máximo 6 linhas, use emojis, tom direto e amigável)
2. E-mail completo (tom profissional, com saudação, resumo do progresso, itens em risco, próximos passos e encerramento)

Formate EXATAMENTE assim, sem texto antes ou depois:
WHATSAPP:
[texto do whatsapp]

EMAIL:
[texto do email]`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    const waMatch = text.match(/WHATSAPP:\n([\s\S]*?)(?=\nEMAIL:|$)/);
    const emailMatch = text.match(/EMAIL:\n([\s\S]*?)$/);

    res.status(200).json({
      whatsapp: waMatch?.[1]?.trim() || '',
      email: emailMatch?.[1]?.trim() || '',
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar report', detail: error.message });
  }
}