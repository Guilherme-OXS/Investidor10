// ==========================================================================
// INVESTLUCRO - MOTOR DE DIAS ÚTEIS DA B3 & CÁLCULO EXATO DE CDI / RENDA FIXA
// Considera 252 dias úteis/ano oficiais (Anbima/B3) expurgando fins de semana e feriados
// ==========================================================================

const B3_FERIADOS_FIXOS = [
  '01-01', // Confraternização Universal
  '04-21', // Tiradentes
  '05-01', // Dia do Trabalho
  '09-07', // Independência do Brasil
  '10-12', // Nossa Senhora Aparecida
  '11-02', // Finados
  '11-15', // Proclamação da República
  '11-20', // Dia da Consciência Negra (Feriado Nacional B3)
  '12-25'  // Natal
];

/**
 * Calcula a data da Páscoa para determinar Carnaval, Sexta-feira Santa e Corpus Christi
 */
function getEasterDate(year) {
  const f = Math.floor,
    G = year % 19,
    C = f(year / 100),
    H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
    I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
    J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
    L = I - J,
    month = 3 + f((L + 40) / 44),
    day = L + 28 - 31 * f(month / 4);

  return new Date(year, month - 1, day);
}

/**
 * Retorna todos os feriados nacionais da B3 para um determinado ano
 */
function getB3Holidays(year) {
  const holidays = new Set();

  // Feriados com data fixa
  B3_FERIADOS_FIXOS.forEach(f => holidays.add(`${year}-${f}`));

  // Feriados móveis calculados a partir da Páscoa
  const easter = getEasterDate(year);
  
  // Carnaval (Segunda e Terça-feira: -48 e -47 dias da Páscoa)
  const carnavalSeg = new Date(easter);
  carnavalSeg.setDate(easter.getDate() - 48);
  holidays.add(formatDateKey(carnavalSeg));

  const carnavalTer = new Date(easter);
  carnavalTer.setDate(easter.getDate() - 47);
  holidays.add(formatDateKey(carnavalTer));

  // Sexta-feira Santa (-2 dias da Páscoa)
  const sextaSanta = new Date(easter);
  sextaSanta.setDate(easter.getDate() - 2);
  holidays.add(formatDateKey(sextaSanta));

  // Corpus Christi (+60 dias da Páscoa)
  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60);
  holidays.add(formatDateKey(corpusChristi));

  return holidays;
}

function formatDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const CDIEngine = {
  /**
   * Verifica se uma data é dia útil para a B3 / Anbima (sem fins de semana e sem feriados)
   */
  isBusinessDay(date) {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return false; // Domingo (0) ou Sábado (6)

    const holidays = getB3Holidays(date.getFullYear());
    return !holidays.has(formatDateKey(date));
  },

  /**
   * Conta os dias úteis entre duas datas (exclusivo do primeiro dia, inclusivo do último)
   */
  countBusinessDays(startDate, endDate = new Date()) {
    let count = 0;
    const cur = new Date(startDate);
    cur.setHours(0, 0, 0, 0);

    const target = new Date(endDate);
    target.setHours(0, 0, 0, 0);

    while (cur < target) {
      cur.setDate(cur.getDate() + 1);
      if (this.isBusinessDay(cur)) {
        count++;
      }
    }
    return count;
  },

  /**
   * Calcula o rendimento exato de um CDB / Renda Fixa pós-fixado indexado ao CDI
   * @param {number} principal Valor investido (R$)
   * @param {number} percentualCDI Percentual do CDI (ex: 100 para 100% do CDI, 110 para 110%)
   * @param {number} cdiAnual Taxa anual do CDI (ex: 10.65 para 10.65% a.a.)
   * @param {Date|string} dataAplicacao Data em que o dinheiro foi aplicado
   * @param {Date|string} dataReferencia Data de cálculo (padrão hoje)
   */
  calculateExactIncome(principal, percentualCDI = 100, cdiAnual = 10.65, dataAplicacao, dataReferencia = new Date()) {
    const start = new Date(dataAplicacao);
    const end = new Date(dataReferencia);
    const businessDays = this.countBusinessDays(start, end);

    // Taxa diária de CDI base 252 dias úteis
    const cdiAnualDec = cdiAnual / 100;
    const fatorDiarioBase = Math.pow(1 + cdiAnualDec, 1 / 252) - 1;
    const fatorEfetivoDiario = fatorDiarioBase * (percentualCDI / 100);

    // Capitalização composta pelos dias úteis reais
    const fatorAcumulado = Math.pow(1 + fatorEfetivoDiario, businessDays);
    const valorAtual = principal * fatorAcumulado;
    const lucroBruto = valorAtual - principal;

    // Tabela regressiva de IR para renda fixa
    // até 180 dias: 22.5% | 181 a 360 dias: 20% | 361 a 720 dias: 17.5% | > 720 dias: 15%
    const diffTime = Math.abs(end - start);
    const diffDaysCorridos = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let aliquotaIR = 0.225;
    if (diffDaysCorridos > 720) aliquotaIR = 0.15;
    else if (diffDaysCorridos > 360) aliquotaIR = 0.175;
    else if (diffDaysCorridos > 180) aliquotaIR = 0.20;

    const valorIR = lucroBruto * aliquotaIR;
    const lucroLiquido = lucroBruto - valorIR;
    const valorLiquido = principal + lucroLiquido;
    const rentabilidadeBrutaPct = principal > 0 ? (lucroBruto / principal) * 100 : 0;
    const rentabilidadeLiquidaPct = principal > 0 ? (lucroLiquido / principal) * 100 : 0;

    return {
      principal: parseFloat(principal.toFixed(2)),
      businessDays,
      diffDaysCorridos,
      valorAtualBruto: parseFloat(valorAtual.toFixed(2)),
      lucroBruto: parseFloat(lucroBruto.toFixed(2)),
      aliquotaIRPct: (aliquotaIR * 100).toFixed(1),
      valorIR: parseFloat(valorIR.toFixed(2)),
      valorLiquido: parseFloat(valorLiquido.toFixed(2)),
      lucroLiquido: parseFloat(lucroLiquido.toFixed(2)),
      rentabilidadeBrutaPct: parseFloat(rentabilidadeBrutaPct.toFixed(2)),
      rentabilidadeLiquidaPct: parseFloat(rentabilidadeLiquidaPct.toFixed(2))
    };
  }
};

if (typeof window !== 'undefined') {
  window.CDIEngine = CDIEngine;
}
