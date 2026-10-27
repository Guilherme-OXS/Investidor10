// ==========================================================================
// INVESTLUCRO - SISTEMA DE AUTENTICAÇÃO FECHADA & BANCO DE DADOS
// Exclusivo para Guilherme Otávio (Admin) e convidados autorizados com carteira isolada
// ==========================================================================

const AUTH_CONFIG = {
  MASTER_USER: {
    username: 'guilherme',
    name: 'Guilherme Otávio',
    role: 'ADMIN',
    email: 'guilhermeotavioxxsouza@gmail.com'
  },
  DEFAULT_INVITE_CODES: [
    'INVEST-VIP',
    'LUCRO-B3',
    'CONVIDADO-2026',
    'GUILHERME-FAMILY'
  ]
};

// Carteira real inicial do Guilherme (baseada no extrato real do Banco Inter / Investidor 10)
const GUILHERME_INITIAL_PORTFOLIO = [
  {
    ticker: 'CDB-INTER-PORQUINHO',
    name: 'CDB Reserva de Emergência 100% CDI',
    type: 'RENDA_FIXA',
    percentualCDI: 100,
    cdiAnual: 10.65,
    valorInvestido: 638.60,
    dataAplicacao: '2026-09-15',
    lucroEsperado: 6.98
  },
  {
    ticker: 'MXRF11',
    name: 'Maxi Renda FII',
    type: 'FII',
    qty: 1,
    precoMedio: 9.40,
    cotacao: 9.01
  }
];

const InvestAuth = {
  getStoredUsers() {
    return JSON.parse(localStorage.getItem('investlucro_users')) || [
      {
        username: 'guilherme',
        name: 'Guilherme Otávio',
        role: 'ADMIN',
        passHash: 'admin123',
        createdAt: '2026-10-01'
      }
    ];
  },

  getInviteCodes() {
    return JSON.parse(localStorage.getItem('investlucro_invite_codes')) || AUTH_CONFIG.DEFAULT_INVITE_CODES;
  },

  getCurrentUser() {
    const session = localStorage.getItem('investlucro_session');
    if (session) {
      try {
        return JSON.parse(session);
      } catch (e) {
        return null;
      }
    }
    // Sem sessão ativa: exige login obrigatório!
    return null;
  },

  async login(usernameOrEmail, password) {
    const u = usernameOrEmail.trim().toLowerCase();

    // 1. Tenta autenticar na API Serverless segura da Vercel
    try {
      const response = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password })
      });
      const data = await response.json();
      if (data && data.success) {
        localStorage.setItem('investlucro_session', JSON.stringify(data.user));
        // Sincroniza carteira da nuvem logo após login
        await this.syncPortfolioFromCloud(data.user.username);
        return { success: true, user: data.user };
      }
    } catch (apiErr) {
      console.warn('API Serverless offline ou em teste local, usando autenticação segura cliente:', apiErr);
    }

    // 2. Fallback de contingência local para o Administrador Master
    if (
      (u === 'guilherme' || u === 'admin' || u === 'guilhermeotavioxxsouza@gmail.com') &&
      (password === 'invest2026' || password === 'admin' || password === 'guilherme')
    ) {
      const userSession = AUTH_CONFIG.MASTER_USER;
      localStorage.setItem('investlucro_session', JSON.stringify(userSession));
      return { success: true, user: userSession };
    }

    const users = this.getStoredUsers();
    const found = users.find(user => 
      (user.username.toLowerCase() === u || (user.email && user.email.toLowerCase() === u)) &&
      (user.passHash === password)
    );

    if (found) {
      const userSession = {
        username: found.username,
        name: found.name,
        role: found.role || 'CONVIDADO',
        email: found.email || ''
      };
      localStorage.setItem('investlucro_session', JSON.stringify(userSession));
      return { success: true, user: userSession };
    }

    return { success: false, message: 'Usuário ou senha incorretos. Acesso restrito a convidados.' };
  },

  logout() {
    localStorage.removeItem('investlucro_session');
    window.location.replace('/login');
  },

  // Sincronização em Nuvem (Celular <-> Computador)
  async syncPortfolioFromCloud(username) {
    try {
      const res = await fetch(`/api/portfolio?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.portfolio) && data.portfolio.length > 0) {
        localStorage.setItem(`investlucro_portfolio_${username}`, JSON.stringify(data.portfolio));
        return data.portfolio;
      }
    } catch (e) {
      console.warn('Falha na sincronização da nuvem:', e);
    }
    return null;
  },

  async syncPortfolioToCloud(username, portfolio) {
    try {
      await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, portfolio })
      });
    } catch (e) {
      console.warn('Falha ao enviar carteira para a nuvem:', e);
    }
  },

  registerGuest(name, username, password, inviteCode) {
    const validCodes = this.getInviteCodes();
    const code = (inviteCode || '').trim().toUpperCase();

    if (!validCodes.includes(code)) {
      return { success: false, message: 'Código de convite inválido! Apenas pessoas autorizadas por Guilherme podem criar conta.' };
    }

    const users = this.getStoredUsers();
    const uname = username.trim().toLowerCase();

    if (users.some(u => u.username.toLowerCase() === uname)) {
      return { success: false, message: 'Este nome de usuário já está em uso.' };
    }

    const newUser = {
      username: uname,
      name: name.trim(),
      role: 'CONVIDADO',
      passHash: password,
      inviteUsed: code,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('investlucro_users', JSON.stringify(users));

    // Inicializa carteira vazia para o novo convidado
    localStorage.setItem(`investlucro_portfolio_${uname}`, JSON.stringify([]));

    // Cria a sessão automaticamente
    const session = { username: newUser.username, name: newUser.name, role: 'CONVIDADO' };
    localStorage.setItem('investlucro_session', JSON.stringify(session));

    return { success: true, user: session };
  },

  logout() {
    localStorage.removeItem('investlucro_session');
    window.location.href = '/login';
  },

  // Gerenciamento da Carteira do Usuário Logado
  getUserPortfolio() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];

    const storageKey = `investlucro_portfolio_${currentUser.username.toLowerCase()}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      return JSON.parse(stored);
    }

    // Se for o Guilherme, inicia com a carteira real do extrato
    if (currentUser.username.toLowerCase() === 'guilherme') {
      localStorage.setItem(storageKey, JSON.stringify(GUILHERME_INITIAL_PORTFOLIO));
      return GUILHERME_INITIAL_PORTFOLIO;
    }

    return [];
  },

  saveUserPortfolio(portfolio) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;
    const storageKey = `investlucro_portfolio_${currentUser.username.toLowerCase()}`;
    localStorage.setItem(storageKey, JSON.stringify(portfolio));
    // Sincroniza imediatamente com a nuvem na Vercel (celular <-> computador)
    this.syncPortfolioToCloud(currentUser.username, portfolio);
  }
};

if (typeof window !== 'undefined') {
  window.InvestAuth = InvestAuth;
  window.GUILHERME_INITIAL_PORTFOLIO = GUILHERME_INITIAL_PORTFOLIO;
}
