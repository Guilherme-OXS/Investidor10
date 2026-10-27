// Investidor 10X - Base de Ativos B3 e Inteligência Financeira
// Dados reais com ajustes para não-recorrentes e métricas setoriais

const MARKET_INDICES = [
  { name: 'IBOVESPA', code: 'IBOV', value: '131.420', change: '+0.58%', positive: true },
  { name: 'IFIX (FIIs)', code: 'IFIX', value: '3.345', change: '+0.21%', positive: true },
  { name: 'DÓLAR', code: 'USDBRL', value: 'R$ 5,684', change: '-0.38%', positive: false },
  { name: 'SELIC', code: 'SELIC', value: '10,75%', change: 'Estável', neutral: true },
  { name: 'IPCA 12M', code: 'IPCA', value: '4,42%', change: 'Meta Ok', neutral: true },
  { name: 'BITCOIN', code: 'BTC', value: 'R$ 384.200', change: '+2.14%', positive: true }
];

const ASSETS_DATA = [
  {
    ticker: 'PETR4',
    name: 'Petrobras PN',
    type: 'AÇÃO',
    sector: 'Petróleo, Gás e Biocombustíveis',
    price: 36.85,
    changeDay: '+1.12%',
    dy: '14.8%',
    pl_contabil: 4.12,
    pl_ajustado: 4.85, // Expurgando itens não-recorrentes
    hasNonRecurrentImpact: true,
    nonRecurrentNote: 'Lucro contábil impactado por R$ 4.2B em reversões fiscais e desinvestimentos.',
    pvp: 1.08,
    roe: '26.4%',
    roic: '21.2%',
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
      { text: 'Governança sem risco de interferência política', passed: false, note: 'Empresa de controle estatal suscetível a mudanças de diretrizes.' }
    ],
    proventosRecentes: [
      { tipo: 'Dividendo', valor: 'R$ 1,25', dataCom: '21/10/2026', dataPag: '20/11/2026' },
      { tipo: 'JCP', valor: 'R$ 0,42', dataCom: '23/08/2026', dataPag: '20/09/2026' }
    ]
  },
  {
    ticker: 'ITUB4',
    name: 'Itaú Unibanco PN',
    type: 'AÇÃO',
    sector: 'Financeiro / Bancos',
    isFinancialSector: true, // Setor Financeiro não tem EBITDA nem Dívida Líquida/EBITDA!
    price: 34.20,
    changeDay: '+0.45%',
    dy: '7.85%',
    pl_contabil: 7.95,
    pl_ajustado: 8.05,
    hasNonRecurrentImpact: false,
    pvp: 1.65,
    roe: '21.8%',
    roic: null, // Não aplicável a bancos
    basileia: '16.4%', // Métrica bancária real
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
      { text: 'Lucros bilionários e consistentes há mais de 10 anos', passed: true },
      { text: 'ROE superior a 18% mesmo em ciclos de juros altos', passed: true },
      { text: 'Índice de Basileia confortável (> 13%)', passed: true },
      { text: 'Inadimplência controlada abaixo da média do setor', passed: true },
      { text: 'Governança privada de alto padrão', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'JCP Mensal', valor: 'R$ 0,0176', dataCom: '30/09/2026', dataPag: '01/11/2026' },
      { tipo: 'JCP Extra', valor: 'R$ 0,38', dataCom: '18/09/2026', dataPag: '14/10/2026' }
    ]
  },
  {
    ticker: 'VALE3',
    name: 'Vale ON',
    type: 'AÇÃO',
    sector: 'Materiais Básicos / Mineração',
    price: 61.15,
    changeDay: '-0.85%',
    dy: '10.2%',
    pl_contabil: 5.60,
    pl_ajustado: 6.10,
    hasNonRecurrentImpact: true,
    nonRecurrentNote: 'Provisões para acordos judiciais e variação cambial no minério.',
    pvp: 1.32,
    roe: '23.5%',
    roic: '18.9%',
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
      { text: 'Alta ciclicidade dependente da economia chinesa', passed: false, note: 'Sensível à demanda imobiliária e produção de aço na China.' }
    ],
    proventosRecentes: [
      { tipo: 'JCP', valor: 'R$ 2,09', dataCom: '02/08/2026', dataPag: '04/09/2026' }
    ]
  },
  {
    ticker: 'TAEE11',
    name: 'Taesa Unit',
    type: 'AÇÃO',
    sector: 'Utilidade Pública / Energia Elétrica',
    isUtilitySector: true, // Endividamento alavancado estrutural comum em concessões
    price: 34.60,
    changeDay: '+0.15%',
    dy: '9.4%',
    pl_contabil: 8.90,
    pl_ajustado: 8.75,
    hasNonRecurrentImpact: false,
    pvp: 1.72,
    roe: '19.4%',
    roic: '15.8%',
    ev_ebitda: 6.80,
    divida_liquida_ebitda: 3.65, // No Investidor 10 isso gera alerta vermelho falso
    utilityLeverageSafe: true, // Ajuste inteligente: contratos de 30 anos com RAP garantida
    margem_liquida: '48.5%',
    tag_along: '100%',
    liquidez_diaria: 'R$ 65M',
    graham_price: 31.20,
    bazin_price: 39.50,
    score: 8.7,
    scoreStatus: 'Defensiva',
    badges: ['Renda Previsível', 'Monopólio Natural'],
    checklist: [
      { text: 'Receita Anual Permitida (RAP) corrigida por inflação (IPCA/IGP-M)', passed: true },
      { text: 'Margem EBITDA superior a 70% típica de transmissão', passed: true },
      { text: 'Dívida/EBITDA de 3,6x calibrada com ciclo de investimentos', passed: true, note: 'Alavancagem normal para o setor de transmissão com receita garantida.' },
      { text: 'Histórico consistente de distribuição de proventos', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Dividendo', valor: 'R$ 0,72', dataCom: '14/08/2026', dataPag: '29/08/2026' }
    ]
  },
  {
    ticker: 'WEGE3',
    name: 'WEG ON',
    type: 'AÇÃO',
    sector: 'Bens Industriais / Motores e Automação',
    price: 52.30,
    changeDay: '+1.65%',
    dy: '2.1%',
    pl_contabil: 33.4,
    pl_ajustado: 33.1,
    hasNonRecurrentImpact: false,
    pvp: 9.80,
    roe: '29.5%',
    roic: '28.2%',
    ev_ebitda: 22.4,
    divida_liquida_ebitda: -0.25, // Caixa líquido positivo
    margem_liquida: '16.8%',
    tag_along: '100%',
    liquidez_diaria: 'R$ 480M',
    graham_price: 18.40, // Graham falha em empresas de crescimento exponencial
    grahamWarning: 'Graham subavalia empresas de alto crescimento e forte retorno sobre capital.',
    score: 9.5,
    scoreStatus: 'Crescimento Premium',
    badges: ['Qualidade Máxima', 'Caixa Líquido'],
    checklist: [
      { text: 'Retorno sobre Capital (ROIC) próximo a 30%', passed: true },
      { text: 'Presença internacional em mais de 135 países', passed: true },
      { text: 'Empresa com mais caixa do que dívida (Caixa Líquido)', passed: true },
      { text: 'Múltiplos elevados (P/L acima de 30x) exigem alta execução', passed: false, note: 'Pouca margem de segurança nos múltiplos tradicionais de Graham.' }
    ],
    proventosRecentes: [
      { tipo: 'Dividendo', valor: 'R$ 0,18', dataCom: '20/09/2026', dataPag: '16/10/2026' }
    ]
  },
  {
    ticker: 'HGLG11',
    name: 'CSHG Logística FII',
    type: 'FII',
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
      { text: 'Diversificação de inquilinos de primeira linha (E-commerce)', passed: true },
      { text: 'Rendimentos sustentados por aluguéis reais (sem amortização)', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Rendimento', valor: 'R$ 1,10', dataCom: '30/09/2026', dataPag: '14/10/2026' },
      { tipo: 'Rendimento', valor: 'R$ 1,10', dataCom: '30/08/2026', dataPag: '13/09/2026' }
    ]
  },
  {
    ticker: 'XPML11',
    name: 'XP Malls FII',
    type: 'FII',
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
      { text: 'Portfólio com shoppings líderes em suas cidades', passed: true },
      { text: 'Vendas nas mesmas lojas (SSS) em crescimento constante', passed: true },
      { text: 'Rendimento mensal previsível e sem artifícios contábeis', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Rendimento', valor: 'R$ 0,92', dataCom: '30/09/2026', dataPag: '14/10/2026' }
    ]
  },
  {
    ticker: 'MXRF11',
    name: 'Maxi Renda FII',
    type: 'FII',
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
      { text: 'Maior base de cotistas do Brasil (+1 milhão)', passed: true },
      { text: 'Cota de valor acessível (~R$ 10,00)', passed: true },
      { text: 'P/VP equilibrado próximo a 1,00', passed: true }
    ],
    proventosRecentes: [
      { tipo: 'Rendimento', valor: 'R$ 0,10', dataCom: '30/09/2026', dataPag: '14/10/2026' }
    ]
  },
  {
    ticker: 'DEVA11',
    name: 'Devant Recebíveis FII',
    type: 'FII',
    fiiType: 'Papel High Yield / CRIs Arriscados',
    price: 41.20,
    changeDay: '-1.45%',
    dy: '17.8%', // DY alto que engana no Investidor 10
    pvp: 0.44, // VP derretido
    vp_cota: 93.40,
    yield_trap_alert: true, // ALERTA ATIVADO!
    yieldTrapReason: 'Armadilha de Yield detectada: Dividend Yield inflado (17.8%) decorrente de desvalorização violenta da cota e risco de calote em CRIs corporativos (Gramado Parks/Circuito de Compras).',
    dividend_sustentavel: false,
    liquidez_diaria: 'R$ 1.8M',
    rendimento_medio_mes: 'R$ 0,55 / cota (Instável)',
    score: 4.8,
    scoreStatus: 'Alto Risco (Yield Trap)',
    badges: ['Alerta Yield Trap', 'High Yield Arriscado'],
    checklist: [
      { text: 'Inadimplência alta na carteira de devedores de CRIs', passed: false, note: 'Calotes recentes reduziram drasticamente a capacidade de pagamento.' },
      { text: 'Valor Patrimonial em queda livre nos últimos 24 meses', passed: false, note: 'Perda permanente de capital para quem comprou no topo.' },
      { text: 'Yield atual não representa retorno real futuro', passed: false, note: 'Risco iminente de novos cortes na distribuição.' }
    ],
    proventosRecentes: [
      { tipo: 'Rendimento', valor: 'R$ 0,55', dataCom: '30/09/2026', dataPag: '14/10/2026' }
    ]
  }
];

// Dados de Exemplo para a Carteira do Usuário
const USER_PORTFOLIO = [
  { ticker: 'ITUB4', qty: 250, precoMedio: 29.50, cotacao: 34.20 },
  { ticker: 'PETR4', qty: 180, precoMedio: 31.00, cotacao: 36.85 },
  { ticker: 'TAEE11', qty: 300, precoMedio: 33.10, cotacao: 34.60 },
  { ticker: 'HGLG11', qty: 45, precoMedio: 154.00, cotacao: 159.80 },
  { ticker: 'XPML11', qty: 80, precoMedio: 99.20, cotacao: 104.50 }
];
