export function getLumaClass(hex, classForLightBg, classForDarkBg) {
  if (!hex) return classForDarkBg;

  const cleanHex = hex.replace('#', '');

  if (cleanHex.length === 3) {
    const [r, g, b] = cleanHex.split('');
    const rFull = parseInt(r + r, 16);
    const gFull = parseInt(g + g, 16);
    const bFull = parseInt(b + b, 16);
    const luma = (0.299 * rFull + 0.587 * gFull + 0.114 * bFull) / 255;
    return luma > 0.5 ? classForLightBg : classForDarkBg;
  }

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return classForDarkBg;
  }

  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.5 ? classForLightBg : classForDarkBg;
}
