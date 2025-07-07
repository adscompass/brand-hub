<script>
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
        id: 'random-test',
        name: 'Тестовый логотип',
        url: '/logos/random-test.jpg',
        background: '#5e6ad2',
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
        className: 'font-bold text-5xl md:text-6xl leading-tight',
        properties: {
          'font-family': 'Arial, sans-serif',
          'font-size': '48px (md:60px)',
          'font-weight': '700 (bold)',
          'line-height': '1.1',
          'letter-spacing': '-0.02em',
        },
      },
      {
        id: 'heading-2',
        name: 'H2 - Подзаголовок',
        className: 'font-semibold text-4xl md:text-5xl leading-tight',
        properties: {
          'font-family': 'Arial, sans-serif',
          'font-size': '36px (md:48px)',
          'font-weight': '600 (semibold)',
          'line-height': '1.2',
        },
      },
      {
        id: 'body-text',
        name: 'Body - Основной текст',
        className: 'font-normal text-base md:text-lg leading-relaxed',
        properties: {
          'font-family': 'Verdana, sans-serif',
          'font-size': '16px (md:18px)',
          'font-weight': '400 (normal)',
          'line-height': '1.6',
        },
      },
      {
        id: 'caption',
        name: 'Caption - Подпись',
        className: 'font-light text-xs md:text-sm text-white/70',
        properties: {
          'font-family': 'Verdana, sans-serif',
          'font-size': '12px (md:14px)',
          'font-weight': '300 (light)',
          'line-height': '1.4',
        },
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
    for (const logo of assets.logos) {
      const dimensions = await getDimensions(logo);
      logo.width = dimensions.width;
      logo.height = dimensions.height;
    }
    assets.logos = assets.logos;
  });

  let selectedAssets = $state([]);
  let customAssets = $state([]);
  let editingLogo = $state(null);

  import JSZip from 'jszip';
  import EditorModal from './components/EditorModal.svelte';
  import AssetCard from './components/AssetCard.svelte';
  import ColorCard from './components/ColorCard.svelte';
  import TypographyPlayground from './components/TypographyPlayground.svelte';
  import { onMount } from 'svelte';

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
      { id: newAsset.id, formats: defaultFormat },
    ];
  }

  function handleToggle(detail) {
    const { id, checked } = detail;
    const asset =
      assets.logos.find((a) => a.id === id) ||
      customAssets.find((a) => a.id === id);
    if (!asset) return;

    if (checked) {
      const defaultFormat =
        asset.extension === 'svg' ? ['svg'] : [asset.extension];
      selectedAssets = [
        ...selectedAssets,
        { id: asset.id, formats: defaultFormat },
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
          let newFormats = checked
            ? [...item.formats, format]
            : item.formats.filter((f) => f !== format);
          return { id, formats: newFormats };
        }
        return item;
      })
      .filter((item) => item.formats.length > 0);
  }

  async function download() {
    const zip = new JSZip();
    const logosFolder = zip.folder('logos');

    let finalAssetsToDownload = [];
    if (selectedAssets.length > 0) {
      finalAssetsToDownload = selectedAssets;
    } else {
      assets.logos.forEach((logo) => {
        finalAssetsToDownload.push({ id: logo.id, formats: [logo.extension] });
      });
      customAssets.forEach((logo) => {
        finalAssetsToDownload.push({ id: logo.id, formats: [logo.extension] });
      });
    }

    if (finalAssetsToDownload.length === 0) return;

    await Promise.all(
      finalAssetsToDownload.map(async (selectedAssetItem) => {
        const { id, formats } = selectedAssetItem;
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
                  fileBlob = new Blob([svgContent], { type: 'image/svg+xml' });
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

<div class="flex flex-col grow min-h-screen bg-[#08090a] text-white">
  <header class="container flex flex-col items-center pt-10 pb-4 gap-4">
    <h1 class="text-5xl font-semibold flex flex-col items-center">
      <span class="text-center">AdsCompass</span>
      <span class="text-center">Руководство по стилю</span>
    </h1>
    <p class="bg-white/10 px-6 py-1 rounded-2xl">Базовая версия</p>
  </header>

  <div class="sticky top-4 z-10 container flex justify-center">
    <button
      type="button"
      class="
		mt-3 px-6 py-3 bg-[#5e6ad2] rounded-lg font-semibold shadow-lg shadow-[#5e6ad2]/20
		transition-all duration-300 ease-in-out
		focus:outline-none
		hover:bg-[#5058b8]
		hover:-translate-y-px
		active:bg-[#434a9d]
		active:translate-y-0
		active:duration-75
		focus-visible:ring-2
		focus-visible:ring-offset-2
		focus-visible:ring-[#5e6ad2]
		focus-visible:ring-offset-[#08090a]
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
          class="grid grid-cols-[repeat(auto-fill,minmax(288px,1fr))] gap-4 mb-10"
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
          <h3 class="text-2xl font-semibold mt-8">Ваши вариации</h3>
          <ul
            class="grid grid-cols-[repeat(auto-fill,minmax(288px,1fr))] gap-4"
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
            class="text-center py-10 px-4 border border-dashed border-white/20 rounded-lg"
          >
            <p class="text-white/60">Вы еще не создали ни одной вариации.</p>
            <p class="text-white/40 text-sm mt-1">
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
  </main>
</div>

{#if editingLogo}
  <EditorModal
    logo={editingLogo}
    onSave={handleSaveCustomAsset}
    onClose={() => (editingLogo = null)}
  />
{/if}
