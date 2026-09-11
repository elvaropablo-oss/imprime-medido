import { correctedSize, correctionScale, labelGrid } from './math/print.js';

const read = (form, name) => form.elements[name].value;
const fmt = (value, digits = 2) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: digits }).format(value);
const show = (element, html) => { element.innerHTML = html; element.hidden = false; element.focus(); };
const fail = (form, reason) => {
  const error = form.querySelector('[data-error]');
  error.textContent = reason.message;
  error.hidden = false;
  error.focus();
};
const save = (value) => { try { localStorage.setItem('im:v1:settings', JSON.stringify(value)); } catch {} };

document.querySelector('#calibration-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  try {
    const result = correctionScale(read(form, 'expected'), read(form, 'measuredX'), read(form, 'measuredY'));
    show(document.querySelector('#calibration-result'), `<p class="metric-label">Corrección calculada</p><h2>${fmt(result.xPercent, 3)} % horizontal<br>${fmt(result.yPercent, 3)} % vertical</h2><p>Guarda estos porcentajes para las otras herramientas. Antes, confirma que el diálogo de impresión estaba en “Tamaño real” o 100 %.</p><a class="button" href="../imprimir-medida-exacta/?x=${encodeURIComponent(result.xPercent)}&y=${encodeURIComponent(result.yPercent)}">Aplicar a una medida</a>`);
    save({ type: 'calibration', ...result, savedAt: new Date().toISOString() });
  } catch (reason) { fail(form, reason); }
});

const exactForm = document.querySelector('#exact-form');
if (exactForm) {
  const params = new URLSearchParams(location.search);
  if (params.has('x')) exactForm.elements.xPercent.value = params.get('x');
  if (params.has('y')) exactForm.elements.yPercent.value = params.get('y');
  exactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      const result = correctedSize(read(exactForm, 'width'), read(exactForm, 'height'), read(exactForm, 'xPercent'), read(exactForm, 'yPercent'));
      const box = document.querySelector('#exact-box');
      box.style.width = `${result.widthMm}mm`;
      box.style.height = `${result.heightMm}mm`;
      box.innerHTML = `<strong>${fmt(result.targetWidth)} × ${fmt(result.targetHeight)} mm finales</strong><span>Caja generada: ${fmt(result.widthMm)} × ${fmt(result.heightMm)} mm</span>`;
      document.querySelector('#exact-sheet').hidden = false;
      show(document.querySelector('#exact-result'), `<p class="metric-label">Preparado para imprimir</p><h2>${fmt(result.targetWidth)} × ${fmt(result.targetHeight)} mm</h2><p>La caja del documento mide ${fmt(result.widthMm)} × ${fmt(result.heightMm)} mm tras aplicar la corrección.</p><button class="button" type="button" data-print>Imprimir plantilla</button>`);
      save({ type: 'exact', ...result, savedAt: new Date().toISOString() });
    } catch (reason) { fail(exactForm, reason); }
  });
}

const labelsForm = document.querySelector('#labels-form');
labelsForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    const paper = labelsForm.elements.paper.value === 'letter' ? { width: 215.9, height: 279.4, css: 'Letter' } : { width: 210, height: 297, css: 'A4' };
    const config = {
      pageWidth: paper.width, pageHeight: paper.height,
      marginX: read(labelsForm, 'marginX'), marginY: read(labelsForm, 'marginY'),
      labelWidth: read(labelsForm, 'labelWidth'), labelHeight: read(labelsForm, 'labelHeight'),
      gapX: read(labelsForm, 'gapX'), gapY: read(labelsForm, 'gapY')
    };
    const result = labelGrid(config);
    const content = read(labelsForm, 'content').trim() || 'Etiqueta';
    const sheet = document.querySelector('#label-sheet');
    sheet.style.cssText = `width:${paper.width}mm;height:${paper.height}mm;padding:${result.startY}mm ${result.startX}mm;grid-template-columns:repeat(${result.columns},${Number(config.labelWidth)}mm);grid-template-rows:repeat(${result.rows},${Number(config.labelHeight)}mm);column-gap:${Number(config.gapX)}mm;row-gap:${Number(config.gapY)}mm`;
    sheet.innerHTML = Array.from({ length: result.total }, () => `<div class="print-label">${escapeHtml(content)}</div>`).join('');
    sheet.hidden = false;
    document.querySelector('#page-style').textContent = `@page { size: ${paper.css}; margin: 0; }`;
    show(document.querySelector('#labels-result'), `<p class="metric-label">Hoja calculada</p><h2>${result.total} etiquetas</h2><p>${result.columns} columnas × ${result.rows} filas. Inicio a ${fmt(result.startX)} mm del borde izquierdo y ${fmt(result.startY)} mm del superior.</p><button class="button" type="button" data-print>Imprimir hoja</button>`);
    save({ type: 'labels', ...config, ...result, content, savedAt: new Date().toISOString() });
  } catch (reason) { fail(labelsForm, reason); }
});

document.addEventListener('click', (event) => { if (event.target.matches('[data-print]')) window.print(); });

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
