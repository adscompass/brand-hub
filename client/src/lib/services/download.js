import JSZip from 'jszip';
import { extractInnerSvg, svgToPng } from '../utils/assetProcessor';

export async function createAndDownloadZip({
  selectedAssets,
  allAssets,
  customAssets,
  customPatterns,
}) {
  const zip = new JSZip();
  const logosFolder = zip.folder('logos');
  const patternsFolder = zip.folder('patterns');
  const videosFolder = zip.folder('videos');

  let finalAssetsToDownload = [];
  if (selectedAssets.length > 0) {
    finalAssetsToDownload = selectedAssets;
  } else {
    allAssets.logos.forEach((logo) => {
      finalAssetsToDownload.push({
        id: logo.id,
        formats: [logo.extension, 'png'],
        assetType: 'logo',
      });
    });
    customAssets.forEach((logo) => {
      finalAssetsToDownload.push({
        id: logo.id,
        formats: [logo.extension],
        assetType: 'logo',
      });
    });
    customPatterns.forEach((pattern) => {
      finalAssetsToDownload.push({
        id: pattern.id,
        formats: ['svg'],
        assetType: 'pattern',
      });
    });
    allAssets.videos.forEach((video) => {
      finalAssetsToDownload.push({
        id: video.id,
        formats: video.formats.map((f) => f.ratio),
        assetType: 'video',
      });
    });
  }

  if (finalAssetsToDownload.length === 0) return;

  await Promise.all(
    finalAssetsToDownload.map(async (selectedAssetItem) => {
      const { id, formats, assetType } = selectedAssetItem;
      if (assetType === 'logo') {
        const asset =
          allAssets.logos.find((a) => a.id === id) ||
          customAssets.find((a) => a.id === id);

        if (!asset) {
          console.warn(`Asset with ID ${id} not found for download.`);
          return;
        }

        await Promise.all(
          formats.map(async (format) => {
            try {
              let fileBlob = null;
              let filename = `${asset.id}.${format}`;

              if (asset.extension === 'svg') {
                let svgContent = null;

                if (asset.type === 'custom') {
                  const baseLogo = allAssets.logos.find(
                    (l) => l.id === asset.originalId,
                  );
                  const response = await fetch(baseLogo.url);
                  const originalInnerSvgText = extractInnerSvg(
                    await response.text(),
                  );

                  const transform = `translate(${asset.logoX}, ${asset.logoY}) rotate(${asset.logoRotate || 0}) scale(${asset.logoScale}) translate(-${
                    asset.originalSvgDimensions.width / 2
                  }, -${asset.originalSvgDimensions.height / 2})`;

                  svgContent = `
                <svg 
                  width="${asset.canvasWidth}" 
                  height="${asset.canvasHeight}" 
                  viewBox="0 0 ${asset.canvasWidth} ${asset.canvasHeight}" 
                  xmlns="http://www.w3.org/2000/svg">
                  <g transform="${transform}">
                    ${originalInnerSvgText}
                  </g>
                </svg>
              `;
                } else {
                  const response = await fetch(asset.url);
                  svgContent = await response.text();
                }

                if (format === 'svg') {
                  fileBlob = new Blob([svgContent], {
                    type: 'image/svg+xml',
                  });
                } else if (format === 'png') {
                  fileBlob = await svgToPng(
                    svgContent,
                    asset.canvasWidth || asset.width,
                    asset.canvasHeight || asset.height,
                  );
                }
              } else if (['png', 'jpg'].includes(asset.extension)) {
                if (format === asset.extension) {
                  if (asset.type === 'custom' && asset.dataUrl) {
                    fileBlob = await (await fetch(asset.dataUrl)).blob();
                  } else {
                    const response = await fetch(asset.url);
                    fileBlob = await response.blob();
                  }
                }
              }

              if (fileBlob) {
                logosFolder.file(filename, fileBlob);
              } else {
                console.warn(
                  `Не удалось подготовить файл для скачивания: ${filename}`,
                );
              }
            } catch (error) {
              console.error(
                `Ошибка при обработке ассета ${id} в формате ${format}:`,
                error,
              );
            }
          }),
        );
      } else if (assetType === 'pattern') {
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

          const padding = pattern.padding || 0;
          const patternWidth = baseWidth + padding;
          const patternHeight = baseHeight + padding;

          const finalSvg = `
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="p" width="${patternWidth}" height="${patternHeight}" patternUnits="userSpaceOnUse">
                  ${coloredInnerSvg}
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="${pattern.backgroundColor}"/>
              <rect width="100%" height="100%" fill="url(#p)"/>
            </svg>`;

          patternsFolder.file(`${pattern.id}.svg`, finalSvg.trim());
        } catch (error) {
          console.error(`Ошибка при обработке паттерна ${pattern.id}:`, error);
        }
      } else if (assetType === 'video') {
        const videoAsset = allAssets.videos.find((v) => v.id === id);
        if (!videoAsset) return;

        await Promise.all(
          formats.map(async (ratio) => {
            const formatInfo = videoAsset.formats.find(
              (f) => f.ratio === ratio,
            );
            if (!formatInfo) return;

            try {
              const response = await fetch(formatInfo.url);
              if (!response.ok)
                throw new Error(
                  `Ошибка сети при скачивании видео: ${formatInfo.url}`,
                );
              const blob = await response.blob();
              const filename = `${videoAsset.id}-${formatInfo.ratio}.mp4`;
              videosFolder.file(filename, blob);
            } catch (error) {
              console.error(
                `Ошибка при обработке видео ${id} в формате ${ratio}:`,
                error,
              );
            }
          }),
        );
      }
    }),
  );

  const archive = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(archive);
  link.download = `AdsCompass_Brand_Assets.zip`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}
