import test from 'node:test';
import assert from 'node:assert/strict';
import { correctedSize, correctionScale, labelGrid } from '../../src/js/math/print.js';

test('calcula la corrección de una impresión reducida', () => {
  const result = correctionScale(100, 98, 99);
  assert.equal(Number(result.xPercent.toFixed(3)), 102.041);
  assert.equal(Number(result.yPercent.toFixed(3)), 101.01);
});

test('distribuye etiquetas dentro de un A4', () => {
  const result = labelGrid({ pageWidth: 210, pageHeight: 297, marginX: 10, marginY: 10, labelWidth: 50, labelHeight: 30, gapX: 5, gapY: 5 });
  assert.equal(result.columns, 3);
  assert.equal(result.rows, 8);
  assert.equal(result.total, 24);
  assert.equal(result.startX, 25);
});

test('aplica correcciones independientes a un rectángulo', () => {
  assert.deepEqual(correctedSize(50, 80, 102, 99), { widthMm: 51, heightMm: 79.2, targetWidth: 50, targetHeight: 80 });
});

test('rechaza configuraciones que no caben o escalas extremas', () => {
  assert.throws(() => labelGrid({ pageWidth: 210, pageHeight: 297, marginX: 20, marginY: 20, labelWidth: 300, labelHeight: 20 }));
  assert.throws(() => correctionScale(100, 50, 100));
});
