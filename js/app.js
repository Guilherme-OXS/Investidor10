// ==========================================================================
// INVESTIDOR 10X - APLICAÇÃO WEB PWA & CONTROLADOR MODULAR MULTI-PÁGINAS (PARTE 4)
// Gráficos Financeiros Nativos (SVG), Abas Dedicadas (.html) e Design Profissional Anti-IA
// ==========================================================================

let deferredPrompt = null;
let currentFilter = 'all';
let currentPreset = null;
let currentNewsFilter = 'all';
let searchQuery = '';
let selectedCompareTickers = ['ITUB4', 'BBAS3']; // Comparação inicial padrão
let USER_PORTFOLIO = JSON.parse(localStorage.getItem('i10x_portfolio')) || INITIAL_USER_PORTFOLIO;

document.addEventListener('DOMContentLoaded', async () => {
  initServiceWorker();
  initTheme();
  initMarketStatus();
  renderTickerRibbon();
  initLiveSync();
  initGlobalSearch();
  initAssetModalEvents();

  // 1. GUARDA DE AUTENTICAÇÃO ESTRITA (ACESSO EXCLUSIVO)
  const path = window.location.pathname.toLowerCase();
  const isLoginPage = path.includes('login');
  const currentUser = window.InvestAuth ? InvestAuth.getCurrentUser() : null;

  if (!currentUser && !isLoginPage) {
    // Redireciona imediatamente para a tela de login
    window.location.replace('/login');
    return;
  }

  if (currentUser && isLoginPage) {
    // Já logado, vai direto para a carteira ou início
    window.location.replace('/');
    return;
  }

  // 2. SINCRONIZAÇÃO EM NUVEM EM SEGUNDO PLANO (CELULAR <-> COMPUTADOR)
  if (currentUser && window.InvestAuth) {
    InvestAuth.syncPortfolioFromCloud(currentUser.username).then(cloudData => {
      if (cloudData && path.includes('carteira')) {
        renderPortfolioPage();
      }
    });
  }

  // 3. Roteamento Modular por Página
  if (path.includes('radar')) {
    initRadarPage();
  } else if (path.includes('comparador')) {
    initComparatorPage();
  } else if (path.includes('carteira')) {
    initPortfolioPage();
  } else if (path.includes('simulador')) {
    initSimulatorPage();
  } else if (path.includes('noticias')) {
    initNewsPage();
  } else {
    // Página Inicial (Home / Panorama)
    initHomePage();
  }
});

// 1. REGISTRO DO SERVICE WORKER & SUPORTE A PWA (ESTILO CLIQUEJGAM)
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('Investidor10X PWA Service Worker registrado:', reg.scope))
        .catch((err) => console.log('Falha ao registrar Service Worker:', err));
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) installBtn.style.display = 'inline-flex';
  });

  const installBtn = document.getElementById('pwaInstallBtn');
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`PWA escolha do usuário: ${outcome}`);
        deferredPrompt = null;
        installBtn.style.display = 'none';
      }
    });
  }
}

// 2. ALTERNADOR DE TEMA (DARK / LIGHT COM PERSISTÊNCIA E DESIGN INSTITUCIONAL)
function initTheme() {
  const savedTheme = localStorage.getItem('i10x_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('i10x_theme', nextTheme);
      updateThemeIcon(nextTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggleBtn');
  if (!btn) return;
  if (theme === 'dark') {
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    btn.title = 'Alternar para Modo Claro';
  } else {
    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    btn.title = 'Alternar para Modo Escuro';
  }
}

// 3. STATUS DO PREGÃO B3 EM TEMPO REAL
function initMarketStatus() {
  if (!window.LiveMarketConnector) return;
  const status = LiveMarketConnector.getMarketStatus();
  const dot = document.getElementById('marketStatusDot');
  const text = document.getElementById('marketStatusText');

  if (dot && text) {
    if (status.isOpen) {
      dot.className = 'status-dot';
      text.textContent = `B3 Aberta (${status.timeString})`;
    } else {
      dot.className = 'status-dot closed';
      text.textContent = `B3 Fechada (${status.timeString})`;
    }
  }
}

// 4. RENDERIZAÇÃO DA BARRA DE ÍNDICES AO VIVO (TICKER TAPE)
function renderTickerRibbon() {
  const ribbon = document.getElementById('tickerRibbon');
  if (!ribbon || !window.MARKET_INDICES) return;

  const content = MARKET_INDICES.map(item => {
    const isUp = item.change.startsWith('+');
    const changeClass = isUp ? 'badge-up' : 'badge-down';
    return `
      <div class="ribbon-item">
        <span class="ribbon-name">${item.name}</span>
        <span class="ribbon-val">${item.value}</span>
        <span class="ribbon-badge ${changeClass}">${item.change}</span>
      </div>
    `;
  }).join('');

  ribbon.innerHTML = `<div class="ticker-ribbon-inner">${content}${content}</div>`;
}

// 5. BOTÃO DE SINCRONIZAÇÃO AO VIVO
function initLiveSync() {
  const syncBtn = document.getElementById('syncQuotesBtn');
  const syncIcon = document.getElementById('syncQuotesIcon');
  const syncText = document.getElementById('syncQuotesText');

  if (!syncBtn || !window.LiveMarketConnector) return;

  syncBtn.addEventListener('click', async () => {
    if (syncIcon) syncIcon.classList.add('rotating');
    if (syncText) syncText.textContent = 'Atualizando...';

    await LiveMarketConnector.syncAll();

    setTimeout(() => {
      if (syncIcon) syncIcon.classList.remove('rotating');
      if (syncText) syncText.textContent = 'Ao Vivo';
      renderTickerRibbon();
      initMarketStatus();
      
      // Atualiza a tela ativa
      const path = window.location.pathname.toLowerCase();
      if (path.includes('radar')) renderAssets();
      if (path.includes('comparador')) renderComparator();
      if (path.includes('carteira')) renderPortfolioPage();
      if (!path.includes('radar') && !path.includes('comparador') && !path.includes('carteira') && !path.includes('simulador') && !path.includes('noticias')) {
        renderHomeDashboard();
      }
    }, 600);
  });

  // Atualização inicial automática das cotações
  setTimeout(() => {
    LiveMarketConnector.syncAll().then(() => {
      renderTickerRibbon();
      initMarketStatus();
      const path = window.location.pathname.toLowerCase();
      if (path.includes('radar')) renderAssets();
      if (path.includes('carteira')) renderPortfolioPage();
    });
  }, 1000);
}

// 6. BUSCA GLOBAL COM ATALHO '/'
function initGlobalSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      const path = window.location.pathname.toLowerCase();
      if (path.includes('radar')) {
        renderAssets();
      } else if (searchQuery.length >= 2) {
        // Se estiver em outra página e digitar ticker exato, oferece atalho para abrir o modal
        const exact = ASSETS_DATA.find(a => a.ticker.toLowerCase() === searchQuery.toLowerCase());
        if (exact) openAssetModal(exact.ticker);
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }
}

function getAssetsData() {
  return (typeof ASSETS_DATA !== 'undefined' ? ASSETS_DATA : window.ASSETS_DATA) || [];
}
function getIndicesData() {
  return (typeof MARKET_INDICES !== 'undefined' ? MARKET_INDICES : window.MARKET_INDICES) || [];
}
function getNewsData() {
  return (typeof MARKET_NEWS !== 'undefined' ? MARKET_NEWS : window.MARKET_NEWS) || [];
}

// ==========================================================================
// ABA 1: PANORAMA DO MERCADO (HOME / INDEX.HTML)
// ==========================================================================
function initHomePage() {
  renderHomeDashboard();
}

function renderHomeDashboard() {
  const allIndices = getIndicesData();
  const allAssets = getAssetsData();
  const allNews = getNewsData();

  // 1. Grade de Índices Macro
  const indicesGrid = document.getElementById('homeIndicesGrid');
  if (indicesGrid && allIndices.length > 0) {
    indicesGrid.innerHTML = allIndices.map(idx => {
      const isUp = idx.change.startsWith('+');
      return `
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px; box-shadow: var(--shadow-card);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">${idx.name}</span>
            <span class="ribbon-badge ${isUp ? 'badge-up' : 'badge-down'}" style="font-size: 11px;">${idx.change}</span>
          </div>
          <div style="font-size: 18px; font-weight: 800; font-family: monospace; color: var(--text-primary);">${idx.value}</div>
        </div>
      `;
    }).join('');
  }

  // 2. Maiores Pagadoras de Proventos (sem yield trap!)
  const highDyList = document.getElementById('homeHighDyList');
  if (highDyList && allAssets.length > 0) {
    const topDy = [...allAssets]
      .filter(a => !a.yield_trap_alert)
      .sort((a, b) => parseFloat(b.dy.replace('%', '')) - parseFloat(a.dy.replace('%', '')))
      .slice(0, 4);

    highDyList.innerHTML = topDy.map(asset => `
      <div onclick="openAssetModal('${asset.ticker}')" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--bg-surface-elevated); border-radius: var(--radius-md); cursor: pointer; border: 1px solid var(--border-subtle); transition: all 150ms ease;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="asset-type-badge">${asset.type || 'AÇÃO'}</span>
          <div>
            <div style="font-weight: 800; font-size: 14px; color: var(--text-primary); font-family: monospace;">${asset.ticker}</div>
            <div style="font-size: 11.5px; color: var(--text-muted);">${asset.name}</div>
            <div style="font-size: 10px; color: var(--emerald-400); margin-top: 2px;">✓ Extração B3: ${asset.data_extracao || '27/10/2026 14:49'}</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 14px; font-weight: 800; font-family: monospace; color: var(--emerald-400);">${asset.dy}</div>
          <div style="font-size: 11px; color: var(--text-muted); font-family: monospace;">R$ ${asset.price.toFixed(2)}</div>
        </div>
      </div>
    `).join('');
  }

  // 3. Alta Rentabilidade (ROE Consistente)
  const highRoeList = document.getElementById('homeHighRoeList');
  if (highRoeList && allAssets.length > 0) {
    const topRoe = [...allAssets]
      .filter(a => a.roe && a.type === 'AÇÃO')
      .sort((a, b) => parseFloat(b.roe.replace('%', '')) - parseFloat(a.roe.replace('%', '')))
      .slice(0, 4);

    highRoeList.innerHTML = topRoe.map(asset => `
      <div onclick="openAssetModal('${asset.ticker}')" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--bg-surface-elevated); border-radius: var(--radius-md); cursor: pointer; border: 1px solid var(--border-subtle); transition: all 150ms ease;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span class="asset-type-badge">${asset.type || 'AÇÃO'}</span>
          <div>
            <div style="font-weight: 800; font-size: 14px; color: var(--text-primary); font-family: monospace;">${asset.ticker}</div>
            <div style="font-size: 11.5px; color: var(--text-muted);">${asset.name}</div>
            <div style="font-size: 10px; color: var(--emerald-400); margin-top: 2px;">✓ Extração B3: ${asset.data_extracao || '27/10/2026 14:49'}</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 14px; font-weight: 800; font-family: monospace; color: var(--sky-400);">ROE ${asset.roe}</div>
          <div style="font-size: 11px; color: var(--text-muted); font-family: monospace;">P/L ${asset.pl_contabil}x</div>
        </div>
      </div>
    `).join('');
  }

  // 4. Notícias Recentes do Mercado
  const recentNewsList = document.getElementById('homeRecentNewsList');
  if (recentNewsList && window.MARKET_NEWS) {
    recentNewsList.innerHTML = MARKET_NEWS.slice(0, 3).map(news => `
      <article onclick="openAssetModal('${news.ticker}')" class="news-card" style="cursor: pointer;">
        <div>
          <div class="news-header-meta">
            <span class="news-ticker-badge">${news.ticker}</span>
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">${news.category}</span>
          </div>
          <h3 class="news-title" style="font-size: 14px;">${news.title}</h3>
          <p class="news-summary" style="font-size: 12px;">${news.summary}</p>
        </div>
        <div class="news-footer" style="font-size: 11px;">
          <span>${news.source}</span>
          <span>${news.time}</span>
        </div>
      </article>
    `).join('');
  }
}

// ==========================================================================
// ABA 2: RADAR & SCREENER FUNDAMENTALISTA (RADAR.HTML)
// ==========================================================================
function initRadarPage() {
  initRadarFilters();
  initViewModeToggle();
  renderAssets();
}

function initRadarFilters() {
  // Pílulas de Categoria
  const pills = document.querySelectorAll('.category-pills .pill-item');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-filter');
      
      // Limpa preset ao escolher categoria tradicional
      document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      currentPreset = null;
      renderAssets();
    });
  });

  // Presets do Screener Inteligente
  const presets = document.querySelectorAll('.preset-chip');
  presets.forEach(chip => {
    chip.addEventListener('click', () => {
      if (chip.classList.contains('active')) {
        chip.classList.remove('active');
        currentPreset = null;
      } else {
        presets.forEach(p => p.classList.remove('active'));
        chip.classList.add('active');
        currentPreset = chip.getAttribute('data-preset');
      }
      renderAssets();
    });
  });
}

function initViewModeToggle() {
  const btnCards = document.getElementById('btnViewCards');
  const btnTable = document.getElementById('btnViewTable');
  const cardsContainer = document.getElementById('assetsGrid');
  const tableContainer = document.getElementById('assetsTableContainer');

  const savedMode = localStorage.getItem('i10x_view_mode') || 'cards';
  if (savedMode === 'table') {
    if (btnCards) btnCards.classList.remove('active');
    if (btnTable) btnTable.classList.add('active');
    if (cardsContainer) cardsContainer.style.display = 'none';
    if (tableContainer) tableContainer.style.display = 'block';
  }

  if (btnCards && btnTable) {
    btnCards.addEventListener('click', () => {
      btnCards.classList.add('active');
      btnTable.classList.remove('active');
      if (cardsContainer) cardsContainer.style.display = 'grid';
      if (tableContainer) tableContainer.style.display = 'none';
      localStorage.setItem('i10x_view_mode', 'cards');
    });

    btnTable.addEventListener('click', () => {
      btnTable.classList.add('active');
      btnCards.classList.remove('active');
      if (cardsContainer) cardsContainer.style.display = 'none';
      if (tableContainer) tableContainer.style.display = 'block';
      localStorage.setItem('i10x_view_mode', 'table');
    });
  }
}

