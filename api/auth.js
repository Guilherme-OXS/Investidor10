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
      const cleanUser = rawUser.toLowerCase().replace(/[\s_]+/g, '.');
      const isMasterAdmin = (cleanUser === 'guilherme.otavio' || cleanUser === 'guilherme' || cleanUser === 'guilhermeotavioxxsouza@gmail.com');

      // Se temos o Upstash Redis conectado
      if (kvUrl && kvToken) {
        const userDbKey = isMasterAdmin ? 'investlucro:user:guilherme.otavio' : `investlucro:user:${cleanUser}`;

        // Busca o usuário no banco de dados na nuvem
        let getRes = await fetch(`${kvUrl}/get/${userDbKey}`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        });
        let getData = await getRes.json();

        // Se for admin e não achar em guilherme.otavio, tenta fallback em guilherme
        if (isMasterAdmin && (!getData || !getData.result)) {
          const fallbackRes = await fetch(`${kvUrl}/get/investlucro:user:guilherme`, {
            headers: { Authorization: `Bearer ${kvToken}` }
          });
          const fallbackData = await fallbackRes.json();
          if (fallbackData && fallbackData.result) {
            getData = fallbackData;
          }
        }

        let savedUser = null;
        if (getData && getData.result) {
          savedUser = typeof getData.result === 'string' ? JSON.parse(getData.result) : getData.result;
        }

        const inputHash = crypto.createHash('sha256').update(`${password}_salt_investlucro`).digest('hex');

        // PRIMEIRO ACESSO DO ADMINISTRADOR GUILHERME.OTAVIO
        // A senha digitada neste primeiro acesso é gravada permanentemente no banco
        if (isMasterAdmin && !savedUser) {
          const masterProfile = {
            id: 'usr_guilherme_master',
            username: 'Guilherme.Otavio',
            name: 'Guilherme Otávio',
            role: 'admin',
            passHash: inputHash,
            createdAt: new Date().toISOString()
          };

          // Grava a senha escolhida pelo Guilherme na nuvem em ambas as chaves
          await fetch(`${kvUrl}/set/investlucro:user:guilherme.otavio`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${kvToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(masterProfile)
          });

          await fetch(`${kvUrl}/set/investlucro:user:guilherme`, {
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
            message: 'Primeiro acesso confirmado! Senha cadastrada com sucesso.',
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
                id: savedUser.id || 'usr_guilherme_master',
                username: savedUser.username || 'Guilherme.Otavio',
                name: savedUser.name || 'Guilherme Otávio',
                role: savedUser.role || (isMasterAdmin ? 'admin' : 'guest')
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
      let customInvites = [];
      if (kvUrl && kvToken) {
        try {
          const invRes = await fetch(`${kvUrl}/get/investlucro:invites`, {
            headers: { Authorization: `Bearer ${kvToken}` }
          });
          const invData = await invRes.json();
          if (invData && invData.result) {
            customInvites = typeof invData.result === 'string' ? JSON.parse(invData.result) : invData.result;
          }
        } catch (e) {
          console.warn('Erro ao verificar convites em nuvem:', e);
        }
      }

      const isCustomValid = Array.isArray(customInvites) && customInvites.some(i => i.code === code && i.status === 'active');
      const isDefaultValid = AUTHORIZED_INVITES.includes(code);

      if (!code || (!isCustomValid && !isDefaultValid)) {
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

        // Se foi convite customizado, registra quem usou
        if (isCustomValid) {
          const updatedInvites = customInvites.map(inv => {
            if (inv.code === code) {
              const usedList = inv.usedBy || [];
              usedList.push({ username: u, name: name.trim(), date: new Date().toISOString() });
              return { ...inv, usedBy: usedList, timesUsed: (inv.timesUsed || 0) + 1 };
            }
            return inv;
          });
          await fetch(`${kvUrl}/set/investlucro:invites`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${kvToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedInvites)
          });
        }
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

    // 3. ÁREA EXCLUSIVA GUILHERME OTÁVIO: GESTÃO DE CONVITES VIP
    const isAdminUser = (user) => {
      if (!user) return false;
      const clean = user.toLowerCase().trim().replace(/[\s_]+/g, '.');
      return clean === 'guilherme.otavio' || clean === 'guilherme' || clean === 'guilhermeotavioxxsouza@gmail.com';
    };

    // 3.1 LISTAR CONVITES
    if (action === 'get_invites') {
      const { requester } = req.query;
      if (!isAdminUser(requester)) {
        return res.status(403).json({ success: false, message: 'Acesso restrito ao administrador.' });
      }

      let invites = [];
      if (kvUrl && kvToken) {
        try {
          const resInv = await fetch(`${kvUrl}/get/investlucro:invites`, {
            headers: { Authorization: `Bearer ${kvToken}` }
          });
          const dataInv = await resInv.json();
          if (dataInv && dataInv.result) {
            invites = typeof dataInv.result === 'string' ? JSON.parse(dataInv.result) : dataInv.result;
          }
        } catch (e) {
          console.error('Erro ao ler convites:', e);
        }
      }

      // Se ainda não tiver convites salvos na nuvem, inicia com lista padrão
      if (!Array.isArray(invites) || invites.length === 0) {
        invites = AUTHORIZED_INVITES.map(code => ({
          code,
          createdAt: new Date().toISOString(),
          createdBy: 'Guilherme.Otavio',
          status: 'active',
          usedBy: []
        }));
      }

      return res.status(200).json({ success: true, invites });
    }

    // 3.2 CRIAR NOVO CONVITE VIP
    if (req.method === 'POST' && action === 'create_invite') {
      const { requester, code } = req.body || {};
      if (!isAdminUser(requester)) {
        return res.status(403).json({ success: false, message: 'Acesso restrito ao administrador.' });
      }

      const cleanCode = (code || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      if (!cleanCode || cleanCode.length < 3) {
        return res.status(400).json({ success: false, message: 'O código deve ter pelo menos 3 caracteres alfanuméricos.' });
      }

      let invites = [];
      if (kvUrl && kvToken) {
        const resInv = await fetch(`${kvUrl}/get/investlucro:invites`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        });
        const dataInv = await resInv.json();
        if (dataInv && dataInv.result) {
          invites = typeof dataInv.result === 'string' ? JSON.parse(dataInv.result) : dataInv.result;
        }
      }

      if (!Array.isArray(invites)) invites = [];

      if (invites.some(i => i.code === cleanCode)) {
        return res.status(400).json({ success: false, message: 'Este código de convite já existe.' });
      }

      const newInvite = {
        code: cleanCode,
        createdAt: new Date().toISOString(),
        createdBy: 'Guilherme.Otavio',
        status: 'active',
        usedBy: []
      };

      invites.unshift(newInvite);

      if (kvUrl && kvToken) {
        await fetch(`${kvUrl}/set/investlucro:invites`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(invites)
        });
      }

      return res.status(200).json({ success: true, message: `Convite ${cleanCode} criado com sucesso!`, invites, newInvite });
    }

    // 3.3 EXCLUIR / REVOGAR CONVITE VIP
    if (req.method === 'POST' && action === 'delete_invite') {
      const { requester, code } = req.body || {};
      if (!isAdminUser(requester)) {
        return res.status(403).json({ success: false, message: 'Acesso restrito ao administrador.' });
      }

      const cleanCode = (code || '').trim().toUpperCase();
      let invites = [];
      if (kvUrl && kvToken) {
        const resInv = await fetch(`${kvUrl}/get/investlucro:invites`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        });
        const dataInv = await resInv.json();
        if (dataInv && dataInv.result) {
          invites = typeof dataInv.result === 'string' ? JSON.parse(dataInv.result) : dataInv.result;
        }
      }

      if (!Array.isArray(invites)) invites = [];
      invites = invites.filter(i => i.code !== cleanCode);

      if (kvUrl && kvToken) {
        await fetch(`${kvUrl}/set/investlucro:invites`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(invites)
        });
      }

      return res.status(200).json({ success: true, message: `Convite ${cleanCode} removido com sucesso!`, invites });
    }

    return res.status(405).json({ success: false, message: 'Método não permitido.' });
  } catch (error) {
    console.error('Erro na API de Auth:', error);
    return res.status(500).json({ success: false, message: 'Erro no servidor de autenticação.' });
  }
};
