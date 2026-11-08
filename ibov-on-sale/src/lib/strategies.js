import { formatCurrency, formatMultiple, formatPercent } from './format';

// The rankings offered by the API (GET /api/ibovespa/filtered?strategy=...).
export const STRATEGIES = {
  deepValue: {
    id: 'deepValue',
    label: 'Deep Value',
    lede: 'As ações mais baratas da bolsa pelo lucro operacional (maior EBIT/EV) que já estão em tendência de alta, acima da média de 200 pregões. Para uma carteira diversificada de cerca de 20 ações, revista a cada trimestre.',
    criteria: [
      ['Liquidez', 'mais de R$ 1 milhão negociado por dia, em média, nos últimos 3 meses'],
      ['Lucro operacional', 'EBIT positivo nos últimos 12 meses'],
      ['Sem bancos e seguradoras', 'bancos, seguradoras e holdings financeiras (como Itaúsa e Caixa Seguridade) ficam de fora, porque o resultado financeiro é a própria operação delas; corretoras de seguros continuam'],
      ['Tendência de alta', 'cotação acima da média móvel dos últimos 200 pregões: ações baratas que já voltaram a subir, em vez de baratas ainda em queda. No backtest de 2014 até hoje, foi a única mudança que melhorou tanto o período usado para escolher as regras (2014 a 2019) quanto o de validação (2020 até hoje)'],
      ['Atenção', 'o ranking é automático: antes de comprar, confira nos balanços (veja a coluna "Lucro 5 anos") se o EBIT não foi inflado por eventos não recorrentes, como venda de ativos. A estratégia pede cerca de 20 ações ao mesmo tempo e revisão a cada trimestre (vender quem sai do top 40), porque pode ter anos ruins e quedas fortes'],
    ],
    tag: {
      priceField: 'EBIT/EV',
      priceLabel: 'EBIT/EV',
      format: formatPercent,
      lines: stock => [
        ['EV/EBIT de', formatMultiple(stock['EV/EBIT'])],
        ['Margem EBIT:', formatPercent(stock['Margem Ebit'])],
      ],
    },
    summary: [
      ['EBIT/EV médio', 'EBIT/EV', 'average', formatPercent],
      ['EV/EBIT mediano', 'EV/EBIT', 'median', formatMultiple],
    ],
    hiddenColumns: ['DY Médio 5 Anos', 'Payout', 'Anos com Dividendos', 'ROCE', 'Dívida Líquida/EBITDA'],
  },

  dividendos: {
    id: 'dividendos',
    label: 'Dividendos sustentáveis',
    lede: 'Ações da B3 com lucro em todos os últimos 5 anos, dividendos acima de 6% no último ano e de 5% na média de 5 anos (sem depender de pagamentos extraordinários), payout de até 120% e dívida sob controle, da mais barata para a mais cara.',
    criteria: [
      ['Liquidez', 'mais de R$ 1 milhão negociado por dia, em média, nos últimos 3 meses'],
      ['Dividendos', 'dividend yield acima de 6% nos últimos 12 meses e acima de 5% na média dos últimos 5 anos, o que deixa de fora dividendos extraordinários'],
      ['Regularidade', 'proventos pagos em pelo menos 3 dos últimos 5 anos'],
      ['Payout', 'a empresa distribui no máximo 120% do lucro dos últimos 12 meses; a folga acima de 100% cobre dividendos pagos agora sobre o lucro do ano anterior'],
      ['Lucro', 'lucro em todos os últimos balanços anuais (pelo menos 3) e nos últimos 12 meses, com margem EBIT positiva'],
      ['Endividamento', 'dívida líquida menor que 3 vezes o EBIT, ou 4,5 vezes em Energia e saneamento, setores de receita regulada que operam naturalmente mais alavancados'],
      ['Preço teto de Bazin', 'dividendo médio por ação dos últimos 5 anos ÷ 6%, o rendimento mínimo que Décio Bazin exigia. Abaixo dele, os dividendos médios rendem mais de 6% ao ano sobre o preço pago. Use o filtro "Só abaixo do preço teto de Bazin" para ver apenas essas ações'],
    ],
    tag: {
      priceField: 'EV/EBIT',
      priceLabel: 'EV/EBIT',
      format: formatMultiple,
      lines: stock => [
        ['Dividend yield de', formatPercent(stock['Dividend Yield'])],
        ['Preço teto Bazin:', formatCurrency(stock['Preço Teto Bazin'])],
      ],
    },
    summary: [
      ['dividend yield médio', 'Dividend Yield', 'average', formatPercent],
      ['EV/EBIT mediano', 'EV/EBIT', 'median', formatMultiple],
    ],
    hiddenColumns: ['ROCE', 'Dívida Líquida/EBITDA', 'EBIT/EV'],
    shownColumns: ['Preço Teto Bazin', 'Desconto Bazin'],
    bazinFilter: true,
  },

  qualidade: {
    id: 'qualidade',
    label: 'Qualidade a bom preço',
    lede: 'Empresas muito rentáveis (ROCE acima de 15%), com lucro estável, pouca dívida (menos de 1,5 ano de EBITDA) e negociadas a no máximo 15 vezes o lucro: negócios excelentes, financeiramente sólidos e com desconto.',
    criteria: [
      ['Liquidez', 'mais de R$ 1 milhão negociado por dia, em média, nos últimos 3 meses'],
      ['Rentabilidade', 'ROCE acima de 15%: EBIT dos últimos 12 meses dividido pelo capital empregado médio (patrimônio líquido + passivo não circulante, média entre o último balanço e o do fim do ano anterior)'],
      ['Endividamento', 'dívida líquida menor que 1,5 vez o EBITDA dos últimos 12 meses; caixa líquido (dívida negativa) é ainda melhor'],
      ['Lucro estável', 'lucro em todos os últimos balanços anuais (pelo menos 3), variando até 50% em torno da média. Sem essa regra, a lista comprava empresas cíclicas (siderurgia, mineração) no pico do lucro, quando o ROCE é alto e o P/L baixo logo antes de o lucro cair; no backtest de 2014 até hoje, a regra levou a estratégia de abaixo para acima do CDI'],
      ['Preço', 'P/L entre 0 e 15, cerca de 25% de desconto sobre um múltiplo de mercado de 20 vezes, usando um múltiplo histórico como referência de compra em vez de projeções otimistas'],
    ],
    tag: {
      priceField: 'P/L',
      priceLabel: 'P/L',
      format: formatMultiple,
      lines: stock => [
        ['ROCE de', formatPercent(stock.ROCE)],
        ['Dív. líq./EBITDA:', formatMultiple(stock['Dívida Líquida/EBITDA'])],
      ],
    },
    summary: [
      ['ROCE médio', 'ROCE', 'average', formatPercent],
      ['P/L mediano', 'P/L', 'median', formatMultiple],
    ],
    hiddenColumns: ['DY Médio 5 Anos', 'Payout', 'Anos com Dividendos', 'Dívida Líquida/EBIT', 'EBIT/EV'],
  },

  valorIntrinseco: {
    id: 'valorIntrinseco',
    label: 'Valor intrínseco',
    lede: 'O preço teto de cada ação por um fluxo de caixa descontado simplificado (um ano de projeção e perpetuidade), comparado com a cotação: da maior para a menor margem de segurança.',
    criteria: [
      ['Liquidez', 'mais de R$ 1 milhão negociado por dia, em média, nos últimos 3 meses'],
      ['Lucro previsível', 'o método só vale para lucros estáveis: lucro em todos os últimos balanços anuais (pelo menos 3), variação moderada entre os anos (desvio de até 50% da média) e lucro dos últimos 12 meses entre metade e o dobro da média anual'],
      ['Fluxo de caixa', 'lucro líquido dos últimos 12 meses, como fluxo de caixa do acionista, projetado um ano à frente: × (1 + crescimento)'],
      ['Crescimento', 'ROE médio dos últimos anos × (1 − payout médio): o lucro retido e reinvestido é o que faz o lucro crescer'],
      ['Taxa de desconto', 'retorno exigido (Tesouro IPCA+ com juros semestrais de cerca de 10 anos + IPCA esperado pelo Boletim Focus para os próximos 12 meses) menos 3% de crescimento na perpetuidade'],
      ['Valor intrínseco', 'fluxo de caixa do próximo ano ÷ taxa de desconto (perpetuidade com crescimento, como no modelo de Gordon), dividido pelo número de ações; em units e em empresas com ON e PN, proporcional ao preço de cada ativo'],
      ['Preço teto', 'valor intrínseco menos uma margem de segurança que depende da previsibilidade do lucro: 20% quando o lucro anual varia até 15% em torno da média, 30% até 30% e 40% acima disso. Abaixo dele, a ação está barata com folga; em verde na tabela'],
      ['Desconto', '(valor intrínseco − cotação) ÷ valor intrínseco. Empresas excelentes e previsíveis pedem menos margem de segurança; as mais arriscadas, bem mais. É uma aproximação: mudanças no ROE, no payout, nos juros ou no crescimento alteram bastante o resultado'],
      ['Bancos e seguradoras', 'entram, porque o método usa o lucro líquido e não o EBIT'],
    ],
    excludeCommon: ['Bancos', 'Ordenação'],
    tag: {
      priceField: 'Desconto',
      priceLabel: 'Desconto',
      format: formatPercent,
      lines: stock => [
        ['Valor intrínseco de', formatCurrency(stock['Valor Intrínseco'])],
        ['Preço teto:', formatCurrency(stock['Preço Teto'])],
      ],
    },
    summary: [
      ['desconto mediano', 'Desconto', 'median', formatPercent],
      ['crescimento esperado médio', 'Crescimento Esperado', 'average', formatPercent],
    ],
    visibleColumns: ['Ranking', 'Ativo', 'Cotação', 'Valor Intrínseco', 'Preço Teto', 'Desconto'],
    columnLabels: { 'Cotação': 'Valor atual' },
    hideSort: true,
    showAssumptions: true,
    hiddenColumns: [],
  },
};

