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
  import { getDimensions } from './lib/utils/assetProcessor';
  import { konami } from './lib/actions/konami';
  import { createAndDownloadZip } from './lib/services/download';
  import {
    store,
    saveCustomAsset,
    saveCustomPattern,
    toggleAssetSelection,
    changeAssetFormat,
    changeVideoFormat,
  } from './lib/stores/store.svelte';

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

  function handleDownload() {
    createAndDownloadZip({
      selectedAssets: store.selectedAssets,
      allAssets: assets,
      customAssets: store.customAssets,
      customPatterns: store.customPatterns,
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
      {store.selectedAssets.length
        ? `Скачать выбранное (${store.selectedAssets.length})`
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
              onToggle={toggleAssetSelection}
              checked={store.selectedAssets.some((item) => item.id === logo.id)}
              onFormatChange={changeAssetFormat}
              selectedFormats={store.selectedAssets.find(
                (item) => item.id === logo.id,
              )?.formats || []}
              type="original"
              onEdit={() => (store.editingLogo = logo)}
            />
          {/each}
        </ul>

        {#if store.customAssets.length > 0}
          <h3 class="mt-8 text-2xl font-semibold">Ваши вариации</h3>
          <ul
            class="grid grid-cols-[repeat(auto-fill,minmax(288px,1fr))] gap-4"
            role="listbox"
          >
            {#each store.customAssets as logo (logo.id)}
              {@const baseLogo = assets.logos.find(
                (l) => l.id === logo.originalId,
              )}
              <AssetCard
                asset={logo}
                {baseLogo}
                onToggle={toggleAssetSelection}
                checked={store.selectedAssets.some(
                  (item) => item.id === logo.id,
                )}
                onFormatChange={changeAssetFormat}
                selectedFormats={store.selectedAssets.find(
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
            {@const selectedVideoEntry = store.selectedAssets.find(
              (item) => item.id === video.id && item.assetType === 'video',
            )}
            <VideoAssetCard
              {video}
              selectedFormats={selectedVideoEntry?.formats || []}
              onToggle={changeVideoFormat}
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
          onSave={saveCustomPattern}
        />
        {#if store.customPatterns.length > 0}
          <h3 class="mt-4 text-xl font-semibold">Ваши паттерны:</h3>
          <ul
            class="grid grid-cols-[repeat(auto-fill,minmax(288px,1fr))] gap-4"
          >
            {#each store.customPatterns as pattern (pattern.id)}
              <PatternCard
                {pattern}
                onToggle={(detail) =>
                  toggleAssetSelection({ ...detail, assetType: 'pattern' })}
                checked={store.selectedAssets.some(
                  (item) => item.id === pattern.id,
                )}
              />
            {/each}
          </ul>
        {/if}
      </div>
    </section>
  </main>
</div>

{#if store.editingLogo}
  <EditorModal
    logo={store.editingLogo}
    onSave={saveCustomAsset}
    onClose={() => (store.editingLogo = null)}
  />
{/if}
