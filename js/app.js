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

document.addEventListener('DOMContentLoaded', () => {
  initServiceWorker();
  initTheme();
  initMarketStatus();
  renderTickerRibbon();
  initLiveSync();
  initGlobalSearch();
  initAssetModalEvents();

  // Roteamento Modular por Página
  const path = window.location.pathname.toLowerCase();
  
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

// ==========================================================================
// ABA 1: PANORAMA DO MERCADO (HOME / INDEX.HTML)
// ==========================================================================
function initHomePage() {
  renderHomeDashboard();
}

function renderHomeDashboard() {
  // 1. Grade de Índices Macro
  const indicesGrid = document.getElementById('homeIndicesGrid');
  if (indicesGrid && window.MARKET_INDICES) {
    indicesGrid.innerHTML = MARKET_INDICES.map(idx => {
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
  if (highDyList && window.ASSETS_DATA) {
    const topDy = [...ASSETS_DATA]
      .filter(a => !a.yield_trap_alert)
      .sort((a, b) => parseFloat(b.dy.replace('%', '')) - parseFloat(a.dy.replace('%', '')))
      .slice(0, 4);

    highDyList.innerHTML = topDy.map(asset => `
      <div onclick="openAssetModal('${asset.ticker}')" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--bg-surface-elevated); border-radius: var(--radius-md); cursor: pointer; border: 1px solid var(--border-subtle); transition: background 150ms ease;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; border-radius: 6px; background: var(--bg-hover); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; font-family: monospace;">${asset.ticker.substring(0, 4)}</div>
          <div>
            <div style="font-weight: 700; font-size: 13.5px; color: var(--text-primary); font-family: monospace;">${asset.ticker}</div>
            <div style="font-size: 11.5px; color: var(--text-muted);">${asset.name}</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 13.5px; font-weight: 800; font-family: monospace; color: var(--emerald-400);">${asset.dy}</div>
          <div style="font-size: 11px; color: var(--text-muted);">R$ ${asset.price.toFixed(2)}</div>
        </div>
      </div>
    `).join('');
  }

  // 3. Alta Rentabilidade (ROE Consistente)
  const highRoeList = document.getElementById('homeHighRoeList');
  if (highRoeList && window.ASSETS_DATA) {
    const topRoe = [...ASSETS_DATA]
      .filter(a => a.roe && a.type === 'AÇÃO')
      .sort((a, b) => parseFloat(b.roe.replace('%', '')) - parseFloat(a.roe.replace('%', '')))
      .slice(0, 4);

    highRoeList.innerHTML = topRoe.map(asset => `
      <div onclick="openAssetModal('${asset.ticker}')" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--bg-surface-elevated); border-radius: var(--radius-md); cursor: pointer; border: 1px solid var(--border-subtle); transition: background 150ms ease;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 32px; height: 32px; border-radius: 6px; background: var(--bg-hover); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; font-family: monospace;">${asset.ticker.substring(0, 4)}</div>
          <div>
            <div style="font-weight: 700; font-size: 13.5px; color: var(--text-primary); font-family: monospace;">${asset.ticker}</div>
            <div style="font-size: 11.5px; color: var(--text-muted);">${asset.name}</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 13.5px; font-weight: 800; font-family: monospace; color: var(--sky-400);">ROE ${asset.roe}</div>
          <div style="font-size: 11px; color: var(--text-muted);">P/L ${asset.pl_contabil}x</div>
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
  if (!window.ASSETS_DATA) return;

  // Filtragem Inteligente
  const filtered = ASSETS_DATA.filter(asset => {
    // 1. Busca por texto
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = asset.ticker.toLowerCase().includes(q) || 
                    asset.name.toLowerCase().includes(q) || 
                    (asset.sector && asset.sector.toLowerCase().includes(q));
      if (!match) return false;
    }

    // 2. Presets do Screener
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
    countBadge.textContent = `Mostrando ${filtered.length} de ${ASSETS_DATA.length} ativos`;
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
// ABA 4: GESTÃO INTELIGENTE DE CARTEIRA (CARTEIRA.HTML)
// ==========================================================================
function initPortfolioPage() {
  const btnOpenModal = document.getElementById('btnOpenAddAssetModal');
  const addModal = document.getElementById('addAssetModal');
  const addCloseBtn = document.getElementById('addAssetCloseBtn');
  const addForm = document.getElementById('addAssetForm');

  if (btnOpenModal && addModal) {
    btnOpenModal.addEventListener('click', () => {
      addModal.classList.add('active');
      addModal.setAttribute('aria-hidden', 'false');
    });
  }

  if (addCloseBtn && addModal) {
    addCloseBtn.addEventListener('click', () => {
      addModal.classList.remove('active');
      addModal.setAttribute('aria-hidden', 'true');
    });
  }

  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const tickerInput = document.getElementById('addAssetTicker');
      const qtyInput = document.getElementById('addAssetQty');
      const priceInput = document.getElementById('addAssetPrice');

      const ticker = tickerInput.value.trim().toUpperCase();
      const qty = parseInt(qtyInput.value) || 0;
      const precoMedio = parseFloat(priceInput.value) || 0;

      if (!ticker || qty <= 0 || precoMedio <= 0) return;

      // Busca cotação atual nos dados mock ou ao vivo
      const existingAsset = ASSETS_DATA.find(a => a.ticker === ticker);
      const cotacao = existingAsset ? existingAsset.price : precoMedio;
      const type = existingAsset ? existingAsset.type : 'AÇÃO';

      // Atualiza ou insere novo item
      const idx = USER_PORTFOLIO.findIndex(item => item.ticker === ticker);
      if (idx >= 0) {
        // Média ponderada
        const currentQty = USER_PORTFOLIO[idx].qty;
        const currentTotal = currentQty * USER_PORTFOLIO[idx].precoMedio;
        const newTotal = currentTotal + (qty * precoMedio);
        USER_PORTFOLIO[idx].qty = currentQty + qty;
        USER_PORTFOLIO[idx].precoMedio = newTotal / (currentQty + qty);
        USER_PORTFOLIO[idx].cotacao = cotacao;
      } else {
        USER_PORTFOLIO.push({
          ticker,
          type,
          qty,
          precoMedio,
          cotacao
        });
      }

      localStorage.setItem('i10x_portfolio', JSON.stringify(USER_PORTFOLIO));
      addModal.classList.remove('active');
      addForm.reset();
      renderPortfolioPage();
    });
  }

  renderPortfolioPage();
}

function removePortfolioItem(ticker) {
  if (!confirm(`Deseja remover a posição de ${ticker} da carteira?`)) return;
  USER_PORTFOLIO = USER_PORTFOLIO.filter(item => item.ticker !== ticker);
  localStorage.setItem('i10x_portfolio', JSON.stringify(USER_PORTFOLIO));
  renderPortfolioPage();
}

function renderPortfolioPage() {
  const summaryGrid = document.getElementById('portfolioSummaryGrid');
  const tableBody = document.getElementById('portfolioTableBody');
  const countLabel = document.getElementById('portfolioItemsCount');
  const donutContainer = document.getElementById('portfolioDonutContainer');
  const rebalContainer = document.getElementById('portfolioRebalancingContainer');

  if (!summaryGrid || !USER_PORTFOLIO) return;

  // Atualiza cotações com ASSETS_DATA mais recentes
  USER_PORTFOLIO.forEach(item => {
    const live = ASSETS_DATA.find(a => a.ticker === item.ticker);
    if (live) item.cotacao = live.price;
  });

  let totalInvested = 0;
  let totalCurrent = 0;
  let annualIncomeEstimate = 0;
  const classTotals = { 'AÇÃO': 0, 'FII': 0, 'FIAGRO': 0, 'BDR': 0, 'OUTROS': 0 };

  USER_PORTFOLIO.forEach(item => {
    const invested = item.qty * item.precoMedio;
    const current = item.qty * item.cotacao;
    totalInvested += invested;
    totalCurrent += current;

    const assetRef = ASSETS_DATA.find(a => a.ticker === item.ticker);
    const dyDec = assetRef ? parseFloat(assetRef.dy.replace('%', '')) / 100 : 0.08;
    annualIncomeEstimate += current * dyDec;

    const t = item.type || (assetRef ? assetRef.type : 'AÇÃO');
    if (classTotals[t] !== undefined) {
      classTotals[t] += current;
    } else {
      classTotals['OUTROS'] += current;
    }
  });

  const totalLucro = totalCurrent - totalInvested;
  const totalPct = totalInvested > 0 ? ((totalCurrent / totalInvested) - 1) * 100 : 0;
  const monthlyIncomeEstimate = annualIncomeEstimate / 12;
  const yieldOnCost = totalInvested > 0 ? (annualIncomeEstimate / totalInvested) * 100 : 0;

  // 1. Resumo Executivo
  summaryGrid.innerHTML = `
    <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px; box-shadow: var(--shadow-card);">
      <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Patrimônio Atual</div>
      <div style="font-size: 22px; font-weight: 800; font-family: monospace; color: var(--text-primary); margin-top: 4px;">R$ ${totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Atualizado em tempo real</div>
    </div>

    <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px; box-shadow: var(--shadow-card);">
      <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Total Investido (Custo)</div>
      <div style="font-size: 22px; font-weight: 800; font-family: monospace; color: var(--text-secondary); margin-top: 4px;">R$ ${totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Total do seu bolso</div>
    </div>

    <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px; box-shadow: var(--shadow-card);">
      <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Lucro / Prejuízo Líquido</div>
      <div style="font-size: 22px; font-weight: 800; font-family: monospace; color: ${totalLucro >= 0 ? 'var(--emerald-400)' : 'var(--rose-400)'}; margin-top: 4px;">
        ${totalLucro >= 0 ? '+' : ''}R$ ${totalLucro.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div style="font-size: 12px; font-weight: 700; color: ${totalPct >= 0 ? 'var(--emerald-400)' : 'var(--rose-400)'}; margin-top: 4px;">
        ${totalPct >= 0 ? '▲ +' : '▼ '}${totalPct.toFixed(2)}% de Rentabilidade
      </div>
    </div>

    <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px; box-shadow: var(--shadow-card);">
      <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Renda Mensal Estimada</div>
      <div style="font-size: 22px; font-weight: 800; font-family: monospace; color: var(--emerald-400); margin-top: 4px;">R$ ${monthlyIncomeEstimate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês</div>
      <div style="font-size: 12px; color: var(--sky-400); font-weight: 700; margin-top: 4px;">Yield on Cost: ${yieldOnCost.toFixed(2)}% a.a.</div>
    </div>
  `;

  if (countLabel) countLabel.textContent = `${USER_PORTFOLIO.length} ativos custodiados`;

  // 2. Gráfico Donut de Alocação por Classe
  if (donutContainer && window.FinancialCharts) {
    const colors = {
      'AÇÃO': '#10b981',
      'FII': '#38bdf8',
      'FIAGRO': '#f59e0b',
      'BDR': '#a855f7',
      'OUTROS': '#64748b'
    };

    const slices = Object.entries(classTotals)
      .filter(([_, val]) => val > 0)
      .map(([label, value]) => ({
        label,
        value,
        color: colors[label] || '#10b981'
      }));

    FinancialCharts.renderDonutChart('portfolioDonutContainer', slices);
  }

  // 3. Balanceamento e Riscos
  if (rebalContainer) {
    rebalContainer.innerHTML = Object.entries(classTotals).map(([label, val]) => {
      const pct = totalCurrent > 0 ? (val / totalCurrent) * 100 : 0;
      return `
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
            <span style="font-weight: 600; color: var(--text-secondary);">${label}</span>
            <span style="font-family: monospace; font-weight: 700; color: var(--text-primary);">R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${pct.toFixed(1)}%)</span>
          </div>
          <div style="width: 100%; height: 6px; background: var(--bg-hover); border-radius: 4px; overflow: hidden;">
            <div style="width: ${pct}%; height: 100%; background: var(--emerald-500); border-radius: 4px;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 4. Tabela Analítica de Posições
  if (tableBody) {
    tableBody.innerHTML = USER_PORTFOLIO.map(item => {
      const invested = item.qty * item.precoMedio;
      const current = item.qty * item.cotacao;
      const lucro = current - invested;
      const lucroPct = invested > 0 ? ((current / invested) - 1) * 100 : 0;
      const isUp = lucro >= 0;
      const pesoPct = totalCurrent > 0 ? (current / totalCurrent) * 100 : 0;

      return `
        <tr style="height: 52px;">
          <td>
            <div style="font-weight: 800; font-family: monospace; color: var(--text-primary); cursor: pointer;" onclick="openAssetModal('${item.ticker}')">${item.ticker}</div>
          </td>
          <td><span class="asset-type-badge">${item.type || 'AÇÃO'}</span></td>
          <td class="num-col">${item.qty}</td>
          <td class="num-col">R$ ${item.precoMedio.toFixed(2)}</td>
          <td class="num-col" style="font-weight: 700;">R$ ${item.cotacao.toFixed(2)}</td>
          <td class="num-col">R$ ${invested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td class="num-col" style="font-weight: 700;">R$ ${current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td class="num-col" style="font-weight: 700; color: ${isUp ? 'var(--emerald-400)' : 'var(--rose-400)'};">
            ${isUp ? '+' : ''}R$ ${lucro.toFixed(2)} (${lucroPct.toFixed(1)}%)
          </td>
          <td class="num-col" style="font-weight: 700;">${pesoPct.toFixed(1)}%</td>
          <td style="text-align: center;">
            <button onclick="removePortfolioItem('${item.ticker}')" style="background: none; border: none; color: var(--rose-400); cursor: pointer; padding: 4px 8px; border-radius: 4px;" title="Excluir Ativo">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
}

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
    valuationCards = `
      <div class="valuation-box-grid">
        <div class="val-card">
          <div class="val-card-title">Valor Patrimonial da Cota (VP)</div>
          <div class="val-card-price">R$ ${asset.vp_cota.toFixed(2)}</div>
          <div class="val-card-note">Valor real dos ativos físicos/títulos divididos pelo número de cotas.</div>
        </div>
        <div class="val-card">
          <div class="val-card-title">P/VP Real</div>
          <div class="val-card-price ${asset.pvp < 1 ? 'highlight' : ''}">${asset.pvp}</div>
          <div class="val-card-note">${asset.pvp < 1 ? 'Negociando com desconto sobre o patrimônio físico.' : 'Negociando com ágio sobre o patrimônio.'}</div>
        </div>
        <div class="val-card">
          <div class="val-card-title">Rendimento Médio Mensal</div>
          <div class="val-card-price">${asset.rendimento_medio_mes}</div>
          <div class="val-card-note">${asset.yieldTrapReason || 'Rendimento consistente com proventos isentos de IR.'}</div>
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
window.addCompareTicker = addCompareTicker;
window.removeCompareTicker = removeCompareTicker;
window.removePortfolioItem = removePortfolioItem;
