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
      // {
      //   id: 'goldlead-logo-light',
      //   name: 'Goldlead светлый логотип',
      //   url: '/logos/goldlead-logo-light.svg',
      //   background: '#5e6ad2',
      //   color: '#ffffff',
      //   extension: 'svg',
      // },
      // {
      //   id: 'goldlead-logo-dark',
      //   name: 'Goldlead тёмный логотип',
      //   url: '/logos/goldlead-logo-dark.svg',
      //   background: '#f4f2f4',
      //   color: '#000000',
      //   extension: 'svg',
      // },
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
  import { onMount } from 'svelte';

  function extractInnerSvg(svgText) {
    const svgTagRegex = /<svg[^>]*>([\s\S]*)<\/svg>/;
    const match = svgText.match(svgTagRegex);
    return match ? match[1].trim() : '';
  }

  function handleSaveCustomAsset(customAsset) {
    const newAsset = {
      ...customAsset,
      id: `custom-${Date.now()}`,
    };
    customAssets = [...customAssets, newAsset];
    selectedAssets = [...selectedAssets, newAsset.id];
  }

  async function download() {
    const zip = new JSZip();
    const logosFolder = zip.folder('logos');

    let assetsToDownload;

    if (selectedAssets.length > 0) {
      assetsToDownload = selectedAssets;
    } else {
      const allOriginalIds = assets.logos.map((logo) => logo.id);
      const allCustomIds = customAssets.map((logo) => logo.id);
      assetsToDownload = [...allOriginalIds, ...allCustomIds];
    }

    if (assetsToDownload.length === 0) return;

    await Promise.all(
      assetsToDownload.map(async (assetId) => {
        try {
          const originalLogo = assets.logos.find((l) => l.id === assetId);
          if (originalLogo) {
            const response = await fetch(originalLogo.url);
            if (!response.ok)
              throw new Error(`Fetch failed for ${originalLogo.url}`);
            const fileBlob = await response.blob();
            const filename = `${originalLogo.id}.${originalLogo.extension}`;
            logosFolder.file(filename, fileBlob);
            return;
          }

          const customLogo = customAssets.find((l) => l.id === assetId);
          if (customLogo) {
            // --- НОВАЯ ЛОГИКА ОБРАБОТКИ СОХРАНЕНИЙ ---
            if (customLogo.extension === 'svg') {
              // Логика для SVG-ассетов (твоя текущая)
              const baseLogo = assets.logos.find(
                (l) => l.id === customLogo.originalId,
              );
              const response = await fetch(baseLogo.url);
              const originalSvgText = await response.text();

              const innerSvgContent = extractInnerSvg(originalSvgText);

              const {
                canvasWidth,
                canvasHeight,
                logoX,
                logoY,
                logoScale,
                logoRotate,
              } = customLogo; // Эти данные приходят из EditorModal

              // originalSvgDimensions теперь приходит из customLogo
              const originalSvgWidth = customLogo.originalSvgDimensions.width;
              const originalSvgHeight = customLogo.originalSvgDimensions.height;

              const transform = `translate(${logoX}, ${logoY}) rotate(${logoRotate || 0}) scale(${logoScale}) translate(-${
                originalSvgWidth / 2
              }, -${originalSvgHeight / 2})`;

              const newSvgText = `
                <svg 
                  width="${canvasWidth}" 
                  height="${canvasHeight}" 
                  viewBox="0 0 ${canvasWidth} ${canvasHeight}" 
                  xmlns="http://www.w3.org/2000/svg">

                  <g transform="${transform}">
                    ${innerSvgContent}
                  </g>
                </svg>
							`;

              const filename = `${customLogo.id}.svg`;
              logosFolder.file(filename, newSvgText.trim());
            } else if (['png', 'jpg'].includes(customLogo.extension)) {
              // Логика для растровых ассетов (используем dataUrl)
              if (customLogo.dataUrl) {
                const filename = `${customLogo.id}.${customLogo.extension}`;
                // JSZip может принимать Base64 напрямую
                const base64Data = customLogo.dataUrl.split(',')[1];
                logosFolder.file(filename, base64Data, { base64: true });
              } else {
                console.warn(
                  `Data URL не найден для кастомного ${customLogo.extension} логотипа ${customLogo.id}.`,
                );
              }
            } else {
              console.warn(
                `Неподдерживаемый формат для кастомного логотипа при скачивании: ${customLogo.extension}`,
              );
            }
          }
        } catch (error) {
          console.error(`Ошибка при обработке ассета ${assetId}:`, error);
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

  function handleToggle(detail) {
    const { id, checked } = detail;
    if (checked) {
      if (!selectedAssets.includes(id)) {
        selectedAssets = [...selectedAssets, id];
      }
    } else {
      selectedAssets = selectedAssets.filter((assetId) => assetId !== id);
    }
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
              checked={selectedAssets.includes(logo.id)}
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
                checked={selectedAssets.includes(logo.id)}
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
  </main>
</div>

{#if editingLogo}
  <EditorModal
    logo={editingLogo}
    onSave={handleSaveCustomAsset}
    onClose={() => (editingLogo = null)}
  />
{/if}
