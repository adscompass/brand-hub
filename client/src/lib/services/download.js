import JSZip from 'jszip';
import {
  convertToFormat,
  extractInnerSvg,
  svgToPng,
} from '../utils/assetProcessor';
import convert from 'color-convert';

function determineAssetsToDownload({
  selectedAssets,
  allAssets,
  customAssets,
  customPatterns,
}) {
  if (selectedAssets.length > 0) {
    return selectedAssets;
  }

  const defaultList = [];
  allAssets.logos.forEach((logo) => {
    defaultList.push({
      id: logo.id,
      formats: [logo.extension, 'png'],
      assetType: 'logo',
    });
  });
  customAssets.forEach((logo) => {
    defaultList.push({
      id: logo.id,
      formats: [logo.extension],
      assetType: 'logo',
    });
  });
  customPatterns.forEach((pattern) => {
    defaultList.push({
      id: pattern.id,
      formats: ['svg', 'png'],
      assetType: 'pattern',
    });
  });
  allAssets.videos.forEach((video) => {
    defaultList.push({
      id: video.id,
      formats: video.formats.map((f) => f.ratio),
      assetType: 'video',
    });
  });
  return defaultList;
}

async function processLogo(assetItem, { allAssets, customAssets, zipFolders }) {
  const { id, formats } = assetItem;
  const asset =
    allAssets.logos.find((a) => a.id === id) ||
    customAssets.find((a) => a.id === id);
  if (!asset) return;

  let sourceImage = null;
  let sourceSvgString = null;

  if (asset.extension === 'svg') {
    if (asset.type === 'custom') {
      const baseLogo = allAssets.logos.find((l) => l.id === asset.originalId);
      const response = await fetch(baseLogo.url);
      const originalInnerSvgText = extractInnerSvg(await response.text());
      const transform = `translate(${asset.logoX}, ${asset.logoY}) rotate(${asset.logoRotate || 0}) scale(${asset.logoScale}) translate(-${asset.originalSvgDimensions.width / 2}, -${asset.originalSvgDimensions.height / 2})`;
      sourceSvgString = `<svg width="${asset.canvasWidth}" height="${asset.canvasHeight}" viewBox="0 0 ${asset.canvasWidth} ${asset.canvasHeight}" xmlns="http://www.w3.org/2000/svg"><g transform="${transform}">${originalInnerSvgText}</g></svg>`;
    } else {
      const response = await fetch(asset.url);
      sourceSvgString = await response.text();
    }
  } else if (['png', 'jpg'].includes(asset.extension)) {
    sourceImage = new Image();
    sourceImage.src = asset.type === 'custom' ? asset.dataUrl : asset.url;
  }

  for (const format of formats) {
    try {
      let fileBlob = null;
      let filename = `${asset.id}.${format}`;
      const width = asset.canvasWidth || asset.width;
      const height = asset.canvasHeight || asset.height;

      switch (format) {
        case 'svg':
          if (sourceSvgString) {
            fileBlob = new Blob([sourceSvgString], { type: 'image/svg+xml' });
          }
          break;
        case 'png':
          if (sourceSvgString) {
            fileBlob = await convertToFormat(
              sourceSvgString,
              'png',
              width,
              height,
            );
          } else if (sourceImage) {
            fileBlob = await convertToFormat(sourceImage, 'png', width, height);
          }
          break;
        case 'jpg':
          if (sourceSvgString) {
            fileBlob = await convertToFormat(
              sourceSvgString,
              'jpeg',
              width,
              height,
            );
          } else if (sourceImage) {
            fileBlob = await convertToFormat(
              sourceImage,
              'jpeg',
              width,
              height,
            );
          }
          break;
        case 'webp':
          if (sourceSvgString) {
            fileBlob = await convertToFormat(
              sourceSvgString,
              'webp',
              width,
              height,
            );
          } else if (sourceImage) {
            fileBlob = await convertToFormat(
              sourceImage,
              'webp',
              width,
              height,
            );
          }
          break;
      }

      if (fileBlob) {
        zipFolders.logos.file(filename, fileBlob);
      } else {
        if (sourceImage && format === asset.extension) {
          const response = await fetch(sourceImage.src);
          fileBlob = await response.blob();
          zipFolders.logos.file(filename, fileBlob);
        }
      }
    } catch (error) {
      console.error(
        `Ошибка при обработке логотипа ${id} в формате ${format}:`,
        error,
      );
    }
  }
}

