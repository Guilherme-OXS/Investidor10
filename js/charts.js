// ==========================================================================
// INVESTIDOR 10X - MOTOR DE GRÁFICOS FINANCEIROS NATIVOS (PARTE 4)
// Renderização SVG vetorial responsiva e ultra-rápida (Zero dependências externas)
// ==========================================================================

const FinancialCharts = {
  /**
   * Renderiza um Gráfico de Linha Interativo com Gradiente e Tooltip
   * @param {string} containerId ID do elemento container
   * @param {Array<{date: string, value: number}>} points Dados históricos
   * @param {object} options Opções de cor e formatação
   */
  renderLineChart(containerId, points, options = {}) {
    const container = document.getElementById(containerId);
    if (!container || !points || points.length === 0) return;

    const strokeColor = options.strokeColor || '#10b981';
    const fillColor = options.fillColor || 'rgba(16, 185, 129, 0.15)';
    const height = options.height || 220;

    const values = points.map(p => p.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = (maxVal - minVal) || 1;

    // Viewbox virtual 800 x height
    const vbWidth = 800;
    const paddingX = 20;
    const paddingTop = 20;
    const paddingBottom = 30;
    const chartHeight = height - paddingTop - paddingBottom;
    const chartWidth = vbWidth - (paddingX * 2);

    const stepX = chartWidth / (points.length - 1);

    const coords = points.map((p, idx) => {
      const x = paddingX + (idx * stepX);
      const normY = (p.value - minVal) / range;
      const y = paddingTop + chartHeight - (normY * chartHeight);
      return { x, y, ...p };
    });

    // Cria a curva SVG com suavização cúbica
    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cx = (p0.x + p1.x) / 2;
      pathD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`;

    const gradId = `lineGrad_${Math.random().toString(36).substring(2, 8)}`;

    const svg = `
      <svg viewBox="0 0 ${vbWidth} ${height}" style="width: 100%; height: auto; display: block; overflow: visible;">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.0"/>
          </linearGradient>
        </defs>

        <!-- Linhas de grade sutis -->
        <line x1="${paddingX}" y1="${paddingTop}" x2="${vbWidth - paddingX}" y2="${paddingTop}" stroke="var(--border-subtle)" stroke-dasharray="4 4" stroke-width="1"/>
        <line x1="${paddingX}" y1="${paddingTop + (chartHeight / 2)}" x2="${vbWidth - paddingX}" y2="${paddingTop + (chartHeight / 2)}" stroke="var(--border-subtle)" stroke-dasharray="4 4" stroke-width="1"/>
        <line x1="${paddingX}" y1="${height - paddingBottom}" x2="${vbWidth - paddingX}" y2="${height - paddingBottom}" stroke="var(--border-subtle)" stroke-width="1"/>

        <!-- Área sombreada -->
        <path d="${areaD}" fill="url(#${gradId})"/>

        <!-- Linha da cotação -->
        <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

        <!-- Rótulos de extremos -->
        <text x="${paddingX}" y="${height - 10}" font-size="11" fill="var(--text-muted)" font-family="monospace">${points[0].date}</text>
        <text x="${vbWidth - paddingX}" y="${height - 10}" text-anchor="end" font-size="11" fill="var(--text-muted)" font-family="monospace">${points[points.length - 1].date}</text>
        <text x="${vbWidth - paddingX}" y="${paddingTop - 6}" text-anchor="end" font-size="11" font-weight="700" fill="${strokeColor}" font-family="monospace">R$ ${maxVal.toFixed(2)}</text>
        <text x="${vbWidth - paddingX}" y="${height - paddingBottom - 4}" text-anchor="end" font-size="11" fill="var(--text-muted)" font-family="monospace">R$ ${minVal.toFixed(2)}</text>
      </svg>
    `;

    container.innerHTML = svg;
  },

  /**
   * Renderiza um Gráfico de Barras para Evolução de Proventos Anuais
   * @param {string} containerId ID do elemento container
   * @param {Array<{year: string, total: number}>} history Histórico de dividendos
   */
  renderDividendBars(containerId, history) {
    const container = document.getElementById(containerId);
    if (!container || !history || history.length === 0) return;

    const height = 180;
    const vbWidth = 600;
    const paddingX = 30;
    const paddingTop = 25;
    const paddingBottom = 30;
    const chartHeight = height - paddingTop - paddingBottom;
    const chartWidth = vbWidth - (paddingX * 2);

    const maxVal = Math.max(...history.map(h => h.total)) * 1.15;
    const barWidth = Math.min(48, chartWidth / history.length * 0.55);
    const stepX = chartWidth / history.length;

    const bars = history.map((item, idx) => {
      const x = paddingX + (idx * stepX) + (stepX - barWidth) / 2;
      const barH = (item.total / maxVal) * chartHeight;
      const y = height - paddingBottom - barH;

      return `
        <g>
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="4" fill="var(--emerald-400)" opacity="0.85">
            <title>${item.year}: R$ ${item.total.toFixed(2)}</title>
          </rect>
          <text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text-primary)" font-family="monospace">R$ ${item.total.toFixed(2)}</text>
          <text x="${x + barWidth / 2}" y="${height - 10}" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-weight="600">${item.year}</text>
        </g>
      `;
    }).join('');

    const svg = `
      <svg viewBox="0 0 ${vbWidth} ${height}" style="width: 100%; height: auto; display: block;">
        <line x1="${paddingX}" y1="${height - paddingBottom}" x2="${vbWidth - paddingX}" y2="${height - paddingBottom}" stroke="var(--border-subtle)" stroke-width="1"/>
        ${bars}
      </svg>
    `;

    container.innerHTML = svg;
  },

  /**
   * Renderiza um Gráfico de Rosca (Donut Chart) Idêntico ao Investidor 10
   * @param {string} containerId ID do elemento
   * @param {Array<{label: string, value: number, color: string}>} slices Fatias
   */
  renderDonutChart(containerId, slices) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!slices || slices.length === 0 || slices.every(s => s.value <= 0)) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; color: var(--text-muted); text-align: center;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.3; margin-bottom: 12px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a10 10 0 0 1 10 10"></path></svg>
          <div style="font-size: 13.5px; font-weight: 600; color: var(--text-secondary);">Sem ativos na carteira</div>
          <div style="font-size: 11.5px; margin-top: 4px;">Adicione ativos para visualizar a divisão percentual</div>
        </div>
      `;
      return;
    }

    const total = slices.reduce((acc, s) => acc + s.value, 0);
    const size = 190;
    const strokeWidth = 36;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    const paths = slices.map(s => {
      if (s.value <= 0) return '';
      const slicePct = s.value / total;
      const strokeDash = slicePct * circumference;
      const rotation = (accumulatedAngle / total) * 360 - 90;
      accumulatedAngle += s.value;

      return `
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none"
          stroke="${s.color}" stroke-width="${strokeWidth}"
          stroke-dasharray="${strokeDash} ${circumference}"
          transform="rotate(${rotation} ${size / 2} ${size / 2})"
          style="transition: stroke-width 150ms ease; cursor: pointer;">
          <title>${s.label}: ${((s.value / total) * 100).toFixed(2).replace('.', ',')}% (R$ ${s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</title>
        </circle>
      `;
    }).join('');

    const legend = slices.map(s => `
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; padding: 6px 0; border-bottom: 1px dashed var(--border-subtle);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="width: 10px; height: 10px; border-radius: 2px; background: ${s.color}; display: inline-block;"></span>
          <span style="color: var(--text-secondary); font-weight: 600;">${s.label}</span>
        </div>
        <span style="font-family: monospace; font-weight: 700; color: var(--text-primary); font-size: 13px;">${((s.value / total) * 100).toFixed(2).replace('.', ',')}%</span>
      </div>
    `).join('');

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-around; gap: 24px; flex-wrap: wrap; padding: 12px 0;">
        <div style="position: relative; width: ${size}px; height: ${size}px; flex-shrink: 0;">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            ${paths}
          </svg>
        </div>
        <div style="flex: 1; min-width: 170px;">
          ${legend}
        </div>
      </div>
    `;
  },

  /**
   * Renderiza Gráfico de Evolução Patrimonial Empilhado Idêntico ao Investidor 10
   * @param {string} containerId ID do container
   * @param {Array<{label: string, invested: number, profit: number}>} data
   */
  renderStackedEvolutionBars(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!data || data.length === 0 || data.every(d => d.invested <= 0)) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; color: var(--text-muted); text-align: center;">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.3; margin-bottom: 10px;"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          <div style="font-size: 13.5px; font-weight: 600; color: var(--text-secondary);">Sem histórico de evolução patrimonial</div>
          <div style="font-size: 11.5px; margin-top: 4px;">Faça lançamentos na sua carteira para gerar os dados mensais</div>
        </div>
      `;
      return;
    }

    const height = 260;
    const vbWidth = 640;
    const paddingLeft = 65;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 35;
    const chartHeight = height - paddingTop - paddingBottom;
    const chartWidth = vbWidth - paddingLeft - paddingRight;

    // Calcula valor máximo arredondado em centenas (estilo Investidor 10: R$ 100, R$ 200, ... R$ 700)
    const totals = data.map(d => (d.invested || 0) + Math.max(0, d.profit || 0));
    const highest = Math.max(...totals, 100);
    const stepInterval = highest > 5000 ? 1000 : (highest > 1000 ? 250 : 100);
    const maxVal = Math.ceil(highest / stepInterval) * stepInterval + stepInterval;

    // Linhas horizontais de grade com intervalos exatos
    const numLines = Math.floor(maxVal / stepInterval);
    let gridLinesSvg = '';
    for (let i = 0; i <= numLines; i++) {
      const val = i * stepInterval;
      const y = height - paddingBottom - (val / maxVal) * chartHeight;
      gridLinesSvg += `
        <line x1="${paddingLeft}" y1="${y}" x2="${vbWidth - paddingRight}" y2="${y}" stroke="var(--border-subtle)" stroke-dasharray="3 3" stroke-width="1" opacity="0.6"/>
        <text x="${paddingLeft - 10}" y="${y + 3.5}" text-anchor="end" font-size="10.5" fill="var(--text-muted)" font-family="monospace">R$ ${val}</text>
      `;
    }

    // Colunas de barras
    const stepX = chartWidth / data.length;
    const barWidth = Math.min(84, Math.max(48, stepX * 0.65));

    const barsSvg = data.map((item, idx) => {
      const x = paddingLeft + (idx * stepX) + (stepX - barWidth) / 2;
      const total = (item.invested || 0) + (item.profit || 0);

      const investedH = ((item.invested || 0) / maxVal) * chartHeight;
      const profitH = (Math.max(0, item.profit || 0) / maxVal) * chartHeight;

      const yInvested = height - paddingBottom - investedH;
      const yProfit = yInvested - profitH;

      return `
        <g class="chart-bar-group" style="cursor: pointer;">
          <!-- Barra Base: Valor Aplicado (Verde Médio Investidor 10 #10b981) -->
          <rect x="${x}" y="${yInvested}" width="${barWidth}" height="${investedH}" fill="#10b981" rx="1">
            <title>Data: ${item.label}&#10;Valor Aplicado: R$ ${item.invested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}&#10;Ganho de Capital: R$ ${item.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}&#10;Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</title>
          </rect>

          <!-- Barra Topo: Ganho de Capital (Verde Claro Investidor 10 #34d399) -->
          ${profitH > 0 ? `
            <rect x="${x}" y="${yProfit}" width="${barWidth}" height="${profitH}" fill="#34d399" rx="1">
              <title>Ganho de Capital: +R$ ${item.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</title>
            </rect>
          ` : ''}

          <!-- Rótulo do Mês no Eixo X -->
          <text x="${x + barWidth / 2}" y="${height - 12}" text-anchor="middle" font-size="11" fill="var(--text-muted)" font-weight="600" font-family="monospace">
            ${item.label}
          </text>
        </g>
      `;
    }).join('');

    container.innerHTML = `
      <svg viewBox="0 0 ${vbWidth} ${height}" style="width: 100%; height: auto; display: block; overflow: visible;">
        ${gridLinesSvg}
        ${barsSvg}
      </svg>
    `;
  }
};

window.FinancialCharts = FinancialCharts;

