import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages } from '../src/pages/pages.mjs';
import { renderPage } from '../src/templates/site.mjs';
import { site } from '../site.config.mjs';
import { applyAnalyticsConsent } from './analytics-consent.mjs';
import { applyShareableCalculations } from './shareable-calculations.mjs';
import { applyCalculationExplanations } from './calculation-explanations.mjs';

const verificationTag = '<meta name="google-site-verification" content="EwTiLP4eMZK5K7W9U_5tpM7cvJsn4ZaLvRwKYrmuuV0">';
const shareableForms = ['pixels-form', 'calibration-form', 'exact-form', 'labels-form'];
const explanations = {
  'pixels-form': {
    formula: 'tamaño físico (cm) = píxeles ÷ ppp × 2,54; píxeles = tamaño (cm) ÷ 2,54 × ppp',
    formulaSwitch: {
      field: 'direction',
      values: {
        'pixels-to-size': 'tamaño físico (cm) = píxeles ÷ ppp × 2,54',
        'size-to-pixels': 'píxeles = tamaño físico (cm) ÷ 2,54 × ppp, redondeado al píxel entero'
      }
    },
    fields: [['width', 'Ancho'], ['height', 'Alto'], ['dpi', 'Resolución', 'ppp']],
    note: 'La conversión usa 1 pulgada = 2,54 cm; el diálogo de impresión aún puede aplicar un escalado adicional.'
  },
  'calibration-form': {
    formula: 'corrección horizontal (%) = medida esperada ÷ medida impresa horizontal × 100; corrección vertical (%) = medida esperada ÷ medida impresa vertical × 100',
    fields: [['expected', 'Medida esperada', 'mm'], ['measuredX', 'Medida horizontal obtenida', 'mm'], ['measuredY', 'Medida vertical obtenida', 'mm']],
    note: 'Una corrección superior al 100 % agranda ese eje; una inferior al 100 % lo reduce.'
  },
  'exact-form': {
    formula: 'medida generada = medida final objetivo × porcentaje de corrección ÷ 100',
    fields: [['width', 'Ancho final objetivo', 'mm'], ['height', 'Alto final objetivo', 'mm'], ['xPercent', 'Corrección horizontal', '%'], ['yPercent', 'Corrección vertical', '%']],
    note: 'La plantilla se dibuja con la medida corregida para compensar el error medido de la impresora.'
  },
  'labels-form': {
    formula: 'columnas = suelo((ancho útil + separación X) ÷ (ancho etiqueta + separación X)); filas = suelo((alto útil + separación Y) ÷ (alto etiqueta + separación Y)); total = columnas × filas',
    fields: [['marginX', 'Margen horizontal', 'mm'], ['marginY', 'Margen vertical', 'mm'], ['labelWidth', 'Ancho de etiqueta', 'mm'], ['labelHeight', 'Alto de etiqueta', 'mm'], ['gapX', 'Separación horizontal', 'mm'], ['gapY', 'Separación vertical', 'mm']],
    note: 'El sobrante se reparte para centrar la retícula dentro del área útil del papel.'
  }
};
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'assets'), { recursive: true });
await cp(path.join(root, 'src/js'), path.join(dist, 'assets'), { recursive: true });
await cp(path.join(root, 'src/styles/site.css'), path.join(dist, 'assets/site.css'));
await cp(path.join(root, 'src/assets/favicon.svg'), path.join(dist, 'assets/favicon.svg'));

for (const page of pages) {
  const destination = page.output
    ? path.join(dist, page.output)
    : page.path ? path.join(dist, page.path, 'index.html') : path.join(dist, 'index.html');
  await mkdir(path.dirname(destination), { recursive: true });
  let html = applyAnalyticsConsent(renderPage(page), {
    measurementId: 'G-2TZX3SNZCL',
    storageKey: 'im:v1:analytics-consent'
  });
  html = applyShareableCalculations(html, shareableForms);
  html = applyCalculationExplanations(html, explanations);
  if (page.path === '') html = html.replace('<head>', `<head>\n  ${verificationTag}`);
  await writeFile(destination, html, 'utf8');
}

const urls = pages.filter((page) => !page.noindex && page.path !== '404')
  .map((page) => `  <url><loc>${site.origin}${site.basePath}${page.path ? `${page.path}/` : ''}</loc></url>`)
  .join('\n');
await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, 'utf8');
await writeFile(path.join(dist, '.nojekyll'), '', 'utf8');
console.log(`Built ${pages.length} pages in dist/`);