async function processPattern(assetItem, { customPatterns, zipFolders }) {
  const { id } = assetItem;
  const pattern = customPatterns.find((p) => p.id === id);
  if (!pattern) return;

  try {
    const response = await fetch(pattern.basePatternUrl);
    const svgTemplateText = await response.text();

    const innerSvgContent = extractInnerSvg(svgTemplateText);
    const coloredInnerSvg = innerSvgContent.replace(
      /currentColor/g,
      pattern.patternColor,
    );

    const viewBoxMatch = svgTemplateText.match(
      /viewBox="0 0 ([\d.]+) ([\d.]+)"/,
    );
    const baseWidth = viewBoxMatch ? parseFloat(viewBoxMatch[1]) : 50;
    const baseHeight = viewBoxMatch ? parseFloat(viewBoxMatch[2]) : 50;

    const tileWithBgSvg = `
            <svg 
                width="${baseWidth}" 
                height="${baseHeight}" 
                viewBox="0 0 ${baseWidth} ${baseHeight}" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect width="100%" height="100%" fill="${pattern.backgroundColor}" />
                ${coloredInnerSvg}
            </svg>`;
    zipFolders.patterns.file(
      `${pattern.id}_tile_with_bg.svg`,
      tileWithBgSvg.trim(),
    );

    const pngTileBlob = await svgToPng(tileWithBgSvg, 1024, 1024);
    if (pngTileBlob) {
      zipFolders.patterns.file(`${pattern.id}_tile.png`, pngTileBlob);
    }

    const tileTransparentSvg = `
            <svg 
                width="${baseWidth}" 
                height="${baseHeight}" 
                viewBox="0 0 ${baseWidth} ${baseHeight}" 
                xmlns="http://www.w3.org/2000/svg"
            >
                ${coloredInnerSvg}
            </svg>`;
    zipFolders.patterns.file(
      `${pattern.id}_tile_transparent.svg`,
      tileTransparentSvg.trim(),
    );

    const pngTileTransparentBlob = await svgToPng(
      tileTransparentSvg,
      1024,
      1024,
    );
    if (pngTileTransparentBlob) {
      zipFolders.patterns.file(
        `${pattern.id}_tile_transparent.png`,
        pngTileTransparentBlob,
      );
    }
  } catch (error) {
    console.error(`Ошибка при обработке паттерна ${pattern.id}:`, error);
  }
}

async function processVideo(assetItem, { allAssets, zipFolders }) {
  const { id, formats } = assetItem;
  const videoAsset = allAssets.videos.find((v) => v.id === id);
  if (!videoAsset) return;

  for (const ratio of formats) {
    const formatInfo = videoAsset.formats.find((f) => f.ratio === ratio);
    if (!formatInfo) continue;

    try {
      const response = await fetch(formatInfo.url);
      if (!response.ok)
        throw new Error(`Ошибка сети при скачивании видео: ${formatInfo.url}`);
      const blob = await response.blob();
      const filename = `${videoAsset.id}-${formatInfo.ratio}.mp4`;
      zipFolders.videos.file(filename, blob);
    } catch (error) {
      console.error(
        `Ошибка при обработке видео ${id} в формате ${ratio}:`,
        error,
      );
    }
  }
}

async function addPaletteFiles({ allAssets, zipFolders }) {
  let txtContent = 'Фирменные цвета AdsCompass\n\n';
  allAssets.colors.forEach((group) => {
    txtContent += `--- ${group.groupName} ---\n`;
    group.items.forEach((color) => {
      const hex = color.hex.toUpperCase();
      const rgb = convert.hex.rgb(hex.replace('#', '')).join(', ');
      const cmyk = convert.hex.cmyk(hex.replace('#', '')).join('%, ') + '%';
      const hsl = convert.hex.hsl(hex.replace('#', '')).join(', ');
      txtContent += `${color.name || hex}:\n`;
      txtContent += `  HEX: ${hex}\n`;
      txtContent += `  RGB: ${rgb}\n`;
      txtContent += `  CMYK: ${cmyk}\n`;
      txtContent += `  HSL: ${hsl}\n\n`;
    });
  });
  zipFolders.palettes.file('palette.txt', txtContent);
}

export async function createAndDownloadZip({
  selectedAssets,
  allAssets,
  customAssets,
  customPatterns,
}) {
  const zip = new JSZip();
  const zipFolders = {
    logos: zip.folder('logos'),
    patterns: zip.folder('patterns'),
    videos: zip.folder('videos'),
    palettes: zip.folder('palettes'),
  };

  const assetsToDownload = determineAssetsToDownload({
    selectedAssets,
    allAssets,
    customAssets,
    customPatterns,
  });

  if (assetsToDownload.length === 0) return;

  const processingPromises = [];

  processingPromises.push(addPaletteFiles({ allAssets, zipFolders }));

  assetsToDownload.forEach((assetItem) => {
    if (assetItem.assetType === 'logo') {
      processingPromises.push(
        processLogo(assetItem, { allAssets, customAssets, zipFolders }),
      );
    } else if (assetItem.assetType === 'pattern') {
      processingPromises.push(
        processPattern(assetItem, { customPatterns, zipFolders }),
      );
    } else if (assetItem.assetType === 'video') {
      processingPromises.push(
        processVideo(assetItem, { allAssets, zipFolders }),
      );
    }
  });

  await Promise.all(processingPromises);

  const archive = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(archive);
  link.download = `AdsCompass_Brand_Assets.zip`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}
