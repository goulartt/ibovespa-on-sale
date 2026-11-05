import { companyName } from './names';

test.each([
  ['ALLIED TECNOLOGIA S.A.', 'Allied Tecnologia'],
  ['CONSTRUTORA TENDA S.A.', 'Construtora Tenda'],
  ['EMPREENDIMENTOS PAGUE MENOS S.A.', 'Empreendimentos Pague Menos'],
  ['BANCO DO BRASIL S.A.', 'Banco do Brasil'],
  ['CPFL ENERGIA S.A.', 'CPFL Energia'],
  ['Plano & Plano Desenvolvimento Imobiliário S.A.', 'Plano & Plano Desenvolvimento Imobiliário'],
  ['', ''],
  [undefined, ''],
])('companyName(%p) = %p', (input, expected) => {
  expect(companyName(input)).toBe(expected);
});
