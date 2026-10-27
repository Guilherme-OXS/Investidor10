// ==========================================================================
// INVESTIDOR 10X - APLICAÇÃO WEB PWA & CONTROLADOR DE INTERFACE (PARTE 2)
// ==========================================================================

let deferredPrompt = null;
let currentFilter = 'all';
let searchQuery = '';
let selectedCompareTickers = ['ITUB4', 'BBAS3']; // Comparação inicial padrão
let USER_PORTFOLIO = JSON.parse(localStorage.getItem('i10x_portfolio')) || INITIAL_USER_PORTFOLIO;

document.addEventListener('DOMContentLoaded', () => {
  initServiceWorker();
  initTheme();
  renderTickerRibbon();
  renderAssets();
  renderComparator();
  renderPortfolio();
  initSimulator();
  initEventListeners();
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

  // Captura o evento de instalação para celular e desktop
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) {
      installBtn.style.display = 'inline-flex';
    }
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

// 2. ALTERNADOR DE TEMA (DARK / LIGHT COM PERSISTÊNCIA)
function initTheme() {
  const savedTheme = localStorage.getItem('i10x_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('i10x_theme', nextTheme);
    });
  }
}

// 3. RENDERIZAÇÃO DA BARRA DE ÍNDICES AO VIVO (TICKER TAPE)
function renderTickerRibbon() {
  const ribbon = document.getElementById('tickerRibbon');
  if (!ribbon || !MARKET_INDICES) return;

  ribbon.innerHTML = MARKET_INDICES.map(idx => {
    let badgeClass = 'badge-neutral';
    if (idx.positive) badgeClass = 'badge-up';
    if (idx.positive === false) badgeClass = 'badge-down';

    return `
      <div class="ticker-item">
        <strong>${idx.name}:</strong>
        <span class="val">${idx.value}</span>
        <span class="${badgeClass}">${idx.change}</span>
      </div>
    `;
  }).join('');
}