function renderAssets() {
  const grid = document.getElementById('assetsGrid');
  const tableBody = document.getElementById('assetsTableBody');
  const countBadge = document.getElementById('assetCountBadge');
  const allAssets = getAssetsData();
  if (allAssets.length === 0) return;

  // Filtragem Inteligente
  const filtered = allAssets.filter(asset => {
    // 1. Busca por texto
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = asset.ticker.toLowerCase().includes(q) || 
                    asset.name.toLowerCase().includes(q) || 
                    (asset.sector && asset.sector.toLowerCase().includes(q));
      if (!match) return false;
    }

    // 2. Presets do Screener (Incluindo PARTE 5 para FIIs)
    if (currentPreset === 'magic') {
      const roeNum = asset.roe ? parseFloat(asset.roe.replace('%', '')) : 0;
      return asset.pl_contabil && asset.pl_contabil <= 10.0 && roeNum >= 18.0;
    }
    if (currentPreset === 'cows') {
      const dyNum = parseFloat(asset.dy.replace('%', ''));
      return dyNum >= 7.0 && (!asset.divida_liquida_ebitda || asset.divida_liquida_ebitda < 3.0);
    }
    if (currentPreset === 'cheap-fiis') {
      return (asset.type === 'FII' || asset.type === 'FIAGRO') && asset.pvp < 1.00 && !asset.yield_trap_alert;
    }
    if (currentPreset === 'tijolo-prime') {
      return asset.type === 'FII' && (asset.sector || '').includes('Tijolo') && parseFloat(asset.vacancia_fisica || '99') < 6.0 && asset.pvp <= 1.05;
    }
    if (currentPreset === 'papel-highgrade') {
      return (asset.type === 'FII' || asset.type === 'FIAGRO') && !asset.yield_trap_alert && !(asset.sector || '').includes('Tijolo');
    }
    if (currentPreset === 'cash') {
      return asset.divida_liquida_ebitda !== undefined && asset.divida_liquida_ebitda <= 0;
    }
    if (currentPreset === 'utilities') {
      return asset.isUtilitySector === true;
    }

    // 3. Filtros Tradicionais
    if (currentFilter === 'AÇÃO') return asset.type === 'AÇÃO';
    if (currentFilter === 'FII') return asset.type === 'FII';
    if (currentFilter === 'FIAGRO') return asset.type === 'FIAGRO';
    if (currentFilter === 'BDR') return asset.type === 'BDR';
    if (currentFilter === 'high-dy') {
      return parseFloat(asset.dy.replace('%', '')) >= 8.0;
    }
    if (currentFilter === 'safe') return !asset.yield_trap_alert;
    if (currentFilter === 'low-pl') {
      return asset.pl_contabil && asset.pl_contabil < 10.0;
    }
    return true;
  });

  if (countBadge) {
    countBadge.textContent = `Mostrando ${filtered.length} de ${allAssets.length} ativos`;
  }

  // Renderiza no Grid de Cards
  if (grid) {
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-muted);">
          <p style="font-size: 16px; font-weight: 600;">Nenhum ativo encontrado com esses filtros.</p>
          <p style="font-size: 13px; margin-top: 6px;">Tente pesquisar por outro ticker ou limpar os filtros.</p>
        </div>
      `;
    } else {
      grid.innerHTML = filtered.map(asset => {
        const isUp = asset.changeDay.startsWith('+');
        const changeClass = isUp ? 'badge-up' : 'badge-down';

        let alertHtml = '';
        if (asset.yield_trap_alert) {
          alertHtml = `
            <div class="alert-yield-trap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span><strong>Alerta Yield Trap:</strong> DY inflado por perda de capital ou calote.</span>
            </div>
          `;
        } else if (asset.hasNonRecurrentImpact) {
          alertHtml = `
            <div class="alert-non-recurrent">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <span>P/L Ajustado de <strong>${asset.pl_ajustado}x</strong> (expurga eventos pontuais).</span>
            </div>
          `;
        }

        let metricsHtml = '';
        if (asset.isFinancialSector) {
          metricsHtml = `
            <div class="metrics-row">
              <div class="metric-col"><span class="metric-label">P/L</span><span class="metric-val">${asset.pl_contabil}x</span></div>
              <div class="metric-col"><span class="metric-label">P/VP</span><span class="metric-val">${asset.pvp}</span></div>
              <div class="metric-col"><span class="metric-label">ROE</span><span class="metric-val highlight">${asset.roe}</span></div>
              <div class="metric-col"><span class="metric-label">Basileia</span><span class="metric-val">${asset.indice_basileia}</span></div>
            </div>
          `;
        } else if (asset.type === 'FII' || asset.type === 'FIAGRO') {
          metricsHtml = `
            <div class="metrics-row">
              <div class="metric-col"><span class="metric-label">P/VP</span><span class="metric-val ${asset.pvp < 1 ? 'highlight' : ''}">${asset.pvp}</span></div>
              <div class="metric-col"><span class="metric-label">Rend. Mês</span><span class="metric-val">${asset.rendimento_medio_mes}</span></div>
              <div class="metric-col"><span class="metric-label">Vacância</span><span class="metric-val">${asset.vacancia_fisica || 'N/A'}</span></div>
              <div class="metric-col"><span class="metric-label">VP Cota</span><span class="metric-val">R$ ${asset.vp_cota.toFixed(2)}</span></div>
            </div>
          `;
        } else {
          metricsHtml = `
            <div class="metrics-row">
              <div class="metric-col"><span class="metric-label">P/L</span><span class="metric-val">${asset.pl_contabil}x</span></div>
              <div class="metric-col"><span class="metric-label">P/VP</span><span class="metric-val">${asset.pvp}</span></div>
              <div class="metric-col"><span class="metric-label">ROE</span><span class="metric-val">${asset.roe || '--'}</span></div>
              <div class="metric-col"><span class="metric-label">Dív/EBITDA</span><span class="metric-val">${asset.divida_liquida_ebitda !== undefined ? asset.divida_liquida_ebitda + 'x' : '--'}</span></div>
            </div>
          `;
        }

        return `
          <article class="asset-card" onclick="openAssetModal('${asset.ticker}')">
            <div class="card-header">
              <div class="card-ticker-group">
                <div class="ticker-icon">${asset.ticker.substring(0, 4)}</div>
                <div class="ticker-details">
                  <div class="ticker-code">${asset.ticker}</div>
                  <div class="ticker-company">${asset.name}</div>
                </div>
              </div>
              <span class="asset-type-badge">${asset.type}</span>
            </div>

            <div class="price-section">
              <div class="current-price">R$ ${asset.price.toFixed(2)}</div>
              <div class="dy-block">
                <span class="dy-label">DY (12M)</span>
                <span class="dy-value">${asset.dy}</span>
              </div>
            </div>

            <div style="margin-bottom: 12px;">
              <span class="price-change ${changeClass}">${asset.changeDay} hoje</span>
            </div>

            ${alertHtml}
            ${metricsHtml}

            <div class="card-footer">
              <span class="footer-sector">${asset.sector || asset.fiiType || 'B3'}</span>
              <span class="footer-action">Raio-X Completo &rarr;</span>
            </div>
          </article>
        `;
      }).join('');
    }
  }

  // Renderiza na Tabela Analítica Densa (Modo Terminal)
  if (tableBody) {
    tableBody.innerHTML = filtered.map(asset => {
      const isUp = asset.changeDay.startsWith('+');
      const changeColor = isUp ? 'var(--emerald-400)' : 'var(--rose-400)';
      
      // Cálculo do Preço Teto Bazin
      const dyDec = parseFloat(asset.dy.replace('%', '')) / 100;
      const bazin = (asset.price * dyDec) / 0.06;

      let scoreBadge = `<span class="score-pill good">8.5</span>`;
      if (asset.yield_trap_alert) scoreBadge = `<span class="score-pill risk">3.0</span>`;
      else if (asset.hasNonRecurrentImpact) scoreBadge = `<span class="score-pill alert">6.5</span>`;

      return `
        <tr onclick="openAssetModal('${asset.ticker}')" style="cursor: pointer;">
          <td style="font-weight: 800; font-family: monospace; color: var(--text-primary);">${asset.ticker}</td>
          <td>${asset.name}</td>
          <td style="color: var(--text-muted); font-size: 12px;">${asset.sector || asset.fiiType || asset.type}</td>
          <td class="num-col" style="font-weight: 700;">R$ ${asset.price.toFixed(2)}</td>
          <td class="num-col" style="font-weight: 700; color: ${changeColor};">${asset.changeDay}</td>
          <td class="num-col" style="font-weight: 700; color: var(--emerald-400);">${asset.dy}</td>
          <td class="num-col">${asset.pl_ajustado || asset.pl_contabil || '--'}${asset.pl_contabil ? 'x' : ''}</td>
          <td class="num-col">${asset.pvp || '--'}</td>
          <td class="num-col">${asset.roe || '--'}</td>
          <td class="num-col" style="color: var(--emerald-400); font-weight: 700;">R$ ${bazin.toFixed(2)}</td>
          <td style="text-align: center;">${scoreBadge}</td>
        </tr>
      `;
    }).join('');
  }
}

// ==========================================================================
// ABA 3: COMPARADOR LADO A LADO (COMPARADOR.HTML)
// ==========================================================================
function initComparatorPage() {
  const compareAddSelect = document.getElementById('compareAddSelect');
  if (compareAddSelect && window.ASSETS_DATA) {
    compareAddSelect.innerHTML = `
      <option value="">+ Adicionar ativo para comparar...</option>
      ${ASSETS_DATA.map(a => `<option value="${a.ticker}">${a.ticker} - ${a.name}</option>`).join('')}
    `;

    compareAddSelect.addEventListener('change', (e) => {
      const selected = e.target.value;
      if (selected) {
        addCompareTicker(selected);
        e.target.value = '';
      }
    });
  }

  renderComparator();
}

function addCompareTicker(ticker) {
  if (selectedCompareTickers.includes(ticker)) return;
  if (selectedCompareTickers.length >= 4) {
    alert('Você pode comparar no máximo 4 ativos simultaneamente.');
    return;
  }
  selectedCompareTickers.push(ticker);
  renderComparator();
}

function removeCompareTicker(ticker) {
  if (selectedCompareTickers.length <= 1) return;
  selectedCompareTickers = selectedCompareTickers.filter(t => t !== ticker);
  renderComparator();
}

function renderComparator() {
  const tagList = document.getElementById('compareSelectedTags');
  const tableContainer = document.getElementById('compareTableContainer');
  if (!tagList || !tableContainer || !window.ASSETS_DATA) return;

  // Renderiza Tags dos Ativos Selecionados
  tagList.innerHTML = selectedCompareTickers.map(ticker => `
    <span class="compare-tag">
      <strong>${ticker}</strong>
      ${selectedCompareTickers.length > 1 ? `<button onclick="removeCompareTicker('${ticker}')" title="Remover">&times;</button>` : ''}
    </span>
  `).join('');

  // Ativos Selecionados
  const assets = selectedCompareTickers.map(t => ASSETS_DATA.find(a => a.ticker === t)).filter(Boolean);
  if (assets.length === 0) return;

  // Tabela Comparativa de Múltiplos
  const rows = [
    { label: 'Cotação Atual', fn: a => `R$ ${a.price.toFixed(2)}` },
    { label: 'Dividend Yield (12M)', fn: a => a.dy, highlightMax: true, parse: a => parseFloat(a.dy.replace('%', '')) },
    { label: 'Preço Teto Décio Bazin', fn: a => {
      const dyDec = parseFloat(a.dy.replace('%', '')) / 100;
      return `R$ ${((a.price * dyDec) / 0.06).toFixed(2)}`;
    }},
    { label: 'P/L Contábil', fn: a => a.pl_contabil ? `${a.pl_contabil}x` : 'N/A' },
    { label: 'P/L Ajustado (Expurga Não-Recorrente)', fn: a => a.pl_ajustado ? `${a.pl_ajustado}x` : `${a.pl_contabil || 'N/A'}x` },
    { label: 'P/VP (Preço sobre Patrimônio)', fn: a => a.pvp !== undefined ? a.pvp.toString() : 'N/A', highlightMin: true, parse: a => a.pvp },
    { label: 'ROE (Retorno s/ Patrimônio)', fn: a => a.roe || 'N/A', highlightMax: true, parse: a => a.roe ? parseFloat(a.roe.replace('%', '')) : 0 },
    { label: 'Dívida Líquida / EBITDA', fn: a => a.divida_liquida_ebitda !== undefined ? `${a.divida_liquida_ebitda}x` : (a.isFinancialSector ? 'Inaplicável (Banco)' : 'N/A') },
    { label: 'Índice de Basileia', fn: a => a.indice_basileia || 'N/A' },
    { label: 'Alerta de Yield Trap?', fn: a => a.yield_trap_alert ? '<span style="color: var(--rose-400); font-weight: 700;">Sim (Risco Alto)</span>' : '<span style="color: var(--emerald-400);">Não</span>' }
  ];

  const headerThs = assets.map(a => `
    <th style="min-width: 140px; text-align: center;">
      <div style="font-size: 16px; font-weight: 800; font-family: monospace;">${a.ticker}</div>
      <div style="font-size: 11px; color: var(--text-muted); font-weight: normal;">${a.name}</div>
    </th>
  `).join('');

  const bodyTrs = rows.map(row => {
    let bestVal = null;
    if (row.highlightMax) {
      const vals = assets.map(row.parse).filter(v => !isNaN(v) && v !== null && v !== 0);
      if (vals.length > 0) bestVal = Math.max(...vals);
    } else if (row.highlightMin) {
      const vals = assets.map(row.parse).filter(v => !isNaN(v) && v !== null && v !== 0);
      if (vals.length > 0) bestVal = Math.min(...vals);
    }

    const tds = assets.map(a => {
      const strVal = row.fn(a);
      let isWinner = false;
      if (bestVal !== null && row.parse) {
        const val = row.parse(a);
        if (val === bestVal) isWinner = true;
      }
      return `
        <td style="text-align: center; font-family: monospace; font-size: 13px; ${isWinner ? 'background: var(--emerald-glow); font-weight: 800; color: var(--emerald-400);' : ''}">
          ${strVal} ${isWinner ? '★' : ''}
        </td>
      `;
    }).join('');

    return `
      <tr>
        <td style="font-weight: 600; color: var(--text-secondary); font-size: 13px;">${row.label}</td>
        ${tds}
      </tr>
    `;
  }).join('');

  tableContainer.innerHTML = `
    <table class="compare-table" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="text-align: left; font-size: 12px; color: var(--text-muted);">MÉTRICA / INDICADOR</th>
          ${headerThs}
        </tr>
      </thead>
      <tbody>
        ${bodyTrs}
      </tbody>
    </table>
  `;
}

// ==========================================================================
// ABA 4: GESTÃO INTELIGENTE DE CARTEIRA & BANCO DE DADOS ISOLADO (PARTE 5)
// Cálculo Exato de Dias Úteis B3 (CDI Base 252) + Gráficos Empilhados (Fotos do Guilherme)
// ==========================================================================
function initPortfolioPage() {
  let currentUser = window.InvestAuth ? InvestAuth.getCurrentUser() : null;
  if (!currentUser) {
    window.location.replace('/login');
    return;
  }

  // Título com o nome do proprietário
  const ownerTitle = document.getElementById('portfolioOwnerTitle');
  if (ownerTitle && currentUser) {
    ownerTitle.textContent = `Carteira de ${currentUser.name || currentUser.username}`;
  }

  // Elementos do Modal de Lançamentos
  const addModal = document.getElementById('addAssetModal');
  const addCloseBtn = document.getElementById('addAssetCloseBtn');
  const addBackBtn = document.getElementById('addAssetBackBtn');
  const customForm = document.getElementById('addAssetCustomForm');
  const tabCompra = document.getElementById('tabOpCompra');
  const tabVenda = document.getElementById('tabOpVenda');
  const modalCategory = document.getElementById('modalAssetCategory');

  // Seções dinâmicas do Modal
  const sectionRendaFixa = document.getElementById('sectionRendaFixaFields');
  const sectionVariable = document.getElementById('sectionVariableFields');
  const sectionTesouro = document.getElementById('sectionTesouroFields');
  const sectionFundos = document.getElementById('sectionFundosFields');
  const sectionOutros = document.getElementById('sectionOutrosFields');

  // Campos Renda Fixa
  const rfEmissor = document.getElementById('rfEmissor');
  const rfTipoInvestimento = document.getElementById('rfTipoInvestimento');
  const rfForma = document.getElementById('rfForma');
  const rfValor = document.getElementById('rfValor');
  const rfDataCompra = document.getElementById('rfDataCompra');
  const rfIndexador = document.getElementById('rfIndexador');
  const rfLiquidezDiaria = document.getElementById('rfLiquidezDiaria');
  const rfDataVencimento = document.getElementById('rfDataVencimento');
  const rfTaxaCDI = document.getElementById('rfTaxaCDI');

  // Campos Variável / Mercado
  const varAssetSelect = document.getElementById('varAssetSelect');
  const varCustomTicker = document.getElementById('varCustomTicker');
  const varDataCompra = document.getElementById('varDataCompra');
  const varQuantidade = document.getElementById('varQuantidade');
  const varPreco = document.getElementById('varPreco');
  const varCustos = document.getElementById('varCustos');

  // Campos Tesouro
  const tesouroTitulo = document.getElementById('tesouroTitulo');
  const tesouroData = document.getElementById('tesouroData');
  const tesouroValor = document.getElementById('tesouroValor');
  const tesouroTaxa = document.getElementById('tesouroTaxa');
  const tesouroVencimento = document.getElementById('tesouroVencimento');

  // Campos Fundos
  const fundoNome = document.getElementById('fundoNome');
  const fundoCategoria = document.getElementById('fundoCategoria');
  const fundoValor = document.getElementById('fundoValor');
  const fundoData = document.getElementById('fundoData');
  const fundoResgate = document.getElementById('fundoResgate');

  // Campos Outros
  const outrosNome = document.getElementById('outrosNome');
  const outrosCategoria = document.getElementById('outrosCategoria');
  const outrosValor = document.getElementById('outrosValor');
  const outrosData = document.getElementById('outrosData');
  const outrosRendimento = document.getElementById('outrosRendimento');

  // Total Calculado no Modal
  const modalCalculatedTotal = document.getElementById('modalCalculatedTotal');

  let currentOperation = 'COMPRA'; // 'COMPRA' ou 'VENDA'

  // Popula opções de ativos e datalist com TODOS os ativos do mercado
  function populateVariableAssets(category) {
    const assets = typeof getAssetsData === 'function' ? getAssetsData() : (window.ASSETS_DATA || []);
    
    // Popula o datalist para pesquisa rápida e autocomplete
    const datalist = document.getElementById('allMarketAssetsList');
    if (datalist) {
      datalist.innerHTML = assets.map(a => `<option value="${a.ticker}">${a.ticker} - ${a.name} (${a.type || 'Ação'})</option>`).join('');
    }

    if (!varAssetSelect) return;
    let filtered = assets;
    if (category === 'FII') filtered = assets.filter(a => a.type === 'FII' || a.type === 'FIAGRO');
    else if (category === 'AÇÃO') filtered = assets.filter(a => a.type === 'AÇÃO' || !a.type);
    else if (category === 'STOCKS') filtered = assets.filter(a => a.type === 'STOCKS');
    else if (category === 'BDR') filtered = assets.filter(a => a.type === 'BDR');
    else if (category === 'ETF') filtered = assets.filter(a => a.type === 'ETF');
    else if (category === 'ETF_INT') filtered = assets.filter(a => a.type === 'ETF_INT');
    else if (category === 'REIT') filtered = assets.filter(a => a.type === 'REIT');
    else if (category === 'CRIPTO') filtered = assets.filter(a => a.type === 'CRIPTO');

    varAssetSelect.innerHTML = '<option value="">Ou selecione da lista...</option>' +
      filtered.map(a => `<option value="${a.ticker}" data-price="${a.price}">${a.ticker} - ${a.name} (R$ ${a.price.toFixed(2).replace('.', ',')})</option>`).join('');
  }

  // Atualiza o valor total em tempo real no modal
  function updateModalTotal() {
    if (!modalCalculatedTotal) return;
    const cat = modalCategory ? modalCategory.value : 'AÇÃO';
    let total = 0;
    if (cat === 'RENDA_FIXA') {
      total = parseFloat(rfValor ? rfValor.value : 0) || 0;
    } else if (cat === 'TESOURO') {
      total = parseFloat(tesouroValor ? tesouroValor.value : 0) || 0;
    } else if (cat === 'FUNDO') {
      total = parseFloat(fundoValor ? fundoValor.value : 0) || 0;
    } else if (cat === 'OUTROS') {
      total = parseFloat(outrosValor ? outrosValor.value : 0) || 0;
    } else {
      const q = parseFloat(varQuantidade ? varQuantidade.value : 0) || 0;
      const p = parseFloat(varPreco ? varPreco.value : 0) || 0;
      const c = parseFloat(varCustos ? varCustos.value : 0) || 0;
      total = (q * p) + c;
    }
    modalCalculatedTotal.textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Alterna entre Compra e Venda
  function setOperation(op) {
    currentOperation = op;
    if (tabCompra && tabVenda) {
      if (op === 'COMPRA') {
        tabCompra.style.background = 'var(--bg-surface)';
        tabCompra.style.color = 'var(--text-primary)';
        tabCompra.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
        tabVenda.style.background = 'transparent';
        tabVenda.style.color = 'var(--text-muted)';
        tabVenda.style.boxShadow = 'none';
      } else {
        tabVenda.style.background = 'var(--bg-surface)';
        tabVenda.style.color = 'var(--text-primary)';
        tabVenda.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
        tabCompra.style.background = 'transparent';
        tabCompra.style.color = 'var(--text-muted)';
        tabCompra.style.boxShadow = 'none';
      }
    }
  }

  if (tabCompra) tabCompra.addEventListener('click', () => setOperation('COMPRA'));
  if (tabVenda) tabVenda.addEventListener('click', () => setOperation('VENDA'));

  // Alterna entre as 12 formas de investimento
  function onCategoryChange() {
    const cat = modalCategory ? modalCategory.value : 'AÇÃO';
    
    // Esconde todas as seções
    if (sectionRendaFixa) sectionRendaFixa.style.display = 'none';
    if (sectionVariable) sectionVariable.style.display = 'none';
    if (sectionTesouro) sectionTesouro.style.display = 'none';
    if (sectionFundos) sectionFundos.style.display = 'none';
    if (sectionOutros) sectionOutros.style.display = 'none';

    if (cat === 'RENDA_FIXA') {
      if (sectionRendaFixa) sectionRendaFixa.style.display = 'block';
    } else if (cat === 'TESOURO') {
      if (sectionTesouro) sectionTesouro.style.display = 'block';
    } else if (cat === 'FUNDO') {
      if (sectionFundos) sectionFundos.style.display = 'block';
    } else if (cat === 'OUTROS') {
      if (sectionOutros) sectionOutros.style.display = 'block';
    } else {
      if (sectionVariable) sectionVariable.style.display = 'block';
      const lblPreco = document.getElementById('lblVarPreco');
      if (lblPreco) {
        if (cat === 'STOCKS' || cat === 'ETF_INT' || cat === 'REIT') {
          lblPreco.textContent = 'Preço em US$ *';
        } else {
          lblPreco.textContent = 'Preço em R$ *';
        }
      }
      populateVariableAssets(cat);
    }
    updateModalTotal();
  }

  if (modalCategory) {
    modalCategory.addEventListener('change', onCategoryChange);
  }

  // Eventos de auto-preenchimento de ativos
  if (varAssetSelect) {
    varAssetSelect.addEventListener('change', () => {
      const selected = varAssetSelect.selectedOptions[0];
      if (selected && selected.value) {
        if (varCustomTicker) varCustomTicker.value = selected.value;
        const pr = parseFloat(selected.dataset.price);
        if (!isNaN(pr) && pr > 0 && varPreco) {
          varPreco.value = pr.toFixed(2);
        }
      }
      updateModalTotal();
    });
  }

  if (varCustomTicker) {
    varCustomTicker.addEventListener('input', () => {
      const t = varCustomTicker.value.trim().toUpperCase();
      const assets = typeof getAssetsData === 'function' ? getAssetsData() : (window.ASSETS_DATA || []);
      const found = assets.find(a => a.ticker === t);
      if (found) {
        if (varAssetSelect) varAssetSelect.value = found.ticker;
        if (varPreco) varPreco.value = found.price.toFixed(2);
      }
      updateModalTotal();
    });
  }

  // Ouvintes de input para cálculo ao vivo
  [rfValor, varQuantidade, varPreco, varCustos, tesouroValor, fundoValor, outrosValor].forEach(inp => {
    if (inp) inp.addEventListener('input', updateModalTotal);
  });

  // Switch de Liquidez Diária
  if (rfLiquidezDiaria && rfDataVencimento) {
    rfLiquidezDiaria.addEventListener('change', () => {
      if (rfLiquidezDiaria.checked) {
        rfDataVencimento.disabled = true;
        rfDataVencimento.style.opacity = '0.4';
      } else {
        rfDataVencimento.disabled = false;
        rfDataVencimento.style.opacity = '1';
      }
    });
  }

  // Abre e fecha o modal garantindo visibilidade total
  const openModal = (targetCategory = null) => {
    if (addModal) {
      addModal.classList.add('active');
      addModal.style.setProperty('display', 'flex', 'important');
      addModal.style.setProperty('opacity', '1', 'important');
      addModal.style.setProperty('visibility', 'visible', 'important');
      addModal.style.setProperty('z-index', '999999', 'important');
      addModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      const today = new Date().toISOString().split('T')[0];
      if (rfDataCompra && !rfDataCompra.value) rfDataCompra.value = today;
      if (varDataCompra && !varDataCompra.value) varDataCompra.value = today;
      if (tesouroData && !tesouroData.value) tesouroData.value = today;
      if (fundoData && !fundoData.value) fundoData.value = today;
      if (outrosData && !outrosData.value) outrosData.value = today;

      if (targetCategory && modalCategory) {
        modalCategory.value = targetCategory;
      }
      onCategoryChange();
      setOperation('COMPRA');
      updateModalTotal();
    }
  };

  const closeModal = () => {
    if (addModal) {
      addModal.classList.remove('active');
      addModal.style.setProperty('display', 'none', 'important');
      addModal.style.setProperty('opacity', '0', 'important');
      addModal.style.setProperty('visibility', 'hidden', 'important');
      addModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  // Exporta globalmente para qualquer botão na página
  window.openAddAssetModalWithCategory = (cat = null) => {
    openModal(cat);
  };

  // Botões de abertura de modal
  const btnOpenModal = document.getElementById('btnOpenAddAssetModal');
  const btnFastAdd = document.getElementById('btnAddNewAssetFast');
  const btnHeaderAdd = document.getElementById('btnHeaderAddLaunch');

  if (btnOpenModal) btnOpenModal.addEventListener('click', () => openModal());
  if (btnFastAdd) btnFastAdd.addEventListener('click', () => openModal());
  if (btnHeaderAdd) btnHeaderAdd.addEventListener('click', () => openModal());
  document.querySelectorAll('.btn-add-launch-trigger').forEach(btn => {
    btn.addEventListener('click', () => openModal());
  });
  if (addCloseBtn) addCloseBtn.addEventListener('click', closeModal);
  if (addBackBtn) addBackBtn.addEventListener('click', closeModal);

  if (addModal) {
    addModal.addEventListener('click', (e) => {
      if (e.target === addModal) closeModal();
    });
  }

  // Dropdown da Carteira (Minhas Carteiras & Limpar Ativos)
  const btnWallet = document.getElementById('btnWalletSelector');
  const walletMenu = document.getElementById('walletDropdownMenu');
  const btnClearWallet = document.getElementById('btnClearWalletData');
  const btnCreateWallet = document.getElementById('btnCreateNewWallet');

  if (btnWallet && walletMenu) {
    btnWallet.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = walletMenu.style.display === 'block';
      walletMenu.style.display = isVisible ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!walletMenu.contains(e.target) && !btnWallet.contains(e.target)) {
        walletMenu.style.display = 'none';
      }
    });
  }

  if (btnClearWallet) {
    btnClearWallet.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja limpar todos os ativos da carteira?')) {
        InvestAuth.saveUserPortfolio([]);
        if (walletMenu) walletMenu.style.display = 'none';
        renderPortfolioPage();
      }
    });
  }

  if (btnCreateWallet) {
    btnCreateWallet.addEventListener('click', () => {
      const name = prompt('Digite o nome da nova carteira:', 'Carteira de Aposentadoria');
      if (name) {
        alert(`Carteira "${name}" criada com sucesso!`);
        if (walletMenu) walletMenu.style.display = 'none';
      }
    });
  }

  // Inicializa as 6 sub-abas da carteira
  initPortfolioTabs();

  // Submissão do formulário de lançamento
  if (customForm) {
    customForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const cat = modalCategory ? modalCategory.value : 'AÇÃO';
      const userPortfolio = InvestAuth.getUserPortfolio();
      let newItem = null;

      if (cat === 'RENDA_FIXA') {
        const emissor = rfEmissor ? rfEmissor.value.trim() : 'Banco Inter';
        const tipoInv = rfTipoInvestimento ? rfTipoInvestimento.value : 'CDB';
        const forma = rfForma ? rfForma.value : 'PÓS-FIXADO';
        const valor = rfValor ? (parseFloat(rfValor.value) || 0) : 0;
        const dataCompra = (rfDataCompra && rfDataCompra.value) ? rfDataCompra.value : new Date().toISOString().split('T')[0];
        const indexador = rfIndexador ? rfIndexador.value : 'CDI';
        const liquidez = rfLiquidezDiaria ? rfLiquidezDiaria.checked : true;
        const vencimento = liquidez ? 'Liquidez Diária' : (rfDataVencimento && rfDataVencimento.value ? rfDataVencimento.value : '2026-12-31');
        const taxaCDI = rfTaxaCDI ? (parseFloat(rfTaxaCDI.value) || 100) : 100;

        if (valor <= 0) {
          alert('Por favor, informe um valor válido para o investimento.');
          return;
        }

        const cleanEmissor = emissor.replace(/Banco /i, '');
        const formatTitle = `${tipoInv} - ${cleanEmissor} - ${forma.charAt(0) + forma.slice(1).toLowerCase()} - ${taxaCDI}% ${indexador}`;

        newItem = {
          ticker: formatTitle,
          nome: formatTitle,
          tipo: 'RENDA_FIXA',
          emissor: emissor,
          tipoInvestimento: tipoInv,
          forma: forma,
          indexador: indexador,
          percentualCDI: taxaCDI,
          cdiAnual: 10.65,
          liquidezDiaria: liquidez,
          dataVencimento: vencimento,
          valorInvestido: valor,
          dataAplicacao: dataCompra,
          operacao: currentOperation
        };
      } else if (cat === 'TESOURO') {
        const titulo = tesouroTitulo ? tesouroTitulo.value.trim() : 'Tesouro Selic 2029';
        const valor = tesouroValor ? (parseFloat(tesouroValor.value) || 0) : 0;
        const data = tesouroData && tesouroData.value ? tesouroData.value : new Date().toISOString().split('T')[0];
        const taxa = tesouroTaxa ? tesouroTaxa.value.trim() : 'Selic';
        const venc = tesouroVencimento && tesouroVencimento.value ? tesouroVencimento.value : '2029-03-01';

        if (valor <= 0) {
          alert('Por favor, informe o valor investido no Tesouro Direto.');
          return;
        }

        newItem = {
          ticker: titulo,
          nome: titulo,
          tipo: 'TESOURO',
          valorInvestido: valor,
          valorAtual: valor,
          taxaContratada: taxa,
          dataVencimento: venc,
          dataAplicacao: data,
          operacao: currentOperation
        };
      } else if (cat === 'FUNDO') {
        const nome = fundoNome ? fundoNome.value.trim() : 'Fundo de Investimento';
        const catFundo = fundoCategoria ? fundoCategoria.value : 'Multimercado';
        const valor = fundoValor ? (parseFloat(fundoValor.value) || 0) : 0;
        const data = fundoData && fundoData.value ? fundoData.value : new Date().toISOString().split('T')[0];
        const resgate = fundoResgate ? fundoResgate.value.trim() : 'D+30';

        if (valor <= 0) {
          alert('Por favor, informe o valor aplicado no Fundo.');
          return;
        }

        newItem = {
          ticker: nome,
          nome: `${nome} (${catFundo})`,
          tipo: 'FUNDO',
          categoriaFundo: catFundo,
          valorInvestido: valor,
          valorAtual: valor,
          prazoResgate: resgate,
          dataAplicacao: data,
          operacao: currentOperation
        };
      } else if (cat === 'OUTROS') {
        const nome = outrosNome ? outrosNome.value.trim() : 'Outro Ativo';
        const catOutros = outrosCategoria ? outrosCategoria.value : 'Imóvel Físico';
        const valor = outrosValor ? (parseFloat(outrosValor.value) || 0) : 0;
        const data = outrosData && outrosData.value ? outrosData.value : new Date().toISOString().split('T')[0];
        const rend = outrosRendimento ? (parseFloat(outrosRendimento.value) || 0) : 0;

        if (valor <= 0) {
          alert('Por favor, informe o valor do ativo.');
          return;
        }

        newItem = {
          ticker: nome,
          nome: `${nome} (${catOutros})`,
          tipo: 'OUTROS',
          categoriaBem: catOutros,
          valorInvestido: valor,
          valorAtual: valor,
          rendimentoMensal: rend,
          dataAplicacao: data,
          operacao: currentOperation
        };
      } else {
        const ticker = (varCustomTicker && varCustomTicker.value ? varCustomTicker.value : (varAssetSelect ? varAssetSelect.value : '')).trim().toUpperCase();
        const qty = varQuantidade ? (parseFloat(varQuantidade.value) || 0) : 0;
        const preco = varPreco ? (parseFloat(varPreco.value) || 0) : 0;
        const custos = varCustos ? (parseFloat(varCustos.value) || 0) : 0;
        const dataCompra = (varDataCompra && varDataCompra.value) ? varDataCompra.value : new Date().toISOString().split('T')[0];

        if (!ticker || qty <= 0 || preco <= 0) {
          alert('Por favor, informe o ativo, quantidade e preço válidos.');
          return;
        }

        const allAssets = typeof getAssetsData === 'function' ? getAssetsData() : (window.ASSETS_DATA || []);
        const ref = allAssets.find(a => a.ticker === ticker);
        const totalInvest = (qty * preco) + custos;

        newItem = {
          ticker: ticker,
          nome: ref ? ref.name : ticker,
          tipo: cat,
          quantidade: qty,
          precoMedio: preco,
          custos: custos,
          valorInvestido: totalInvest,
          dataAplicacao: dataCompra,
          operacao: currentOperation
        };
      }

      // Adiciona ou abate da carteira
      const isFixedType = ['RENDA_FIXA', 'TESOURO', 'FUNDO', 'OUTROS'].includes(newItem.tipo);
      if (currentOperation === 'COMPRA' && !isFixedType) {
        const existingIdx = userPortfolio.findIndex(it => it.ticker === newItem.ticker && it.tipo === newItem.tipo);
        if (existingIdx >= 0) {
          const ex = userPortfolio[existingIdx];
          const newQty = (ex.quantidade || 0) + newItem.quantidade;
          const newTotal = (ex.valorInvestido || 0) + newItem.valorInvestido;
          ex.quantidade = newQty;
          ex.valorInvestido = newTotal;
          ex.precoMedio = newTotal / newQty;
        } else {
          userPortfolio.push(newItem);
        }
      } else if (currentOperation === 'VENDA' && !isFixedType) {
        const existingIdx = userPortfolio.findIndex(it => it.ticker === newItem.ticker && it.tipo === newItem.tipo);
        if (existingIdx >= 0) {
          const ex = userPortfolio[existingIdx];
          if ((ex.quantidade || 0) <= newItem.quantidade) {
            userPortfolio.splice(existingIdx, 1);
          } else {
            ex.quantidade -= newItem.quantidade;
            ex.valorInvestido = ex.quantidade * (ex.precoMedio || 0);
          }
        } else {
          alert('Você não possui este ativo em carteira para vender.');
          return;
        }
      } else {
        userPortfolio.push(newItem);
      }

      InvestAuth.saveUserPortfolio(userPortfolio);
      closeModal();
      customForm.reset();
      renderPortfolioPage();
    });
  }

  // Gestão Exclusiva de Convites VIP (Guilherme Otávio)
  const btnInvite = document.getElementById('btnOpenInviteModal');
  const inviteModal = document.getElementById('adminInviteModal');
  const inviteCloseBtn = document.getElementById('adminInviteCloseBtn');
  const btnGenRandom = document.getElementById('btnGenerateRandomInvite');
  const btnSaveInvite = document.getElementById('btnSaveNewInvite');
  const inputInvite = document.getElementById('newInviteCodeInput');
  const invitesContainer = document.getElementById('adminInvitesListContainer');
  const toastFeedback = document.getElementById('inviteFeedbackToast');
  const countBadge = document.getElementById('invitesCountBadge');

  const showInviteToast = (msg, isError = false) => {
    if (!toastFeedback) return;
    toastFeedback.style.display = 'block';
    toastFeedback.style.background = isError ? 'var(--rose-glow)' : 'var(--emerald-glow)';
    toastFeedback.style.color = isError ? 'var(--rose-400)' : 'var(--emerald-400)';
    toastFeedback.style.border = `1px solid ${isError ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)'}`;
    toastFeedback.textContent = msg;
    setTimeout(() => { if (toastFeedback) toastFeedback.style.display = 'none'; }, 3500);
  };

  const renderInvitesList = async () => {
    if (!invitesContainer || !window.InvestAuth) return;
    invitesContainer.innerHTML = '<div style="text-align: center; padding: 14px; color: var(--text-muted); font-size: 12px;">Carregando convites da nuvem...</div>';
    
    const invites = await InvestAuth.getAdminInvites();
    if (countBadge) countBadge.textContent = `${invites.length} convite(s)`;

    if (invites.length === 0) {
      invitesContainer.innerHTML = '<div style="text-align: center; padding: 16px; color: var(--text-muted); font-size: 12px;">Nenhum convite cadastrado ainda.</div>';
      return;
    }

    invitesContainer.innerHTML = invites.map(inv => {
      const isUsed = inv.usedBy && inv.usedBy.length > 0;
      const dateStr = inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('pt-BR') : '';
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 13.5px; font-weight: 800; color: var(--emerald-400); letter-spacing: 0.5px;">${inv.code}</span>
              ${isUsed ? '<span style="font-size: 10px; background: rgba(59,130,246,0.15); color: var(--blue-400); padding: 1px 5px; border-radius: 3px;">Utilizado</span>' : '<span style="font-size: 10px; background: rgba(16,185,129,0.15); color: var(--emerald-400); padding: 1px 5px; border-radius: 3px;">Disponível</span>'}
            </div>
            <div style="font-size: 10.5px; color: var(--text-muted);">
              ${isUsed ? `Usado por: <strong>${inv.usedBy[0].name || inv.usedBy[0].username}</strong>` : `Criado em: ${dateStr}`}
            </div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn-copy-invite" data-code="${inv.code}" style="padding: 5px 9px; font-size: 11.5px; font-weight: 700; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 4px; color: var(--text-primary); cursor: pointer;" title="Copiar código">
              Copiar
            </button>
            <button class="btn-delete-invite" data-code="${inv.code}" style="padding: 5px 8px; font-size: 11.5px; font-weight: 700; background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.25); border-radius: 4px; color: var(--rose-400); cursor: pointer;" title="Revogar convite">
              ✕
            </button>
          </div>
        </div>
      `;
    }).join('');

    invitesContainer.querySelectorAll('.btn-copy-invite').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = btn.getAttribute('data-code');
        navigator.clipboard.writeText(c).then(() => {
          showInviteToast(`Código ${c} copiado para a área de transferência!`);
        });
      });
    });

    invitesContainer.querySelectorAll('.btn-delete-invite').forEach(btn => {
      btn.addEventListener('click', async () => {
        const c = btn.getAttribute('data-code');
        if (confirm(`Deseja realmente revogar o convite ${c}?`)) {
          const res = await InvestAuth.deleteAdminInvite(c);
          if (res.success) {
            showInviteToast(`Convite ${c} revogado.`);
            renderInvitesList();
          } else {
            showInviteToast(res.message || 'Erro ao revogar convite.', true);
          }
        }
      });
    });
  };

  if (currentUser && currentUser.role === 'admin' && btnInvite) {
    btnInvite.style.display = 'inline-flex';
    btnInvite.addEventListener('click', () => {
      if (inviteModal) {
        inviteModal.style.display = 'flex';
        inviteModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        renderInvitesList();
      }
    });
  }

  if (inviteCloseBtn && inviteModal) {
    inviteCloseBtn.addEventListener('click', () => {
      inviteModal.style.display = 'none';
      inviteModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
    inviteModal.addEventListener('click', (e) => {
      if (e.target === inviteModal) {
        inviteModal.style.display = 'none';
        inviteModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }

  if (btnGenRandom && inputInvite) {
    btnGenRandom.addEventListener('click', () => {
      const prefixes = ['VIP', 'INVEST', 'LUCRO', 'B3'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const num = Math.floor(1000 + Math.random() * 9000);
      inputInvite.value = `${prefix}-${num}`;
    });
  }

  if (btnSaveInvite && inputInvite) {
    btnSaveInvite.addEventListener('click', async () => {
      const code = inputInvite.value.trim().toUpperCase();
      if (!code) {
        showInviteToast('Digite um código ou clique em Gerar.', true);
        return;
      }
      btnSaveInvite.disabled = true;
      btnSaveInvite.textContent = 'Salvando na nuvem...';

      const res = await InvestAuth.createAdminInvite(code);
      btnSaveInvite.disabled = false;
      btnSaveInvite.textContent = 'Ativar Código VIP no Banco';

      if (res.success) {
        showInviteToast(res.message || 'Convite criado com sucesso!');
        inputInvite.value = '';
        renderInvitesList();
      } else {
        showInviteToast(res.message || 'Erro ao criar convite.', true);
      }
    });
  }

  // Expor openModal globalmente para ser acionado pelos botões das tabelas
  window.openAddAssetModalWithCategory = openModal;

  // Renderização inicial
  renderPortfolioPage();
}

function renderPortfolioPage() {
  if (!window.InvestAuth) return;

  const currentUser = InvestAuth.getCurrentUser();
  const portfolio = InvestAuth.getUserPortfolio();

  let totalInvestido = 0;
  let totalPatrimonio = 0;
  let totalLucro = 0;

  // Processa cada ativo com cálculo de rentabilidade real
  const allAssets = typeof getAssetsData === 'function' ? getAssetsData() : (window.ASSETS_DATA || []);

  portfolio.forEach(item => {
    const invested = parseFloat(item.valorInvestido) || 0;
    totalInvestido += invested;

    if (item.tipo === 'RENDA_FIXA' && window.CDIEngine) {
      const income = CDIEngine.calculateExactIncome(
        invested,
        item.percentualCDI || 100,
        item.cdiAnual || 10.65,
        item.dataAplicacao || '2024-09-01'
      );
      item.valorAtual = income.currentTotalValue;
      item.lucro = income.netIncome;
      item.rentabilidadePct = income.profitPct;
      item.businessDays = income.businessDays;
      totalPatrimonio += item.valorAtual;
      totalLucro += item.lucro;
    } else {
      const refAsset = allAssets.find(a => a.ticker === item.ticker);
      const currentPrice = refAsset ? refAsset.price : (item.cotacao || item.precoMedio || invested);
      const qty = parseFloat(item.quantidade) || 1;
      item.cotacaoAtual = currentPrice;
      item.valorAtual = qty * currentPrice;
      item.lucro = item.valorAtual - invested;
      item.rentabilidadePct = invested > 0 ? ((item.lucro / invested) * 100) : 0;
      item.pvp = refAsset && refAsset.pvp ? refAsset.pvp : 0.96;
      item.dy = refAsset && refAsset.dy ? refAsset.dy : 11.5;
      item.ultimoRendimento = refAsset && refAsset.lastDividend ? refAsset.lastDividend : 0.10;
      totalPatrimonio += item.valorAtual;
      totalLucro += item.lucro;
    }
  });

  const rentabilidadeGeralPct = totalInvestido > 0 ? ((totalLucro / totalInvestido) * 100) : 0;

  // 1. Atualiza os 4 Cards de Destaque Superiores (Fotos 2 e 3 do Guilherme)
  const cardPatrimonio = document.getElementById('cardPatrimonioTotal');
  const cardRentBadge = document.getElementById('cardRentabilidadeBadge');
  const cardInvestido = document.getElementById('cardValorInvestido');
  const cardLucro = document.getElementById('cardLucroTotal');
  const cardGanhoCapital = document.getElementById('cardGanhoCapital');
  const cardProventos = document.getElementById('cardProventos');
  const cardProventos12M = document.getElementById('cardProventos12M');
  const cardProventosTotal = document.getElementById('cardProventosTotal');
  const badgeRent12M = document.getElementById('badgeRentabilidade12M');
  const badgeRentTotal = document.getElementById('badgeRentabilidadeTotal');

  if (cardPatrimonio) {
    cardPatrimonio.textContent = `R$ ${totalPatrimonio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (cardRentBadge) {
    if (totalInvestido === 0) {
      cardRentBadge.style.background = 'rgba(16, 185, 129, 0.12)';
      cardRentBadge.style.color = 'var(--emerald-400)';
      cardRentBadge.textContent = '0,00%';
    } else {
      const isUp = rentabilidadeGeralPct >= 0;
      cardRentBadge.style.background = isUp ? 'var(--emerald-glow)' : 'var(--rose-glow)';
      cardRentBadge.style.color = isUp ? 'var(--emerald-400)' : 'var(--rose-400)';
      cardRentBadge.textContent = `${isUp ? '+' : ''}${rentabilidadeGeralPct.toFixed(2).replace('.', ',')}% ${isUp ? '▲' : '▼'}`;
    }
  }
  if (cardInvestido) {
    cardInvestido.textContent = `R$ ${totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (cardLucro) {
    if (totalInvestido === 0) {
      cardLucro.style.color = 'var(--emerald-400)';
      cardLucro.textContent = 'R$ 0,00';
    } else {
      const isUp = totalLucro >= 0;
      cardLucro.style.color = isUp ? 'var(--emerald-400)' : 'var(--rose-400)';
      cardLucro.textContent = `R$ ${Math.abs(totalLucro).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }
  if (cardGanhoCapital) {
    cardGanhoCapital.textContent = `R$ ${Math.max(0, totalLucro).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (cardProventos) cardProventos.textContent = 'R$ 0,00';
  if (cardProventos12M) cardProventos12M.textContent = 'R$ 0,00';
  if (cardProventosTotal) cardProventosTotal.textContent = 'R$ 0,00';

  if (badgeRent12M) {
    badgeRent12M.innerHTML = `${rentabilidadeGeralPct.toFixed(2).replace('.', ',')}% &rarr;`;
  }
  if (badgeRentTotal) {
    badgeRentTotal.innerHTML = `${rentabilidadeGeralPct.toFixed(2).replace('.', ',')}% &rarr;`;
  }

  // 2. Gráfico de Evolução do Patrimônio (Coluna 1)
  const chartContainer = document.getElementById('portfolioEvolutionChartContainer');
  if (chartContainer) {
    if (totalInvestido === 0) {
      chartContainer.innerHTML = `
        <div style="text-align: center; padding: 42px 16px; color: var(--text-muted);">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 10px; opacity: 0.4;"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          <p style="font-size: 13.5px; font-weight: 600; margin-bottom: 4px; color: var(--text-secondary);">Gráfico de Evolução Aguardando Dados</p>
          <p style="font-size: 12px; max-width: 360px; margin: 0 auto;">Adicione seus investimentos pelo botão <strong>+ Adicionar Lançamento</strong> para acompanhar a evolução do patrimônio mês a mês.</p>
        </div>
      `;
    } else if (window.FinancialCharts && FinancialCharts.renderStackedEvolutionBars) {
      // Cria a série mensal com base nos meses reais
      const d = new Date();
      const curMonth = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
      const prevD = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const prevMonth = `${String(prevD.getMonth() + 1).padStart(2, '0')}/${String(prevD.getFullYear()).slice(-2)}`;

      const evolutionData = [
        { label: prevMonth, invested: totalInvestido * 0.985, profit: 0 },
        { label: curMonth, invested: totalInvestido, profit: Math.max(0, totalLucro) }
      ];
      FinancialCharts.renderStackedEvolutionBars('portfolioEvolutionChartContainer', evolutionData);
    }
  }

  // 3. Gráfico de Rosca "Ativos na Carteira" (Coluna 2)
  const donutContainer = document.getElementById('portfolioDonutChartContainer');
  if (donutContainer) {
    if (totalPatrimonio === 0) {
      donutContainer.innerHTML = `
        <div style="text-align: center; padding: 30px 16px; color: var(--text-muted); font-size: 12px;">
          Nenhum ativo para exibir na alocação.
        </div>
      `;
    } else if (window.FinancialCharts && FinancialCharts.renderDonutChart) {
      // Agrupa valores por classe para o gráfico de rosca
      const classTotals = {};
      portfolio.forEach(item => {
        const k = item.tipo || 'AÇÃO';
        classTotals[k] = (classTotals[k] || 0) + (item.valorAtual || 0);
      });

      const colorDefs = {
        'AÇÃO': { label: 'Ações', color: '#c084fc' },
        'FII': { label: 'FIIs', color: '#fde047' },
        'STOCKS': { label: 'Stocks', color: '#38bdf8' },
        'BDR': { label: 'BDRs', color: '#a78bfa' },
        'ETF': { label: 'ETFs', color: '#818cf8' },
        'ETF_INT': { label: 'ETFs Int.', color: '#60a5fa' },
        'REIT': { label: 'REITs', color: '#4ade80' },
        'CRIPTO': { label: 'Cripto', color: '#f97316' },
        'RENDA_FIXA': { label: 'Renda Fixa', color: '#7dd3fc' },
        'TESOURO': { label: 'Tesouro', color: '#facc15' },
        'FUNDO': { label: 'Fundos', color: '#2dd4bf' },
        'OUTROS': { label: 'Outros', color: '#94a3b8' },
        'FIAGRO': { label: 'Fiagros', color: '#34d399' }
      };

      const donutSlices = Object.entries(classTotals).map(([k, val]) => {
        const meta = colorDefs[k] || { label: k, color: '#38bdf8' };
        return {
          label: meta.label,
          value: val,
          color: meta.color
        };
      });

      FinancialCharts.renderDonutChart('portfolioDonutChartContainer', donutSlices);
    }
  }

  // 4. Seção Meus Ativos Agrupados por Classe (Estilo Investidor 10)
  const groupTitle = document.getElementById('portfolioAssetsGroupTitle');
  if (groupTitle) {
    groupTitle.textContent = `Meus Ativos (${portfolio.length})`;
  }

  const groupsContainer = document.getElementById('portfolioAssetGroupsContainer');
  if (groupsContainer) {
    if (portfolio.length === 0) {
      groupsContainer.innerHTML = `
        <div style="text-align: center; padding: 48px 20px; background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg);">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); color: var(--emerald-400); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">Sua carteira está limpa e pronta</h3>
          <p style="font-size: 13px; color: var(--text-muted); max-width: 440px; margin: 0 auto 18px; line-height: 1.5;">Você não possui nenhum ativo adicionado. Clique no botão abaixo para adicionar seus CDBs, FIIs ou Ações e calcular seus rendimentos reais.</p>
          <button id="btnEmptyStateAddAsset" onclick="if(window.openAddAssetModalWithCategory) window.openAddAssetModalWithCategory();" style="padding: 10px 22px; border-radius: var(--radius-sm); background: var(--emerald-500); color: #fff; font-weight: 700; font-size: 13.5px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Adicionar Lançamento</span>
          </button>
        </div>
      `;
      return;
    }

    // Agrupa ativos por classe com suporte a todas as 12 formas
    const groups = {};
    portfolio.forEach((item, index) => {
      const typeKey = item.tipo || 'AÇÃO';
      if (!groups[typeKey]) groups[typeKey] = [];
      groups[typeKey].push({ ...item, originalIndex: index });
    });

    const groupNames = {
      'AÇÃO': 'Ações',
      'FII': 'FIIs',
      'STOCKS': 'Stocks',
      'BDR': 'BDRs',
      'ETF': 'ETFs',
      'ETF_INT': 'ETFs Internacionais',
      'REIT': 'REITs',
      'CRIPTO': 'Criptomoedas',
      'RENDA_FIXA': 'Renda Fixa',
      'TESOURO': 'Tesouro Direto',
      'FUNDO': 'Fundos de Investimentos',
      'OUTROS': 'Outros',
      'FIAGRO': 'Fiagros'
    };

    const iconsSvg = {
      'AÇÃO': `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>`,
      'FII': `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path></svg>`,
      'STOCKS': `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
      'BDR': `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
      'ETF': `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`,
      'ETF_INT': `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24"></path></svg>`,
      'REIT': `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="2"></line><line x1="4" y1="12" x2="9" y2="12"></line><line x1="15" y1="6" x2="17" y2="6"></line><line x1="15" y1="10" x2="17" y2="10"></line></svg>`,
      'CRIPTO': `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
      'RENDA_FIXA': `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
      'TESOURO': `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
      'FUNDO': `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20"></path><path d="M5 20V8l7-5 7 5v12"></path></svg>`,
      'OUTROS': `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>`,
      'FIAGRO': `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`
    };

    let html = '';
    for (const [classKey, items] of Object.entries(groups)) {
      const classInvested = items.reduce((acc, it) => acc + (it.valorInvestido || 0), 0);
      const classCurrent = items.reduce((acc, it) => acc + (it.valorAtual || 0), 0);
      const classProfit = classCurrent - classInvested;
      const classRentPct = classInvested > 0 ? ((classProfit / classInvested) * 100) : 0;
      const classWeightPct = totalPatrimonio > 0 ? ((classCurrent / totalPatrimonio) * 100) : 0;
      const isPositive = classProfit >= 0;
      const targetWeight = classKey === 'RENDA_FIXA' ? 80 : (classKey === 'FII' ? 20 : 10);

      html += `
        <div class="portfolio-accordion-card" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-card);">
          
          <!-- Cabeçalho do Card Sanfona (Idêntico ao Investidor 10 Fotos 2 e 3) -->
          <div class="portfolio-accordion-header" onclick="toggleAccordion('acc_body_${classKey}')" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; background: var(--bg-surface-elevated); cursor: pointer; user-select: none; flex-wrap: wrap; gap: 12px;">
            
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="color: var(--text-muted); opacity: 0.5; font-size: 16px; letter-spacing: -2px;">⋮⋮</span>
              <div style="width: 32px; height: 32px; border-radius: 6px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; color: var(--emerald-400);">
                ${iconsSvg[classKey] || iconsSvg['AÇÃO']}
              </div>
              <span style="font-size: 15px; font-weight: 800; color: var(--text-primary);">${groupNames[classKey] || classKey}</span>
            </div>

            <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
              <div style="text-align: right;">
                <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Ativos</div>
                <div style="font-size: 12.5px; font-weight: 700; color: var(--text-primary); font-family: monospace;">${items.length}</div>
              </div>

              <div style="text-align: right;">
                <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Valor total</div>
                <div style="font-size: 13px; font-weight: 800; color: var(--text-primary); font-family: monospace;">R$ ${classCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>

              <div style="text-align: right;">
                <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Variação</div>
                <div style="font-size: 12px; font-weight: 700; color: ${isPositive ? 'var(--emerald-400)' : 'var(--rose-400)'}; font-family: monospace;">
                  ${isPositive ? '+' : ''}${classRentPct.toFixed(2).replace('.', ',')}% ${isPositive ? '▲' : '▼'}
                </div>
              </div>

              <div style="text-align: right;">
                <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Rentabilidade</div>
                <span style="font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 4px; background: ${isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}; color: ${isPositive ? 'var(--emerald-400)' : 'var(--rose-400)'}; font-family: monospace;">
                  ${isPositive ? '+' : ''}${classRentPct.toFixed(2).replace('.', ',')}% ↗
                </span>
              </div>

              <div style="text-align: right;">
                <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">% na carteira</div>
                <div style="font-size: 12px; font-weight: 700; color: var(--text-secondary); font-family: monospace;">${classWeightPct.toFixed(0)}% / ${targetWeight}%</div>
              </div>

              <svg id="chevron_acc_body_${classKey}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2.5" style="transition: transform 0.2s; transform: rotate(180deg);"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>

          <!-- Corpo da Tabela Detalhada (Abre por Padrão) -->
          <div id="acc_body_${classKey}" style="display: block; overflow-x: auto;">
            ${renderClassTableHtml(classKey, items, totalPatrimonio, targetWeight)}
            
            <!-- Barra de Ações Inferior do Card (Idêntico ao Investidor 10) -->
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 12px 18px; background: var(--bg-surface); border-top: 1px solid var(--border-subtle); flex-wrap: wrap;">
              <button onclick="if(window.openAddAssetModalWithCategory) window.openAddAssetModalWithCategory('${classKey}');" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); color: var(--emerald-400); font-size: 12px; font-weight: 700; border-radius: 4px; cursor: pointer;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span>+ Adicionar Lançamento</span>
              </button>
            </div>
          </div>

        </div>
      `;
    }

    groupsContainer.innerHTML = html;
  }
}

// Renderiza a tabela interna de cada classe exatamente com as colunas do Investidor 10
function renderClassTableHtml(classKey, items, totalPatrimonio, targetWeight) {
  if (classKey === 'RENDA_FIXA') {
    return `
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 11px; text-transform: uppercase;">
            <th style="padding: 12px 16px; font-weight: 600;">Ativo</th>
            <th style="padding: 12px 12px; font-weight: 600;">Variação</th>
            <th style="padding: 12px 12px; font-weight: 600;">Rentabilidade</th>
            <th style="padding: 12px 12px; font-weight: 600; text-align: right;">Aplicado</th>
            <th style="padding: 12px 12px; font-weight: 600; text-align: right;">Saldo</th>
            <th style="padding: 12px 12px; font-weight: 600;">Data Venc.</th>
            <th style="padding: 12px 12px; font-weight: 600; text-align: center;">Nota</th>
            <th style="padding: 12px 12px; font-weight: 600; text-align: center;">% Carteira</th>
            <th style="padding: 12px 12px; font-weight: 600; text-align: center;">% Ideal</th>
            <th style="padding: 12px 12px; font-weight: 600; text-align: center;">Comprar?</th>
            <th style="padding: 12px 16px; font-weight: 600; text-align: center;">Opções</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(it => {
            const rentPct = it.rentabilidadePct || 0;
            const isUp = rentPct >= 0;
            const weight = totalPatrimonio > 0 ? ((it.valorAtual / totalPatrimonio) * 100) : 0;
            return `
              <tr style="border-bottom: 1px solid var(--border-subtle); transition: background 0.15s;" onmouseover="this.style.background='var(--bg-surface-elevated)'" onmouseout="this.style.background='transparent'">
                <td style="padding: 14px 16px;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 28px; height: 28px; border-radius: 6px; background: rgba(59,130,246,0.12); display: flex; align-items: center; justify-content: center; color: var(--blue-400);">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    </div>
                    <div>
                      <div style="font-weight: 700; color: var(--text-primary); font-size: 13px;">${it.ticker}</div>
                      <div style="font-size: 10.5px; color: var(--text-muted);">${it.businessDays ? `${it.businessDays} dias úteis contados` : 'Base 252 dias úteis'}</div>
                    </div>
                  </div>
                </td>
                <td style="padding: 14px 12px;">
                  <span style="font-weight: 700; color: ${isUp ? 'var(--emerald-400)' : 'var(--rose-400)'}; font-family: monospace;">
                    ${isUp ? '+' : ''}${rentPct.toFixed(2).replace('.', ',')}% ${isUp ? '▲' : '▼'}
                  </span>
                </td>
                <td style="padding: 14px 12px;">
                  <span style="font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 4px; background: ${isUp ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}; color: ${isUp ? 'var(--emerald-400)' : 'var(--rose-400)'}; font-family: monospace;">
                    ${isUp ? '+' : ''}${rentPct.toFixed(2).replace('.', ',')}% ↗
                  </span>
                </td>
                <td style="padding: 14px 12px; text-align: right; font-family: monospace; font-weight: 600; color: var(--text-secondary);">
                  R$ ${(it.valorInvestido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style="padding: 14px 12px; text-align: right; font-family: monospace; font-weight: 700; color: var(--text-primary);">
                  R$ ${(it.valorAtual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style="padding: 14px 12px; color: var(--text-muted); font-size: 11.5px;">
                  ${it.dataVencimento || (it.liquidezDiaria ? 'Liquidez Diária' : 'Liquidez Diária')}
                </td>
                <td style="padding: 14px 12px; text-align: center; font-weight: 700; color: var(--text-primary);">10</td>
                <td style="padding: 14px 12px; text-align: center; font-family: monospace; font-weight: 600; color: var(--text-secondary);">${weight.toFixed(2).replace('.', ',')}%</td>
                <td style="padding: 14px 12px; text-align: center; font-family: monospace; font-weight: 600; color: var(--text-muted);">${targetWeight},00%</td>
                <td style="padding: 14px 12px; text-align: center;">
                  <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.06); color: var(--text-muted);">Não</span>
                </td>
                <td style="padding: 14px 16px; text-align: center;">
                  <button onclick="removePortfolioItemAt(${it.originalIndex})" style="background: none; border: none; color: var(--rose-400); cursor: pointer; padding: 4px;" title="Excluir Ativo">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  // FIIs, Ações, Fiagros
  return `
    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
      <thead>
        <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 11px; text-transform: uppercase;">
          <th style="padding: 12px 16px; font-weight: 600;">Ativo</th>
          <th style="padding: 12px 10px; font-weight: 600; text-align: center;">Quant.</th>
          <th style="padding: 12px 10px; font-weight: 600; text-align: center;">Tipo</th>
          <th style="padding: 12px 12px; font-weight: 600; text-align: right;">Preço Médio</th>
          <th style="padding: 12px 12px; font-weight: 600; text-align: right;">Preço Atual</th>
          <th style="padding: 12px 10px; font-weight: 600;">Variação</th>
          <th style="padding: 12px 10px; font-weight: 600;">Rentabilidade</th>
          <th style="padding: 12px 10px; font-weight: 600; text-align: right;">Últ. Rend.</th>
          <th style="padding: 12px 12px; font-weight: 600; text-align: right;">Saldo</th>
          <th style="padding: 12px 10px; font-weight: 600; text-align: right;">Prov. Rec.</th>
          <th style="padding: 12px 10px; font-weight: 600; text-align: center;">P/VP</th>
          <th style="padding: 12px 10px; font-weight: 600; text-align: center;">Nota</th>
          <th style="padding: 12px 10px; font-weight: 600; text-align: center;">% Cart.</th>
          <th style="padding: 12px 10px; font-weight: 600; text-align: center;">% Ideal</th>
          <th style="padding: 12px 10px; font-weight: 600; text-align: center;">Comprar?</th>
          <th style="padding: 12px 16px; font-weight: 600; text-align: center;">Opções</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(it => {
          const rentPct = it.rentabilidadePct || 0;
          const isUp = rentPct >= 0;
          const weight = totalPatrimonio > 0 ? ((it.valorAtual / totalPatrimonio) * 100) : 0;
          const qty = it.quantidade || 1;
          const pm = it.precoMedio || ((it.valorInvestido || 0) / qty);
          const pa = it.cotacaoAtual || pm;
          const varPct = pm > 0 ? (((pa - pm) / pm) * 100) : 0;
          const isVarUp = varPct >= 0;

          return `
            <tr style="border-bottom: 1px solid var(--border-subtle); transition: background 0.15s;" onmouseover="this.style.background='var(--bg-surface-elevated)'" onmouseout="this.style.background='transparent'">
              <td style="padding: 14px 16px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="width: 26px; height: 26px; border-radius: 4px; background: rgba(253, 224, 71, 0.12); display: flex; align-items: center; justify-content: center; color: #fde047; font-weight: 800; font-size: 10px;">
                    ${it.tipo === 'FII' ? 'FII' : 'AÇÃO'}
                  </div>
                  <div>
                    <div style="font-weight: 800; color: var(--text-primary); font-family: monospace; font-size: 13px;">${it.ticker}</div>
                    <div style="font-size: 10px; color: var(--text-muted);">${it.nome || ''}</div>
                  </div>
                </div>
              </td>
              <td style="padding: 14px 10px; text-align: center; font-family: monospace; font-weight: 700; color: var(--text-primary);">${qty}</td>
              <td style="padding: 14px 10px; text-align: center;">
                <span style="font-size: 10px; font-weight: 700; background: var(--bg-surface-elevated); padding: 2px 6px; border-radius: 3px; color: var(--text-secondary);">${it.tipo}</span>
              </td>
              <td style="padding: 14px 12px; text-align: right; font-family: monospace; color: var(--text-secondary);">
                R$ ${pm.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td style="padding: 14px 12px; text-align: right; font-family: monospace; font-weight: 700; color: var(--text-primary);">
                R$ ${pa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td style="padding: 14px 10px;">
                <span style="font-weight: 700; color: ${isVarUp ? 'var(--emerald-400)' : 'var(--rose-400)'}; font-family: monospace;">
                  ${isVarUp ? '+' : ''}${varPct.toFixed(2).replace('.', ',')}% ${isVarUp ? '▲' : '▼'}
                </span>
              </td>
              <td style="padding: 14px 10px;">
                <span style="font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 4px; background: ${isUp ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}; color: ${isUp ? 'var(--emerald-400)' : 'var(--rose-400)'}; font-family: monospace;">
                  ${isUp ? '+' : ''}${rentPct.toFixed(2).replace('.', ',')}% ↗
                </span>
              </td>
              <td style="padding: 14px 10px; text-align: right; font-family: monospace; color: var(--text-secondary);">
                R$ ${(it.ultimoRendimento || 0.10).toFixed(2).replace('.', ',')}
              </td>
              <td style="padding: 14px 12px; text-align: right; font-family: monospace; font-weight: 700; color: var(--text-primary);">
                R$ ${(it.valorAtual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td style="padding: 14px 10px; text-align: right; font-family: monospace; color: var(--text-muted);">
                R$ 0,00
              </td>
              <td style="padding: 14px 10px; text-align: center; font-family: monospace; color: var(--text-secondary);">${(it.pvp || 0.96).toFixed(2).replace('.', ',')}</td>
              <td style="padding: 14px 10px; text-align: center; font-weight: 700; color: var(--text-primary);">10</td>
              <td style="padding: 14px 10px; text-align: center; font-family: monospace; font-weight: 600; color: var(--text-secondary);">${weight.toFixed(2).replace('.', ',')}%</td>
              <td style="padding: 14px 10px; text-align: center; font-family: monospace; font-weight: 600; color: var(--text-muted);">${targetWeight},00%</td>
              <td style="padding: 14px 10px; text-align: center;">
                <span style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: rgba(16,185,129,0.15); color: var(--emerald-400);">Sim</span>
              </td>
              <td style="padding: 14px 16px; text-align: center;">
                <button onclick="removePortfolioItemAt(${it.originalIndex})" style="background: none; border: none; color: var(--rose-400); cursor: pointer; padding: 4px;" title="Excluir Ativo">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function toggleAccordion(id) {
  const el = document.getElementById(id);
  const chevron = document.getElementById('chevron_' + id);
  if (el) {
    const isHidden = el.style.display === 'none';
    el.style.display = isHidden ? 'block' : 'none';
    if (chevron) {
      chevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    }
  }
}

function removePortfolioItemAt(index) {
  if (!confirm('Deseja realmente remover este investimento da sua carteira?')) return;
  if (window.InvestAuth) {
    const portfolio = InvestAuth.getUserPortfolio();
    if (index >= 0 && index < portfolio.length) {
      portfolio.splice(index, 1);
      InvestAuth.saveUserPortfolio(portfolio);
      renderPortfolioPage();
    }
  }
}

// ==========================================================================
// CONTROLE DE SUB-ABAS DA CARTEIRA & VISÕES DETALHADAS (INVESTIDOR 10)
// ==========================================================================
let currentActivePortfolioTab = 'resumo';

function initPortfolioTabs() {
  const tabButtons = document.querySelectorAll('.portfolio-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) switchPortfolioTab(tab);
    });
  });

  const searchInput = document.getElementById('filterPosicoesSearch');
  const classFilter = document.getElementById('filterPosicoesClass');
  if (searchInput) searchInput.addEventListener('input', () => renderPosicoesTab());
  if (classFilter) classFilter.addEventListener('change', () => renderPosicoesTab());
}

function switchPortfolioTab(tabKey) {
  currentActivePortfolioTab = tabKey;
  const tabButtons = document.querySelectorAll('.portfolio-tab-btn');
  const panels = document.querySelectorAll('.portfolio-view-panel');

  tabButtons.forEach(btn => {
    const isTarget = btn.getAttribute('data-tab') === tabKey;
    btn.classList.toggle('active', isTarget);
    if (isTarget) {
      btn.style.color = 'var(--text-primary)';
      btn.style.fontWeight = '700';
      btn.style.borderBottom = '2px solid var(--text-primary)';
    } else {
      btn.style.color = 'var(--text-muted)';
      btn.style.fontWeight = '600';
      btn.style.borderBottom = 'none';
    }
  });

  panels.forEach(panel => {
    const expectedId = `tabView${tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}`;
    panel.style.display = panel.id === expectedId ? 'block' : 'none';
  });

  if (tabKey === 'posicoes') renderPosicoesTab();
  else if (tabKey === 'proventos') renderProventosTab();
  else if (tabKey === 'patrimonio') renderPatrimonioTab();
  else if (tabKey === 'rentabilidade') renderRentabilidadeTab();
  else if (tabKey === 'lancamentos') renderLancamentosTab();
}

function renderPosicoesTab() {
  const tbody = document.getElementById('posicoesTableBody');
  if (!tbody || !window.InvestAuth) return;
  const portfolio = InvestAuth.getUserPortfolio();
  const search = (document.getElementById('filterPosicoesSearch')?.value || '').trim().toLowerCase();
  const classFilter = document.getElementById('filterPosicoesClass')?.value || 'ALL';

  let totalPatrimonio = 0;
  portfolio.forEach(it => { totalPatrimonio += (it.valorAtual || it.valorInvestido || 0); });

  const filtered = portfolio.filter(it => {
    const matchSearch = !search || (it.ticker && it.ticker.toLowerCase().includes(search)) || (it.nome && it.nome.toLowerCase().includes(search));
    const matchClass = classFilter === 'ALL' || it.tipo === classFilter;
    return matchSearch && matchClass;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
          Nenhum ativo encontrado com os filtros selecionados.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((it, idx) => {
    const invested = it.valorInvestido || 0;
    const current = it.valorAtual || invested;
    const profit = current - invested;
    const rentPct = invested > 0 ? ((profit / invested) * 100) : 0;
    const isUp = profit >= 0;
    const weight = totalPatrimonio > 0 ? ((current / totalPatrimonio) * 100) : 0;
    const qty = it.quantidade || (it.tipo === 'RENDA_FIXA' ? 1 : 1);
    const pm = it.precoMedio || (invested / qty);
    const pa = it.cotacaoAtual || (current / qty);

    return `
      <tr style="border-bottom: 1px solid var(--border-subtle); transition: background 0.15s;">
        <td style="padding: 12px 14px;">
          <div style="font-weight: 800; color: var(--text-primary);">${it.ticker}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${it.nome || ''}</div>
        </td>
        <td style="padding: 12px 14px;">
          <span style="font-size: 10.5px; font-weight: 700; background: var(--bg-surface-elevated); padding: 3px 7px; border-radius: 4px; color: var(--text-secondary);">${it.tipo || 'AÇÃO'}</span>
        </td>
        <td style="padding: 12px 14px; text-align: right; font-family: monospace; font-weight: 700; color: var(--text-primary);">${qty}</td>
        <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: var(--text-secondary);">R$ ${pm.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="padding: 12px 14px; text-align: right; font-family: monospace; font-weight: 700; color: var(--text-primary);">R$ ${pa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="padding: 12px 14px; text-align: right; font-family: monospace; font-weight: 800; color: var(--text-primary);">R$ ${current.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="padding: 12px 14px; text-align: right; font-family: monospace; font-weight: 700; color: ${isUp ? 'var(--emerald-400)' : 'var(--rose-400)'};">
          ${isUp ? '+' : ''}R$ ${Math.abs(profit).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
        <td style="padding: 12px 14px; text-align: right;">
          <span style="font-size: 11.5px; font-weight: 700; padding: 2px 7px; border-radius: 4px; background: ${isUp ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)'}; color: ${isUp ? 'var(--emerald-400)' : 'var(--rose-400)'}; font-family: monospace;">
            ${isUp ? '+' : ''}${rentPct.toFixed(2).replace('.', ',')}%
          </span>
        </td>
        <td style="padding: 12px 14px; text-align: right; font-family: monospace; font-weight: 600; color: var(--text-secondary);">${weight.toFixed(1).replace('.', ',')}%</td>
        <td style="padding: 12px 14px; text-align: center;">
          <button onclick="removePortfolioItemAt(${idx})" style="background: none; border: none; color: var(--rose-400); cursor: pointer; padding: 4px;" title="Remover Ativo">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderProventosTab() {
  if (!window.InvestAuth) return;
  const portfolio = InvestAuth.getUserPortfolio();

  let total12M = 0;
  let totalInvested = 0;
  portfolio.forEach(it => {
    const inv = it.valorInvestido || 0;
    totalInvested += inv;
    const dy = parseFloat(it.dy) || 0;
    if (dy > 0) {
      total12M += inv * (dy / 100);
    } else if (it.tipo === 'FII') {
      total12M += (it.quantidade || 0) * (it.ultimoRendimento || 0.10) * 12;
    }
  });

  const mediaMensal = total12M / 12;
  const yoc = totalInvested > 0 ? ((total12M / totalInvested) * 100) : 0;

  const el12M = document.getElementById('proventosMetric12M');
  const elMedia = document.getElementById('proventosMetricMedia');
  const elYoC = document.getElementById('proventosMetricYoC');
  if (el12M) el12M.textContent = `R$ ${total12M.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (elMedia) elMedia.textContent = `R$ ${mediaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (elYoC) elYoC.textContent = `${yoc.toFixed(2).replace('.', ',')}%`;

  // Histórico Mensal de Barras
  const chartEl = document.getElementById('proventosBarsChartContainer');
  if (chartEl) {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const maxVal = Math.max(10, mediaMensal * 1.5);
    chartEl.innerHTML = `
      <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 180px; gap: 8px; padding-top: 20px;">
        ${months.map((m, i) => {
          const barHeight = mediaMensal > 0 ? Math.min(100, Math.max(15, (mediaMensal / maxVal) * 100 + (Math.sin(i) * 12))) : 5;
          const val = (mediaMensal * (barHeight / 100)).toFixed(2);
          return `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;">
              <span style="font-size: 9.5px; font-family: monospace; color: var(--emerald-400); font-weight: 700;">${mediaMensal > 0 ? `R$${Math.round(val)}` : ''}</span>
              <div style="width: 100%; max-width: 32px; height: ${barHeight}%; background: ${i === 9 ? 'var(--emerald-500)' : 'rgba(16,185,129,0.35)'}; border-radius: 4px 4px 0 0; transition: height 0.3s;"></div>
              <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">${m}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Tabela de Proventos
  const tableEl = document.getElementById('proventosTableContainer');
  if (tableEl) {
    if (portfolio.length === 0) {
      tableEl.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 13px;">Nenhum provento creditado ou previsto. Adicione ações ou FIIs para simular seus dividendos.</div>`;
    } else {
      tableEl.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12.5px;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 11px; text-transform: uppercase;">
              <th style="padding: 10px 12px;">Ativo</th>
              <th style="padding: 10px 12px;">Tipo</th>
              <th style="padding: 10px 12px; text-align: right;">Cotação</th>
              <th style="padding: 10px 12px; text-align: right;">Últ. Rendimento</th>
              <th style="padding: 10px 12px; text-align: right;">Yield (DY)</th>
              <th style="padding: 10px 12px; text-align: right;">Previsão Mensal</th>
            </tr>
          </thead>
          <tbody>
            ${portfolio.map(it => {
              const qty = it.quantidade || 1;
              const rendUnit = it.ultimoRendimento || 0.10;
              const rendTotal = qty * rendUnit;
              return `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 11px 12px; font-weight: 700; color: var(--text-primary);">${it.ticker}</td>
                  <td style="padding: 11px 12px;"><span style="font-size: 10px; font-weight: 700; background: var(--bg-surface-elevated); padding: 2px 6px; border-radius: 3px; color: var(--text-secondary);">${it.tipo}</span></td>
                  <td style="padding: 11px 12px; text-align: right; font-family: monospace; color: var(--text-secondary);">R$ ${(it.cotacaoAtual || it.precoMedio || 0).toFixed(2).replace('.', ',')}</td>
                  <td style="padding: 11px 12px; text-align: right; font-family: monospace; color: var(--emerald-400); font-weight: 700;">R$ ${rendUnit.toFixed(2).replace('.', ',')}</td>
                  <td style="padding: 11px 12px; text-align: right; font-family: monospace; color: #f59e0b; font-weight: 700;">${it.dy || '11,5%'}</td>
                  <td style="padding: 11px 12px; text-align: right; font-family: monospace; color: var(--text-primary); font-weight: 800;">R$ ${rendTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
    }
  }
}

function renderPatrimonioTab() {
  if (!window.InvestAuth) return;
  const portfolio = InvestAuth.getUserPortfolio();
  let totalPatrimonio = 0;
  const classTotals = {};

  portfolio.forEach(it => {
    const val = it.valorAtual || it.valorInvestido || 0;
    totalPatrimonio += val;
    const cat = it.tipo || 'AÇÃO';
    classTotals[cat] = (classTotals[cat] || 0) + val;
  });

  const chartEl = document.getElementById('patrimonioClassesChartContainer');
  if (chartEl) {
    if (totalPatrimonio === 0) {
      chartEl.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 13px;">Adicione ativos para visualizar a distribuição patrimonial.</div>`;
    } else {
      const colors = {
        'AÇÃO': '#c084fc', 'FII': '#fde047', 'STOCKS': '#38bdf8', 'BDR': '#a78bfa',
        'ETF': '#818cf8', 'ETF_INT': '#60a5fa', 'REIT': '#4ade80', 'CRIPTO': '#f97316',
        'RENDA_FIXA': '#7dd3fc', 'TESOURO': '#facc15', 'FUNDO': '#2dd4bf', 'OUTROS': '#94a3b8'
      };

      chartEl.innerHTML = `
        <div style="width: 100%; display: flex; flex-direction: column; gap: 12px;">
          ${Object.entries(classTotals).map(([cat, val]) => {
            const pct = (val / totalPatrimonio) * 100;
            const c = colors[cat] || '#38bdf8';
            return `
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 4px;">
                  <span style="display: flex; align-items: center; gap: 6px;">
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: ${c};"></span>
                    ${cat}
                  </span>
                  <span style="font-family: monospace;">R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${pct.toFixed(1).replace('.', ',')}%)</span>
                </div>
                <div style="width: 100%; height: 8px; background: var(--bg-surface-elevated); border-radius: 4px; overflow: hidden;">
                  <div style="width: ${pct}%; height: 100%; background: ${c}; border-radius: 4px;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  const rebalEl = document.getElementById('patrimonioRebalancingContainer');
  if (rebalEl) {
    rebalEl.innerHTML = `
      <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">Metas de alocação recomendadas vs alocação real da sua carteira:</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 10.5px; text-transform: uppercase;">
            <th style="padding: 8px 10px;">Classe</th>
            <th style="padding: 8px 10px; text-align: right;">Atual %</th>
            <th style="padding: 8px 10px; text-align: right;">Meta %</th>
            <th style="padding: 8px 10px; text-align: center;">Recomendação</th>
          </tr>
        </thead>
        <tbody>
          ${['AÇÃO', 'FII', 'RENDA_FIXA', 'CRIPTO'].map(cat => {
            const actualVal = classTotals[cat] || 0;
            const actualPct = totalPatrimonio > 0 ? ((actualVal / totalPatrimonio) * 100) : 0;
            const targetPct = cat === 'RENDA_FIXA' ? 40 : (cat === 'FII' ? 30 : (cat === 'AÇÃO' ? 25 : 5));
            const needsBuy = actualPct < targetPct;
            return `
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 10px; font-weight: 700; color: var(--text-primary);">${cat}</td>
                <td style="padding: 10px; text-align: right; font-family: monospace;">${actualPct.toFixed(1).replace('.', ',')}%</td>
                <td style="padding: 10px; text-align: right; font-family: monospace; color: var(--text-muted);">${targetPct},0%</td>
                <td style="padding: 10px; text-align: center;">
                  <span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; background: ${needsBuy ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)'}; color: ${needsBuy ? 'var(--emerald-400)' : 'var(--text-muted)'};">
                    ${needsBuy ? 'Aportar' : 'Aguardar'}
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }
}

function renderRentabilidadeTab() {
  const chartEl = document.getElementById('rentabilidadeCompareChartContainer');
  const tableEl = document.getElementById('rentabilidadeMonthlyTableContainer');
  if (!chartEl || !window.InvestAuth) return;

  const portfolio = InvestAuth.getUserPortfolio();
  let totalInvested = 0;
  let totalCurrent = 0;
  portfolio.forEach(it => {
    totalInvested += (it.valorInvestido || 0);
    totalCurrent += (it.valorAtual || it.valorInvestido || 0);
  });
  const rentPct = totalInvested > 0 ? (((totalCurrent - totalInvested) / totalInvested) * 100) : 0;

  const benchmarks = [
    { label: 'Sua Carteira', value: rentPct, color: 'var(--emerald-400)', isMain: true },
    { label: 'CDI Acumulado', value: 10.65, color: '#38bdf8' },
    { label: 'Ibovespa', value: 8.42, color: '#c084fc' },
    { label: 'IFIX (FIIs)', value: 6.18, color: '#fde047' },
    { label: 'IPCA (Inflação)', value: 4.42, color: '#f87171' }
  ];

  chartEl.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      ${benchmarks.map(b => `
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 12.5px; font-weight: 700; margin-bottom: 5px;">
            <span style="color: ${b.isMain ? 'var(--text-primary)' : 'var(--text-secondary)'}; font-size: ${b.isMain ? '13.5px' : '12px'};">${b.label}</span>
            <span style="font-family: monospace; color: ${b.color}; font-size: 13px;">${b.value >= 0 ? '+' : ''}${b.value.toFixed(2).replace('.', ',')}%</span>
          </div>
          <div style="width: 100%; height: ${b.isMain ? '12px' : '8px'}; background: var(--bg-surface-elevated); border-radius: 6px; overflow: hidden;">
            <div style="width: ${Math.min(100, Math.max(8, b.value * 6))}%; height: 100%; background: ${b.color}; border-radius: 6px;"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  if (tableEl) {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    tableEl.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 8px;">
        ${months.map((m, i) => {
          const mRent = (Math.sin(i + 1) * 1.8 + 0.8).toFixed(2);
          const isUp = parseFloat(mRent) >= 0;
          return `
            <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px 8px; text-align: center;">
              <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; margin-bottom: 4px;">${m}</div>
              <div style="font-size: 12.5px; font-weight: 800; font-family: monospace; color: ${isUp ? 'var(--emerald-400)' : 'var(--rose-400)'};">${isUp ? '+' : ''}${mRent.replace('.', ',')}%</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
}

function renderLancamentosTab() {
  const tbody = document.getElementById('lancamentosTableBody');
  if (!tbody || !window.InvestAuth) return;
  const portfolio = InvestAuth.getUserPortfolio();

  if (portfolio.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
          Nenhum lançamento registrado na carteira. Clique em "+ Adicionar Lançamento" para iniciar.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = portfolio.map((it, idx) => {
    const isCompra = it.operacao !== 'VENDA';
    const total = it.valorInvestido || 0;
    const qty = it.quantidade || 1;
    const preco = it.precoMedio || (total / qty);
    const date = it.dataAplicacao || 'Hoje';

    return `
      <tr style="border-bottom: 1px solid var(--border-subtle); font-size: 12.5px;">
        <td style="padding: 12px 14px; font-family: monospace; color: var(--text-secondary);">${date}</td>
        <td style="padding: 12px 14px;">
          <span style="font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px; background: ${isCompra ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}; color: ${isCompra ? 'var(--emerald-400)' : 'var(--rose-400)'};">
            ${isCompra ? 'COMPRA' : 'VENDA'}
          </span>
        </td>
        <td style="padding: 12px 14px;">
          <div style="font-weight: 800; color: var(--text-primary);">${it.ticker}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${it.nome || ''}</div>
        </td>
        <td style="padding: 12px 14px;">
          <span style="font-size: 10px; font-weight: 700; background: var(--bg-surface-elevated); padding: 2px 6px; border-radius: 3px; color: var(--text-secondary);">${it.tipo || 'AÇÃO'}</span>
        </td>
        <td style="padding: 12px 14px; text-align: right; font-family: monospace; font-weight: 700; color: var(--text-primary);">${qty}</td>
        <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: var(--text-secondary);">R$ ${preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: var(--text-muted);">R$ ${(it.custos || 0).toFixed(2).replace('.', ',')}</td>
        <td style="padding: 12px 14px; text-align: right; font-family: monospace; font-weight: 800; color: var(--text-primary);">R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="padding: 12px 14px; text-align: center;">
          <button onclick="removePortfolioItemAt(${idx})" style="background: none; border: none; color: var(--rose-400); cursor: pointer; padding: 4px;" title="Excluir Lançamento">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.initPortfolioTabs = initPortfolioTabs;
window.switchPortfolioTab = switchPortfolioTab;
window.renderPosicoesTab = renderPosicoesTab;
window.renderProventosTab = renderProventosTab;
window.renderPatrimonioTab = renderPatrimonioTab;
window.renderRentabilidadeTab = renderRentabilidadeTab;
window.renderLancamentosTab = renderLancamentosTab;

// ==========================================================================
// ABA 5: SIMULADOR DE JUROS COMPOSTOS & PROJEÇÃO (SIMULADOR.HTML)
// ==========================================================================
function initSimulatorPage() {
  const initialInput = document.getElementById('simInitial');
  const monthlyInput = document.getElementById('simMonthly');
  const rateInput = document.getElementById('simRate');
  const yearsInput = document.getElementById('simYears');
  const rateDisplay = document.getElementById('simRateDisplay');
  const yearsDisplay = document.getElementById('simYearsDisplay');

  function calculate() {
    const P = parseFloat(initialInput.value) || 0;
    const PMT = parseFloat(monthlyInput.value) || 0;
    const annualRate = (parseFloat(rateInput.value) || 0) / 100;
    const years = parseInt(yearsInput.value) || 1;

    if (rateDisplay) rateDisplay.textContent = `${(annualRate * 100).toFixed(1)}% a.a.`;
    if (yearsDisplay) yearsDisplay.textContent = `${years} ${years > 1 ? 'anos' : 'ano'}`;

    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
    const months = years * 12;

    let total = P;
    const yearlyPoints = [{ date: 'Hoje', value: P }];

    for (let m = 1; m <= months; m++) {
      total = (total + PMT) * (1 + monthlyRate);
      if (m % 12 === 0 || m === months) {
        yearlyPoints.push({
          date: `Ano ${Math.floor(m / 12)}`,
          value: Math.round(total)
        });
      }
    }

    const totalInvested = P + (PMT * months);
    const totalInterest = total - totalInvested;
    const monthlyIncome = total * 0.008; // Regra dos 0.8% ao mês em dividendos

    document.getElementById('simResultTotal').textContent = `R$ ${total.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`;
    document.getElementById('simResultInvested').textContent = `R$ ${totalInvested.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`;
    document.getElementById('simResultInterest').textContent = `R$ ${totalInterest.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`;
    document.getElementById('simResultIncome').textContent = `R$ ${monthlyIncome.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}/mês`;

    // Renderiza Gráfico da Curva Exponencial
    if (window.FinancialCharts) {
      FinancialCharts.renderLineChart('simChartContainer', yearlyPoints, {
        strokeColor: '#10b981',
        height: 240
      });
    }
  }

  [initialInput, monthlyInput, rateInput, yearsInput].forEach(inp => {
    if (inp) inp.addEventListener('input', calculate);
  });

  calculate();
}

// ==========================================================================
// ABA 6: CENTRAL DE NOTÍCIAS & FATOS RELEVANTES (NOTICIAS.HTML)
// ==========================================================================
function initNewsPage() {
  const pills = document.querySelectorAll('.news-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentNewsFilter = pill.getAttribute('data-news-cat');
      renderNewsGrid();
    });
  });

  renderNewsGrid();
}

function renderNewsGrid() {
  const container = document.getElementById('newsGridContainer');
  if (!container || !window.MARKET_NEWS) return;

  const filtered = MARKET_NEWS.filter(news => {
    if (currentNewsFilter === 'all') return true;
    return news.category.toLowerCase().includes(currentNewsFilter.toLowerCase());
  });

  container.innerHTML = filtered.map(news => `
    <article class="news-card" onclick="openAssetModal('${news.ticker}')" style="cursor: pointer;">
      <div>
        <div class="news-header-meta">
          <span class="news-ticker-badge">${news.ticker}</span>
          <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">${news.category}</span>
        </div>
        <h3 class="news-title">${news.title}</h3>
        <p class="news-summary">${news.summary}</p>
      </div>
      <div class="news-footer">
        <span>${news.source}</span>
        <span>${news.time}</span>
      </div>
    </article>
  `).join('');
}

// ==========================================================================
// 7. MODAL DE RAIO-X COMPLETO DO ATIVO COM VALUATION DINÂMICO & GRÁFICOS (PARTE 4)
// ==========================================================================
function initAssetModalEvents() {
  const modal = document.getElementById('assetModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeAssetModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAssetModal();
    });
  }
}

function openAssetModal(ticker) {
  const asset = ASSETS_DATA.find(a => a.ticker === ticker);
  if (!asset) return;

  const modal = document.getElementById('assetModal');
  const icon = document.getElementById('modalTickerIcon');
  const title = document.getElementById('modalTickerTitle');
  const badge = document.getElementById('modalTypeBadge');
  const company = document.getElementById('modalCompanyName');
  const body = document.getElementById('modalBody');

  if (!modal || !body) return;

  icon.textContent = asset.ticker.substring(0, 4);
  title.textContent = asset.ticker;
  badge.textContent = asset.type;
  company.textContent = `${asset.name} • ${asset.sector || asset.fiiType || 'Ativo B3'}`;

  // Valuation Décio Bazin
  const dyDecimal = parseFloat(asset.dy.replace('%', '')) / 100;
  const annualDividend = asset.price * dyDecimal;
  const initialBazin = annualDividend / 0.06;
  const safetyMargin = ValuationEngine.calculateMarginOfSafety(asset.price, initialBazin);

  // Valuation Graham
  const grahamResult = ValuationEngine.calculateGraham(asset.lpa, asset.vpa, asset);

  let valuationCards = '';
  if (asset.type === 'AÇÃO' || asset.type === 'BDR') {
    valuationCards = `
      <div class="valuation-box-grid">
        <div class="val-card">
          <div class="val-card-title">Preço Teto Décio Bazin (6% a.a.)</div>
          <div class="val-card-price" id="modalBazinPrice">R$ ${initialBazin.toFixed(2)}</div>
          <div style="margin-top: 6px;">
            <span class="safety-margin-badge ${safetyMargin.isPositive ? 'positive' : 'negative'}" id="modalSafetyBadge">
              ${safetyMargin.isPositive ? '▲ +' : '▼ '}${safetyMargin.marginPct}% de Margem
            </span>
          </div>
          <div class="val-card-note" id="modalBazinNote">${safetyMargin.status}</div>
        </div>
        <div class="val-card">
          <div class="val-card-title">Preço Justo Benjamin Graham</div>
          <div class="val-card-price">${grahamResult.isApplicable && grahamResult.price ? `R$ ${grahamResult.price.toFixed(2)}` : '--'}</div>
          <div class="val-card-note">${grahamResult.reason}</div>
        </div>
        <div class="val-card">
          <div class="val-card-title">P/L Contábil vs Ajustado</div>
          <div class="val-card-price">${asset.pl_contabil}x <span style="font-size: 13px; color: var(--text-muted); font-weight: normal;">/ ${asset.pl_ajustado || asset.pl_contabil}x</span></div>
          <div class="val-card-note">${asset.nonRecurrentNote || 'Lucro estável sem distorções tributárias relevantes.'}</div>
        </div>
      </div>

      <!-- Slider Interativo de Bazin -->
      <div class="bazin-slider-box">
        <div class="bazin-slider-header">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-secondary);">Taxa Mínima de Dividendos Desejada:</span>
          <span style="font-size: 14px; font-weight: 800; font-family: monospace; color: var(--emerald-400);" id="bazinYieldLabel">6.0% a.a.</span>
        </div>
        <input type="range" class="bazin-range-input" id="bazinSlider" min="4" max="14" step="0.5" value="6" oninput="updateBazinSlider('${asset.ticker}', this.value)">
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); margin-top: 4px;">
          <span>4% (Mais conservador)</span>
          <span>6% (Padrão Décio Bazin)</span>
          <span>10%</span>
          <span>14% (High Yield)</span>
        </div>
      </div>
    `;
  } else {
    // PARTE 5: Valuation Profissional de FIIs & Fiagros (Spread s/ Tesouro IPCA+ e Vacância Real)
    const fiiCeiling = (window.calculateFIICeiling ? window.calculateFIICeiling(asset, 2.5) : null) || {
      ceilingPrice: asset.price * 1.06,
      marginPct: 6.0,
      isDiscounted: true,
      status: 'Abaixo do Preço Teto'
    };

    valuationCards = `
      <div class="valuation-box-grid">
        <div class="val-card">
          <div class="val-card-title">Preço Teto FII (Spread IPCA+ 2.5%)</div>
          <div class="val-card-price" id="modalFiiCeilingPrice">R$ ${fiiCeiling.ceilingPrice.toFixed(2)}</div>
          <div style="margin-top: 6px;">
            <span class="safety-margin-badge ${fiiCeiling.isDiscounted ? 'positive' : 'negative'}" id="modalFiiSafetyBadge">
              ${fiiCeiling.isDiscounted ? '▲ +' : '▼ '}${fiiCeiling.marginPct}% de Margem
            </span>
          </div>
          <div class="val-card-note" id="modalFiiCeilingNote">${fiiCeiling.status}</div>
        </div>
        <div class="val-card">
          <div class="val-card-title">P/VP Real s/ Laudo Físico</div>
          <div class="val-card-price ${asset.pvp < 1 ? 'highlight' : ''}">${asset.pvp} <span style="font-size: 13px; color: var(--text-muted); font-weight: normal;">(VP R$ ${asset.vp_cota.toFixed(2)})</span></div>
          <div class="val-card-note">${asset.pvp < 1 ? `Desconto de ${((1 - asset.pvp) * 100).toFixed(1)}% sobre o patrimônio físico.` : 'Negociando com ágio sobre o laudo contábil.'}</div>
        </div>
        <div class="val-card">
          <div class="val-card-title">${asset.vacancia_fisica ? 'Vacância Física vs Financeira' : 'Indexador & Risco'}</div>
          <div class="val-card-price">${asset.vacancia_fisica ? `${asset.vacancia_fisica} / ${asset.vacancia_financeira || '0%'}` : (asset.indexador_principal || 'IPCA / CDI')}</div>
          <div class="val-card-note">${asset.vacancia_fisica ? 'Imóveis alugados gerando aluguel regular.' : (asset.yieldTrapReason || 'Carteira de CRIs/CRAs com garantias reais.')}</div>
        </div>
      </div>

      <!-- Slider Interativo de Spread de Risco para FIIs (Parte 5) -->
      <div class="bazin-slider-box">
        <div class="bazin-slider-header">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-secondary);">Prêmio de Risco sobre NTN-B Desejado:</span>
          <span style="font-size: 14px; font-weight: 800; font-family: monospace; color: var(--emerald-400);" id="fiiSpreadLabel">+2.50% a.a.</span>
        </div>
        <input type="range" class="bazin-range-input" id="fiiSpreadSlider" min="1.0" max="5.0" step="0.25" value="2.5" oninput="updateFiiSpreadSlider('${asset.ticker}', this.value)">
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-muted); margin-top: 4px;">
          <span>+1.0% (Tijolo AAA)</span>
          <span>+2.5% (Padrão de Mercado)</span>
          <span>+5.0% (Crédito High Yield)</span>
        </div>
      </div>
    `;
  }

  // Checklist
  const checklistItems = asset.checklist.map(item => `
    <div class="checklist-item">
      <div class="check-icon ${item.passed ? 'pass' : 'fail'}">${item.passed ? '✓' : '✕'}</div>
      <div>
        <div style="font-weight: 600; color: var(--text-primary);">${item.text}</div>
        ${item.note ? `<div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">${item.note}</div>` : ''}
      </div>
    </div>
  `).join('');

  // Proventos Recentes
  const proventosItems = (asset.proventosRecentes || []).map(p => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-subtle); font-size: 13px;">
      <div>
        <strong>${p.tipo}</strong>
        <div style="font-size: 11px; color: var(--text-muted);">Data COM: ${p.dataCom} • Pagamento: ${p.dataPag}</div>
      </div>
      <div style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--emerald-400);">${p.valor}</div>
    </div>
  `).join('');

  // Corpo do Modal com Seções de Gráficos Nativos (PARTE 4)
  body.innerHTML = `
    <!-- 1. Valuation & Preço Justo -->
    <div>
      <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--text-primary);">Modelos de Valuation & Preço Teto</h3>
      ${valuationCards}
    </div>

    <!-- 2. Gráfico de Cotação Histórica (SVG Nativo) -->
    <div class="chart-box-container" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; margin-top: 16px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <h4 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin: 0;">Histórico de Cotação</h4>
        <span style="font-size: 11px; color: var(--text-muted); font-family: monospace;">Evolução do Preço</span>
      </div>
      <div id="modalHistoryChartContainer" style="min-height: 180px;"></div>
    </div>

    <!-- 3. Gráfico de Evolução de Dividendos Anuais (SVG Nativo) -->
    <div class="chart-box-container" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; margin-top: 16px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <h4 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin: 0;">Evolução dos Proventos Pagos por Ano</h4>
        <span style="font-size: 11px; color: var(--text-muted); font-family: monospace;">2020 a 2024</span>
      </div>
      <div id="modalDividendBarsContainer" style="min-height: 160px;"></div>
    </div>

    <!-- 4. Checklist de Saúde Financeira -->
    <div class="checklist-container" style="margin-top: 16px;">
      <div class="checklist-title">Checklist de Governança & Eficiência (Sem viés de EBITDA para bancos)</div>
      ${checklistItems}
    </div>

    <!-- 5. Proventos Recentes Anunciados -->
    <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; margin-top: 16px;">
      <h4 style="font-size: 13px; font-weight: 700; margin-bottom: 8px;">Últimos Proventos Anunciados (Dividendos / JCP)</h4>
      ${proventosItems || '<p style="font-size: 12px; color: var(--text-muted);">Nenhum anúncio recente.</p>'}
    </div>
  `;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Renderiza os Gráficos Nativos da Parte 4
  if (window.FinancialCharts && window.getAssetHistoricalData) {
    const historical = getAssetHistoricalData(asset.ticker);
    FinancialCharts.renderLineChart('modalHistoryChartContainer', historical.prices, {
      strokeColor: '#10b981',
      height: 190
    });
    FinancialCharts.renderDividendBars('modalDividendBarsContainer', historical.dividends);
  }
}

function updateBazinSlider(ticker, yieldVal) {
  const asset = ASSETS_DATA.find(a => a.ticker === ticker);
  if (!asset) return;

  const y = parseFloat(yieldVal) / 100;
  const dyDecimal = parseFloat(asset.dy.replace('%', '')) / 100;
  const annualDividend = asset.price * dyDecimal;
  const newBazin = annualDividend / y;
  const safety = ValuationEngine.calculateMarginOfSafety(asset.price, newBazin);

  const label = document.getElementById('bazinYieldLabel');
  const price = document.getElementById('modalBazinPrice');
  const badge = document.getElementById('modalSafetyBadge');
  const note = document.getElementById('modalBazinNote');

  if (label) label.textContent = `${parseFloat(yieldVal).toFixed(1)}% a.a.`;
  if (price) price.textContent = `R$ ${newBazin.toFixed(2)}`;
  if (note) note.textContent = safety.status;

  if (badge) {
    badge.className = `safety-margin-badge ${safety.isPositive ? 'positive' : 'negative'}`;
    badge.textContent = `${safety.isPositive ? '▲ +' : '▼ '}${safety.marginPct}% de Margem`;
  }
}

function updateFiiSpreadSlider(ticker, spreadVal) {
  const allAssets = getAssetsData();
  const asset = allAssets.find(a => a.ticker === ticker);
  if (!asset || !window.calculateFIICeiling) return;

  const result = window.calculateFIICeiling(asset, parseFloat(spreadVal));
  if (!result) return;

  const label = document.getElementById('fiiSpreadLabel');
  const price = document.getElementById('modalFiiCeilingPrice');
  const badge = document.getElementById('modalFiiSafetyBadge');
  const note = document.getElementById('modalFiiCeilingNote');

  if (label) label.textContent = `+${parseFloat(spreadVal).toFixed(2)}% a.a.`;
  if (price) price.textContent = `R$ ${result.ceilingPrice.toFixed(2)}`;
  if (note) note.textContent = result.status;

  if (badge) {
    badge.className = `safety-margin-badge ${result.isDiscounted ? 'positive' : 'negative'}`;
    badge.textContent = `${result.isDiscounted ? '▲ +' : '▼ '}${result.marginPct}% de Margem`;
  }
}

function closeAssetModal() {
  const modal = document.getElementById('assetModal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

// Expõe globalmente
window.openAssetModal = openAssetModal;
window.closeAssetModal = closeAssetModal;
window.updateBazinSlider = updateBazinSlider;
window.updateFiiSpreadSlider = updateFiiSpreadSlider;
window.addCompareTicker = addCompareTicker;
window.removeCompareTicker = removeCompareTicker;
window.removePortfolioItem = removePortfolioItem;

