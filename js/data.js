// ==========================================================================
// INVESTIDOR 10X - BASE EXPANDIDA DE ATIVOS B3, FIIS, FIAGROS E BDRS
// Dados ajustados para não-recorrentes, métricas setoriais e alertas de Yield Trap
// ==========================================================================

const MARKET_INDICES = [
  { name: 'IBOVESPA', code: 'IBOV', value: '131.420', change: '+0.58%', positive: true },
  { name: 'IFIX (FIIs)', code: 'IFIX', value: '3.345', change: '+0.21%', positive: true },
  { name: 'DÓLAR', code: 'USDBRL', value: 'R$ 5,684', change: '-0.38%', positive: false },
  { name: 'SELIC', code: 'SELIC', value: '10,75%', change: 'Estável', neutral: true },
  { name: 'IPCA 12M', code: 'IPCA', value: '4,42%', change: 'Meta Ok', neutral: true },
  { name: 'BITCOIN', code: 'BTC', value: 'R$ 384.200', change: '+2.14%', positive: true }
];

const ASSETS_DATA = [
  // --- AÇÕES: COMMODITIES & PETRÓLEO ---
  {
    ticker: 'PETR4',
    name: 'Petrobras PN',
    type: 'AÇÃO',
    sector: 'Petróleo, Gás e Biocombustíveis',
    price: 36.85,
    changeDay: '+1.12%',
    dy: '14.8%',
    pl_contabil: 4.12,
    pl_ajustado: 4.85,
    hasNonRecurrentImpact: true,
    nonRecurrentNote: 'Lucro contábil impactado por R$ 4.2B em reversões fiscais e desinvestimentos pontuais.',
    pvp: 1.08,
    roe: '26.4%',
    roic: '21.2%',
    lpa: 8.94,
    vpa: 34.12,
    ev_ebitda: 2.85,
    divida_liquida_ebitda: 0.88,
    margem_liquida: '22.4%',
    tag_along: '100%',
    liquidez_diaria: 'R$ 1.8B',
    graham_price: 52.40,
    bazin_price: 44.50,
    score: 8.5,
    scoreStatus: 'Excelente',
    badges: ['Alta Dividendos', 'Blue Chip'],
    checklist: [
      { text: 'Lucro consistente nos últimos 5 anos', passed: true },
      { text: 'ROE superior a 10%', passed: true },
      { text: 'Dívida Líquida / EBITDA < 2,5x', passed: true },
      { text: 'Tag Along de 100% nas PN', passed: true },
      { text: 'Lucro recorrente alinhado ao fluxo de caixa', passed: true },
      { text: 'Governança sem risco de interferência política', passed: false, note: 'Empresa estatal suscetível a mudanças de diretrizes no plano de negócios.' }
    ],
    proventosRecentes: [
      { tipo: 'Dividendo', valor: 'R$ 1,25', dataCom: '21/10/2026', dataPag: '20/11/2026' },
      { tipo: 'JCP', valor: 'R$ 0,42', dataCom: '23/08/2026', dataPag: '20/09/2026' }
    ]
  },
  {
    ticker: 'VALE3',
    name: 'Vale ON',
    type: 'AÇÃO',
    sector: 'Mineração e Metais Básicos',
    price: 61.15,
    changeDay: '-0.85%',
    dy: '10.2%',
    pl_contabil: 5.60,
    pl_ajustado: 6.10,
    hasNonRecurrentImpact: true,
    nonRecurrentNote: 'Provisões judiciais e efeitos cambiais sobre o preço de referência do minério de ferro.',
    pvp: 1.32,
    roe: '23.5%',
    roic: '18.9%',
    lpa: 10.92,
    vpa: 46.32,
    ev_ebitda: 3.40,
    divida_liquida_ebitda: 0.65,
    margem_liquida: '24.1%',
    tag_along: '100%',
    liquidez_diaria: 'R$ 1.4B',
    graham_price: 78.50,
    bazin_price: 68.00,
    score: 8.8,
    scoreStatus: 'Forte',
    badges: ['Commodity Global', 'Maior Exportadora'],
    checklist: [
      { text: 'Líder global com menor custo de extração (All-in C1)', passed: true },
      { text: 'Dívida controlada e forte geração de caixa livre', passed: true },
      { text: 'Tag Along de 100% no Novo Mercado', passed: true },
      { text: 'Ciclicidade moderada decorrente da demanda de aço na China', passed: false, note: 'Sensível ao setor imobiliário chinês.' }
    ],
    proventosRecentes: [
      { tipo: 'JCP', valor: 'R$ 2,09', dataCom: '02/08/2026', dataPag: '04/09/2026' }
    ]
  },

  // --- AÇÕES: BANCOS (MÉTRICAS ESPECÍFICAS SEM EBITDA) ---
  {
    ticker: 'ITUB4',
    name: 'Itaú Unibanco PN',
    type: 'AÇÃO',
    sector: 'Financeiro / Bancos',
    isFinancialSector: true,
    price: 34.20,
    changeDay: '+0.45%',
    dy: '7.85%',
    pl_contabil: 7.95,
    pl_ajustado: 8.05,
    hasNonRecurrentImpact: false,
    pvp: 1.65,
    roe: '21.8%',
    lpa: 4.30,
    vpa: 20.72,
    basileia: '16.4%',
    inadimplencia_90d: '2.6%',
    margem_financeira: '31.2%',
    tag_along: '80%',
    liquidez_diaria: 'R$ 950M',
    graham_price: 36.80,
    bazin_price: 38.20,
    score: 9.2,
    scoreStatus: 'Excepcional',
    badges: ['Top Bancos', 'Dividendos Crescentes'],
    checklist: [
      { text: 'Lucros consistentes e crescentes há mais de 10 anos', passed: true },
      { text: 'ROE superior a 20% mesmo com concorrência de fintechs', passed: true },
      { text: 'Índice de Basileia robusto (> 14%)', passed: true },
      { text: 'Inadimplência controlada abaixo da média do sistema', passed: true },
      { text: 'Governança privada consagrada', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'JCP Mensal', valor: 'R$ 0,0176', dataCom: '30/09/2026', dataPag: '01/11/2026' },
      { tipo: 'JCP Extra', valor: 'R$ 0,38', dataCom: '18/09/2026', dataPag: '14/10/2026' }
    ]
  },
  {
    ticker: 'BBAS3',
    name: 'Banco do Brasil ON',
    type: 'AÇÃO',
    sector: 'Financeiro / Bancos',
    isFinancialSector: true,
    price: 27.60,
    changeDay: '+0.88%',
    dy: '10.4%',
    pl_contabil: 4.25,
    pl_ajustado: 4.30,
    hasNonRecurrentImpact: false,
    pvp: 0.82, // Negociando abaixo do patrimônio
    roe: '21.4%',
    lpa: 6.49,
    vpa: 33.65,
    basileia: '15.6%',
    inadimplencia_90d: '2.8%',
    margem_financeira: '34.5%',
    tag_along: '100%',
    liquidez_diaria: 'R$ 720M',
    graham_price: 49.50,
    bazin_price: 42.00,
    score: 9.0,
    scoreStatus: 'Pechincha Fundamentalista',
    badges: ['Líder Agro', 'Desconto P/VP'],
    checklist: [
      { text: 'Desconto atrativo: P/VP de 0.82x (abaixo do valor dos ativos)', passed: true },
      { text: 'Líder absoluto no crédito ao agronegócio com garantia real', passed: true },
      { text: 'Payout de 45% com distribuição trimestral de proventos', passed: true },
      { text: 'Governança estatal com Lei das Estatais como proteção', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Dividendo', valor: 'R$ 0,48', dataCom: '12/09/2026', dataPag: '27/09/2026' },
      { tipo: 'JCP', valor: 'R$ 0,34', dataCom: '12/09/2026', dataPag: '27/09/2026' }
    ]
  },
  {
    ticker: 'BBDC4',
    name: 'Bradesco PN',
    type: 'AÇÃO',
    sector: 'Financeiro / Bancos',
    isFinancialSector: true,
    price: 13.90,
    changeDay: '+0.25%',
    dy: '6.4%',
    pl_contabil: 8.80,
    pl_ajustado: 8.50,
    hasNonRecurrentImpact: false,
    pvp: 0.88,
    roe: '11.8%',
    lpa: 1.58,
    vpa: 15.80,
    basileia: '15.2%',
    inadimplencia_90d: '4.8%',
    tag_along: '80%',
    liquidez_diaria: 'R$ 550M',
    graham_price: 19.80,
    bazin_price: 15.20,
    score: 7.8,
    scoreStatus: 'Em Recuperação',
    badges: ['Turnaround', 'Desconto Patrimonial'],
    checklist: [
      { text: 'Grande base de correntistas e seguradora líder (Bradesco Seguros)', passed: true },
      { text: 'P/VP de 0.88x com margem de segurança patrimonial', passed: true },
      { text: 'Plano de reestruturação de crédito e redução de inadimplência em curso', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'JCP Mensal', valor: 'R$ 0,019', dataCom: '01/10/2026', dataPag: '01/11/2026' }
    ]
  },

  // --- AÇÕES: ENERGIA ELÉTRICA & SANEAMENTO ---
  {
    ticker: 'TAEE11',
    name: 'Taesa Unit',
    type: 'AÇÃO',
    sector: 'Energia Elétrica / Transmissão',
    isUtilitySector: true,
    price: 34.60,
    changeDay: '+0.15%',
    dy: '9.4%',
    pl_contabil: 8.90,
    pl_ajustado: 8.75,
    hasNonRecurrentImpact: false,
    pvp: 1.72,
    roe: '19.4%',
    roic: '15.8%',
    lpa: 3.88,
    vpa: 20.11,
    ev_ebitda: 6.80,
    divida_liquida_ebitda: 3.65,
    utilityLeverageSafe: true,
    margem_liquida: '48.5%',
    tag_along: '100%',
    liquidez_diaria: 'R$ 65M',
    graham_price: 31.20,
    bazin_price: 39.50,
    score: 8.7,
    scoreStatus: 'Defensiva / Renda',
    badges: ['Renda Previsível', 'Monopólio Natural'],
    checklist: [
      { text: 'Receita Anual Permitida (RAP) garantida e reajustada por IPCA/IGP-M', passed: true },
      { text: 'Margem EBITDA acima de 70% típica de transmissoras puras', passed: true },
      { text: 'Endividamento condizente com concessões de 30 anos sem risco de demanda', passed: true },
      { text: 'Histórico consistente de distribuição de proventos', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Dividendo', valor: 'R$ 0,72', dataCom: '14/08/2026', dataPag: '29/08/2026' }
    ]
  },
  {
    ticker: 'EGIE3',
    name: 'Engie Brasil ON',
    type: 'AÇÃO',
    sector: 'Energia Elétrica / Geração e Transmissão',
    isUtilitySector: true,
    price: 43.10,
    changeDay: '+0.55%',
    dy: '7.6%',
    pl_contabil: 10.8,
    pl_ajustado: 10.6,
    hasNonRecurrentImpact: false,
    pvp: 2.75,
    roe: '26.8%',
    roic: '17.4%',
    lpa: 3.99,
    vpa: 15.67,
    ev_ebitda: 7.4,
    divida_liquida_ebitda: 2.45,
    margem_liquida: '31.2%',
    tag_along: '100%',
    liquidez_diaria: 'R$ 85M',
    graham_price: 37.40,
    bazin_price: 45.80,
    score: 9.3,
    scoreStatus: 'Eficiência Máxima',
    badges: ['ESG Ouro', 'Geração Limpa'],
    checklist: [
      { text: 'Maior geradora de energia 100% renovável privada do país', passed: true },
      { text: 'ROE consistente superior a 25%', passed: true },
      { text: 'Diversificação em linhas de transmissão e gás natural (TAG)', passed: true },
      { text: 'Governança multinacional (Grupo Engie França)', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Dividendo', valor: 'R$ 1,18', dataCom: '21/08/2026', dataPag: '18/09/2026' }
    ]
  },
  {
    ticker: 'CPLE6',
    name: 'Copel PNB',
    type: 'AÇÃO',
    sector: 'Energia Elétrica / Integrada',
    isUtilitySector: true,
    price: 9.45,
    changeDay: '+0.32%',
    dy: '8.2%',
    pl_contabil: 8.40,
    pl_ajustado: 8.20,
    hasNonRecurrentImpact: false,
    pvp: 1.15,
    roe: '15.6%',
    roic: '12.8%',
    lpa: 1.12,
    vpa: 8.21,
    ev_ebitda: 5.60,
    divida_liquida_ebitda: 2.10,
    tag_along: '100%',
    liquidez_diaria: 'R$ 110M',
    graham_price: 14.30,
    bazin_price: 12.80,
    score: 8.9,
    scoreStatus: 'Privatização Concluída',
    badges: ['Ganhos de Eficiência', 'Corporation'],
    checklist: [
      { text: 'Privatização com migração para Corporation sem controlador único', passed: true },
      { text: 'Nova política de dividendos agressiva com payout mínimo de 50%', passed: true },
      { text: 'Dívida controlada e corte expressivo de custos operacionais', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Dividendo', valor: 'R$ 0,22', dataCom: '10/09/2026', dataPag: '30/09/2026' }
    ]
  },
  {
    ticker: 'SBSP3',
    name: 'Sabesp ON',
    type: 'AÇÃO',
    sector: 'Saneamento Básico / Concessões',
    isUtilitySector: true,
    price: 98.40,
    changeDay: '+1.40%',
    dy: '4.8%',
    pl_contabil: 13.2,
    pl_ajustado: 12.8,
    hasNonRecurrentImpact: false,
    pvp: 1.95,
    roe: '15.8%',
    roic: '13.2%',
    lpa: 7.45,
    vpa: 50.46,
    ev_ebitda: 7.90,
    divida_liquida_ebitda: 2.20,
    tag_along: '100%',
    liquidez_diaria: 'R$ 380M',
    graham_price: 91.50,
    bazin_price: 78.00,
    score: 9.1,
    scoreStatus: 'Tese de Eficiência',
    badges: ['Nova Sabesp', 'Monopólio SP'],
    checklist: [
      { text: 'Maior empresa de saneamento da América Latina', passed: true },
      { text: 'Entrada da Equatorial como acionista de referência estratégica', passed: true },
      { text: 'Ganhos bilionários esperados com redução de perdas de água e automação', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Dividendo', valor: 'R$ 1,42', dataCom: '25/06/2026', dataPag: '15/07/2026' }
    ]
  },

  // --- AÇÕES: INDÚSTRIA & TECNOLOGIA ---
  {
    ticker: 'WEGE3',
    name: 'WEG ON',
    type: 'AÇÃO',
    sector: 'Bens Industriais / Equipamentos',
    price: 52.30,
    changeDay: '+1.65%',
    dy: '2.1%',
    pl_contabil: 33.4,
    pl_ajustado: 33.1,
    hasNonRecurrentImpact: false,
    pvp: 9.80,
    roe: '29.5%',
    roic: '28.2%',
    lpa: 1.56,
    vpa: 5.33,
    ev_ebitda: 22.4,
    divida_liquida_ebitda: -0.25,
    margem_liquida: '16.8%',
    tag_along: '100%',
    liquidez_diaria: 'R$ 480M',
    graham_price: 18.40,
    grahamWarning: 'Graham subavalia empresas de alto crescimento com alto retorno sobre capital reinvestido.',
    score: 9.5,
    scoreStatus: 'Crescimento Premium',
    badges: ['Qualidade Máxima', 'Caixa Líquido'],
    checklist: [
      { text: 'Retorno sobre Capital (ROIC) próximo a 30% há anos', passed: true },
      { text: 'Fábricas e presença internacional em mais de 135 países', passed: true },
      { text: 'Empresa com mais caixa do que dívida (Caixa Líquido)', passed: true },
      { text: 'Múltiplos esticados (P/L > 30x) exigem execução impecável', passed: false, note: 'Preço atual já embutiu anos de crescimento.' }
    ],
    proventosRecentes: [
      { tipo: 'Dividendo', valor: 'R$ 0,18', dataCom: '20/09/2026', dataPag: '16/10/2026' }
    ]
  },
  {
    ticker: 'KLBN11',
    name: 'Klabin Unit',
    type: 'AÇÃO',
    sector: 'Papel e Celulose / Embalagens',
    price: 21.80,
    changeDay: '+0.10%',
    dy: '6.9%',
    pl_contabil: 9.10,
    pl_ajustado: 8.80,
    hasNonRecurrentImpact: false,
    pvp: 1.95,
    roe: '22.4%',
    roic: '14.6%',
    lpa: 2.39,
    vpa: 11.17,
    ev_ebitda: 6.90,
    divida_liquida_ebitda: 3.40,
    tag_along: '100%',
    liquidez_diaria: 'R$ 95M',
    graham_price: 24.50,
    bazin_price: 25.00,
    score: 8.6,
    scoreStatus: 'Resiliente / Dólar',
    badges: ['Receita em Dólar', 'Monopólio Papel'],
    checklist: [
      { text: 'Maior produtora e exportadora de papéis de embalagem do país', passed: true },
      { text: 'Conclusão dos grandes ciclos de investimento (Projeto Puma II)', passed: true },
      { text: 'Dívida alavancada estruturalmente em trajetória de queda', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Dividendo', valor: 'R$ 0,32', dataCom: '08/08/2026', dataPag: '22/08/2026' }
    ]
  },
  {
    ticker: 'VIVT3',
    name: 'Telefônica Brasil (Vivo) ON',
    type: 'AÇÃO',
    sector: 'Telecomunicações / Renda Recorrente',
    price: 53.40,
    changeDay: '+0.20%',
    dy: '7.8%',
    pl_contabil: 13.8,
    pl_ajustado: 13.5,
    hasNonRecurrentImpact: false,
    pvp: 1.25,
    roe: '9.4%',
    roic: '11.2%',
    lpa: 3.86,
    vpa: 42.72,
    ev_ebitda: 4.80,
    divida_liquida_ebitda: 0.45,
    tag_along: '100%',
    liquidez_diaria: 'R$ 130M',
    graham_price: 60.90,
    bazin_price: 64.00,
    score: 8.8,
    scoreStatus: 'Renda Previsível',
    badges: ['Vaca Leiteira', 'Caixa Forte'],
    checklist: [
      { text: 'Líder nacional em telefonia móvel e fibra óptica', passed: true },
      { text: 'Fluxo de caixa livre constante e dívida mínima', passed: true },
      { text: 'Distribuição quase total do lucro como proventos e recompra de ações', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'JCP', valor: 'R$ 0,85', dataCom: '18/09/2026', dataPag: '23/10/2026' }
    ]
  },

  // --- FUNDOS IMOBILIÁRIOS: TIJOLO (GALPÕES & SHOPPINGS) ---
  {
    ticker: 'HGLG11',
    name: 'CSHG Logística FII',
    type: 'FII',
    sector: 'FII Logístico (Tijolo)',
    fiiType: 'Tijolo (Galpões Logísticos)',
    price: 159.80,
    changeDay: '+0.12%',
    dy: '8.65%',
    pvp: 0.98,
    vp_cota: 163.20,
    vacancia_fisica: '5.2%',
    vacancia_financeira: '3.8%',
    quantidade_imoveis: 22,
    yield_trap_alert: false,
    dividend_sustentavel: true,
    liquidez_diaria: 'R$ 9.8M',
    rendimento_medio_mes: 'R$ 1,10 / cota',
    score: 9.4,
    scoreStatus: 'FII AAA',
    badges: ['Imóveis AAA', 'Tijolo Sólido'],
    checklist: [
      { text: 'P/VP com desconto atrativo abaixo de 1,00', passed: true },
      { text: 'Vacância baixa em galpões no raio de 30km de SP', passed: true },
      { text: 'Inquilinos de primeira linha (Mercado Livre, Ambev, etc.)', passed: true },
      { text: 'Rendimentos sustentados por aluguéis reais sem queima de capital', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Rendimento', valor: 'R$ 1,10', dataCom: '30/09/2026', dataPag: '14/10/2026' },
      { tipo: 'Rendimento', valor: 'R$ 1,10', dataCom: '30/08/2026', dataPag: '13/09/2026' }
    ]
  },
  {
    ticker: 'BTLG11',
    name: 'BTG Pactual Logística FII',
    type: 'FII',
    sector: 'FII Logístico (Tijolo)',
    fiiType: 'Tijolo (Galpões Logísticos)',
    price: 101.40,
    changeDay: '+0.22%',
    dy: '8.90%',
    pvp: 0.99,
    vp_cota: 102.50,
    vacancia_fisica: '2.8%',
    quantidade_imoveis: 34,
    yield_trap_alert: false,
    dividend_sustentavel: true,
    liquidez_diaria: 'R$ 11.2M',
    rendimento_medio_mes: 'R$ 0,76 / cota',
    score: 9.3,
    scoreStatus: 'Logística Top Pick',
    badges: ['Vacância Mínima', 'Alta Diversificação'],
    checklist: [
      { text: 'Vacância física inferior a 3% com galpões em eixos nobres', passed: true },
      { text: 'Gestão ativa do BTG Pactual gerando valor com reciclagem de ativos', passed: true },
      { text: 'Proventos previsíveis e crescentes nos últimos 3 anos', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Rendimento', valor: 'R$ 0,76', dataCom: '30/09/2026', dataPag: '15/10/2026' }
    ]
  },
  {
    ticker: 'XPML11',
    name: 'XP Malls FII',
    type: 'FII',
    sector: 'FII Shoppings (Tijolo)',
    fiiType: 'Tijolo (Shopping Centers)',
    price: 104.50,
    changeDay: '+0.38%',
    dy: '9.2%',
    pvp: 0.95,
    vp_cota: 110.10,
    vacancia_fisica: '4.1%',
    quantidade_imoveis: 19,
    yield_trap_alert: false,
    dividend_sustentavel: true,
    liquidez_diaria: 'R$ 14.5M',
    rendimento_medio_mes: 'R$ 0,92 / cota',
    score: 9.1,
    scoreStatus: 'Dominante',
    badges: ['Shoppings Premium', 'Liquidez Alta'],
    checklist: [
      { text: 'Portfólio com shoppings líderes em capitais (Cidade Jardim, Catarina)', passed: true },
      { text: 'Vendas nas mesmas lojas (SSS) em crescimento consistente', passed: true },
      { text: 'Rendimento mensal previsível e sem artifícios contábeis', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Rendimento', valor: 'R$ 0,92', dataCom: '30/09/2026', dataPag: '14/10/2026' }
    ]
  },
  {
    ticker: 'VISC11',
    name: 'Vinci Shopping Centers FII',
    type: 'FII',
    sector: 'FII Shoppings (Tijolo)',
    fiiType: 'Tijolo (Shopping Centers)',
    price: 112.80,
    changeDay: '+0.15%',
    dy: '8.8%',
    pvp: 0.94,
    vp_cota: 120.40,
    vacancia_fisica: '5.8%',
    quantidade_imoveis: 24,
    yield_trap_alert: false,
    dividend_sustentavel: true,
    liquidez_diaria: 'R$ 6.2M',
    rendimento_medio_mes: 'R$ 0,85 / cota',
    score: 9.0,
    scoreStatus: 'Desconto Atrativo',
    badges: ['Desconto P/VP', '24 Shoppings'],
    checklist: [
      { text: 'P/VP de 0.94x com 6% de margem patrimonial', passed: true },
      { text: 'Presença geográfica diversificada em 14 estados', passed: true },
      { text: 'Rendimentos sustentados por receitas operacionais reais', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Rendimento', valor: 'R$ 0,85', dataCom: '30/09/2026', dataPag: '14/10/2026' }
    ]
  },

  // --- FUNDOS IMOBILIÁRIOS: PAPEL (CRIs HIGH GRADE vs HIGH YIELD) ---
  {
    ticker: 'KNCR11',
    name: 'Kinea Rendimentos Imobiliários',
    type: 'FII',
    sector: 'FII Papel / CRIs (Pós-Fixado CDI)',
    fiiType: 'Papel (CRIs High Grade CDI)',
    price: 102.30,
    changeDay: '+0.05%',
    dy: '11.8%',
    pvp: 1.01,
    vp_cota: 101.50,
    yield_trap_alert: false,
    dividend_sustentavel: true,
    liquidez_diaria: 'R$ 13.8M',
    rendimento_medio_mes: 'R$ 1,02 / cota',
    score: 9.3,
    scoreStatus: 'High Grade CDI',
    badges: ['Proteção Selic', 'Kinea / Itaú'],
    checklist: [
      { text: 'Devedores de primeira linha com risco corporativo mínimo', passed: true },
      { text: 'Carteira 100% indexada ao CDI protegida em ciclos de juros altos', passed: true },
      { text: 'Gestão conservadora da Kinea Investimentos', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Rendimento', valor: 'R$ 1,02', dataCom: '30/09/2026', dataPag: '13/10/2026' }
    ]
  },
  {
    ticker: 'KNIP11',
    name: 'Kinea Índices de Preços',
    type: 'FII',
    sector: 'FII Papel / CRIs (Inflação IPCA+)',
    fiiType: 'Papel (CRIs High Grade IPCA+)',
    price: 94.20,
    changeDay: '-0.10%',
    dy: '10.9%',
    pvp: 0.97,
    vp_cota: 97.40,
    yield_trap_alert: false,
    dividend_sustentavel: true,
    liquidez_diaria: 'R$ 10.5M',
    rendimento_medio_mes: 'R$ 0,88 / cota',
    score: 9.2,
    scoreStatus: 'Proteção IPCA+',
    badges: ['Escudo Anti-Inflação', 'Desconto P/VP'],
    checklist: [
      { text: 'CRIs indexados a IPCA + 7,2% ao ano com garantias reais pesadas', passed: true },
      { text: 'Negociando com desconto de 3% sobre o valor patrimonial', passed: true },
      { text: 'Zero calotes em todo o histórico do fundo', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Rendimento', valor: 'R$ 0,88', dataCom: '30/09/2026', dataPag: '13/10/2026' }
    ]
  },
  {
    ticker: 'MXRF11',
    name: 'Maxi Renda FII',
    type: 'FII',
    sector: 'FII Híbrido / Papel e CRIs',
    fiiType: 'Híbrido / Papel e CRIs',
    price: 9.98,
    changeDay: '-0.10%',
    dy: '12.4%',
    pvp: 1.01,
    vp_cota: 9.88,
    quantidade_imoveis: 'CRIs + Permutas',
    yield_trap_alert: false,
    dividend_sustentavel: true,
    liquidez_diaria: 'R$ 12.8M',
    rendimento_medio_mes: 'R$ 0,10 / cota',
    score: 8.6,
    scoreStatus: 'Popular',
    badges: ['Base Gigante', 'Acessível'],
    checklist: [
      { text: 'Maior base de investidores do país (+1,1 milhão de cotistas)', passed: true },
      { text: 'Cota acessível negociada na casa dos R$ 10,00', passed: true },
      { text: 'P/VP equilibrado próximo a 1,00 sem risco de quebra', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Rendimento', valor: 'R$ 0,10', dataCom: '30/09/2026', dataPag: '14/10/2026' }
    ]
  },

  // --- FIIs COM ALERTA DE YIELD TRAP CRÍTICO ---
  {
    ticker: 'DEVA11',
    name: 'Devant Recebíveis FII',
    type: 'FII',
    sector: 'FII Papel High Yield (Alto Risco)',
    fiiType: 'Papel High Yield / CRIs Arriscados',
    price: 41.20,
    changeDay: '-1.45%',
    dy: '17.8%',
    pvp: 0.44,
    vp_cota: 93.40,
    yield_trap_alert: true,
    yieldTrapReason: 'Armadilha de Yield confirmada: DY artificial de 17.8% causado pelo colapso da cotação (-55%) e inadimplência severa em CRIs corporativos (Gramado Parks / Circuito de Compras).',
    dividend_sustentavel: false,
    liquidez_diaria: 'R$ 1.8M',
    rendimento_medio_mes: 'R$ 0,55 / cota (Instável)',
    score: 4.8,
    scoreStatus: 'Alto Risco (Yield Trap)',
    badges: ['Alerta Yield Trap', 'Calote em CRIs'],
    checklist: [
      { text: 'Inadimplência alta na carteira de devedores de CRIs', passed: false, note: 'Calotes recentes devedores destruíram o fluxo de pagamentos.' },
      { text: 'Valor Patrimonial em queda livre nos últimos 24 meses', passed: false, note: 'Perda permanente de patrimônio para quem comprou no topo.' },
      { text: 'Yield atual não é sustentável e mascara novos cortes futuros', passed: false, note: 'Risco iminente de suspensão de distribuições.' }
    ],
    proventosRecentes: [
      { tipo: 'Rendimento', valor: 'R$ 0,55', dataCom: '30/09/2026', dataPag: '14/10/2026' }
    ]
  },
  {
    ticker: 'HCTR11',
    name: 'Hectare CE FII',
    type: 'FII',
    sector: 'FII Papel High Yield (Alto Risco)',
    fiiType: 'Papel High Yield / Loteamentos',
    price: 29.80,
    changeDay: '-2.10%',
    dy: '19.2%',
    pvp: 0.28,
    vp_cota: 106.50,
    yield_trap_alert: true,
    yieldTrapReason: 'Armadilha de Yield Extrema: Queda de mais de 70% na cota. Concentração em multipropriedades e devedores com recuperação judicial. Não confunda com pechincha.',
    dividend_sustentavel: false,
    liquidez_diaria: 'R$ 1.4M',
    rendimento_medio_mes: 'R$ 0,38 / cota (Oscilante)',
    score: 3.9,
    scoreStatus: 'Risco Crítico',
    badges: ['Alerta Yield Trap', 'Crise de Inadimplência'],
    checklist: [
      { text: 'Concentração em devedores do setor turístico/multipropriedade', passed: false, note: 'Risco excessivo em créditos de difícil execução.' },
      { text: 'Queda de mais de 70% na cotação histórica', passed: false, note: 'Destruição de capital sem horizonte claro de reversão.' },
      { text: 'Proventos pagos dependentes de repactuações instáveis', passed: false, note: 'Cuidado: DY alto no screener é puramente ilusório.' }
    ],
    proventosRecentes: [
      { tipo: 'Rendimento', valor: 'R$ 0,38', dataCom: '30/09/2026', dataPag: '14/10/2026' }
    ]
  },

  // --- FIAGROS (AGRONEGÓCIO) ---
  {
    ticker: 'VGIA11',
    name: 'Valora CRA Fiagro',
    type: 'FIAGRO',
    sector: 'Fiagro / Crédito Agro (CRAs)',
    price: 8.42,
    changeDay: '+0.24%',
    dy: '14.2%',
    pvp: 0.95,
    vp_cota: 8.85,
    yield_trap_alert: false,
    dividend_sustentavel: true,
    liquidez_diaria: 'R$ 3.8M',
    rendimento_medio_mes: 'R$ 0,10 / cota',
    score: 8.4,
    scoreStatus: 'Agro Yield Forte',
    badges: ['Agro Brasil', 'Proventos Mensais'],
    checklist: [
      { text: 'Carteira pulverizada de CRAs no agronegócio exportador', passed: true },
      { text: 'P/VP com desconto de 5% sobre a carteira de crédito', passed: true },
      { text: 'Dividend Yield de 14.2% isento de IR para pessoa física', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Rendimento', valor: 'R$ 0,10', dataCom: '30/09/2026', dataPag: '14/10/2026' }
    ]
  },

  // --- BDRs (INTERNACIONAL / DOLARIZAÇÃO) ---
  {
    ticker: 'AAPL34',
    name: 'Apple Inc BDR',
    type: 'BDR',
    sector: 'Tecnologia / Hardware & Serviços',
    price: 68.90,
    changeDay: '+0.95%',
    dy: '0.85%',
    pl_contabil: 32.5,
    pl_ajustado: 32.0,
    hasNonRecurrentImpact: false,
    pvp: 45.2,
    roe: '145.0%',
    roic: '54.2%',
    lpa: 2.12,
    vpa: 1.52,
    tag_along: '100%',
    liquidez_diaria: 'R$ 45M',
    graham_price: 8.50,
    grahamWarning: 'Graham falha totalmente na Apple porque ela recompra ações massivamente e opera com capital próprio negativo/ínfimo.',
    score: 9.6,
    scoreStatus: 'Monopólio Global',
    badges: ['Maior do Mundo', 'Moat Inabalável'],
    checklist: [
      { text: 'Ecossistema dominante com mais de 2 bilhões de dispositivos ativos', passed: true },
      { text: 'Geração de mais de US$ 100 bilhões anuais em fluxo de caixa livre', passed: true },
      { text: 'Poder de precificação intacto mesmo com inflação global', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Dividendo', valor: 'R$ 0,12', dataCom: '08/08/2026', dataPag: '22/08/2026' }
    ]
  }
,
  // --- CATÁLOGO COMPLETO EXPANDIDO: MERCADO B3, STOCKS, REITS, ETFS, CRIPTO & TESOURO ---
  {
    ticker: 'PETR3',
    name: 'Petrobras ON',
    type: 'AÇÃO',
    sector: 'Petróleo e Gás',
    price: 39.5,
    changeDay: '+0.00%',
    dy: '14.5%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'ITUB3',
    name: 'Itaú Unibanco ON',
    type: 'AÇÃO',
    sector: 'Bancos',
    price: 29.1,
    changeDay: '+0.00%',
    dy: '6.5%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'BBDC3',
    name: 'Bradesco ON',
    type: 'AÇÃO',
    sector: 'Bancos',
    price: 13.2,
    changeDay: '+0.00%',
    dy: '7.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'ABEV3',
    name: 'Ambev ON',
    type: 'AÇÃO',
    sector: 'Bebidas',
    price: 12.45,
    changeDay: '+0.00%',
    dy: '6.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'RENT3',
    name: 'Localiza ON',
    type: 'AÇÃO',
    sector: 'Aluguel de Carros',
    price: 44.1,
    changeDay: '+0.00%',
    dy: '3.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'MGLU3',
    name: 'Magazine Luiza ON',
    type: 'AÇÃO',
    sector: 'Varejo',
    price: 9.8,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'LREN3',
    name: 'Lojas Renner ON',
    type: 'AÇÃO',
    sector: 'Varejo',
    price: 17.5,
    changeDay: '+0.00%',
    dy: '3.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'B3SA3',
    name: 'B3 ON',
    type: 'AÇÃO',
    sector: 'Serviços Financeiros',
    price: 10.9,
    changeDay: '+0.00%',
    dy: '5.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'EMBR3',
    name: 'Embraer ON',
    type: 'AÇÃO',
    sector: 'Aeroespacial',
    price: 51.3,
    changeDay: '+0.00%',
    dy: '0.5%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'PRIO3',
    name: 'PRIO ON',
    type: 'AÇÃO',
    sector: 'Petróleo e Gás',
    price: 42.8,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'SUZB3',
    name: 'Suzano ON',
    type: 'AÇÃO',
    sector: 'Papel e Celulose',
    price: 55.4,
    changeDay: '+0.00%',
    dy: '3.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'JBSS3',
    name: 'JBS ON',
    type: 'AÇÃO',
    sector: 'Alimentos',
    price: 35.7,
    changeDay: '+0.00%',
    dy: '7.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'CSNA3',
    name: 'Siderúrgica Nacional ON',
    type: 'AÇÃO',
    sector: 'Siderurgia',
    price: 11.2,
    changeDay: '+0.00%',
    dy: '8.5%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'USIM5',
    name: 'Usiminas PNA',
    type: 'AÇÃO',
    sector: 'Siderurgia',
    price: 6.3,
    changeDay: '+0.00%',
    dy: '4.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'GGBR4',
    name: 'Gerdau PN',
    type: 'AÇÃO',
    sector: 'Siderurgia',
    price: 18.9,
    changeDay: '+0.00%',
    dy: '6.4%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'GOAU4',
    name: 'Metalúrgica Gerdau PN',
    type: 'AÇÃO',
    sector: 'Siderurgia',
    price: 10.6,
    changeDay: '+0.00%',
    dy: '7.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'ELET3',
    name: 'Eletrobras ON',
    type: 'AÇÃO',
    sector: 'Energia Elétrica',
    price: 38.4,
    changeDay: '+0.00%',
    dy: '3.5%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'ELET6',
    name: 'Eletrobras PNB',
    type: 'AÇÃO',
    sector: 'Energia Elétrica',
    price: 42.1,
    changeDay: '+0.00%',
    dy: '4.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'TAEE4',
    name: 'Taesa PN',
    type: 'AÇÃO',
    sector: 'Energia Elétrica',
    price: 11.55,
    changeDay: '+0.00%',
    dy: '9.9%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'CMIG4',
    name: 'Cemig PN',
    type: 'AÇÃO',
    sector: 'Energia Elétrica',
    price: 11.7,
    changeDay: '+0.00%',
    dy: '10.5%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'VBBR3',
    name: 'Vibra Energia ON',
    type: 'AÇÃO',
    sector: 'Combustíveis',
    price: 22.3,
    changeDay: '+0.00%',
    dy: '6.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'RAIZ4',
    name: 'Raízen PN',
    type: 'AÇÃO',
    sector: 'Biocombustíveis',
    price: 2.85,
    changeDay: '+0.00%',
    dy: '5.9%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'ASAI3',
    name: 'Assaí ON',
    type: 'AÇÃO',
    sector: 'Atacarejo',
    price: 7.4,
    changeDay: '+0.00%',
    dy: '1.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'CRFB3',
    name: 'Carrefour Brasil ON',
    type: 'AÇÃO',
    sector: 'Varejo',
    price: 8.1,
    changeDay: '+0.00%',
    dy: '2.5%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'HAPV3',
    name: 'Hapvida ON',
    type: 'AÇÃO',
    sector: 'Saúde',
    price: 3.65,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'RDOR3',
    name: 'Rede D\'Or ON',
    type: 'AÇÃO',
    sector: 'Saúde',
    price: 29.5,
    changeDay: '+0.00%',
    dy: '3.9%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'RADL3',
    name: 'Raia Drogasil ON',
    type: 'AÇÃO',
    sector: 'Farmácias',
    price: 25.8,
    changeDay: '+0.00%',
    dy: '1.5%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'MULT3',
    name: 'Multiplan ON',
    type: 'AÇÃO',
    sector: 'Shoppings',
    price: 24.9,
    changeDay: '+0.00%',
    dy: '4.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'IGTI11',
    name: 'Iguatemi UNT',
    type: 'AÇÃO',
    sector: 'Shoppings',
    price: 20.4,
    changeDay: '+0.00%',
    dy: '4.6%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'CYRE3',
    name: 'Cyrela ON',
    type: 'AÇÃO',
    sector: 'Construção Civil',
    price: 21.3,
    changeDay: '+0.00%',
    dy: '8.4%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'MRVE3',
    name: 'MRV ON',
    type: 'AÇÃO',
    sector: 'Construção Civil',
    price: 6.8,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'EZTC3',
    name: 'EZTEC ON',
    type: 'AÇÃO',
    sector: 'Construção Civil',
    price: 14.1,
    changeDay: '+0.00%',
    dy: '3.5%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'SLCE3',
    name: 'SLC Agrícola ON',
    type: 'AÇÃO',
    sector: 'Agronegócio',
    price: 18.4,
    changeDay: '+0.00%',
    dy: '5.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'SMTO3',
    name: 'São Martinho ON',
    type: 'AÇÃO',
    sector: 'Açúcar e Álcool',
    price: 28.5,
    changeDay: '+0.00%',
    dy: '4.9%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'BEEF3',
    name: 'Minerva ON',
    type: 'AÇÃO',
    sector: 'Frigoríficos',
    price: 6.1,
    changeDay: '+0.00%',
    dy: '8.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'MRFG3',
    name: 'Marfrig ON',
    type: 'AÇÃO',
    sector: 'Frigoríficos',
    price: 12.8,
    changeDay: '+0.00%',
    dy: '7.5%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'BRFS3',
    name: 'BRF ON',
    type: 'AÇÃO',
    sector: 'Alimentos',
    price: 24.3,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'TIMS3',
    name: 'TIM ON',
    type: 'AÇÃO',
    sector: 'Telecom',
    price: 17.6,
    changeDay: '+0.00%',
    dy: '6.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'TOTS3',
    name: 'Totvs ON',
    type: 'AÇÃO',
    sector: 'Tecnologia',
    price: 29.8,
    changeDay: '+0.00%',
    dy: '1.9%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'INTB3',
    name: 'Intelbras ON',
    type: 'AÇÃO',
    sector: 'Tecnologia',
    price: 19.5,
    changeDay: '+0.00%',
    dy: '4.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'POSI3',
    name: 'Positivo ON',
    type: 'AÇÃO',
    sector: 'Tecnologia',
    price: 6.4,
    changeDay: '+0.00%',
    dy: '5.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'CASH3',
    name: 'Méliuz ON',
    type: 'AÇÃO',
    sector: 'Tecnologia',
    price: 8.9,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'LWSA3',
    name: 'Locaweb ON',
    type: 'AÇÃO',
    sector: 'Tecnologia',
    price: 4.3,
    changeDay: '+0.00%',
    dy: '1.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'ALOS3',
    name: 'Allos ON',
    type: 'AÇÃO',
    sector: 'Shoppings',
    price: 22.4,
    changeDay: '+0.00%',
    dy: '7.9%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'DXCO3',
    name: 'Dexco ON',
    type: 'AÇÃO',
    sector: 'Construção',
    price: 6.95,
    changeDay: '+0.00%',
    dy: '3.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'MOVI3',
    name: 'Movida ON',
    type: 'AÇÃO',
    sector: 'Aluguel de Carros',
    price: 6.45,
    changeDay: '+0.00%',
    dy: '2.4%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'STBP3',
    name: 'Santos Brasil ON',
    type: 'AÇÃO',
    sector: 'Logística Portuária',
    price: 13.1,
    changeDay: '+0.00%',
    dy: '9.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'CCRO3',
    name: 'CCR ON',
    type: 'AÇÃO',
    sector: 'Concessões Rodovias',
    price: 12.3,
    changeDay: '+0.00%',
    dy: '5.4%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'ECOR3',
    name: 'EcoRodovias ON',
    type: 'AÇÃO',
    sector: 'Concessões Rodovias',
    price: 7.2,
    changeDay: '+0.00%',
    dy: '4.9%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'AZUL4',
    name: 'Azul PN',
    type: 'AÇÃO',
    sector: 'Aviação',
    price: 4.8,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'GOLL4',
    name: 'Gol PN',
    type: 'AÇÃO',
    sector: 'Aviação',
    price: 1.15,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'CVCB3',
    name: 'CVC Brasil ON',
    type: 'AÇÃO',
    sector: 'Turismo',
    price: 1.85,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'COGN3',
    name: 'Cogna ON',
    type: 'AÇÃO',
    sector: 'Educação',
    price: 1.35,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'YDUQ3',
    name: 'YDUQS ON',
    type: 'AÇÃO',
    sector: 'Educação',
    price: 9.8,
    changeDay: '+0.00%',
    dy: '3.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'BPAC11',
    name: 'BTG Pactual UNT',
    type: 'AÇÃO',
    sector: 'Bancos de Investimento',
    price: 34.2,
    changeDay: '+0.00%',
    dy: '4.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'SANB11',
    name: 'Santander Brasil UNT',
    type: 'AÇÃO',
    sector: 'Bancos',
    price: 27.8,
    changeDay: '+0.00%',
    dy: '6.9%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'BRAP4',
    name: 'Bradespar PN',
    type: 'AÇÃO',
    sector: 'Holdings',
    price: 19.3,
    changeDay: '+0.00%',
    dy: '11.4%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'CPFE3',
    name: 'CPFL Energia ON',
    type: 'AÇÃO',
    sector: 'Energia Elétrica',
    price: 34.9,
    changeDay: '+0.00%',
    dy: '8.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'ENGI11',
    name: 'Energisa UNT',
    type: 'AÇÃO',
    sector: 'Energia Elétrica',
    price: 46.5,
    changeDay: '+0.00%',
    dy: '5.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'EQTL3',
    name: 'Equatorial ON',
    type: 'AÇÃO',
    sector: 'Energia Elétrica',
    price: 31.8,
    changeDay: '+0.00%',
    dy: '2.9%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'FLRY3',
    name: 'Fleury ON',
    type: 'AÇÃO',
    sector: 'Saúde',
    price: 15.2,
    changeDay: '+0.00%',
    dy: '5.6%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'KEPL3',
    name: 'Kepler Weber ON',
    type: 'AÇÃO',
    sector: 'Agronegócio',
    price: 9.9,
    changeDay: '+0.00%',
    dy: '7.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'MDIA3',
    name: 'M. Dias Branco ON',
    type: 'AÇÃO',
    sector: 'Alimentos',
    price: 28.4,
    changeDay: '+0.00%',
    dy: '4.6%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'NEOE3',
    name: 'Neoenergia ON',
    type: 'AÇÃO',
    sector: 'Energia Elétrica',
    price: 18.7,
    changeDay: '+0.00%',
    dy: '5.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'ODPV3',
    name: 'Odontoprev ON',
    type: 'AÇÃO',
    sector: 'Saúde Odonto',
    price: 11.4,
    changeDay: '+0.00%',
    dy: '7.3%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'PETZ3',
    name: 'Petz ON',
    type: 'AÇÃO',
    sector: 'Varejo Pet',
    price: 4.1,
    changeDay: '+0.00%',
    dy: '1.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'RECV3',
    name: 'PetroReconcavo ON',
    type: 'AÇÃO',
    sector: 'Petróleo e Gás',
    price: 17.8,
    changeDay: '+0.00%',
    dy: '8.9%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'SAPR11',
    name: 'Sanepar UNT',
    type: 'AÇÃO',
    sector: 'Saneamento',
    price: 28.9,
    changeDay: '+0.00%',
    dy: '6.7%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'SAPR4',
    name: 'Sanepar PN',
    type: 'AÇÃO',
    sector: 'Saneamento',
    price: 5.8,
    changeDay: '+0.00%',
    dy: '6.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'TRPL4',
    name: 'ISA CTEEP PN',
    type: 'AÇÃO',
    sector: 'Energia Elétrica',
    price: 24.3,
    changeDay: '+0.00%',
    dy: '8.7%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'UGPA3',
    name: 'Ultrapar ON',
    type: 'AÇÃO',
    sector: 'Combustíveis',
    price: 21.6,
    changeDay: '+0.00%',
    dy: '4.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'VAMO3',
    name: 'Grupo Vamos ON',
    type: 'AÇÃO',
    sector: 'Locação Pesados',
    price: 6.2,
    changeDay: '+0.00%',
    dy: '3.7%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'CSAN3',
    name: 'Cosan ON',
    type: 'AÇÃO',
    sector: 'Holdings Agro',
    price: 11.4,
    changeDay: '+0.00%',
    dy: '4.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'BBSE3',
    name: 'BB Seguridade ON',
    type: 'AÇÃO',
    sector: 'Seguros',
    price: 34.8,
    changeDay: '+0.00%',
    dy: '9.4%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'CXSE3',
    name: 'Caixa Seguridade ON',
    type: 'AÇÃO',
    sector: 'Seguros',
    price: 14.5,
    changeDay: '+0.00%',
    dy: '8.9%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'PSSA3',
    name: 'Porto Seguro ON',
    type: 'AÇÃO',
    sector: 'Seguros',
    price: 36.7,
    changeDay: '+0.00%',
    dy: '6.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'XPLG11',
    name: 'XP Log FII',
    type: 'FII',
    sector: 'Logística',
    price: 98.7,
    changeDay: '+0.00%',
    dy: '9.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'CPTS11',
    name: 'Capitânia Securities II FII',
    type: 'FII',
    sector: 'Papel / CRI',
    price: 7.65,
    changeDay: '+0.00%',
    dy: '12.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'VGIR11',
    name: 'Valora RE III FII',
    type: 'FII',
    sector: 'Papel / CRI',
    price: 9.4,
    changeDay: '+0.00%',
    dy: '13.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'HGRU11',
    name: 'CSHG Renda Urbana FII',
    type: 'FII',
    sector: 'Renda Urbana',
    price: 122.5,
    changeDay: '+0.00%',
    dy: '8.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'TGAR11',
    name: 'TG Ativo Real FII',
    type: 'FII',
    sector: 'Desenvolvimento',
    price: 118.6,
    changeDay: '+0.00%',
    dy: '14.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'BCFF11',
    name: 'BTG Pactual Fundo de Fundos',
    type: 'FII',
    sector: 'Fundo de Fundos',
    price: 8.7,
    changeDay: '+0.00%',
    dy: '9.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'BRCO11',
    name: 'Bresco Logística FII',
    type: 'FII',
    sector: 'Logística',
    price: 118.9,
    changeDay: '+0.00%',
    dy: '8.9%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'VILG11',
    name: 'Vinci Logística FII',
    type: 'FII',
    sector: 'Logística',
    price: 89.4,
    changeDay: '+0.00%',
    dy: '9.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'ALZR11',
    name: 'Alianza Trust Renda Imobiliária',
    type: 'FII',
    sector: 'Híbrido',
    price: 104.3,
    changeDay: '+0.00%',
    dy: '8.7%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'GALG11',
    name: 'Guardian Logística FII',
    type: 'FII',
    sector: 'Logística',
    price: 8.95,
    changeDay: '+0.00%',
    dy: '11.4%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'RBRR11',
    name: 'RBR Rendimento High Grade FII',
    type: 'FII',
    sector: 'Papel / CRI',
    price: 88.5,
    changeDay: '+0.00%',
    dy: '10.9%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'IRDM11',
    name: 'Iridium Recebíveis Imobiliários',
    type: 'FII',
    sector: 'Papel / CRI',
    price: 72.4,
    changeDay: '+0.00%',
    dy: '12.6%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'VGHF11',
    name: 'Valora Hedge Fund FII',
    type: 'FII',
    sector: 'Hedge Fund',
    price: 8.6,
    changeDay: '+0.00%',
    dy: '12.9%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'KNSC11',
    name: 'Kinea Securities FII',
    type: 'FII',
    sector: 'Papel / CRI',
    price: 8.8,
    changeDay: '+0.00%',
    dy: '11.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'RECR11',
    name: 'REC Recebíveis Imobiliários FII',
    type: 'FII',
    sector: 'Papel / CRI',
    price: 79.8,
    changeDay: '+0.00%',
    dy: '12.3%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'JSRE11',
    name: 'JS Real Estate Multigestão FII',
    type: 'FII',
    sector: 'Lajes Corporativas',
    price: 68.2,
    changeDay: '+0.00%',
    dy: '8.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'PVBI11',
    name: 'VBI Prime Properties FII',
    type: 'FII',
    sector: 'Lajes Corporativas',
    price: 88.3,
    changeDay: '+0.00%',
    dy: '8.5%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'HFOF11',
    name: 'Hedge Top FOFII FII',
    type: 'FII',
    sector: 'Fundo de Fundos',
    price: 69.5,
    changeDay: '+0.00%',
    dy: '10.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'MCCI11',
    name: 'Mauá Capital Recebíveis FII',
    type: 'FII',
    sector: 'Papel / CRI',
    price: 87.9,
    changeDay: '+0.00%',
    dy: '11.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'URPR11',
    name: 'Urca Prime Renda FII',
    type: 'FII',
    sector: 'Papel / High Yield',
    price: 82.5,
    changeDay: '+0.00%',
    dy: '14.5%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'RBVA11',
    name: 'Rio Bravo Renda Varejo FII',
    type: 'FII',
    sector: 'Varejo',
    price: 104.9,
    changeDay: '+0.00%',
    dy: '10.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'TRXF11',
    name: 'TRX Real Estate FII',
    type: 'FII',
    sector: 'Renda Urbana',
    price: 103.8,
    changeDay: '+0.00%',
    dy: '10.4%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'RZTR11',
    name: 'Riza Terrax FII',
    type: 'FII',
    sector: 'Agronegócio / Terras',
    price: 91.2,
    changeDay: '+0.00%',
    dy: '12.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'SNAG11',
    name: 'Suno Agro Fiagro',
    type: 'FII',
    sector: 'Fiagro',
    price: 9.95,
    changeDay: '+0.00%',
    dy: '13.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    type: 'STOCKS',
    sector: 'Tecnologia',
    price: 231.5,
    changeDay: '+0.00%',
    dy: '0.5%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    type: 'STOCKS',
    sector: 'Tecnologia',
    price: 428.2,
    changeDay: '+0.00%',
    dy: '0.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc. (Google)',
    type: 'STOCKS',
    sector: 'Tecnologia',
    price: 168.4,
    changeDay: '+0.00%',
    dy: '0.5%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com Inc.',
    type: 'STOCKS',
    sector: 'E-commerce e Nuvem',
    price: 186.7,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    type: 'STOCKS',
    sector: 'Semicondutores',
    price: 141.2,
    changeDay: '+0.00%',
    dy: '0.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'META',
    name: 'Meta Platforms (Facebook)',
    type: 'STOCKS',
    sector: 'Redes Sociais',
    price: 584.1,
    changeDay: '+0.00%',
    dy: '0.4%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    type: 'STOCKS',
    sector: 'Automóveis Elétricos',
    price: 218.4,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'NFLX',
    name: 'Netflix Inc.',
    type: 'STOCKS',
    sector: 'Streaming',
    price: 752.6,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'AMD',
    name: 'Advanced Micro Devices',
    type: 'STOCKS',
    sector: 'Semicondutores',
    price: 154.2,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'INTC',
    name: 'Intel Corporation',
    type: 'STOCKS',
    sector: 'Semicondutores',
    price: 22.8,
    changeDay: '+0.00%',
    dy: '2.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'DIS',
    name: 'The Walt Disney Company',
    type: 'STOCKS',
    sector: 'Entretenimento',
    price: 96.3,
    changeDay: '+0.00%',
    dy: '0.9%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'V',
    name: 'Visa Inc.',
    type: 'STOCKS',
    sector: 'Pagamentos',
    price: 282.5,
    changeDay: '+0.00%',
    dy: '0.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'MA',
    name: 'Mastercard Incorporated',
    type: 'STOCKS',
    sector: 'Pagamentos',
    price: 504.8,
    changeDay: '+0.00%',
    dy: '0.5%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'JNJ',
    name: 'Johnson & Johnson',
    type: 'STOCKS',
    sector: 'Saúde / Farmacêutica',
    price: 162.1,
    changeDay: '+0.00%',
    dy: '3.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'KO',
    name: 'The Coca-Cola Company',
    type: 'STOCKS',
    sector: 'Bebidas',
    price: 68.4,
    changeDay: '+0.00%',
    dy: '2.9%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'PEP',
    name: 'PepsiCo Inc.',
    type: 'STOCKS',
    sector: 'Bebidas e Alimentos',
    price: 172.5,
    changeDay: '+0.00%',
    dy: '3.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'WMT',
    name: 'Walmart Inc.',
    type: 'STOCKS',
    sector: 'Varejo',
    price: 81.3,
    changeDay: '+0.00%',
    dy: '1.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'COST',
    name: 'Costco Wholesale',
    type: 'STOCKS',
    sector: 'Varejo',
    price: 902.5,
    changeDay: '+0.00%',
    dy: '0.6%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'MCD',
    name: 'McDonald\'s Corporation',
    type: 'STOCKS',
    sector: 'Restaurantes',
    price: 298.2,
    changeDay: '+0.00%',
    dy: '2.4%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'NKE',
    name: 'Nike Inc.',
    type: 'STOCKS',
    sector: 'Vestuário e Calçados',
    price: 82.4,
    changeDay: '+0.00%',
    dy: '1.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'SBUX',
    name: 'Starbucks Corporation',
    type: 'STOCKS',
    sector: 'Cafeterias',
    price: 97.6,
    changeDay: '+0.00%',
    dy: '2.4%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'BRK.B',
    name: 'Berkshire Hathaway B',
    type: 'STOCKS',
    sector: 'Holdings / Seguros',
    price: 452.1,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'JPM',
    name: 'JPMorgan Chase & Co.',
    type: 'STOCKS',
    sector: 'Bancos',
    price: 224.5,
    changeDay: '+0.00%',
    dy: '2.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'CRM',
    name: 'Salesforce Inc.',
    type: 'STOCKS',
    sector: 'Software SaaS',
    price: 288.4,
    changeDay: '+0.00%',
    dy: '0.6%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'PLTR',
    name: 'Palantir Technologies',
    type: 'STOCKS',
    sector: 'Inteligência Artificial',
    price: 44.5,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'MSFT34',
    name: 'Microsoft BDR',
    type: 'BDR',
    sector: 'Tecnologia',
    price: 92.5,
    changeDay: '+0.00%',
    dy: '0.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'GOGL34',
    name: 'Alphabet BDR',
    type: 'BDR',
    sector: 'Tecnologia',
    price: 74.3,
    changeDay: '+0.00%',
    dy: '0.5%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'AMZO34',
    name: 'Amazon BDR',
    type: 'BDR',
    sector: 'E-commerce',
    price: 48.9,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'NVDC34',
    name: 'Nvidia BDR',
    type: 'BDR',
    sector: 'Semicondutores',
    price: 18.6,
    changeDay: '+0.00%',
    dy: '0.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'M1TA34',
    name: 'Meta BDR',
    type: 'BDR',
    sector: 'Redes Sociais',
    price: 78.4,
    changeDay: '+0.00%',
    dy: '0.4%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'TSLA34',
    name: 'Tesla BDR',
    type: 'BDR',
    sector: 'Automóveis Elétricos',
    price: 42.1,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'NFLX34',
    name: 'Netflix BDR',
    type: 'BDR',
    sector: 'Streaming',
    price: 68.5,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'DISB34',
    name: 'Disney BDR',
    type: 'BDR',
    sector: 'Entretenimento',
    price: 34.2,
    changeDay: '+0.00%',
    dy: '0.9%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'VISA34',
    name: 'Visa BDR',
    type: 'BDR',
    sector: 'Pagamentos',
    price: 98.4,
    changeDay: '+0.00%',
    dy: '0.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'BERK34',
    name: 'Berkshire Hathaway BDR',
    type: 'BDR',
    sector: 'Holdings',
    price: 112.5,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'COCA34',
    name: 'Coca-Cola BDR',
    type: 'BDR',
    sector: 'Bebidas',
    price: 58.7,
    changeDay: '+0.00%',
    dy: '2.9%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'BOVA11',
    name: 'iShares Ibovespa ETF',
    type: 'ETF',
    sector: 'Índice B3',
    price: 126.8,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'SMAL11',
    name: 'iShares Small Cap ETF',
    type: 'ETF',
    sector: 'Small Caps',
    price: 98.4,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'IVVB11',
    name: 'iShares S&P 500 B3 ETF',
    type: 'ETF',
    sector: 'S&P 500 EUA',
    price: 334.5,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'HASH11',
    name: 'Hashdex Cripto ETF',
    type: 'ETF',
    sector: 'Criptomoedas',
    price: 54.2,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'DIVO11',
    name: 'It Now IDIV Dividendos ETF',
    type: 'ETF',
    sector: 'Dividendos B3',
    price: 114.8,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'WRLD11',
    name: 'Investo Global Equities ETF',
    type: 'ETF',
    sector: 'Mercado Global',
    price: 118.2,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'GOLD11',
    name: 'Trend Ouro ETF',
    type: 'ETF',
    sector: 'Ouro / Commodities',
    price: 16.4,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    type: 'ETF_INT',
    sector: 'S&P 500',
    price: 582.4,
    changeDay: '+0.00%',
    dy: '1.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'QQQ',
    name: 'Invesco QQQ Trust (Nasdaq 100)',
    type: 'ETF_INT',
    sector: 'Nasdaq 100 Tech',
    price: 494.3,
    changeDay: '+0.00%',
    dy: '0.6%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    type: 'ETF_INT',
    sector: 'S&P 500',
    price: 534.6,
    changeDay: '+0.00%',
    dy: '1.3%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'VTI',
    name: 'Vanguard Total Stock Market',
    type: 'ETF_INT',
    sector: 'Mercado Total EUA',
    price: 284.5,
    changeDay: '+0.00%',
    dy: '1.4%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'VXUS',
    name: 'Vanguard Total International Stock',
    type: 'ETF_INT',
    sector: 'Internacional Ex-EUA',
    price: 62.8,
    changeDay: '+0.00%',
    dy: '3.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'VT',
    name: 'Vanguard Total World Stock',
    type: 'ETF_INT',
    sector: 'Mundo Inteiro',
    price: 118.4,
    changeDay: '+0.00%',
    dy: '2.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'SCHD',
    name: 'Schwab U.S. Dividend Equity ETF',
    type: 'ETF_INT',
    sector: 'Dividendos EUA',
    price: 84.2,
    changeDay: '+0.00%',
    dy: '3.4%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'O',
    name: 'Realty Income Corp (Monthly Dividend)',
    type: 'REIT',
    sector: 'Varejo Comercial',
    price: 61.4,
    changeDay: '+0.00%',
    dy: '5.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'AMT',
    name: 'American Tower Corp',
    type: 'REIT',
    sector: 'Torres Celular',
    price: 218.7,
    changeDay: '+0.00%',
    dy: '3.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'PLD',
    name: 'Prologis Inc.',
    type: 'REIT',
    sector: 'Logística Industrial',
    price: 122.5,
    changeDay: '+0.00%',
    dy: '3.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'EQIX',
    name: 'Equinix Inc.',
    type: 'REIT',
    sector: 'Data Centers',
    price: 874.2,
    changeDay: '+0.00%',
    dy: '2.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'SPG',
    name: 'Simon Property Group',
    type: 'REIT',
    sector: 'Shoppings e Outlets',
    price: 168.9,
    changeDay: '+0.00%',
    dy: '4.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'DLR',
    name: 'Digital Realty Trust',
    type: 'REIT',
    sector: 'Data Centers',
    price: 158.4,
    changeDay: '+0.00%',
    dy: '3.1%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'VICI',
    name: 'VICI Properties Inc.',
    type: 'REIT',
    sector: 'Cassinos e Hotelaria',
    price: 32.1,
    changeDay: '+0.00%',
    dy: '5.4%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'BTC',
    name: 'Bitcoin',
    type: 'CRIPTO',
    sector: 'Criptomoeda Líder',
    price: 384200,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'ETH',
    name: 'Ethereum',
    type: 'CRIPTO',
    sector: 'Smart Contracts',
    price: 14800,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'SOL',
    name: 'Solana',
    type: 'CRIPTO',
    sector: 'Blockchain Layer 1',
    price: 980,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'BNB',
    name: 'Binance Coin',
    type: 'CRIPTO',
    sector: 'Exchange Utility',
    price: 3420,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'XRP',
    name: 'Ripple',
    type: 'CRIPTO',
    sector: 'Pagamentos Globais',
    price: 3.1,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'ADA',
    name: 'Cardano',
    type: 'CRIPTO',
    sector: 'Layer 1 PoS',
    price: 2.15,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'AVAX',
    name: 'Avalanche',
    type: 'CRIPTO',
    sector: 'Layer 1',
    price: 165,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'LINK',
    name: 'Chainlink',
    type: 'CRIPTO',
    sector: 'Oráculos Web3',
    price: 72,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'Tesouro Selic 2026',
    name: 'Tesouro Selic 2026 (LFT)',
    type: 'TESOURO',
    sector: 'Pós-fixado Selic',
    price: 14200,
    changeDay: '+0.00%',
    dy: '10.75%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'Tesouro Selic 2029',
    name: 'Tesouro Selic 2029 (LFT)',
    type: 'TESOURO',
    sector: 'Pós-fixado Selic',
    price: 14180,
    changeDay: '+0.00%',
    dy: '10.85%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'Tesouro IPCA+ 2029',
    name: 'Tesouro IPCA+ 2029 (NTN-B Principal)',
    type: 'TESOURO',
    sector: 'Inflação IPCA',
    price: 3280,
    changeDay: '+0.00%',
    dy: '6.45%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'Tesouro IPCA+ 2035',
    name: 'Tesouro IPCA+ 2035 (NTN-B Principal)',
    type: 'TESOURO',
    sector: 'Inflação IPCA',
    price: 2150,
    changeDay: '+0.00%',
    dy: '6.55%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'Tesouro IPCA+ 2045',
    name: 'Tesouro IPCA+ 2045 (NTN-B Principal)',
    type: 'TESOURO',
    sector: 'Inflação IPCA',
    price: 1180,
    changeDay: '+0.00%',
    dy: '6.60%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'Tesouro Prefixado 2027',
    name: 'Tesouro Prefixado 2027 (LTN)',
    type: 'TESOURO',
    sector: 'Prefixado',
    price: 780,
    changeDay: '+0.00%',
    dy: '12.15%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'Tesouro Prefixado 2031',
    name: 'Tesouro Prefixado 2031 (LTN)',
    type: 'TESOURO',
    sector: 'Prefixado',
    price: 490,
    changeDay: '+0.00%',
    dy: '12.45%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'Tesouro RendA+ 2030',
    name: 'Tesouro RendA+ Aposentadoria Extra 2030',
    type: 'TESOURO',
    sector: 'Previdência Pública',
    price: 1890,
    changeDay: '+0.00%',
    dy: '6.40%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'Verde AM FIM',
    name: 'Verde AM Fundo Multimercado',
    type: 'FUNDO',
    sector: 'Multimercado Macro',
    price: 1,
    changeDay: '+0.00%',
    dy: '11.8%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'SPX Nimitz FIM',
    name: 'SPX Nimitz Fundo Multimercado',
    type: 'FUNDO',
    sector: 'Multimercado Macro',
    price: 1,
    changeDay: '+0.00%',
    dy: '12.2%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'Kinea Chronos FIM',
    name: 'Kinea Chronos Multimercado',
    type: 'FUNDO',
    sector: 'Multimercado Juros e Câmbio',
    price: 1,
    changeDay: '+0.00%',
    dy: '11.5%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'Real Investor FIA',
    name: 'Real Investor Fundo de Ações',
    type: 'FUNDO',
    sector: 'Ações Valor',
    price: 1,
    changeDay: '+0.00%',
    dy: '15.4%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'Trend DI Simples FI RF',
    name: 'Trend DI Simples Referenciado DI',
    type: 'FUNDO',
    sector: 'Renda Fixa DI',
    price: 1,
    changeDay: '+0.00%',
    dy: '10.65%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'Imóvel Residencial',
    name: 'Apartamento / Casa para Renda',
    type: 'OUTROS',
    sector: 'Imóveis Físicos',
    price: 350000,
    changeDay: '+0.00%',
    dy: '6.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'Terreno / Lote',
    name: 'Terreno Comercial ou Residencial',
    type: 'OUTROS',
    sector: 'Imóveis Físicos',
    price: 120000,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'Ouro Físico 24k',
    name: 'Ouro Barra / Lingote (Gramas)',
    type: 'OUTROS',
    sector: 'Metais Preciosos',
    price: 490,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  },
  {
    ticker: 'Dólar em Espécie',
    name: 'Moeda Estrangeira USD',
    type: 'OUTROS',
    sector: 'Câmbio',
    price: 5.7,
    changeDay: '+0.00%',
    dy: '0.0%',
    score: 8.0,
    scoreStatus: 'Bom'
  }
];

// Dados Iniciais da Carteira (Persistidos e editáveis pelo usuário)
const INITIAL_USER_PORTFOLIO = [
  { ticker: 'ITUB4', qty: 250, precoMedio: 29.50, cotacao: 34.20 },
  { ticker: 'BBAS3', qty: 300, precoMedio: 24.20, cotacao: 27.60 },
  { ticker: 'PETR4', qty: 180, precoMedio: 31.00, cotacao: 36.85 },
  { ticker: 'TAEE11', qty: 300, precoMedio: 33.10, cotacao: 34.60 },
  { ticker: 'HGLG11', qty: 45, precoMedio: 154.00, cotacao: 159.80 },
  { ticker: 'KNCR11', qty: 100, precoMedio: 100.80, cotacao: 102.30 },
  { ticker: 'XPML11', qty: 80, precoMedio: 99.20, cotacao: 104.50 }
];

/**
 * Retorna dados históricos realistas de cotação e proventos para renderização de gráficos
 */
function getAssetHistoricalData(ticker) {
  const asset = ASSETS_DATA.find(a => a.ticker === ticker);
  if (!asset) return null;

  const currentPrice = asset.price;
  const dyDecimal = parseFloat(asset.dy.replace('%', '')) / 100;
  const annualDiv = currentPrice * dyDecimal;

  // Histórico de cotações em 5 anos
  const priceHistory = [
    { date: '2022', value: parseFloat((currentPrice * 0.72).toFixed(2)) },
    { date: '2023', value: parseFloat((currentPrice * 0.84).toFixed(2)) },
    { date: '2024', value: parseFloat((currentPrice * 0.91).toFixed(2)) },
    { date: '2025', value: parseFloat((currentPrice * 1.05).toFixed(2)) },
    { date: '2026', value: parseFloat(currentPrice.toFixed(2)) }
  ];

  // Histórico de dividendos anuais
  const dividendHistory = [
    { year: '2022', total: parseFloat((annualDiv * 0.82).toFixed(2)) },
    { year: '2023', total: parseFloat((annualDiv * 0.90).toFixed(2)) },
    { year: '2024', total: parseFloat((annualDiv * 0.95).toFixed(2)) },
    { year: '2025', total: parseFloat((annualDiv * 1.02).toFixed(2)) },
    { year: '2026', total: parseFloat(annualDiv.toFixed(2)) }
  ];

  return { priceHistory, dividendHistory };
}

/**
 * PARTE 5: Cálculo de Preço Teto e Valuation Específico para Fundos Imobiliários e Fiagros
 * Utiliza o Spread Real sobre o Tesouro IPCA+ (NTN-B) e o rendimento mensal recorrente
 */
function calculateFIICeiling(asset, targetSpread = 2.5) {
  if (!asset || (asset.type !== 'FII' && asset.type !== 'FIAGRO')) return null;

  const dyDecimal = parseFloat(asset.dy.replace('%', '')) / 100;
  const annualIncome = asset.price * dyDecimal;

  // Taxa de referência: Tesouro IPCA+ 2035 (aprox 6.25% a.a.) + Prêmio de Risco do Segmento
  const baseRate = 0.0625;
  const riskPremium = (targetSpread || 2.5) / 100;
  const fairRate = baseRate + riskPremium; // ex: 8.75% a.a.

  const ceilingPrice = annualIncome / fairRate;
  const marginPct = ((ceilingPrice / asset.price) - 1) * 100;

  return {
    fairRatePct: (fairRate * 100).toFixed(2),
    ceilingPrice: parseFloat(ceilingPrice.toFixed(2)),
    marginPct: parseFloat(marginPct.toFixed(1)),
    isDiscounted: marginPct > 0,
    status: marginPct > 10 ? 'Excelente Oportunidade' : marginPct > 0 ? 'Abaixo do Preço Teto' : 'Com Ágio (Preço Esticado)'
  };
}

// Exportações explícitas para o escopo global
if (typeof window !== 'undefined') {
  window.MARKET_INDICES = MARKET_INDICES;
  window.ASSETS_DATA = ASSETS_DATA;
  window.INITIAL_USER_PORTFOLIO = INITIAL_USER_PORTFOLIO;
  window.getAssetHistoricalData = getAssetHistoricalData;
  window.calculateFIICeiling = calculateFIICeiling;
}


