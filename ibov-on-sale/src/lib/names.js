const LOWER = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em']);
const KEEP = new Set(['S.A.', 'S/A', 'SA', 'S.A', 'LTDA']);

// "ALLIED TECNOLOGIA S.A." => "Allied Tecnologia"; registry names are all caps.
export function companyName(name) {
  if (!name) return '';
  const words = name.trim().split(/\s+/).filter(w => !KEEP.has(w.toUpperCase()));
  return words
    .map((word, i) => {
      const lower = word.toLocaleLowerCase('pt-BR');
      if (i > 0 && LOWER.has(lower)) return lower;
      if (/^[A-Z0-9&]{2,4}$/.test(word) && !/[AEIOU]/.test(word)) return word; // acronyms like "BRF", "CPFL"
      return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
    })
    .join(' ')
    .replace(/\s*-\s*$/, '');
}
