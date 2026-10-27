// API Serverless Vercel - Autenticação Segura & Gestão de Convites
// Executado estritamente no servidor Node.js (código não exposto no navegador)

const crypto = require('crypto');

// Usuários Autorizados no Servidor
const MASTER_USER = {
  id: 'usr_guilherme_master',
  username: 'guilherme',
  // Hash SHA-256 com salt seguro
  passwordHash: crypto.createHash('sha256').update('invest2026_salt_b3').digest('hex'),
  name: 'Guilherme Otávio',
  role: 'admin'
};

const AUTHORIZED_INVITES = ['INVEST-VIP', 'LUCRO-B3', 'AMIGO-VIP', 'GUILHERME-VIP'];

module.exports = async (req, res) => {
  // CORS & Segurança
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action } = req.query;

  try {
    if (req.method === 'POST' && action === 'login') {
      const { username, password } = req.body || {};
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios.' });
      }

      const inputHash = crypto.createHash('sha256').update(`${password}_salt_b3`).digest('hex');

      // Verifica Master
      if (
        (username.toLowerCase() === MASTER_USER.username || username.toLowerCase() === 'admin') &&
        inputHash === MASTER_USER.passwordHash
      ) {
        const token = crypto.randomBytes(32).toString('hex');
        return res.status(200).json({
          success: true,
          token,
          user: {
            id: MASTER_USER.id,
            username: MASTER_USER.username,
            name: MASTER_USER.name,
            role: MASTER_USER.role
          }
        });
      }

      return res.status(401).json({ success: false, message: 'Usuário ou senha incorretos.' });
    }

    if (req.method === 'POST' && action === 'register') {
      const { name, username, password, inviteCode } = req.body || {};
      
      if (!inviteCode || !AUTHORIZED_INVITES.includes(inviteCode.toUpperCase())) {
        return res.status(403).json({ success: false, message: 'Código de convite VIP inválido ou expirado.' });
      }

      if (!name || !username || !password) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: `usr_${Date.now()}`,
          username: username.toLowerCase().trim(),
          name: name.trim(),
          role: 'guest'
        }
      });
    }

    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  } catch (error) {
    console.error('Erro na API de Auth:', error);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor de autenticação.' });
  }
};
