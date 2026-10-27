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
   * Renderiza um Gráfico de Rosca (Donut Chart) para Alocação da Carteira
   * @param {string} containerId ID do elemento
   * @param {Array<{label: string, value: number, color: string}>} slices Fatias
   */
  renderDonutChart(containerId, slices) {
    const container = document.getElementById(containerId);
    if (!container || !slices || slices.length === 0) return;

    const total = slices.reduce((acc, s) => acc + s.value, 0);
    if (total <= 0) return;

    const size = 200;
    const strokeWidth = 28;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    const paths = slices.map(s => {
      const slicePct = s.value / total;
      const strokeDash = slicePct * circumference;
      const strokeDashoffset = circumference - strokeDash;
      const rotation = (accumulatedAngle / total) * 360 - 90;
      accumulatedAngle += s.value;

      return `
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none"
          stroke="${s.color}" stroke-width="${strokeWidth}"
          stroke-dasharray="${strokeDash} ${circumference}"
          transform="rotate(${rotation} ${size / 2} ${size / 2})"
          stroke-linecap="round">
          <title>${s.label}: ${((s.value / total) * 100).toFixed(1)}%</title>
        </circle>
      `;
    }).join('');

    const legend = slices.map(s => `
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="width: 10px; height: 10px; border-radius: 50%; background: ${s.color};"></span>
          <span style="color: var(--text-secondary); font-weight: 500;">${s.label}</span>
        </div>
        <span style="font-family: monospace; font-weight: 700; color: var(--text-primary);">${((s.value / total) * 100).toFixed(1)}%</span>
      </div>
    `).join('');

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 24px; flex-wrap: wrap;">
        <div style="position: relative; width: ${size}px; height: ${size}px;">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            ${paths}
          </svg>
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
            <span style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Alocação</span>
            <span style="font-size: 16px; font-weight: 800; font-family: monospace; color: var(--text-primary);">Total</span>
          </div>
        </div>
        <div style="flex: 1; min-width: 180px;">
          ${legend}
        </div>
      </div>
    `;
  }
};

window.FinancialCharts = FinancialCharts;
