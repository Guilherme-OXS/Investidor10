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
