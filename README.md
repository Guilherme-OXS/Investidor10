# InvestLucro (PRO)

Terminal profissional de análise fundamentalista, valuation inteligente e gestão de carteira de ativos da B3 (Ações, FIIs, Fiagros e BDRs), construído como **PWA Híbrido de Alto Desempenho**.

Projetado especificamente para resolver os erros clássicos das plataformas tradicionais de investimentos brasileiras.

---

## Experiência Dupla (Desktop & Mobile First)

* **No Computador:** Interface de terminal financeiro profissional, com barra de cotações contínua no topo, atalhos de teclado (`/` para busca), tabela analítica ampla e radar de múltiplos.
* **No Celular:** Funciona como um **aplicativo nativo (PWA)**, instalável na tela de início com 1 clique, barra de navegação inferior tátil (Bottom Navigation Bar), gavetas deslizantes (Bottom Sheets) e suporte offline instantâneo via Service Worker.

---

## Principais Correções e Diferenciais

1. **Expurgo de Eventos Não-Recorrentes:** Apresentação clara de P/L Contábil vs P/L Ajustado para evitar armadilhas de valor (empresas com lucros pontuais de vendas de subsidiárias ou ganhos judiciais).
2. **Tratamento Específico por Setor:**
   * **Bancos e Seguradoras:** Métricas reais de solvência (Índice de Basileia, Inadimplência, Margem Financeira) sem inventar EBITDA ou Dívida Líquida onde não existem.
   * **Utilidades Públicas (Transmissoras):** Alavancagem e endividamento avaliados no contexto de contratos estáveis de 30 anos (RAP corrigida por IPCA), sem alertas vermelhos falsos.
3. **Termômetro de Yield Trap para FIIs:** Identificação imediata de fundos de papel com Dividend Yield artificialmente alto que estão na verdade corroendo o valor patrimonial por inadimplência.
4. **Valuation Multimétodos Calibrado (Parte 5):**
   * Preço Teto de Décio Bazin (com slider interativo).
   * Preço Teto de FIIs com Spread sobre o Tesouro IPCA+ (NTN-B).
   * Preço Justo de Graham com ressalvas explícitas para empresas de crescimento (asset light).
5. **Zero Anúncios & 100% Rápido:** Sem pop-ups invasivos, sem anúncios que travam conexões móveis brasileiras.

---

## 🛠️ Tecnologias Utilizadas
* **HTML5 Semântico & Vanilla CSS3:** Variáveis customizadas, física de animação de Emil Kowalski (`cubic-bezier(0.16, 1, 0.3, 1)`), layout responsivo sem dependências pesadas.
* **JavaScript ES6+:** Cérebro matemático de valuation e simulador dinâmico de juros compostos.
* **PWA (Progressive Web App):** `manifest.json`, Service Worker com estratégia *Stale-While-Revalidate* e suporte a instalação nativa.
* **Vercel Deploy:** Configuração otimizada com `vercel.json` e URLs limpas.

---

Desenvolvido por **Guilherme Otávio**.
