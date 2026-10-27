// API Serverless Vercel - Autenticação Segura & Primeiro Acesso (Upstash Cloud)
// Gerenciamento de credenciais na nuvem com hash criptográfico (SHA-256 + salt)

const crypto = require('crypto');

const AUTHORIZED_INVITES = ['INVEST-VIP', 'LUCRO-B3', 'AMIGO-VIP', 'GUILHERME-VIP'];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
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

  const { action } = req.query;

  try {
    // 1. LOGIN / PRIMEIRO ACESSO
    if (req.method === 'POST' && action === 'login') {
      const { username, password } = req.body || {};
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios.' });
      }

      const rawUser = username.trim();
      const u = rawUser.toLowerCase();
      const isMasterAdmin = (u === 'guilherme.otavio' || u === 'guilherme' || u === 'guilhermeotavioxxsouza@gmail.com');

      // Se temos o Upstash Redis conectado
      if (kvUrl && kvToken) {
        const userDbKey = isMasterAdmin ? 'investlucro:user:guilherme.otavio' : `investlucro:user:${u}`;

        // Busca o usuário no banco de dados na nuvem
        const getRes = await fetch(`${kvUrl}/get/${userDbKey}`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        });
        const getData = await getRes.json();

        let savedUser = null;
        if (getData && getData.result) {
          savedUser = typeof getData.result === 'string' ? JSON.parse(getData.result) : getData.result;
        }

        const inputHash = crypto.createHash('sha256').update(`${password}_salt_investlucro`).digest('hex');

        // PRIMEIRO ACESSO DO ADMINISTRADOR GUILHERME.OTAVIO
        if (isMasterAdmin && !savedUser) {
          const masterProfile = {
            id: 'usr_guilherme_master',
            username: 'Guilherme.Otavio',
            name: 'Guilherme Otávio',
            role: 'admin',
            passHash: inputHash,
            createdAt: new Date().toISOString()
          };

          // Grava a senha escolhida pelo Guilherme na nuvem
          await fetch(`${kvUrl}/set/${userDbKey}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${kvToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(masterProfile)
          });

          return res.status(200).json({
            success: true,
            isFirstAccess: true,
            message: 'Primeiro acesso confirmado! Sua senha pessoal foi cadastrada com sucesso.',
            user: {
              id: masterProfile.id,
              username: masterProfile.username,
              name: masterProfile.name,
              role: masterProfile.role
            }
          });
        }

        // LOGIN SUBSEQUENTE (Valida o hash da senha no banco)
        if (savedUser) {
          if (savedUser.passHash === inputHash) {
            return res.status(200).json({
              success: true,
              user: {
                id: savedUser.id || 'usr_auth',
                username: savedUser.username,
                name: savedUser.name,
                role: savedUser.role || 'guest'
              }
            });
          } else {
            return res.status(401).json({ success: false, message: 'Senha incorreta para este usuário.' });
          }
        }
      }

      // Fallback se o banco ainda não tiver a chave ou para convidados locais
      return res.status(401).json({ success: false, message: 'Usuário não encontrado ou senha inválida.' });
    }

    // 2. CADASTRO DE CONVIDADO COM CÓDIGO VIP
    if (req.method === 'POST' && action === 'register') {
      const { name, username, password, inviteCode } = req.body || {};
      
      const code = (inviteCode || '').trim().toUpperCase();
      if (!code || !AUTHORIZED_INVITES.includes(code)) {
        return res.status(403).json({ success: false, message: 'Código de convite VIP inválido ou não autorizado.' });
      }

      if (!name || !username || !password) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
      }

      const u = username.toLowerCase().trim();
      const inputHash = crypto.createHash('sha256').update(`${password}_salt_investlucro`).digest('hex');

      const guestUser = {
        id: `usr_${Date.now()}`,
        username: username.trim(),
        name: name.trim(),
        role: 'guest',
        inviteUsed: code,
        passHash: inputHash,
        createdAt: new Date().toISOString()
      };

      if (kvUrl && kvToken) {
        // Salva credenciais do convidado na nuvem
        await fetch(`${kvUrl}/set/investlucro:user:${u}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(guestUser)
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Conta VIP criada com sucesso!',
        user: {
          id: guestUser.id,
          username: guestUser.username,
          name: guestUser.name,
          role: guestUser.role
        }
      });
    }

    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  } catch (error) {
    console.error('Erro na API de Auth:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor de autenticação.' });
  }
};
