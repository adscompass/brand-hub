import { assets } from '../data/assets.svelte';

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

    const innerSvgContent =
      svgTemplateText.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1] || '';
    const coloredInnerSvg = innerSvgContent.replace(
      /currentColor/g,
      patternData.patternColor,
    );

    const viewBoxMatch = svgTemplateText.match(
      /viewBox="0 0 ([\d.]+) ([\d.]+)"/,
    );
    const baseWidth = viewBoxMatch ? parseFloat(viewBoxMatch[1]) : 50;
    const baseHeight = viewBoxMatch ? parseFloat(viewBoxMatch[2]) : 50;

    const finalSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${baseWidth} ${baseHeight}">
        <rect width="100%" height="100%" fill="${patternData.backgroundColor}" />
        ${coloredInnerSvg}
      </svg>`.trim();

    const dataUrl =
      'data:image/svg+xml;base64,' +
      btoa(unescape(encodeURIComponent(finalSvg)));

    const newPattern = {
      ...patternData,
      id: `pattern-${patternData.baseId}-${Date.now()}`,
      type: 'custom',
      dataUrl: dataUrl,
    };

    store.customPatterns.push(newPattern);
    store.selectedAssets.push({
      id: newPattern.id,
      formats: ['svg', 'png'],
      assetType: 'pattern',
    });
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
  const { id, format, checked, assetType } = detail;

  const videoEntryIndex = store.selectedAssets.findIndex(
    (item) => item.id === id && item.assetType === assetType,
  );

  if (checked) {
    if (videoEntryIndex > -1) {
      store.selectedAssets[videoEntryIndex].formats.push(format);
    } else {
      store.selectedAssets.push({
        id,
        assetType,
        formats: [format],
      });
    }
  } else {
    if (videoEntryIndex > -1) {
      const formatIndexToRemove = store.selectedAssets[
        videoEntryIndex
      ].formats.findIndex(
        (f) => f.ratio === format.ratio && f.type === format.type,
      );
      if (formatIndexToRemove > -1) {
        store.selectedAssets[videoEntryIndex].formats.splice(
          formatIndexToRemove,
          1,
        );
      }
      if (store.selectedAssets[videoEntryIndex].formats.length === 0) {
        store.selectedAssets.splice(videoEntryIndex, 1);
      }
    }
  }
}