// 4. RENDERIZAÇÃO DOS ATIVOS COM FILTRO INTELIGENTE
function renderAssets() {
  const grid = document.getElementById('assetsGrid');
  const countBadge = document.getElementById('assetCountBadge');
  if (!grid || !ASSETS_DATA) return;

  // Filtragem inteligente
  const filtered = ASSETS_DATA.filter(asset => {
    // Filtro de texto da busca
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = asset.ticker.toLowerCase().includes(q) || 
                    asset.name.toLowerCase().includes(q) || 
                    (asset.sector && asset.sector.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Filtros por botões
    if (currentFilter === 'AÇÃO') return asset.type === 'AÇÃO';
    if (currentFilter === 'FII') return asset.type === 'FII';
    if (currentFilter === 'FIAGRO') return asset.type === 'FIAGRO';
    if (currentFilter === 'BDR') return asset.type === 'BDR';
    if (currentFilter === 'high-dy') {
      const dyNum = parseFloat(asset.dy.replace('%', ''));
      return dyNum >= 8.0;
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

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-muted);">
        <p style="font-size: 16px; font-weight: 600;">Nenhum ativo encontrado com esses filtros.</p>
        <p style="font-size: 13px; margin-top: 6px;">Tente pesquisar por outro ticker ou limpar os filtros.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(asset => {
    const isUp = asset.changeDay.startsWith('+');
    const changeClass = isUp ? 'badge-up' : 'badge-down';

    // Banner de Yield Trap (Correção crucial do Investidor 10)
    let yieldTrapHtml = '';
    if (asset.yield_trap_alert) {
      yieldTrapHtml = `
        <div class="alert-yield-trap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span><strong>Alerta Yield Trap:</strong> Dividend Yield inflado por desvalorização patrimonial e calote.</span>
        </div>
      `;
    }

    // Banner de Impacto Não-Recorrente
    let nonRecurrentHtml = '';
    if (asset.hasNonRecurrentImpact) {
      nonRecurrentHtml = `
        <div class="alert-non-recurrent">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          <span>P/L Ajustado de <strong>${asset.pl_ajustado}x</strong> (expurga eventos pontuais).</span>
        </div>
      `;
    }

    // Linha de Métricas inteligente por setor
    let metricsHtml = '';
    if (asset.isFinancialSector) {
      // Bancos: Basileia, P/VP, ROE, Margem Financeira (SEM EBITDA!)
      metricsHtml = `
        <div class="metrics-row">
          <div class="metric-col">
            <span class="metric-label">P/L</span>
            <span class="metric-val">${asset.pl_contabil}x</span>
          </div>
          <div class="metric-col">
            <span class="metric-label">P/VP</span>
            <span class="metric-val ${asset.pvp < 1 ? 'highlight' : ''}">${asset.pvp}</span>
          </div>
          <div class="metric-col">
            <span class="metric-label">DY (12M)</span>
            <span class="metric-val highlight">${asset.dy}</span>
          </div>
          <div class="metric-col">
            <span class="metric-label">Basileia</span>
            <span class="metric-val highlight">${asset.basileia}</span>
          </div>
        </div>
      `;
    } else if (asset.type === 'FII' || asset.type === 'FIAGRO') {
      // FIIs e Fiagros: DY, P/VP, Vacância, VP Cota
      metricsHtml = `
        <div class="metrics-row">
          <div class="metric-col">
            <span class="metric-label">P/VP</span>
            <span class="metric-val ${asset.pvp < 1 ? 'highlight' : ''}">${asset.pvp}</span>
          </div>
          <div class="metric-col">
            <span class="metric-label">DY (12M)</span>
            <span class="metric-val ${asset.yield_trap_alert ? 'warning' : 'highlight'}">${asset.dy}</span>
          </div>
          <div class="metric-col">
            <span class="metric-label">VP Cota</span>
            <span class="metric-val">R$ ${asset.vp_cota.toFixed(2)}</span>
          </div>
          <div class="metric-col">
            <span class="metric-label">${asset.type === 'FIAGRO' ? 'Proventos' : 'Vacância'}</span>
            <span class="metric-val">${asset.vacancia_fisica || 'Mensal'}</span>
          </div>
        </div>
      `;
    } else {
      // Empresas Tradicionais e BDRs: P/L, P/VP, DY, ROE
      metricsHtml = `
        <div class="metrics-row">
          <div class="metric-col">
            <span class="metric-label">P/L</span>
            <span class="metric-val">${asset.pl_contabil}x</span>
          </div>
          <div class="metric-col">
            <span class="metric-label">P/VP</span>
            <span class="metric-val ${asset.pvp < 1 ? 'highlight' : ''}">${asset.pvp}</span>
          </div>
          <div class="metric-col">
            <span class="metric-label">DY (12M)</span>
            <span class="metric-val highlight">${asset.dy}</span>
          </div>
          <div class="metric-col">
            <span class="metric-label">ROE</span>
            <span class="metric-val highlight">${asset.roe}</span>
          </div>
        </div>
      `;
    }

    const scoreClass = asset.score >= 8.5 ? 'high' : (asset.score < 6 ? 'risk' : '');
    const displaySector = asset.sector || asset.fiiType || 'Renda Variável';

    return `
      <article class="asset-card" onclick="openAssetModal('${asset.ticker}')">
        <div>
          <div class="card-header">
            <div class="ticker-info">
              <div class="ticker-icon">${asset.ticker.substring(0, 4)}</div>
              <div class="ticker-names">
                <div class="ticker-code">
                  ${asset.ticker}
                  <span class="asset-type-badge">${asset.type}</span>
                </div>
                <div class="company-name" title="${asset.name}">${asset.name}</div>
              </div>
            </div>
            <div class="price-box">
              <div class="current-price">R$ ${asset.price.toFixed(2)}</div>
              <span class="${changeClass}">${asset.changeDay}</span>
            </div>
          </div>

          ${yieldTrapHtml}
          ${nonRecurrentHtml}
          ${metricsHtml}
        </div>

        <div class="card-footer">
          <div style="font-size: 11.5px; color: var(--text-muted);">${displaySector}</div>
          <div class="score-badge ${scoreClass}">
            <span>Score ${asset.score}</span>
            <small>(${asset.scoreStatus})</small>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// 5. MODAL DE RAIO-X COMPLETO DO ATIVO COM VALUATION DINÂMICO INTERATIVO
function openAssetModal(ticker) {
  const asset = ASSETS_DATA.find(a => a.ticker === ticker);
  if (!asset) return;

  const modal = document.getElementById('assetModal');
  const icon = document.getElementById('modalTickerIcon');
  const title = document.getElementById('modalTickerTitle');
  const badge = document.getElementById('modalTypeBadge');
  const company = document.getElementById('modalCompanyName');
  const body = document.getElementById('modalBody');

  icon.textContent = asset.ticker.substring(0, 4);
  title.textContent = asset.ticker;
  badge.textContent = asset.type;
  company.textContent = `${asset.name} • ${asset.sector || asset.fiiType || 'Ativo B3'}`;

  // Cálculo de Margem de Segurança Inicial (Bazin 6%)
  const dyDecimal = parseFloat(asset.dy.replace('%', '')) / 100;
  const annualDividend = asset.price * dyDecimal;
  const initialBazin = annualDividend / 0.06;
  const safetyMargin = ValuationEngine.calculateMarginOfSafety(asset.price, initialBazin);

  // Graham Check
  const grahamResult = ValuationEngine.calculateGraham(asset.lpa, asset.vpa, asset);

  let valuationCards = '';
  if (asset.type === 'AÇÃO' || asset.type === 'BDR') {
    valuationCards = `
      <div class="valuation-box-grid">
        <div class="val-card">
          <div class="val-card-title">Preço Teto Décio Bazin</div>
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

  // Checklist do Investidor 10 Inteligente (sem penalidades descabidas)
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

  body.innerHTML = `
    <!-- Valuation -->
    <div>
      <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--text-primary);">Modelos de Valuation & Preço Justo</h3>
      ${valuationCards}
    </div>

    <!-- Checklist Inteligente -->
    <div class="checklist-container">
      <div class="checklist-title">Checklist de Saúde Financeira (Sem vieses automáticos)</div>
      ${checklistItems}
    </div>

    <!-- Histórico de Proventos -->
    <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px;">
      <h4 style="font-size: 13px; font-weight: 700; margin-bottom: 8px;">Últimos Proventos Anunciados (Dividendos / JCP)</h4>
      ${proventosItems || '<p style="font-size: 12px; color: var(--text-muted);">Nenhum anúncio recente.</p>'}
    </div>
  `;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

// Atualização dinâmica do slider de Bazin
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

// 6. RENDERIZAÇÃO DO COMPARADOR LADO A LADO
function renderComparator() {
  const container = document.getElementById('compareTableContainer');
  const tagsContainer = document.getElementById('compareSelectedTags');
  const addSelect = document.getElementById('compareAddSelect');
  if (!container || !tagsContainer || !addSelect) return;

  // Renderiza tags de ativos selecionados
  tagsContainer.innerHTML = selectedCompareTickers.map(ticker => `
    <div class="compare-tag">
      <span>${ticker}</span>
      ${selectedCompareTickers.length > 1 ? `<button class="compare-tag-remove" onclick="removeCompareTicker('${ticker}')" title="Remover">&times;</button>` : ''}
    </div>
  `).join('');

  // Atualiza opções do dropdown (apenas ativos não selecionados)
  const availableAssets = ASSETS_DATA.filter(a => !selectedCompareTickers.includes(a.ticker));
  addSelect.innerHTML = `<option value="">+ Adicionar ativo para comparar...</option>` +
    availableAssets.map(a => `<option value="${a.ticker}">${a.ticker} - ${a.name}</option>`).join('');

  // Gera dados comparativos
  const result = ValuationEngine.compareAssets(selectedCompareTickers, ASSETS_DATA);
  if (!result) return;

  const { assets, comparisonTable } = result;

  // Cabeçalho da tabela
  const headerHtml = `
    <thead>
      <tr>
        <th style="width: 200px;">Indicador</th>
        ${assets.map(a => `
          <th style="text-align: center;">
            <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); font-family: monospace;">${a.ticker}</div>
            <div style="font-size: 11px; color: var(--text-muted); font-weight: normal; text-transform: none;">${a.type}</div>
          </th>
        `).join('')}
      </tr>
    </thead>
  `;

  // Linhas da tabela
  const rowsHtml = comparisonTable.map(row => `
    <tr>
      <td class="metric-title-cell">${row.metric}</td>
      ${row.values.map((val, idx) => {
        const isWinner = row.bestIndex === idx;
        return `
          <td style="text-align: center; font-family: 'JetBrains Mono', monospace;" class="${isWinner ? 'winner-cell' : ''}">
            ${val.formatted}
            ${isWinner ? '<span class="winner-crown" title="Melhor índice">👑</span>' : ''}
          </td>
        `;
      }).join('')}
    </tr>
  `).join('');

  container.innerHTML = `
    <table class="compare-table">
      ${headerHtml}
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `;
}

function addCompareTicker(ticker) {
  if (!ticker || selectedCompareTickers.includes(ticker)) return;
  if (selectedCompareTickers.length >= 4) {
    alert('Você pode comparar até 4 ativos ao mesmo tempo.');
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

// 7. RENDERIZAÇÃO DA MINHA CARTEIRA
function renderPortfolio() {
  const container = document.getElementById('portfolioContainer');
  if (!container || !USER_PORTFOLIO) return;

  let totalInvested = 0;
  let totalCurrent = 0;

  const rows = USER_PORTFOLIO.map(item => {
    const invested = item.qty * item.precoMedio;
    const current = item.qty * item.cotacao;
    const lucro = current - invested;
    const lucroPct = ((current / invested) - 1) * 100;
    const isUp = lucro >= 0;

    totalInvested += invested;
    totalCurrent += current;

    return `
      <tr style="border-bottom: 1px solid var(--border-subtle); height: 48px;">
        <td style="font-weight: 700; color: var(--text-primary); font-family: monospace;">${item.ticker}</td>
        <td style="font-family: monospace;">${item.qty}</td>
        <td style="font-family: monospace;">R$ ${item.precoMedio.toFixed(2)}</td>
        <td style="font-family: monospace; font-weight: 600;">R$ ${item.cotacao.toFixed(2)}</td>
        <td style="font-family: monospace; font-weight: 700; color: ${isUp ? 'var(--emerald-400)' : 'var(--rose-400)'};">
          ${isUp ? '+' : ''}R$ ${lucro.toFixed(2)} (${lucroPct.toFixed(1)}%)
        </td>
      </tr>
    `;
  }).join('');

  const totalLucro = totalCurrent - totalInvested;
  const totalPct = ((totalCurrent / totalInvested) - 1) * 100;

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 20px;">
      <div style="background: var(--bg-surface-elevated); padding: 14px; border-radius: var(--radius-md);">
        <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Patrimônio Atual</div>
        <div style="font-size: 20px; font-weight: 800; font-family: monospace; color: var(--text-primary); margin-top: 4px;">R$ ${totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
      </div>
      <div style="background: var(--bg-surface-elevated); padding: 14px; border-radius: var(--radius-md);">
        <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Total Aplicado</div>
        <div style="font-size: 20px; font-weight: 800; font-family: monospace; color: var(--text-secondary); margin-top: 4px;">R$ ${totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
      </div>
      <div style="background: var(--bg-surface-elevated); padding: 14px; border-radius: var(--radius-md);">
        <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Lucro / Prejuízo</div>
        <div style="font-size: 20px; font-weight: 800; font-family: monospace; color: ${totalLucro >= 0 ? 'var(--emerald-400)' : 'var(--rose-400)'}; margin-top: 4px;">
          ${totalLucro >= 0 ? '+' : ''}R$ ${totalLucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${totalPct.toFixed(1)}%)
        </div>
      </div>
    </div>

    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 11px; text-transform: uppercase;">
            <th style="padding-bottom: 8px;">Ativo</th>
            <th style="padding-bottom: 8px;">Qtd</th>
            <th style="padding-bottom: 8px;">Preço Médio</th>
            <th style="padding-bottom: 8px;">Cotação Atual</th>
            <th style="padding-bottom: 8px;">Rentabilidade</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

// 8. SIMULADOR DE JUROS COMPOSTOS & PROVENTOS REINVESTIDOS
function initSimulator() {
  const initialInput = document.getElementById('simInitial');
  const monthlyInput = document.getElementById('simMonthly');
  const rateInput = document.getElementById('simRate');
  const yearsInput = document.getElementById('simYears');

  function calculate() {
    const P = parseFloat(initialInput.value) || 0;
    const PMT = parseFloat(monthlyInput.value) || 0;
    const annualRate = (parseFloat(rateInput.value) || 0) / 100;
    const years = parseInt(yearsInput.value) || 1;

    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
    const months = years * 12;

    let total = P;
    for (let i = 0; i < months; i++) {
      total = (total + PMT) * (1 + monthlyRate);
    }

    const totalInvested = P + (PMT * months);
    const monthlyIncome = total * 0.008;

    document.getElementById('simResultTotal').textContent = `R$ ${total.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`;
    document.getElementById('simResultInvested').textContent = `R$ ${totalInvested.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`;
    document.getElementById('simResultIncome').textContent = `R$ ${monthlyIncome.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`;
  }

  [initialInput, monthlyInput, rateInput, yearsInput].forEach(inp => {
    if (inp) inp.addEventListener('input', calculate);
  });

  calculate();
}

// 9. EVENT LISTENERS GERAIS
function initEventListeners() {
  // Pílulas de filtro
  const pills = document.querySelectorAll('.pill-item');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.getAttribute('data-filter');
      renderAssets();
    });
  });

  // Busca global
  const searchInput = document.getElementById('globalSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderAssets();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  // Listener para adicionar ativo no comparador
  const compareAddSelect = document.getElementById('compareAddSelect');
  if (compareAddSelect) {
    compareAddSelect.addEventListener('change', (e) => {
      const selected = e.target.value;
      if (selected) {
        addCompareTicker(selected);
        e.target.value = '';
      }
    });
  }

  // Fechamento de modal
  const modal = document.getElementById('assetModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeAssetModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAssetModal();
    });
  }

  // Bottom Navigation no celular
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
  bottomNavItems.forEach(item => {
    item.addEventListener('click', () => {
      bottomNavItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}
