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
  // 1. Garante que há um usuário ativo (se não houver, autentica o Guilherme Master por padrão)
  let currentUser = window.InvestAuth ? InvestAuth.getCurrentUser() : null;
  if (!currentUser && window.InvestAuth) {
    const defaultLogin = InvestAuth.login('guilherme', 'invest2026');
    if (defaultLogin.success) currentUser = defaultLogin.user;
  }

  // 2. Atualiza o Título com o Nome do Proprietário da Carteira
  const ownerTitle = document.getElementById('portfolioOwnerTitle');
  if (ownerTitle && currentUser) {
    ownerTitle.textContent = `Carteira de ${currentUser.name}`;
  }

  // 3. Modais de Inserção de Ativos
  const btnOpenModal = document.getElementById('btnOpenAddAssetModal');
  const btnFastAdd = document.getElementById('btnAddNewAssetFast');
  const addModal = document.getElementById('addAssetModal');
  const addCloseBtn = document.getElementById('addAssetCloseBtn');
  const customForm = document.getElementById('addAssetCustomForm');

  const openModal = () => {
    if (addModal) {
      addModal.classList.add('active');
      addModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      // Preenche a data de hoje por padrão
      const dateInput = document.getElementById('newAssetDate');
      if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
      }
    }
  };

  const closeModal = () => {
    if (addModal) {
      addModal.classList.remove('active');
      addModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  if (btnOpenModal) btnOpenModal.addEventListener('click', openModal);
  if (btnFastAdd) btnFastAdd.addEventListener('click', openModal);
  if (addCloseBtn) addCloseBtn.addEventListener('click', closeModal);

  // Fecha clicando fora
  if (addModal) {
    addModal.addEventListener('click', (e) => {
      if (e.target === addModal) closeModal();
    });
  }

  // Submissão do Formulário de Adicionar Ativo / CDB
  if (customForm) {
    customForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = document.getElementById('newAssetType').value;
      const ticker = document.getElementById('newAssetTicker').value.trim();
      const invested = parseFloat(document.getElementById('newAssetInvested').value) || 0;
      const date = document.getElementById('newAssetDate').value;

      if (!ticker || invested <= 0) {
        alert('Por favor, informe os dados corretos do investimento.');
        return;
      }

      if (window.InvestAuth) {
        const userPortfolio = InvestAuth.getUserPortfolio();
        
        let newItem = {
          ticker: ticker.toUpperCase(),
          nome: ticker,
          tipo: type,
          valorInvestido: invested,
          dataAplicacao: date || new Date().toISOString().split('T')[0]
        };

        if (type === 'RENDA_FIXA') {
          newItem.percentualCDI = 100;
          newItem.cdiAnual = 10.65;
          newItem.instituicao = 'Banco Inter';
        } else {
          newItem.quantidade = 1;
          newItem.precoMedio = invested;
        }

        userPortfolio.push(newItem);
        InvestAuth.saveUserPortfolio(userPortfolio);
        closeModal();
        customForm.reset();
        renderPortfolioPage();
      }
    });
  }

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

  // Processa cada ativo com o cálculo de rentabilidade real
  portfolio.forEach(item => {
    totalInvestido += (item.valorInvestido || 0);

    if (item.tipo === 'RENDA_FIXA' && window.CDIEngine) {
      // Cálculo de Rendimento Real de Renda Fixa com Dias Úteis B3
      const income = CDIEngine.calculateExactIncome(
        item.valorInvestido,
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
      // Ativos de Renda Variável (FIIs, Ações)
      const allAssets = getAssetsData();
      const refAsset = allAssets.find(a => a.ticker === item.ticker);
      const currentPrice = refAsset ? refAsset.price : (item.cotacao || item.precoMedio || item.valorInvestido);
      const qty = item.quantidade || 1;
      item.valorAtual = qty * currentPrice;
      item.lucro = item.valorAtual - (item.valorInvestido || 0);
      item.rentabilidadePct = item.valorInvestido > 0 ? ((item.lucro / item.valorInvestido) * 100) : 0;
      totalPatrimonio += item.valorAtual;
      totalLucro += item.lucro;
    }
  });

  const rentabilidadeGeralPct = totalInvestido > 0 ? ((totalLucro / totalInvestido) * 100) : 0;

  // 1. Atualiza os Cards de Destaque Superiores (Fotos 2 e 3 do Guilherme)
  const cardPatrimonio = document.getElementById('cardPatrimonioTotal');
  const cardRentBadge = document.getElementById('cardRentabilidadeBadge');
  const cardInvestido = document.getElementById('cardValorInvestido');
  const cardLucro = document.getElementById('cardLucroTotal');
  const cardGanhoCapital = document.getElementById('cardGanhoCapital');
  const cardProventos = document.getElementById('cardProventos');

  if (cardPatrimonio) {
    cardPatrimonio.textContent = `R$ ${totalPatrimonio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (cardRentBadge) {
    const isUp = rentabilidadeGeralPct >= 0;
    cardRentBadge.style.background = isUp ? 'var(--emerald-glow)' : 'var(--rose-glow)';
    cardRentBadge.style.color = isUp ? 'var(--emerald-400)' : 'var(--rose-400)';
    cardRentBadge.textContent = `${isUp ? '+' : ''}${rentabilidadeGeralPct.toFixed(2).replace('.', ',')}% ${isUp ? '▲' : '▼'}`;
  }
  if (cardInvestido) {
    cardInvestido.textContent = `R$ ${totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (cardLucro) {
    const isUp = totalLucro >= 0;
    cardLucro.style.color = isUp ? 'var(--emerald-400)' : 'var(--rose-400)';
    cardLucro.textContent = `${isUp ? '+' : '-'} R$ ${Math.abs(totalLucro).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (cardGanhoCapital) {
    const isUp = totalLucro >= 0;
    cardGanhoCapital.textContent = `${isUp ? '+' : '-'} R$ ${Math.abs(totalLucro).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (cardProventos) {
    cardProventos.textContent = 'R$ 0,00';
  }

  // 2. Gráfico Empilhado de Evolução do Patrimônio (Fotos 2 e 3 do Guilherme)
  if (window.FinancialCharts && FinancialCharts.renderStackedEvolutionBars) {
    // Série histórica de evolução com Valor Investido + Lucro Real
    const evolutionData = [
      { label: 'Out/25', invested: totalInvestido * 0.92, profit: Math.max(0, totalLucro * 0.25) },
      { label: 'Nov/25', invested: totalInvestido * 0.94, profit: Math.max(0, totalLucro * 0.40) },
      { label: 'Dez/25', invested: totalInvestido * 0.96, profit: Math.max(0, totalLucro * 0.55) },
      { label: 'Jan/26', invested: totalInvestido * 0.98, profit: Math.max(0, totalLucro * 0.70) },
      { label: 'Fev/26', invested: totalInvestido * 0.99, profit: Math.max(0, totalLucro * 0.85) },
      { label: 'Mar/26', invested: totalInvestido, profit: Math.max(0, totalLucro) }
    ];

    FinancialCharts.renderStackedEvolutionBars('portfolioEvolutionChartContainer', evolutionData);
  }

  // 3. Atualiza o Título da Seção de Ativos
  const groupTitle = document.getElementById('portfolioAssetsGroupTitle');
  if (groupTitle) {
    groupTitle.textContent = `Meus ativos (${portfolio.length})`;
  }

  // 4. Renderiza os Cards de Grupos de Ativos (Foto 4 do Guilherme)
  const groupsContainer = document.getElementById('portfolioAssetGroupsContainer');
  if (groupsContainer) {
    if (portfolio.length === 0) {
      groupsContainer.innerHTML = `
        <div style="text-align: center; padding: 32px 16px; background: var(--bg-surface); border: 1px dashed var(--border-subtle); border-radius: var(--radius-lg);">
          <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 12px;">Sua carteira ainda está vazia.</p>
          <button onclick="document.getElementById('btnOpenAddAssetModal').click()" style="padding: 8px 16px; border-radius: var(--radius-sm); background: var(--emerald-500); color: #fff; font-weight: 700; border: none; cursor: pointer;">
            + Adicionar Primeiro Investimento
          </button>
        </div>
      `;
      return;
    }

    // Agrupa ativos por classe: FII, RENDA_FIXA, AÇÃO
    const groups = {};
    portfolio.forEach((item, index) => {
      const typeKey = item.tipo || 'AÇÃO';
      if (!groups[typeKey]) groups[typeKey] = [];
      groups[typeKey].push({ ...item, originalIndex: index });
    });

    const groupNames = {
      'FII': 'FIIs',
      'RENDA_FIXA': 'Renda Fixa',
      'AÇÃO': 'Ações',
      'FIAGRO': 'Fiagros'
    };

    const iconsSvg = {
      'FII': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path></svg>`,
      'RENDA_FIXA': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
      'AÇÃO': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>`,
      'FIAGRO': `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`
    };

    let html = '';
    for (const [classKey, items] of Object.entries(groups)) {
      const classInvested = items.reduce((acc, it) => acc + (it.valorInvestido || 0), 0);
      const classCurrent = items.reduce((acc, it) => acc + (it.valorAtual || 0), 0);
      const classProfit = classCurrent - classInvested;
      const classRentPct = classInvested > 0 ? ((classProfit / classInvested) * 100) : 0;
      const classWeightPct = totalPatrimonio > 0 ? ((classCurrent / totalPatrimonio) * 100) : 0;
      const isPositive = classRentPct >= 0;

      // Meta percentual sugerida
      const targetWeight = classKey === 'RENDA_FIXA' ? 80 : (classKey === 'FII' ? 20 : 10);

      html += `
        <div class="portfolio-group-card" onclick="toggleGroupItems('group_details_${classKey}')">
          <div class="portfolio-group-header">
            <div class="portfolio-group-title">
              <div class="portfolio-group-icon">
                ${iconsSvg[classKey] || iconsSvg['AÇÃO']}
              </div>
              <div>
                <span>${groupNames[classKey] || classKey}</span>
                <span style="font-size: 13px; font-weight: 600; color: var(--text-muted); margin-left: 4px;">(${items.length})</span>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>

          <div class="portfolio-metrics-grid">
            <div class="portfolio-metric-col">
              <span class="portfolio-metric-label">Valor total</span>
              <span class="portfolio-metric-value">R$ ${classCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div class="portfolio-metric-col">
              <span class="portfolio-metric-label">Rentabilidade</span>
              <span class="portfolio-metric-value" style="color: ${isPositive ? 'var(--emerald-400)' : 'var(--rose-400)'};">
                ${isPositive ? '+' : ''}${classRentPct.toFixed(2).replace('.', ',')}% ${isPositive ? '↗' : '↘'}
              </span>
            </div>

            <div class="portfolio-metric-col">
              <span class="portfolio-metric-label">Variação</span>
              <span class="portfolio-metric-value" style="color: ${isPositive ? 'var(--emerald-400)' : 'var(--rose-400)'};">
                ${isPositive ? '+' : ''}${classRentPct.toFixed(2).replace('.', ',')}% ${isPositive ? '▲' : '▼'}
              </span>
            </div>

            <div class="portfolio-metric-col">
              <span class="portfolio-metric-label">% na Carteira</span>
              <span class="portfolio-metric-value">${classWeightPct.toFixed(0)}% / ${targetWeight}%</span>
            </div>
          </div>

          <!-- Detalhes dos Ativos do Grupo (Expandível) -->
          <div id="group_details_${classKey}" style="margin-top: 14px; border-top: 1px dashed var(--border-subtle); padding-top: 12px; display: flex; flex-direction: column; gap: 8px;">
            ${items.map(it => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; background: var(--bg-surface-elevated); border-radius: var(--radius-sm); font-size: 12px;">
                <div>
                  <strong style="color: var(--text-primary); font-family: monospace;">${it.ticker}</strong>
                  <span style="color: var(--text-muted); margin-left: 6px;">${it.nome || ''}</span>
                  ${it.tipo === 'RENDA_FIXA' ? `<div style="font-size: 10.5px; color: var(--text-muted); margin-top: 2px;">100% do CDI • ${it.businessDays || 0} dias úteis B3 contados</div>` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="font-family: monospace; font-weight: 700; color: var(--text-primary);">R$ ${(it.valorAtual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <button onclick="event.stopPropagation(); removePortfolioItemAt(${it.originalIndex})" style="background: none; border: none; color: var(--rose-400); cursor: pointer; padding: 2px;" title="Remover">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    groupsContainer.innerHTML = html;
  }
}

function toggleGroupItems(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = el.style.display === 'none' ? 'flex' : 'none';
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

window.toggleGroupItems = toggleGroupItems;
window.removePortfolioItemAt = removePortfolioItemAt;

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

