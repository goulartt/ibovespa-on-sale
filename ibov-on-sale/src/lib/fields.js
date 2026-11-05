// Metadata for every field returned by the API: label, explanation (column tooltip) and format.
// `format` is one of: rank, ticker, text, currency, percent, multiple, compactCurrency, date.
// `hidden` columns start hidden but can be enabled in the "Colunas" menu.
export const FIELDS = [
  {
    field: 'Ranking',
    label: '#',
    format: 'rank',
    width: 64,
    description: 'Posição no ranking. As ações são ordenadas do menor para o maior EV/EBIT, ou seja, da mais barata para a mais cara.',
  },
  {
    field: 'Ativo',
    label: 'Ativo',
    format: 'ticker',
    width: 230,
    description: 'Código de negociação na B3 e nome da empresa. Quando a empresa tem mais de uma classe de ação, aparece a mais negociada.',
  },
  {
    field: 'Empresa',
    label: 'Empresa',
    format: 'text',
    width: 260,
    hidden: true,
    description: 'Razão social da companhia, conforme o cadastro na CVM.',
  },
  {
    field: 'Cotação',
    label: 'Cotação',
    format: 'currency',
    description: 'Último preço de fechamento da ação, em reais.',
  },
  {
    field: 'Dividend Yield',
    label: 'Div. Yield',
    format: 'percent',
    highlight: 'dividend',
    description: 'Dividendos e JCP pagos nos últimos 12 meses divididos pela cotação atual. Indica o retorno em proventos de quem compra hoje. Pode incluir pagamentos extraordinários.',
  },
  {
    field: 'EV/EBIT',
    label: 'EV/EBIT',
    format: 'multiple',
    description: 'Valor da firma (valor de mercado + dívida líquida) dividido pelo EBIT dos últimos 12 meses. Quanto menor, mais barata a empresa considerando também o endividamento. É o critério de ordenação do ranking.',
  },
  {
    field: 'P/L',
    label: 'P/L',
    format: 'multiple',
    description: 'Preço sobre Lucro: valor de mercado dividido pelo lucro líquido dos últimos 12 meses. Representa em quantos anos o lucro atual "pagaria" a empresa.',
  },
  {
    field: 'P/VP',
    label: 'P/VP',
    format: 'multiple',
    description: 'Preço sobre Valor Patrimonial: valor de mercado dividido pelo patrimônio líquido. Abaixo de 1, a ação negocia por menos que o seu valor contábil.',
  },
  {
    field: 'PSR',
    label: 'PSR',
    format: 'multiple',
    hidden: true,
    description: 'Price Sales Ratio: valor de mercado dividido pela receita líquida dos últimos 12 meses.',
  },
  {
    field: 'P/EBIT',
    label: 'P/EBIT',
    format: 'multiple',
    hidden: true,
    description: 'Valor de mercado dividido pelo EBIT (lucro operacional) dos últimos 12 meses.',
  },
  {
    field: 'Margem Ebit',
    label: 'Marg. EBIT',
    format: 'percent',
    signed: true,
    description: 'EBIT dividido pela receita líquida. Mostra quanto de cada real vendido vira lucro operacional.',
  },
  {
    field: 'Margem Líquida',
    label: 'Marg. Líquida',
    format: 'percent',
    signed: true,
    description: 'Lucro líquido dividido pela receita líquida, nos últimos 12 meses.',
  },
  {
    field: 'ROE',
    label: 'ROE',
    format: 'percent',
    signed: true,
    description: 'Retorno sobre o Patrimônio: lucro líquido dos últimos 12 meses dividido pelo patrimônio líquido. Mede a rentabilidade do capital dos acionistas.',
  },
  {
    field: 'Dívida Líquida/Patrimônio',
    label: 'Dív. Líq./PL',
    format: 'multiple',
    width: 130,
    description: 'Dívida líquida (empréstimos menos caixa) dividida pelo patrimônio líquido. Valores negativos indicam mais caixa do que dívida.',
  },
  {
    field: 'Dívida Líquida/EBIT',
    label: 'Dív. Líq./EBIT',
    format: 'multiple',
    width: 130,
    description: 'Dívida líquida dividida pelo EBIT dos últimos 12 meses: em quantos anos o lucro operacional quitaria a dívida. Valores negativos indicam caixa líquido.',
  },
  {
    field: 'Liquidez Média Diária',
    label: 'Liquidez Diária',
    format: 'compactCurrency',
    width: 140,
    description: 'Volume financeiro médio negociado por dia nos últimos 3 meses. Quanto maior, mais fácil comprar e vender a ação.',
  },
  {
    field: 'Tendência',
    label: 'vs. MM200',
    format: 'percent',
    signed: true,
    trend: true,
    width: 120,
    description: 'Distância da cotação para a média móvel de 200 pregões. Positivo: a ação está acima da média (tendência de alta). Negativo: abaixo da média.',
  },
  {
    field: 'MA5',
    label: 'MM5',
    format: 'currency',
    hidden: true,
    description: 'Média móvel simples dos preços de fechamento dos últimos 5 pregões (uma semana).',
  },
  {
    field: 'MA10',
    label: 'MM10',
    format: 'currency',
    hidden: true,
    description: 'Média móvel simples dos preços de fechamento dos últimos 10 pregões (duas semanas).',
  },
  {
    field: 'MA20',
    label: 'MM20',
    format: 'currency',
    hidden: true,
    description: 'Média móvel simples dos preços de fechamento dos últimos 20 pregões (cerca de um mês).',
  },
  {
    field: 'MMA50',
    label: 'MM50',
    format: 'currency',
    description: 'Média móvel simples dos preços de fechamento dos últimos 50 pregões (cerca de dois meses e meio).',
  },
  {
    field: 'MA100',
    label: 'MM100',
    format: 'currency',
    hidden: true,
    description: 'Média móvel simples dos preços de fechamento dos últimos 100 pregões (cerca de cinco meses).',
  },
  {
    field: 'MA200',
    label: 'MM200',
    format: 'currency',
    description: 'Média móvel simples dos preços de fechamento dos últimos 200 pregões (cerca de dez meses). Muito usada para identificar a tendência de longo prazo.',
  },
  {
    field: 'Data Balanço',
    label: 'Balanço',
    format: 'date',
    width: 110,
    description: 'Data do último demonstrativo financeiro (trimestral ou anual) enviado à CVM e usado nos indicadores.',
  },
];

// Derived values not sent by the API.
export function withDerivedFields(stock) {
  const price = stock['Cotação'];
  const ma200 = stock.MA200;
  const trend = typeof price === 'number' && typeof ma200 === 'number' && ma200 > 0 ? (price / ma200 - 1) * 100 : null;
  return { ...stock, 'Tendência': trend };
}
