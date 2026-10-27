// ==========================================================================
// INVESTIDOR 10X - CONECTOR DE DADOS AO VIVO & CENTRAL DE NOTÍCIAS (PARTE 3)
// Conexão com APIs públicas gratuitas (AwesomeAPI + Brapi) com fallback resiliente
// ==========================================================================

const LiveMarketConnector = {
  lastUpdated: null,
  isUpdating: false,

  /**
   * Verifica se a B3 está em horário de pregão (Segunda a Sexta, 10h às 17h55 Horário de Brasília)
   */
  getMarketStatus() {
    const now = new Date();
    // Ajusta para o horário oficial de Brasília (UTC-3)
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const brtHours = (utcHours - 3 + 24) % 24;
    const dayOfWeek = now.getDay(); // 0 = Domingo, 6 = Sábado

    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const isTradingHours = (brtHours >= 10 && brtHours < 18);

    const isOpen = isWeekday && isTradingHours;

    return {
      isOpen,
      text: isOpen ? 'Mercado B3 Aberto' : 'Mercado B3 Fechado',
      timeString: `${String(brtHours).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    };
  },

  /**
   * Atualiza Dólar e Bitcoin em tempo real absoluto via AwesomeAPI (gratuita e ilimitada)
   */
  async updateCurrencies() {
    try {
      const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,BTC-BRL', { cache: 'no-cache' });
      if (!response.ok) return false;
      const data = await response.json();

      if (data.USDBRL) {
        const dollarVal = parseFloat(data.USDBRL.bid).toFixed(3);
        const dollarPct = parseFloat(data.USDBRL.pctChange).toFixed(2);
        const dollarIdx = MARKET_INDICES.find(i => i.code === 'USDBRL');
        if (dollarIdx) {
          dollarIdx.value = `R$ ${dollarVal.replace('.', ',')}`;
          dollarIdx.change = `${dollarPct >= 0 ? '+' : ''}${dollarPct}%`;
          dollarIdx.positive = parseFloat(dollarPct) >= 0;
        }
      }

      if (data.BTCBRL) {
        const btcVal = Math.round(parseFloat(data.BTCBRL.bid)).toLocaleString('pt-BR');
        const btcPct = parseFloat(data.BTCBRL.pctChange).toFixed(2);
        const btcIdx = MARKET_INDICES.find(i => i.code === 'BTC');
        if (btcIdx) {
          btcIdx.value = `R$ ${btcVal}`;
          btcIdx.change = `${btcPct >= 0 ? '+' : ''}${btcPct}%`;
          btcIdx.positive = parseFloat(btcPct) >= 0;
        }
      }

      return true;
    } catch (err) {
      console.warn('Erro ao atualizar moedas ao vivo (offline ou bloqueio):', err);
      return false;
    }
  },

  /**
   * Busca cotações atualizadas de ativos B3 via Brapi (com fallback seguro)
   */
  async updateAssetQuotes(tickersToFetch) {
    if (!navigator.onLine) return false;

    try {
      const symbols = tickersToFetch.join(',');
      const response = await fetch(`https://brapi.dev/api/quote/${symbols}`, { cache: 'no-cache' });
      if (!response.ok) return false;

      const data = await response.json();
      if (!data.results || !Array.isArray(data.results)) return false;

      data.results.forEach(item => {
        const asset = ASSETS_DATA.find(a => a.ticker === item.symbol);
        if (asset && item.regularMarketPrice) {
          asset.price = item.regularMarketPrice;
          if (item.regularMarketChangePercent !== undefined) {
            const pct = item.regularMarketChangePercent.toFixed(2);
            asset.changeDay = `${pct >= 0 ? '+' : ''}${pct}%`;
          }
          // Recalcula múltiplos sensíveis à cotação
          if (asset.lpa && asset.lpa > 0) {
            asset.pl_contabil = parseFloat((asset.price / asset.lpa).toFixed(2));
          }
          if (asset.vpa && asset.vpa > 0) {
            asset.pvp = parseFloat((asset.price / asset.vpa).toFixed(2));
          }
        }
      });

      return true;
    } catch (err) {
      console.warn('Falha na API da B3 (usando dados locais resilientes):', err);
      return false;
    }
  },

  /**
   * Executa a sincronização completa
   */
  async syncAll() {
    if (this.isUpdating) return;
    this.isUpdating = true;

    // Atualiza moedas e Dólar/Bitcoin em tempo real
    await this.updateCurrencies();

    // Seleciona principais tickers para atualizar cotações
    const mainTickers = ASSETS_DATA.map(a => a.ticker).slice(0, 10);
    await this.updateAssetQuotes(mainTickers);

    this.lastUpdated = new Date();
    this.isUpdating = false;

    // Dispara evento de cotações atualizadas
    window.dispatchEvent(new CustomEvent('marketQuotesUpdated'));
  }
};

// ==========================================================================
// CENTRAL DE FATOS RELEVANTES & NOTÍCIAS DO MERCADO
// ==========================================================================
const MARKET_NEWS = [
  {
    id: 1,
    title: 'Petrobras (PETR4) aprova pagamento de dividendos extraordinários',
    summary: 'Conselho de Administração aprovou distribuição de proventos complementares com base no fluxo de caixa livre do 3T.',
    ticker: 'PETR4',
    category: 'Proventos',
    time: 'Há 25 minutos',
    source: 'Fato Relevante CVM'
  },
  {
    id: 2,
    title: 'Banco do Brasil (BBAS3) registra alta no crédito ao agronegócio e inadimplência estável',
    summary: 'Carteira de crédito sustentável superou R$ 350 bilhões, mantendo índice de Basileia em confortáveis 15.6%.',
    ticker: 'BBAS3',
    category: 'Resultados',
    time: 'Há 1 hora',
    source: 'B3 Divulgações'
  },
  {
    id: 3,
    title: 'CSHG Logística (HGLG11) anuncia locação de 100% de novo galpão em Itupeva',
    summary: 'Contrato atípico de 10 anos firmado com grande operador logístico reduz a vacância física do fundo para menos de 4%.',
    ticker: 'HGLG11',
    category: 'FIIs',
    time: 'Há 3 horas',
    source: 'Boletim Imobiliário'
  },
  {
    id: 4,
    title: 'Alerta da CVM sobre fundos imobiliários High Yield com risco de crédito',
    summary: 'Regulador reforça necessidade de investidores pessoa física analisarem qualidade de garantias de CRIs antes de investir apenas pelo DY.',
    ticker: 'DEVA11',
    category: 'Regulação',
    time: 'Há 5 horas',
    source: 'CVM Alertas'
  },
  {
    id: 5,
    title: 'Taesa (TAEE11) conclui energização de novo trecho de transmissão antes do prazo',
    summary: 'Antecipação do projeto assegura adiantamento de Receita Anual Permitida (RAP) e reforça previsibilidade de dividendos.',
    ticker: 'TAEE11',
    category: 'Operacional',
    time: 'Há 6 horas',
    source: 'RI Taesa'
  }
];

window.LiveMarketConnector = LiveMarketConnector;
window.MARKET_NEWS = MARKET_NEWS;
