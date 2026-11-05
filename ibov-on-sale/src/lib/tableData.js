// Client-side search, sort, pagination and CSV export for the stocks table.
// The table paginates here (instead of inside the DataGrid) because the free DataGrid caps pages at
// 100 rows, and we offer 150.
import { compareNullsLast, FORMATTERS } from './columns';
import { isNumber } from './format';

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 150];

const normalize = text => String(text ?? '')
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase();

// Every word must match the ticker or the company name (accent and case insensitive).
export function searchRows(rows, words = []) {
  const terms = words.map(normalize).filter(Boolean);
  if (terms.length === 0) return rows;
  return rows.filter(row => {
    const haystack = `${normalize(row.Ativo)} ${normalize(row.Empresa)}`;
    return terms.every(term => haystack.includes(term));
  });
}

// Sorts by the first sort item; missing values always go last, whatever the direction.
export function sortRows(rows, sortModel = []) {
  const [item] = sortModel;
  if (!item || !item.sort) return rows;
  const direction = item.sort === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const x = a[item.field];
    const y = b[item.field];
    if (isNumber(x) || isNumber(y)) {
      if (!isNumber(x) || !isNumber(y)) return compareNullsLast(x, y);
      return direction * (x - y);
    }
    if (x == null || x === '') return y == null || y === '' ? 0 : 1;
    if (y == null || y === '') return -1;
    return direction * String(x).localeCompare(String(y), 'pt-BR');
  });
}

export function paginate(rows, page, pageSize) {
  const lastPage = Math.max(0, Math.ceil(rows.length / pageSize) - 1);
  const safePage = Math.min(Math.max(0, page), lastPage);
  return { page: safePage, rows: rows.slice(safePage * pageSize, (safePage + 1) * pageSize) };
}

const csvCell = value => {
  const text = String(value ?? '');
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

// CSV for Excel in pt-BR: ';' separator, ',' decimals, UTF-8 with BOM. Numbers stay numeric.
export function toCsv(rows, fields) {
  const header = fields.map(f => csvCell(f.label === '#' ? 'Ranking' : f.label)).join(';');
  const lines = rows.map(row => fields.map(f => {
    const value = row[f.field];
    if (isNumber(value)) return String(value).replace('.', ',');
    const format = FORMATTERS[f.format];
    return csvCell(value == null ? '' : format && typeof value === 'object' ? format(value) : value);
  }).join(';'));
  return `\uFEFF${[header, ...lines].join('\r\n')}\r\n`;
}

export function downloadCsv(content, fileName) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
