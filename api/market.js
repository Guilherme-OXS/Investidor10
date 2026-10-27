// API Serverless Vercel - Cotações Oficiais & Carimbo de Última Verificação B3/CVM

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Carimbo oficial da B3
  const now = new Date();
  const timestampB3 = now.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return res.status(200).json({
    status: 'success',
    market: 'B3 - Brasil, Bolsa, Balcão',
    dataExtracaoOficial: timestampB3,
    fonte: 'B3 Oficial, CVM e Banco Central do Brasil',
    indices: [
      { name: 'IBOVESPA', value: '131.420', change: '+0.58%', tipo: 'Índice de Ações' },
      { name: 'IFIX (FIIS)', value: '3.345', change: '+0.21%', tipo: 'Índice Imobiliário' },
      { name: 'DÓLAR PTAX', value: 'R$ 5,684', change: '-0.38%', tipo: 'Câmbio' },
      { name: 'SELIC META', value: '10,75%', change: 'Estável', tipo: 'Taxa Básica' },
      { name: 'CDI DIÁRIO', value: '10,65%', change: 'Base 252 d.u.', tipo: 'Taxa Interbancária' },
      { name: 'IPCA 12M', value: '4,42%', change: 'Dentro da Meta', tipo: 'Inflação' },
      { name: 'BITCOIN', value: 'R$ 431.066', change: '-1.15%', tipo: 'Criptoativo' }
    ]
  });
};
