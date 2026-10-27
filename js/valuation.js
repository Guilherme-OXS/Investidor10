// ==========================================================================
// INVESTIDOR 10X - MOTOR DE VALUATION & CÁLCULOS FINANCEIROS AVANÇADOS
// Implementa Bazin, Graham Adaptado, Margem de Segurança e Comparador Lado a Lado
// ==========================================================================

const ValuationEngine = {
  /**
   * Cálculo do Preço Teto de Décio Bazin
   * @param {number} dividend12m Proventos pagos por ação/cota nos últimos 12 meses
   * @param {number} requiredYield Taxa mínima exigida (padrão 0.06 = 6% a.a.)
   * @returns {number} Preço Teto em Reais
   */
  calculateBazin(dividend12m, requiredYield = 0.06) {
    if (!dividend12m || dividend12m <= 0 || requiredYield <= 0) return 0;
    return dividend12m / requiredYield;
  },

  /**
   * Cálculo do Preço Justo de Benjamin Graham com Travas de Elegibilidade
   * @param {number} lpa Lucro por Ação
   * @param {number} vpa Valor Patrimonial por Ação
   * @param {object} asset Objeto do ativo para checagem de setor
   * @returns {object} { price: number, isApplicable: boolean, reason: string }
   */
  calculateGraham(lpa, vpa, asset = {}) {
    // Graham exige LPA e VPA positivos
    if (!lpa || !vpa || lpa <= 0 || vpa <= 0) {
      return {
        price: 0,
        isApplicable: false,
        reason: 'Graham não se aplica: a empresa apresenta prejuízo recente (LPA negativo) ou patrimônio líquido negativo.'
      };
    }

    // Setores onde Graham falha (Bancos, FIIs, Tech/Asset Light, Concessões altamente alavancadas)
    if (asset.type === 'FII') {
      return {
        price: 0,
        isApplicable: false,
        reason: 'Graham não se aplica a Fundos Imobiliários. FIIs devem ser avaliados por P/VP, cap rate e qualidade dos imóveis.'
      };
    }

    if (asset.isFinancialSector) {
      return {
        price: Math.sqrt(22.5 * lpa * vpa),
        isApplicable: true,
        reason: 'Aplicado com ressalvas: no setor bancário, o Índice de Basileia e o ROE são mais determinantes que o capital físico.'
      };
    }

    if (asset.sector && (asset.sector.includes('Tecnologia') || asset.pvp > 6)) {
      return {
        price: Math.sqrt(22.5 * lpa * vpa),
        isApplicable: false,
        reason: 'Empresa com forte componente intangível/crescimento (Asset Light). Graham subestima fortemente essas empresas.'
      };
    }

    const price = Math.sqrt(22.5 * lpa * vpa);
    return {
      price,
      isApplicable: true,
      reason: 'Fórmula clássica de Graham elegível: baseada em indústrias e empresas de capital intensivo tradicional.'
    };
  },

  /**
   * Calcula a Margem de Segurança percentual entre cotação atual e preço teto
   * @param {number} currentPrice Cotação de mercado
   * @param {number} fairPrice Preço Teto ou Preço Justo
   * @returns {object} { marginPct: number, status: string, isPositive: boolean }
   */
  calculateMarginOfSafety(currentPrice, fairPrice) {
    if (!currentPrice || !fairPrice || fairPrice <= 0) {
      return { marginPct: 0, status: 'Neutro', isPositive: false };
    }

    const marginPct = ((fairPrice - currentPrice) / currentPrice) * 100;
    let status = 'Preço Justo';

    if (marginPct >= 20) {
      status = 'Alta Margem de Segurança (Forte Desconto)';
    } else if (marginPct > 5) {
      status = 'Margem Confortável';
    } else if (marginPct >= -5) {
      status = 'Negociando no Preço Justo';
    } else if (marginPct >= -20) {
      status = 'Levemente Esticada';
    } else {
      status = 'Sem Margem de Segurança (Sobreavaliada)';
    }

    return {
      marginPct: parseFloat(marginPct.toFixed(1)),
      status,
      isPositive: marginPct > 0
    };
  },

  /**
   * Compara 2 ou mais ativos lado a lado e determina o vencedor por indicador
   * @param {Array<string>} tickers Lista de tickers a comparar
   * @param {Array<object>} allAssets Base completa de ativos
   * @returns {object} Dados comparativos estruturados
   */
  compareAssets(tickers, allAssets) {
    const assets = tickers.map(t => allAssets.find(a => a.ticker === t)).filter(Boolean);
    if (assets.length === 0) return null;

    const metrics = [
      { id: 'price', label: 'Cotação Atual', format: (v) => `R$ ${v.toFixed(2)}`, type: 'neutral' },
      { id: 'dy', label: 'Dividend Yield (12M)', format: (v) => v, type: 'higher_better', extractNum: (v) => parseFloat(v.replace('%', '')) },
      { id: 'pl_ajustado', label: 'P/L Ajustado (Recorrente)', format: (v) => v ? `${v}x` : 'N/A', type: 'lower_better', extractNum: (v) => v || 999 },
      { id: 'pvp', label: 'P/VP', format: (v) => v ? v.toFixed(2) : 'N/A', type: 'lower_better', extractNum: (v) => v || 999 },
      { id: 'roe', label: 'ROE (Rentabilidade)', format: (v) => v || 'N/A', type: 'higher_better', extractNum: (v) => v ? parseFloat(v.replace('%', '')) : -999 },
      { id: 'bazin_price', label: 'Preço Teto Bazin (6%)', format: (v) => v ? `R$ ${v.toFixed(2)}` : 'N/A', type: 'higher_better', extractNum: (v) => v || 0 },
      { id: 'score', label: 'Score Investidor 10X', format: (v) => `${v}/10`, type: 'higher_better', extractNum: (v) => v }
    ];

    const comparisonTable = metrics.map(metric => {
      let bestIndex = -1;
      let bestValue = metric.type === 'higher_better' ? -Infinity : Infinity;

      const values = assets.map((asset, index) => {
        let rawVal = asset[metric.id];
        if (metric.id === 'bazin_price' && !rawVal) {
          const dyNum = parseFloat(asset.dy.replace('%', '')) / 100;
          rawVal = (asset.price * dyNum) / 0.06;
        }

        if (metric.extractNum) {
          const num = metric.extractNum(rawVal);
          if (metric.type === 'higher_better' && num > bestValue) {
            bestValue = num;
            bestIndex = index;
          } else if (metric.type === 'lower_better' && num < bestValue && num > 0) {
            bestValue = num;
            bestIndex = index;
          }
        }

        return {
          raw: rawVal,
          formatted: rawVal !== undefined ? metric.format(rawVal) : '--'
        };
      });

      return {
        metric: metric.label,
        values,
        bestIndex: metric.type !== 'neutral' ? bestIndex : -1
      };
    });

    return {
      assets,
      comparisonTable
    };
  }
};

// Exporta globalmente para o navegador
window.ValuationEngine = ValuationEngine;
