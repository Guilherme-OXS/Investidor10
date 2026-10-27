// API Serverless Vercel - Gestão de Carteira & Sincronização em Nuvem (PC <-> Celular)
// Suporta Upstash Redis / Vercel KV REST API nativo (100% gratuito)

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const kvUrl = 
    process.env.STORAGE_REST_API_URL || 
    process.env.KV_REST_API_URL || 
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.STORAGE_URL;

  const kvToken = 
    process.env.STORAGE_REST_API_TOKEN || 
    process.env.KV_REST_API_TOKEN || 
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.STORAGE_TOKEN;

  const { username } = req.query;
  const targetUser = (username || 'guilherme').toLowerCase().trim();
  const dbKey = `investlucro:portfolio:${targetUser}`;

  try {
    // 1. LEITURA DA CARTEIRA NA NUVEM
    if (req.method === 'GET') {
      if (kvUrl && kvToken) {
        // Busca direta no Upstash Redis / Vercel KV REST API
        const response = await fetch(`${kvUrl}/get/${dbKey}`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        });
        const data = await response.json();
        
        let portfolio = [];
        if (data && data.result) {
          portfolio = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        }

        return res.status(200).json({
          success: true,
          source: 'cloud_kv',
          portfolio,
          lastSync: new Date().toISOString()
        });
      }

      // Se o usuário ainda não adicionou Upstash na Vercel, responde indicando prontidão
      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        message: 'Storage em nuvem pronto. Para sincronizar automaticamente celular e PC, ative o Upstash KV no painel da Vercel (1 clique grátis).',
        portfolio: null,
        lastSync: new Date().toISOString()
      });
    }

    // 2. GRAVAÇÃO DA CARTEIRA NA NUVEM (DO CELULAR OU DO COMPUTADOR)
    if (req.method === 'POST') {
      const { portfolio } = req.body || {};

      if (!Array.isArray(portfolio)) {
        return res.status(400).json({ success: false, message: 'Dados de carteira inválidos.' });
      }

      if (kvUrl && kvToken) {
        // Grava no Upstash Redis / Vercel KV REST API
        await fetch(`${kvUrl}/set/${dbKey}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(portfolio)
        });

        return res.status(200).json({
          success: true,
          source: 'cloud_kv',
          message: 'Carteira salva e sincronizada na nuvem com sucesso!',
          savedCount: portfolio.length,
          updatedAt: new Date().toISOString()
        });
      }

      return res.status(200).json({
        success: true,
        source: 'local_fallback',
        message: 'Salvo localmente no dispositivo. Adicione as chaves KV na Vercel para sincronização instantânea entre celular e computador.',
        savedCount: portfolio.length,
        updatedAt: new Date().toISOString()
      });
    }

    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  } catch (err) {
    console.error('Erro na API de Portfólio:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
