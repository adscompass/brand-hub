<script>
  import JSZip from 'jszip';
  import EditorModal from './components/EditorModal.svelte';
  import AssetCard from './components/AssetCard.svelte';
  import ColorCard from './components/ColorCard.svelte';
  import TypographyPlayground from './components/TypographyPlayground.svelte';
  import { onMount, onDestroy } from 'svelte';
  import GuidelineSlider from './components/GuidelineSlider.svelte';
  import VideoAssetCard from './components/VideoAssetCard.svelte';
  import PatternGenerator from './components/PatternGenerator.svelte';
  import PatternCard from './components/PatternCard.svelte';

  const konamiCodeSequence = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ];
  let konamiCodePosition = 0;
  let konamiActive = $state(false);

  function handleKeyDown(event) {
    const expectedKey = konamiCodeSequence[konamiCodePosition];

    if (event.key.toLowerCase() === expectedKey.toLowerCase()) {
      konamiCodePosition++;

      if (konamiCodePosition === konamiCodeSequence.length) {
        console.log(
          '%cКОД KONAMI АКТИВИРОВАН!',
          'color: limegreen; font-size: 24px; font-weight: bold;',
        );
        konamiActive = true;
        setTimeout(() => {
          konamiActive = false;
        }, 10000);

        konamiCodePosition = 0;
      }
    } else {
      konamiCodePosition = 0;
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  const assets = $state({
    logos: [
      {
        id: 'adscompass-logo-light',
        name: 'Adscompass светлый логотип',
        url: '/logos/adscompass-logo-light.svg',
        background: '#5e6ad2',
        color: '#ffffff',
        extension: 'svg',
      },
      {
        id: 'adscompass-logo-dark',
        name: 'Adscompass тёмный логотип',
        url: '/logos/adscompass-logo-dark.svg',
        background: '#f4f2f4',
        color: '#000000',
        extension: 'svg',
      },
      {
        id: 'adscompass-logo-red',
        name: 'Adscompass красный логотип',
        url: '/logos/adscompass-logo-red.png',
        background: '#f4f2f4',
        color: '#ffffff',
        extension: 'png',
      },
    ],
    colors: [
      {
        groupName: 'Основные',
        items: [
          { name: 'Красный', hex: '#FF1847' },
          { name: 'Белый', hex: '#FFF8F9' },
          { name: 'Чёрный', hex: '#190000' },
        ],
      },
      {
        groupName: 'Вспомогательные',
        items: [
          { name: '', hex: '#F13194' },
          { name: '', hex: '#F6598D' },
        ],
      },
    ],
    typography: [
      {
        id: 'heading-1',
        name: 'H1 - Заголовок',
        className:
          'text-5xl md:text-6xl font-bold leading-tight tracking-tighter',
        properties: {
          'font-family': {
            css: 'Montserrat',
            display: 'Montserrat',
          },
          'font-size': { css: '3rem', display: '3rem (48px)' },
          'font-weight': { css: '700', display: '700 (Bold)' },
          'line-height': { css: '1.1', display: '1.1' },
          'letter-spacing': { css: '-0.05em', display: '-0.05em' },
        },
      },
      {
        id: 'heading-2',
        name: 'H2 - Подзаголовок',
        className:
          'text-4xl md:text-5xl font-semibold leading-tight tracking-tight',
        properties: {
          'font-family': {
            css: 'Montserrat',
            display: 'Montserrat',
          },
          'font-size': { css: '2.25rem', display: '2.25rem (36px)' },
          'font-weight': { css: '600', display: '600 (Semibold)' },
          'line-height': { css: '1.2', display: '1.2' },
        },
      },
      {
        id: 'body-text',
        name: 'Body - Основной текст',
        className: 'text-base md:text-lg font-normal leading-relaxed',
        properties: {
          'font-family': {
            css: 'Inter',
            display: 'Inter',
          },
          'font-size': { css: '1rem', display: '1rem (16px)' },
          'font-weight': { css: '400', display: '400 (Normal)' },
          'line-height': { css: '1.6', display: '1.6' },
        },
      },
      {
        id: 'caption',
        name: 'Caption - Подпись',
        className: 'text-xs md:text-sm font-light text-white/70',
        font: 'main',
        properties: {
          'font-family': {
            css: 'Inter',
            display: 'Inter',
          },
          'font-size': { css: '0.75rem', display: '0.75rem (12px)' },
          'font-weight': { css: '300', display: '300 (Light)' },
          'line-height': { css: '1.4', display: '1.4' },
        },
      },
    ],
    guidelines: [
      {
        id: 'backgrounds',
        title: 'Использование на фонах',
        description:
          'Для обеспечения максимальной читаемости и контраста, используйте светлую версию логотипа на темных и цветных фонах, а темную версию — на светлых. Избегайте использования логотипа на сложных, пестрых фонах, которые мешают его восприятию.',
        imageDo: '/guidelines/backgrounds-do.png',
        imageDont: '/guidelines/backgrounds-dont.png',
      },
      {
        id: 'stretch',
        title: 'Не искажайте пропорции',
        description:
          'Растягивание или сжатие логотипа нарушает его целостность и узнаваемость. Всегда масштабируйте его пропорционально.',
        imageDo: '/guidelines/stretch-do.png',
        imageDont: '/guidelines/stretch-dont.png',
      },
    ],
    videos: [
      {
        id: 'sample-video',
        title: 'Тестовый образец',
        thumbnailUrl: '/videos/sample-video-thumbnail.png',
        formats: [
          {
            name: 'Горизонтальное (16:9)',
            ratio: '16x9',
            resolution: '1080×566',
            url: '/videos/sample-video-16x9.mp4',
          },
          {
            name: 'Stories (9:16)',
            ratio: '9x16',
            resolution: '1080×1920',
            url: '/videos/sample-video-9x16.mp4',
          },
          {
            name: 'Квадрат (1:1)',
            ratio: '1x1',
            resolution: '1080×1080',
            url: '/videos/sample-video-1x1.mp4',
          },
          {
            name: 'Портретное (4:5)',
            ratio: '4x5',
            resolution: '1080×1350',
            url: '/videos/sample-video-4x5.mp4',
          },
        ],
      },
      {
        id: 'sample-video-2',
        title: 'Тестовый образец',
        thumbnailUrl: '/videos/sample-video-2-thumbnail.png',
        formats: [
          {
            name: 'Горизонтальное (16:9)',
            ratio: '16x9',
            resolution: '1080×566',
            url: '/videos/sample-video-2-16x9.mp4',
          },
          {
            name: 'Портретное (4:5)',
            ratio: '4x5',
            resolution: '1080×1350',
            url: '/videos/sample-video-2-4x5.mp4',
          },
        ],
      },
    ],
    patterns: [
      {
        id: 'diamond-grid',
        name: 'Ромбовидная сетка',
        url: '/patterns/diamond-grid.svg',
      },
    ],
  });

  async function getDimensions(logo) {
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

  onMount(async () => {
    console.log(
      '%cТы нашел это!🧐',
      'color: #5e6ad2; font-size: 20px; font-weight: bold;',
    );
    console.log(
      '%cОтличная работа, разработчик!',
      'color: #5e6ad2; font-size: 16px; font-weight: semibold;',
    );
    console.log('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

    for (const logo of assets.logos) {
      const dimensions = await getDimensions(logo);
      logo.width = dimensions.width;
      logo.height = dimensions.height;
    }
    assets.logos = assets.logos;
  });

  let selectedAssets = $state([]);
  let customAssets = $state([]);
  let customPatterns = $state([]);
  let editingLogo = $state(null);

  function extractInnerSvg(svgText) {
    const svgTagRegex = /<svg[^>]*>([\s\S]*)<\/svg>/;
    const match = svgText.match(svgTagRegex);
    return match ? match[1].trim() : '';
  }

  async function svgToPng(svgString, width, height) {
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

  function handleSaveCustomAsset(customAsset) {
    const originalLogo = assets.logos.find(
      (l) => l.id === customAsset.originalId,
    );
    const newId = `${originalLogo ? originalLogo.id : 'custom'}-custom-${Date.now()}`;

    const newAsset = {
      ...customAsset,
      id: newId,
      type: 'custom',
    };
    customAssets = [...customAssets, newAsset];
    const defaultFormat =
      newAsset.extension === 'svg' ? ['svg'] : [newAsset.extension];
    selectedAssets = [
      ...selectedAssets,
      { id: newAsset.id, formats: defaultFormat, assetType: 'logo' },
    ];
  }

  async function handleSaveCustomPattern(patternData) {
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
      const patternWidth = viewBoxMatch ? viewBoxMatch[1] : '50';
      const patternHeight = viewBoxMatch ? viewBoxMatch[2] : '50';

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
      };

      customPatterns = [...customPatterns, newPattern];
      selectedAssets = [
        ...selectedAssets,
        { id: newPattern.id, formats: ['svg'], assetType: 'pattern' },
      ];
    } catch (error) {
      console.error('Ошибка при создании кастомного паттерна:', error);
    }
  }

  function handleToggle(detail) {
    const { id, checked, assetType } = detail;
    if (assetType === 'video') return;
    const asset =
      assets.logos.find((a) => a.id === id) ||
      customAssets.find((a) => a.id === id) ||
      customPatterns.find((a) => a.id === id);
    if (!asset) return;

    if (checked) {
      let defaultFormats = [];
      if (assetType === 'logo') {
        defaultFormats =
          asset.extension === 'svg' ? ['svg'] : [asset.extension];
      } else if (assetType === 'pattern') {
        defaultFormats = ['svg'];
      }

      selectedAssets = [
        ...selectedAssets,
        { id, formats: defaultFormats, assetType },
      ];
    } else {
      selectedAssets = selectedAssets.filter((item) => item.id !== id);
    }
  }

  function handleFormatChange(detail) {
    const { id, format, checked } = detail;
    selectedAssets = selectedAssets
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

  function handleVideoFormatChange(detail) {
    const { id, format, checked } = detail;

    const entryIndex = selectedAssets.findIndex(
      (item) => item.id === id && item.assetType === 'video',
    );

    if (checked) {
      if (entryIndex > -1) {
        selectedAssets = selectedAssets.map((item, index) => {
          if (index === entryIndex) {
            return { ...item, formats: [...item.formats, format] };
          }
          return item;
        });
      } else {
        selectedAssets = [
          ...selectedAssets,
          { id, formats: [format], assetType: 'video' },
        ];
      }
    } else {
      if (entryIndex > -1) {
        const newFormats = selectedAssets[entryIndex].formats.filter(
          (f) => f !== format,
        );

        if (newFormats.length > 0) {
          selectedAssets = selectedAssets.map((item, index) => {
            if (index === entryIndex) {
              return { ...item, formats: newFormats };
            }
            return item;
          });
        } else {
          selectedAssets = selectedAssets.filter(
            (_, index) => index !== entryIndex,
          );
        }
      }
    }
  }

  async function download() {
    const zip = new JSZip();
    const logosFolder = zip.folder('logos');
    const patternsFolder = zip.folder('patterns');
    const videosFolder = zip.folder('videos');

    let finalAssetsToDownload = [];
    if (selectedAssets.length > 0) {
      finalAssetsToDownload = selectedAssets;
    } else {
      assets.logos.forEach((logo) => {
        finalAssetsToDownload.push({
          id: logo.id,
          formats: [logo.extension],
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
    }

    if (finalAssetsToDownload.length === 0) return;

    await Promise.all(
      finalAssetsToDownload.map(async (selectedAssetItem) => {
        const { id, formats, assetType } = selectedAssetItem;
        if (assetType === 'logo') {
          const asset =
            assets.logos.find((a) => a.id === id) ||
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
                    const baseLogo = assets.logos.find(
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
            const patternWidth = viewBoxMatch ? viewBoxMatch[1] : '50';
            const patternHeight = viewBoxMatch ? viewBoxMatch[2] : '50';

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
            console.error(
              `Ошибка при обработке паттерна ${pattern.id}:`,
              error,
            );
          }
        } else if (assetType === 'video') {
          const videoAsset = assets.videos.find((v) => v.id === id);
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
</script>

<div
  class="flex min-h-screen grow flex-col bg-[#08090a] text-white"
  class:rave-mode={konamiActive}
>
  <header class="container flex flex-col items-center gap-4 pb-4 pt-10">
    <h1 class="flex flex-col items-center text-5xl font-semibold">
      <span class="text-center">AdsCompass</span>
      <span class="text-center">Руководство по стилю</span>
    </h1>
    <p class="rounded-2xl bg-white/10 px-6 py-1">Базовая версия</p>
  </header>

  <div class="container sticky top-4 z-10 flex justify-center">
    <button
      type="button"
      class="
		mt-3 rounded-lg bg-[#5e6ad2] px-6 py-3 font-semibold shadow-lg shadow-[#5e6ad2]/20
		transition-all duration-300 ease-in-out
		hover:-translate-y-px
		hover:bg-[#5058b8]
		focus:outline-none
		focus-visible:ring-2
		focus-visible:ring-[#5e6ad2]
		focus-visible:ring-offset-2
		focus-visible:ring-offset-[#08090a]
		active:translate-y-0
		active:bg-[#434a9d]
		active:duration-75
	"
      onclick={download}
    >
      {selectedAssets.length
        ? `Скачать выбранное (${selectedAssets.length})`
        : `Скачать все материалы`}
    </button>
  </div>

  <main class="h-full pt-8">
    <section class="mb-10">
      <div class="container flex flex-col gap-3">
        <h2 class="text-2xl font-semibold">Логотипы</h2>
        <ul
          class="mb-10 grid grid-cols-[repeat(auto-fill,minmax(288px,1fr))] gap-4"
        >
          {#each assets.logos as logo (logo.id)}
            <AssetCard
              asset={logo}
              baseLogo={logo}
              onToggle={handleToggle}
              checked={selectedAssets.some((item) => item.id === logo.id)}
              onFormatChange={handleFormatChange}
              selectedFormats={selectedAssets.find(
                (item) => item.id === logo.id,
              )?.formats || []}
              type="original"
              onEdit={() => (editingLogo = logo)}
            />
          {/each}
        </ul>

        {#if customAssets.length > 0}
          <h3 class="mt-8 text-2xl font-semibold">Ваши вариации</h3>
          <ul
            class="grid grid-cols-[repeat(auto-fill,minmax(288px,1fr))] gap-4"
            role="listbox"
          >
            {#each customAssets as logo (logo.id)}
              {@const baseLogo = assets.logos.find(
                (l) => l.id === logo.originalId,
              )}
              <AssetCard
                asset={logo}
                {baseLogo}
                onToggle={handleToggle}
                checked={selectedAssets.some((item) => item.id === logo.id)}
                onFormatChange={handleFormatChange}
                selectedFormats={selectedAssets.find(
                  (item) => item.id === logo.id,
                )?.formats || []}
                type="custom"
              />
            {/each}
          </ul>
        {:else}
          <div
            class="rounded-lg border border-dashed border-white/20 px-4 py-10 text-center"
          >
            <p class="text-white/60">Вы еще не создали ни одной вариации.</p>
            <p class="mt-1 text-sm text-white/40">
              Нажмите на иконку кисти на любом логотипе, чтобы начать.
            </p>
          </div>
        {/if}
      </div>
    </section>
    <section class="mb-10">
      <div class="container flex flex-col gap-8">
        <h2 class="text-2xl font-semibold">Цвета</h2>
        {#each assets.colors as colorGroup (colorGroup.groupName)}
          <div class="flex flex-col gap-3">
            <h3 class="text-xl font-semibold">{colorGroup.groupName}</h3>
            <div
              class="grid grid-cols-[repeat(auto-fill,minmax(288px,1fr))] gap-4"
            >
              {#each colorGroup.items as color (color.hex)}
                <ColorCard {color} />
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </section>
    <section class="mb-10">
      <div class="container flex flex-col gap-8">
        <h2 class="text-2xl font-semibold">Типографика</h2>
        <TypographyPlayground styles={assets.typography} />
      </div>
    </section>
    <section class="mb-10">
      <div class="container flex flex-col gap-8">
        <h2 class="text-2xl font-semibold">Правила использования</h2>
        {#each assets.guidelines as guideline (guideline.id)}
          <GuidelineSlider
            title={guideline.title}
            description={guideline.description}
            imageDo={guideline.imageDo}
            imageDont={guideline.imageDont}
          />
        {/each}
      </div>
    </section>
    <section class="mb-10">
      <div class="container flex flex-col gap-8">
        <h2 class="text-2xl font-semibold">Видео-материалы</h2>
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {#each assets.videos as video (video.id)}
            {@const selectedVideoEntry = selectedAssets.find(
              (item) => item.id === video.id && item.assetType === 'video',
            )}
            <VideoAssetCard
              {video}
              selectedFormats={selectedVideoEntry?.formats || []}
              onToggle={handleVideoFormatChange}
            />
          {/each}
        </div>
      </div>
    </section>
    <section class="mb-10">
      <div class="container flex flex-col gap-8">
        <h2 class="text-2xl font-semibold">Генератор Паттернов</h2>
        <PatternGenerator
          patterns={assets.patterns}
          brandColors={assets.colors}
          onSave={handleSaveCustomPattern}
        />
        {#if customPatterns.length > 0}
          <h3 class="mt-4 text-xl font-semibold">Ваши паттерны:</h3>
          <ul
            class="grid grid-cols-[repeat(auto-fill,minmax(288px,1fr))] gap-4"
          >
            {#each customPatterns as pattern (pattern.id)}
              <PatternCard
                {pattern}
                onToggle={(detail) =>
                  handleToggle({ ...detail, assetType: 'pattern' })}
                checked={selectedAssets.some((item) => item.id === pattern.id)}
              />
            {/each}
          </ul>
        {/if}
      </div>
    </section>
  </main>
</div>

{#if editingLogo}
  <EditorModal
    logo={editingLogo}
    onSave={handleSaveCustomAsset}
    onClose={() => (editingLogo = null)}
  />
{/if}

<style>
  @keyframes rainbow-flicker {
    0% {
      filter: hue-rotate(0deg) saturate(1);
    }
    25% {
      filter: hue-rotate(90deg) saturate(1.5);
    }
    50% {
      filter: hue-rotate(180deg) saturate(1);
    }
    75% {
      filter: hue-rotate(270deg) saturate(1.5);
    }
    100% {
      filter: hue-rotate(360deg) saturate(1);
    }
  }

  @keyframes subtle-shake {
    0% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(10px, -10px);
    }
    50% {
      transform: translate(-10px, 10px);
    }
    75% {
      transform: translate(10px, 10px);
    }
    100% {
      transform: translate(0, 0);
    }
  }

  .rave-mode {
    animation:
      rainbow-flicker 2s infinite linear,
      subtle-shake 0.1s infinite alternate;
  }
</style>