// Criteria that apply to every strategy.
export const COMMON_CRITERIA = [
  ['Situação', 'ficam de fora as empresas em recuperação judicial ou extrajudicial, falência ou liquidação, segundo o cadastro da CVM'],
  ['Bancos', 'bancos e seguradoras que publicam balanço no formato de instituição financeira não têm EBIT nem EBITDA, por isso não aparecem em nenhuma lista; holdings financeiras com balanço no formato comum (como Itaúsa) podem aparecer em Dividendos sustentáveis e Qualidade a bom preço'],
  ['Setores', 'os setores de atividade informados à CVM são agrupados em 6: Energia e saneamento, Commodities, Construção e imóveis, Financeiro, Consumo e Indústria e serviços'],
  ['Ordenação', 'do maior para o menor EBIT/EV (o mesmo que do menor para o maior EV/EBIT), ou pela Fórmula Mágica, que soma a posição no EBIT/EV (mais barata) com a posição no ROIC (melhor negócio); uma ação por empresa, a mais negociada'],
];

export const DEFAULT_STRATEGY = 'deepValue';

// The backtest tab is a view of its own, after the strategies.
export const BACKTEST_VIEW = {
  id: 'backtest',
  label: 'Backtest',
  lede: 'Quanto teriam rendido as 20 primeiras de cada estratégia (10 em Dividendos) desde 2014, comparadas com o CDI e o Ibovespa, recalculando os rankings só com o que era público em cada data.',
};

export function viewFromHash(hash) {
  const id = String(hash || '').replace(/^#/, '');
  return id === BACKTEST_VIEW.id ? id : strategyFromHash(hash);
}

export function strategyFromHash(hash) {
  const id = String(hash || '').replace(/^#/, '');
  return STRATEGIES[id] ? id : DEFAULT_STRATEGY;
}
