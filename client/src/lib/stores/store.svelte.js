import { assets } from '../data/assets.svelte';
import { extractInnerSvg } from '../utils/assetProcessor';

export const store = $state({
  selectedAssets: [],
  customAssets: [],
  customPatterns: [],
  editingLogo: null,
});

export function saveCustomAsset(customAsset) {
  const originalLogo = assets.logos.find(
    (l) => l.id === customAsset.originalId,
  );
  const newId = `${originalLogo ? originalLogo.id : 'custom'}-custom-${Date.now()}`;

  const newAsset = {
    ...customAsset,
    id: newId,
    type: 'custom',
  };
  store.customAssets = [...store.customAssets, newAsset];
  const defaultFormat =
    newAsset.extension === 'svg' ? ['svg'] : [newAsset.extension];
  store.selectedAssets = [
    ...store.selectedAssets,
    { id: newAsset.id, formats: defaultFormat, assetType: 'logo' },
  ];
}

export async function saveCustomPattern(patternData) {
  try {
    const response = await fetch(patternData.basePatternUrl);
    if (!response.ok) throw new Error('Не удалось загрузить шаблон паттерна');
    const svgTemplateText = await response.text();

    const innerSvgContent = extractInnerSvg(svgTemplateText);
    const coloredInnerSvg = innerSvgContent.replace(
      /currentColor/g,
      patternData.patternColor,
    );

    const viewBoxMatch = svgTemplateText.match(
      /viewBox="0 0 ([\d.]+) ([\d.]+)"/,
    );
    const baseWidth = viewBoxMatch ? parseFloat(viewBoxMatch[1]) : 50;
    const baseHeight = viewBoxMatch ? parseFloat(viewBoxMatch[2]) : 50;
    const padding = patternData.padding || 0;
    const patternWidth = baseWidth + padding;
    const patternHeight = baseHeight + padding;

    const finalSvg = `
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="p" width="${patternWidth}" height="${patternHeight}" patternUnits="userSpaceOnUse">
              ${coloredInnerSvg}
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="${patternData.backgroundColor}"/>
          <rect width="100%" height="100%" fill="url(#p)"/>
        </svg>`.trim();

    const dataUrl =
      'data:image/svg+xml;base64,' +
      btoa(unescape(encodeURIComponent(finalSvg)));

    const newPattern = {
      ...patternData,
      id: `pattern-${patternData.baseId}-${Date.now()}`,
      type: 'custom',
      dataUrl: dataUrl,
      padding: padding,
    };

    store.customPatterns = [...store.customPatterns, newPattern];
    store.selectedAssets = [
      ...store.selectedAssets,
      { id: newPattern.id, formats: ['svg'], assetType: 'pattern' },
    ];
  } catch (error) {
    console.error('Ошибка при создании кастомного паттерна:', error);
  }
}

export function toggleAssetSelection(detail) {
  const { id, checked, assetType } = detail;
  if (assetType === 'video') return;

  const asset =
    assets.logos.find((a) => a.id === id) ||
    store.customAssets.find((a) => a.id === id) ||
    store.customPatterns.find((a) => a.id === id);
  if (!asset) return;

  if (checked) {
    let defaultFormats = [];
    if (assetType === 'logo') {
      defaultFormats = asset.extension === 'svg' ? ['svg'] : [asset.extension];
    } else if (assetType === 'pattern') {
      defaultFormats = ['svg'];
    }

    store.selectedAssets = [
      ...store.selectedAssets,
      { id, formats: defaultFormats, assetType },
    ];
  } else {
    store.selectedAssets = store.selectedAssets.filter(
      (item) => item.id !== id,
    );
  }
}

export function changeAssetFormat(detail) {
  const { id, format, checked } = detail;
  store.selectedAssets = store.selectedAssets
    .map((item) => {
      if (item.id === id) {
        const newFormats = checked
          ? [...item.formats, format]
          : item.formats.filter((f) => f !== format);
        return { ...item, formats: newFormats };
      }
      return item;
    })
    .filter((item) => item.formats.length > 0);
}

export function changeVideoFormat(detail) {
  const { id, format, checked } = detail;
  const entryIndex = store.selectedAssets.findIndex(
    (item) => item.id === id && item.assetType === 'video',
  );

  if (checked) {
    if (entryIndex > -1) {
      store.selectedAssets = store.selectedAssets.map((item, index) => {
        if (index === entryIndex) {
          return { ...item, formats: [...item.formats, format] };
        }
        return item;
      });
    } else {
      store.selectedAssets = [
        ...store.selectedAssets,
        { id, formats: [format], assetType: 'video' },
      ];
    }
  } else {
    if (entryIndex > -1) {
      const newFormats = store.selectedAssets[entryIndex].formats.filter(
        (f) => f !== format,
      );

      if (newFormats.length > 0) {
        store.selectedAssets = store.selectedAssets.map((item, index) => {
          if (index === entryIndex) {
            return { ...item, formats: newFormats };
          }
          return item;
        });
      } else {
        store.selectedAssets = store.selectedAssets.filter(
          (_, index) => index !== entryIndex,
        );
      }
    }
  }
}
