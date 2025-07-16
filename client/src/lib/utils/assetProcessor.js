export async function getDimensions(logo) {
  const extension = logo.extension || logo.url.split('.').pop() || 'svg';

  if (extension === 'svg') {
    try {
      let response = await fetch(logo.url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const svgText = await response.text();
      const viewBoxMatch = svgText.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      if (viewBoxMatch) {
        const width = parseFloat(viewBoxMatch[1]);
        const height = parseFloat(viewBoxMatch[2]);
        return { width, height };
      } else {
        console.warn(
          `SVG ${logo.url} has no viewBox. Returning default dimensions.`,
        );
        return { width: 400, height: 300 };
      }
    } catch (error) {
      console.error('Error loading SVG dimensions or viewBox:', error);
      return { width: 400, height: 300 };
    }
  } else if (['png', 'jpg'].includes(extension)) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = (e) => {
        console.error(`Failed to load raster image: ${logo.url}`, e);
        resolve({ width: 400, height: 300 });
      };
      img.src = logo.url;
    });
  } else {
    console.warn(
      `Unsupported logo extension: ${extension}. Returning default dimensions.`,
    );
    return { width: 400, height: 300 };
  }
}

export function extractInnerSvg(svgText) {
  const svgTagRegex = /<svg[^>]*>([\s\S]*)<\/svg>/;
  const match = svgText.match(svgTagRegex);
  return match ? match[1].trim() : '';
}

export async function svgToPng(svgString, width, height) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    };
    img.onerror = (e) => {
      console.error('Failed to convert SVG to PNG:', e);
      resolve(null);
    };
    img.src =
      'data:image/svg+xml;base64,' +
      btoa(unescape(encodeURIComponent(svgString)));
  });
}
