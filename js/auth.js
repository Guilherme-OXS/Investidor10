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
    const rawUser = usernameOrEmail.trim();

    // 1. Tenta autenticar na API Serverless segura da Vercel (Upstash Cloud)
    try {
      const response = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: rawUser, password })
      });
      const data = await response.json();
      if (data && data.success) {
        localStorage.setItem('investlucro_session', JSON.stringify(data.user));
        // Sincroniza carteira da nuvem logo após login
        await this.syncPortfolioFromCloud(data.user.username);
        return { success: true, isFirstAccess: data.isFirstAccess, user: data.user };
      } else if (data && !data.success) {
        return { success: false, message: data.message };
      }
    } catch (apiErr) {
      console.warn('API Serverless offline ou em teste local:', apiErr);
    }

    return { success: false, message: 'Não foi possível autenticar. Verifique sua conexão e credenciais.' };
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
      if (data && data.success && Array.isArray(data.portfolio)) {
        localStorage.setItem(`investlucro_portfolio_${username.toLowerCase()}`, JSON.stringify(data.portfolio));
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

  async registerGuest(name, username, password, inviteCode) {
    const code = (inviteCode || '').trim().toUpperCase();

    // Envia para a API Serverless na nuvem
    try {
      const response = await fetch('/api/auth?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password, inviteCode: code })
      });
      const data = await response.json();
      if (data && data.success) {
        localStorage.setItem('investlucro_session', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else if (data && !data.success) {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.warn('Falha ao registrar via API na nuvem:', err);
    }

    return { success: false, message: 'Código de convite VIP inválido ou erro de conexão.' };
  },

  // Gestão Exclusiva de Convites VIP (Área do Administrador Guilherme)
  async getAdminInvites() {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') return [];
    try {
      const res = await fetch(`/api/auth?action=get_invites&requester=${encodeURIComponent(currentUser.username)}`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.invites)) {
        return data.invites;
      }
    } catch (e) {
      console.warn('Erro ao carregar convites:', e);
    }
    return [];
  },

  async createAdminInvite(code) {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') return { success: false, message: 'Acesso restrito ao administrador.' };
    try {
      const res = await fetch('/api/auth?action=create_invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requester: currentUser.username, code })
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: 'Erro de conexão ao criar convite.' };
    }
  },

  async deleteAdminInvite(code) {
    const currentUser = this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') return { success: false, message: 'Acesso restrito ao administrador.' };
    try {
      const res = await fetch('/api/auth?action=delete_invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requester: currentUser.username, code })
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: 'Erro de conexão ao excluir convite.' };
    }
  },

  // Gerenciamento da Carteira do Usuário Logado
  getUserPortfolio() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];

    const u = currentUser.username.toLowerCase();
    const storageKey = `investlucro_portfolio_${u}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }

    // A carteira começa vazia por padrão ([]). O usuário adiciona seus próprios ativos.
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
}
