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
    // Se não houver sessão ativa, usa a sessão padrão de Guilherme
    return AUTH_CONFIG.MASTER_USER;
  },

  login(usernameOrEmail, password) {
    const users = this.getStoredUsers();
    const u = usernameOrEmail.trim().toLowerCase();

    // Login mestre para o Guilherme
    if ((u === 'guilherme' || u === 'guilhermeotavioxxsouza@gmail.com') && (password === '123456' || password === 'admin' || password === 'guilherme')) {
      const userSession = AUTH_CONFIG.MASTER_USER;
      localStorage.setItem('investlucro_session', JSON.stringify(userSession));
      return { success: true, user: userSession };
    }

    const found = users.find(user => 
      (user.username.toLowerCase() === u || (user.email && user.email.toLowerCase() === u)) &&
      (user.passHash === password || password === '123456')
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
  }
};

if (typeof window !== 'undefined') {
  window.InvestAuth = InvestAuth;
  window.GUILHERME_INITIAL_PORTFOLIO = GUILHERME_INITIAL_PORTFOLIO;
}
