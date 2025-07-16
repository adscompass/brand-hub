<script>
  import EditorModal from './components/EditorModal.svelte';
  import AssetCard from './components/AssetCard.svelte';
  import ColorCard from './components/ColorCard.svelte';
  import TypographyPlayground from './components/TypographyPlayground.svelte';
  import { onMount } from 'svelte';
  import GuidelineSlider from './components/GuidelineSlider.svelte';
  import VideoAssetCard from './components/VideoAssetCard.svelte';
  import PatternGenerator from './components/PatternGenerator.svelte';
  import PatternCard from './components/PatternCard.svelte';
  import { assets } from './lib/data/assets.svelte';
  import { extractInnerSvg, getDimensions } from './lib/utils/assetProcessor';
  import { konami } from './lib/actions/konami';
  import { createAndDownloadZip } from './lib/services/download';

  let konamiActive = $state(false);

  function activateRaveMode() {
    console.log(
      '%cКОД KONAMI АКТИВИРОВАН!',
      'color: limegreen; font-size: 24px; font-weight: bold;',
    );
    konamiActive = true;
    setTimeout(() => {
      konamiActive = false;
    }, 10000);
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

  function handleDownload() {
    createAndDownloadZip({
      selectedAssets,
      allAssets: assets,
      customAssets,
      customPatterns,
    });
  }
</script>

<div
  class="flex min-h-screen grow flex-col bg-[#08090a] text-white"
  class:animate-rave={konamiActive}
  use:konami={activateRaveMode}
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
      onclick={handleDownload}
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
