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

  let selectedAssets = [];

  import JSZip from 'jszip';

  async function download() {
    let zip = new JSZip();
    let logosFolder = zip.folder('logos');

    let selectedObjects = assets.logos.filter((logo) =>
      selectedAssets.includes(logo.id),
    );

    if (selectedObjects.length === 0) {
      return;
    }

    await Promise.all(
      selectedObjects.map(async (logo) => {
        try {
          const response = await fetch(logo.url);
          if (!response.ok)
            throw new Error(`Не удалось получить ассет ${logo.url}`);
          const file = response.blob();
          const extension = logo.extension;
          const filename = `${logo.id.replace(/ /g, '_')}.${extension}`;
          logosFolder.file(filename, file);
        } catch (error) {
          console.error(error);
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
              class="group aspect-[4/3] relative overflow-hidden transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] active:duration-75 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-[#5e6ad2]"
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
                    class="pointer-events-none select-none"
                  />
                  <figcaption
                    class="absolute top-4 left-4 font-semibold opacity-0 text-shadow-lg group-hover:opacity-100 transition-opacity duration-300 text-black"
                    style="color: {logo.color}"
                  >
                    {logo.name}
                  </figcaption>
                </figure>

                <span
                  class="absolute top-4 right-4 w-7 h-7 rounded-md border-2 border-white/80 bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 group-has-[input:checked]:opacity-100 group-has-[input:focus-visible]:opacity-100"
                >
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    viewBox="0 0 511.999 511.999"
                    style="enable-background:new 0 0 511.999 511.999;"
                    xml:space="preserve"
                    class="p-1 opacity-0 group-has-[input:checked]:opacity-100 transition-all duration-300 scale-50 group-has-[input:checked]:scale-100"
                    ><g
                      ><g
                        ><path
                          fill="#FFFFFF"
                          d="M506.231,75.508c-7.689-7.69-20.158-7.69-27.849,0l-319.21,319.211L33.617,269.163c-7.689-7.691-20.158-7.691-27.849,0 c-7.69,7.69-7.69,20.158,0,27.849l139.481,139.481c7.687,7.687,20.16,7.689,27.849,0l333.133-333.136 C513.921,95.666,513.921,83.198,506.231,75.508z"
                        /></g
                      ></g
                    ></svg
                  >
                </span>
              </label>
            </li>
          {/each}
        </ul>
      </div>
    </section>
    <section>
      <div class="container">
        <h2 class="text-2xl font-semibold">Цвета</h2>
      </div>
    </section>
  </main>
</div>
