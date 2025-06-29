<script>
  const assets = {
    logos: [
      {
        id: 'adscompass-logo-light',
        name: 'Light Logo',
        url: '/logos/adscompass-logo-light.svg',
        background: '#5e6ad2',
        color: '#ffffff',
        extension: 'svg',
      },
      {
        id: 'adscompass-logo-dark',
        name: 'Dark Logo',
        url: '/logos/adscompass-logo-dark.svg',
        background: '#f4f2f4',
        color: '#000000',
        extension: 'svg',
      },
      {
        id: 'goldlead-logo-light',
        name: 'Dark Logo',
        url: '/logos/goldlead-logo-light.svg',
        background: '#5e6ad2',
        color: '#ffffff',
        extension: 'svg',
      },
      {
        id: 'goldlead-logo-dark',
        name: 'Dark Logo',
        url: '/logos/goldlead-logo-dark.svg',
        background: '#f4f2f4',
        color: '#000000',
        extension: 'svg',
      },
    ],
  };

  let selectedAssets = $state([]);
  let customAssets = $state([]);
  let editingLogo = $state(null);

  import JSZip from 'jszip';
  import EditorModal from './components/EditorModal.svelte';

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
    customAssets.push(newAsset);
    selectedAssets.push(newAsset.id);
  }

  async function download() {
    const zip = new JSZip();
    const logosFolder = zip.folder('logos');

    if (selectedAssets.length === 0) return;

    await Promise.all(
      selectedAssets.map(async (assetId) => {
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
            const baseLogo = assets.logos.find(
              (l) => l.id === customLogo.originalId,
            );
            const response = await fetch(baseLogo.url);
            const originalSvgText = await response.text();

            const innerSvgContent = extractInnerSvg(originalSvgText);

            const { canvasWidth, canvasHeight, logoX, logoY, logoScale } =
              customLogo;

            const transform = `translate(${logoX}, ${logoY}) scale(${logoScale}) translate(-${
              customLogo.originalSvgDimensions.width / 2
            }, -${customLogo.originalSvgDimensions.height / 2})`;

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
</script>

<div class="flex flex-col grow min-h-screen bg-[#08090a] text-white">
  <header class="container flex flex-col items-center py-10 gap-4">
    <h1 class="text-5xl font-semibold flex flex-col items-center">
      <span class="text-center">AdsCompass</span>
      <span class="text-center">Руководство по стилю</span>
    </h1>
    <p class="bg-white/10 px-6 py-1 rounded-2xl">Упрощённая версия</p>
    <button
      type="button"
      class="
		mt-3 px-6 py-3 bg-[#5e6ad2] rounded-lg font-semibold
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
  </header>

  <main class="h-full">
    <section>
      <div class="container flex flex-col gap-3">
        <h2 class="text-2xl font-semibold">Логотипы</h2>
        <ul class="grid grid-cols-[repeat(auto-fit,minmax(288px,1fr))] gap-4">
          {#each assets.logos as logo (logo.id)}
            <li
              class="group aspect-[4/3] relative has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-[#5e6ad2] has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-offset-2 has-[button:focus-visible]:outline-[#5e6ad2] overflow-hidden transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] active:duration-75"
              style="background-color: {logo.background};"
            >
              <input
                id={logo.id}
                bind:group={selectedAssets}
                value={logo.id}
                type="checkbox"
                class="sr-only"
              />
              <label for={logo.id} class="cursor-pointer w-full h-full block">
                <figure class="grid place-items-center w-full h-full">
                  <img
                    src={logo.url}
                    alt={logo.name}
                    class="pointer-events-none select-none max-w-[60%]"
                  />
                  <figcaption
                    class="absolute top-4 left-4 font-semibold opacity-0 text-shadow-lg group-hover:opacity-100 transition-opacity duration-300"
                    style="color: {logo.color}"
                  >
                    {logo.name}
                  </figcaption>
                </figure>

                <span
                  class="absolute top-4 right-4 w-7 h-7 rounded-md border-2 border-white/80 bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 group-has-[input:checked]:opacity-100 group-has-[input:focus-visible]:opacity-100 group-has-[button:focus-visible]:opacity-100"
                >
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 511.999 511.999"
                    class="p-1 opacity-0 group-has-[input:checked]:opacity-100 transition-all duration-300 scale-50 group-has-[input:checked]:scale-100"
                  >
                    <path
                      fill="#FFFFFF"
                      d="M506.231,75.508c-7.689-7.69-20.158-7.69-27.849,0l-319.21,319.211L33.617,269.163c-7.689-7.691-20.158-7.691-27.849,0 c-7.69,7.69-7.69,20.158,0,27.849l139.481,139.481c7.687,7.687,20.16,7.689,27.849,0l333.133-333.136 C513.921,95.666,513.921,83.198,506.231,75.508z"
                    />
                  </svg>
                </span>
              </label>
              <button
                type="button"
                onclick={() => (editingLogo = logo)}
                class="absolute bottom-4 right-4 z-10 p-2 rounded-full bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity group-has-[input:focus-visible]:opacity-100 group-has-[button:focus-visible]:opacity-100"
                title="Настроить логотип"
                aria-label="Настроить логотип"
              >
                <svg
                  class="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  ></path></svg
                >
              </button>
            </li>
          {/each}
        </ul>

        {#if customAssets.length > 0}
          <h3 class="text-xl font-semibold mt-8">Ваши вариации</h3>
          <ul class="grid grid-cols-[repeat(auto-fit,minmax(288px,1fr))] gap-4">
            {#each customAssets as logo (logo.id)}
              {@const baseLogo = assets.logos.find(
                (l) => l.id === logo.originalId,
              )}
              <li
                class="group aspect-[4/3] relative bg-[#08090a] border border-dashed border-white/20 overflow-hidden has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-[#5e6ad2]"
                style="background-color: {baseLogo.background};"
              >
                <input
                  id={logo.id}
                  bind:group={selectedAssets}
                  value={logo.id}
                  type="checkbox"
                  class="sr-only"
                />
                <label for={logo.id} class="cursor-pointer w-full h-full block">
                  <figure class="grid place-items-center w-full h-full">
                    <svg
                      class="w-full h-full"
                      viewBox="0 0 {logo.canvasWidth} {logo.canvasHeight}"
                    >
                      <g
                        transform="translate({logo.logoX}, {logo.logoY}) scale({logo.logoScale}) translate(-{logo
                          .originalSvgDimensions.width / 2}, -{logo
                          .originalSvgDimensions.height / 2})"
                      >
                        <image
                          href={baseLogo.url}
                          x="0"
                          y="0"
                          width={logo.originalSvgDimensions.width}
                          height={logo.originalSvgDimensions.height}
                        />
                      </g>
                    </svg>
                  </figure>
                  <span
                    class="absolute top-4 right-4 w-7 h-7 rounded-md border-2 border-white/80 bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 group-has-[input:checked]:opacity-100 group-has-[input:focus-visible]:opacity-100"
                  >
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      viewBox="0 0 511.999 511.999"
                      class="p-1 opacity-0 group-has-[input:checked]:opacity-100 transition-all duration-300 scale-50 group-has-[input:checked]:scale-100"
                    >
                      <path
                        fill="#FFFFFF"
                        d="M506.231,75.508c-7.689-7.69-20.158-7.69-27.849,0l-319.21,319.211L33.617,269.163c-7.689-7.691-20.158-7.691-27.849,0 c-7.69,7.69-7.69,20.158,0,27.849l139.481,139.481c7.687,7.687,20.16,7.689,27.849,0l333.133-333.136 C513.921,95.666,513.921,83.198,506.231,75.508z"
                      />
                    </svg>
                  </span>
                </label>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </section>
    <section>
      <div class="container">
        <h2 class="text-2xl font-semibold">Цвета</h2>
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
