export function positive(value, label = 'El valor') {
  const number = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} debe ser mayor que cero.`);
  return number;
}

export function correctionScale(expectedValue, measuredXValue, measuredYValue) {
  const expected = positive(expectedValue, 'La medida esperada');
  const measuredX = positive(measuredXValue, 'La medida horizontal impresa');
  const measuredY = positive(measuredYValue, 'La medida vertical impresa');
  const xPercent = expected / measuredX * 100;
  const yPercent = expected / measuredY * 100;
  if (xPercent < 80 || xPercent > 120 || yPercent < 80 || yPercent > 120) {
    throw new Error('La diferencia supera el 20 %. Revisa que la impresión esté configurada al 100 % y vuelve a medir.');
  }
  return { xPercent, yPercent, xFactor: xPercent / 100, yFactor: yPercent / 100 };
}

export function labelGrid({ pageWidth, pageHeight, marginX, marginY, labelWidth, labelHeight, gapX = 0, gapY = 0 }) {
  const width = positive(pageWidth, 'El ancho del papel');
  const height = positive(pageHeight, 'El alto del papel');
  const horizontalMargin = Math.max(0, Number(marginX) || 0);
  const verticalMargin = Math.max(0, Number(marginY) || 0);
  const itemWidth = positive(labelWidth, 'El ancho de etiqueta');
  const itemHeight = positive(labelHeight, 'El alto de etiqueta');
  const horizontalGap = Math.max(0, Number(gapX) || 0);
  const verticalGap = Math.max(0, Number(gapY) || 0);
  const availableWidth = width - horizontalMargin * 2;
  const availableHeight = height - verticalMargin * 2;
  const columns = Math.floor((availableWidth + horizontalGap) / (itemWidth + horizontalGap));
  const rows = Math.floor((availableHeight + verticalGap) / (itemHeight + verticalGap));
  if (columns < 1 || rows < 1) throw new Error('No cabe ninguna etiqueta con estas medidas y márgenes.');
  const usedWidth = columns * itemWidth + (columns - 1) * horizontalGap;
  const usedHeight = rows * itemHeight + (rows - 1) * verticalGap;
  return {
    columns, rows, total: columns * rows, usedWidth, usedHeight,
    startX: horizontalMargin + (availableWidth - usedWidth) / 2,
    startY: verticalMargin + (availableHeight - usedHeight) / 2
  };
}

export function correctedSize(widthValue, heightValue, xPercentValue = 100, yPercentValue = 100) {
  const width = positive(widthValue, 'El ancho final');
  const height = positive(heightValue, 'El alto final');
  const xPercent = positive(xPercentValue, 'La corrección horizontal');
  const yPercent = positive(yPercentValue, 'La corrección vertical');
  if (xPercent < 80 || xPercent > 120 || yPercent < 80 || yPercent > 120) throw new Error('La corrección debe estar entre 80 % y 120 %.');
  return { widthMm: width * xPercent / 100, heightMm: height * yPercent / 100, targetWidth: width, targetHeight: height };
}
