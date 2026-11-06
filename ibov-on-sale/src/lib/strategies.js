import { formatMultiple, formatPercent } from './format';

// The rankings offered by the API (GET /api/ibovespa/filtered?strategy=...).
export const STRATEGIES = {
  deepValue: {
    id: 'deepValue',
    label: 'Deep Value',
    lede: 'As ações mais baratas da bolsa pelo lucro operacional: quanto maior o EBIT em relação ao valor da empresa (EBIT/EV), mais barata. Só com filtros básicos, para uma carteira diversificada de cerca de 20 ações e visão de longo prazo.',
    criteria: [
      ['Liquidez', 'mais de R$ 1 milhão negociado por dia, em média, nos últimos 3 meses'],
      ['Lucro operacional', 'EBIT positivo nos últimos 12 meses'],
      ['Atenção', 'o ranking é automático: antes de comprar, confira nos balanços (veja a coluna "Lucro 5 anos") se o EBIT não foi inflado por eventos não recorrentes, como venda de ativos. A estratégia pede cerca de 20 ações ao mesmo tempo, porque pode ter anos ruins'],
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
    lede: 'Ações da B3 com lucro em todos os últimos 5 anos, dividendos acima de 6% ao ano sem depender de pagamentos extraordinários, payout de até 100% e dívida sob controle, da mais barata para a mais cara.',
    criteria: [
      ['Liquidez', 'mais de R$ 1 milhão negociado por dia, em média, nos últimos 3 meses'],
      ['Dividendos', 'dividend yield acima de 6% tanto nos últimos 12 meses quanto na média dos últimos 5 anos, o que deixa de fora dividendos extraordinários'],
      ['Regularidade', 'proventos pagos em pelo menos 3 dos últimos 5 anos'],
      ['Payout', 'a empresa distribui no máximo 100% do lucro, ou seja, não paga mais do que ganha'],
      ['Lucro', 'lucro em todos os últimos balanços anuais (pelo menos 3) e nos últimos 12 meses, com margem EBIT positiva'],
      ['Endividamento', 'dívida líquida menor que 3 vezes o EBIT'],
    ],
    tag: {
      priceField: 'EV/EBIT',
      priceLabel: 'EV/EBIT',
      format: formatMultiple,
      lines: stock => [
        ['Dividend yield de', formatPercent(stock['Dividend Yield'])],
        ['Média de 5 anos:', formatPercent(stock['DY Médio 5 Anos'])],
      ],
    },
    summary: [
      ['dividend yield médio', 'Dividend Yield', 'average', formatPercent],
      ['EV/EBIT mediano', 'EV/EBIT', 'median', formatMultiple],
    ],
    hiddenColumns: ['ROCE', 'Dívida Líquida/EBITDA', 'EBIT/EV'],
  },

  qualidade: {
    id: 'qualidade',
    label: 'Qualidade a bom preço',
    lede: 'Empresas muito rentáveis (ROCE acima de 15%), com pouca dívida (menos de 1 ano de EBITDA) e negociadas a no máximo 10 vezes o lucro: negócios excelentes, financeiramente sólidos e com desconto.',
    criteria: [
      ['Liquidez', 'mais de R$ 1 milhão negociado por dia, em média, nos últimos 3 meses'],
      ['Rentabilidade', 'ROCE acima de 15%: EBIT dos últimos 12 meses dividido pelo capital empregado médio (patrimônio líquido + passivo não circulante, média entre o último balanço e o do fim do ano anterior)'],
      ['Endividamento', 'dívida líquida menor que 1 vez o EBITDA dos últimos 12 meses; caixa líquido (dívida negativa) é ainda melhor'],
      ['Preço', 'P/L entre 0 e 10, usando um múltiplo histórico como referência de compra em vez de projeções otimistas'],
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
};

// Criteria that apply to every strategy.
export const COMMON_CRITERIA = [
  ['Situação', 'ficam de fora as empresas em recuperação judicial ou extrajudicial, falência ou liquidação, segundo o cadastro da CVM'],
  ['Instituições financeiras', 'bancos, seguradoras e holdings financeiras ficam fora de todas as listas, porque EBIT e EV não se aplicam a elas'],
  ['Setores', 'os setores de atividade informados à CVM são agrupados em 6: Energia e saneamento, Commodities, Construção e imóveis, Financeiro, Consumo e Indústria e serviços'],
  ['Ordenação', 'do maior para o menor EBIT/EV (o mesmo que do menor para o maior EV/EBIT), ou pela Fórmula Mágica, que soma a posição no EBIT/EV (mais barata) com a posição no ROIC (melhor negócio); uma ação por empresa, a mais negociada'],
];

export const DEFAULT_STRATEGY = 'deepValue';

export function strategyFromHash(hash) {
  const id = String(hash || '').replace(/^#/, '');
  return STRATEGIES[id] ? id : DEFAULT_STRATEGY;
}
