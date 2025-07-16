<script>
  let { patterns, brandColors, onSave } = $props();
  let selectedPattern = $state(patterns[0]);
  let patternColor = $state(brandColors[0].items[0].hex);
  let backgroundColor = $state(brandColors[0].items[1].hex);
  let padding = $state(0);
  let previewMode = $state('tile');

  const previewData = $derived.by(() => {
    if (!selectedPattern.svgContent) return { style: '', type: 'empty' };

    const innerSvgContent =
      selectedPattern.svgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1] || '';

    const coloredInnerSvg = innerSvgContent.replace(
      /currentColor/g,
      patternColor,
    );

    const viewBoxMatch = selectedPattern.svgContent.match(
      /viewBox="0 0 ([\d.]+) ([\d.]+)"/,
    );
    const baseWidth = viewBoxMatch ? parseFloat(viewBoxMatch[1]) : 50;
    const baseHeight = viewBoxMatch ? parseFloat(viewBoxMatch[2]) : 50;

    if (previewMode === 'tile') {
      const tileSvg = `
        <svg width="100%" height="100%" viewBox="0 0 ${baseWidth} ${baseHeight}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${backgroundColor}" />
          ${coloredInnerSvg}
        </svg>`;

      const dataUrl =
        'data:image/svg+xml;base64,' +
        btoa(unescape(encodeURIComponent(tileSvg)));
      return {
        type: 'tile',
        src: dataUrl,
      };
    } else {
      const patternWidth = baseWidth + padding;
      const patternHeight = baseHeight + padding;
      const infiniteSvg = `
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="p" width="${patternWidth}" height="${patternHeight}" patternUnits="userSpaceOnUse">
              ${coloredInnerSvg}
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="${backgroundColor}"/>
          <rect width="100%" height="100%" fill="url(#p)"/>
        </svg>`;

      const dataUrl =
        'data:image/svg+xml;base64,' +
        btoa(unescape(encodeURIComponent(infiniteSvg)));
      return {
        style: `background-image: url('${dataUrl}'); background-size: cover;`,
        type: 'infinite',
      };
    }
  });

  $effect(() => {
    const currentPattern = selectedPattern;

    fetch(currentPattern.url)
      .then((res) => res.text())
      .then((svgText) => {
        if (currentPattern.id === selectedPattern.id) {
          currentPattern.svgContent = svgText;
        }
      });
  });

  function handleSave() {
    onSave({
      baseId: selectedPattern.id,
      basePatternUrl: selectedPattern.url,
      patternColor: patternColor,
      backgroundColor: backgroundColor,
      padding: padding,
    });
  }
</script>

<div class="flex flex-col items-start gap-8 md:flex-row">
  <div class="flex w-full shrink-0 flex-col gap-6 md:w-72">
    <div>
      <h4 class="mb-2 font-semibold">Шаблон</h4>
      <div class="flex flex-wrap gap-2">
        {#each patterns as p (p.id)}
          <button
            onclick={() => (selectedPattern = p)}
            class="h-10 max-w-sm grow rounded-md border-2 bg-white/10 px-3 text-white/80 transition-all hover:bg-white/20 active:scale-95 {selectedPattern ===
            p
              ? 'border-[#5e6ad2]'
              : ''}"
          >
            {p.name}
          </button>
        {/each}
      </div>
    </div>

    <div>
      <h4 class="mb-2 font-semibold">Цвет элементов</h4>
      <div class="flex flex-wrap items-center gap-2">
        {#each brandColors.flatMap((g) => g.items) as color (color.hex)}
          <button
            onclick={() => (patternColor = color.hex)}
            class="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95"
            style="background-color: {color.hex};"
            aria-label="Выбрать цвет {color.name || color.hex}"
          ></button>
        {/each}
        <input
          type="color"
          bind:value={patternColor}
          class="h-9 w-10 cursor-pointer appearance-none rounded-md border-none bg-transparent p-0"
          aria-label="Выбрать свой цвет для элементов"
        />
      </div>
    </div>

    <div>
      <h4 class="mb-2 font-semibold">Цвет фона</h4>
      <div class="flex flex-wrap items-center gap-2">
        {#each brandColors.flatMap((g) => g.items) as color (color.hex)}
          <button
            onclick={() => (backgroundColor = color.hex)}
            class="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95"
            style="background-color: {color.hex};"
            aria-label="Выбрать цвет фона {color.name || color.hex}"
          ></button>
        {/each}
        <input
          type="color"
          bind:value={backgroundColor}
          class="h-9 w-10 cursor-pointer appearance-none rounded-md border-none bg-transparent p-0"
          aria-label="Выбрать свой цвет для фона"
        />
      </div>
    </div>

    <div>
      <label for="padding-slider" class="mb-2 block font-semibold"
        >Отступ между элементами: {padding}px</label
      >
      <input
        id="padding-slider"
        type="range"
        min="0"
        max="150"
        step="1"
        bind:value={padding}
        class="w-full"
      />
    </div>

    <div>
      <h4 class="mb-2 font-semibold">Режим превью</h4>
      <div class="flex w-full rounded-md bg-white/10 p-1 text-sm">
        <button
          onclick={() => (previewMode = 'infinite')}
          class="flex-1 rounded-md px-3 py-1.5 transition-colors {previewMode ===
          'infinite'
            ? 'bg-[#5e6ad2]'
            : 'hover:bg-white/10'}"
        >
          Фон
        </button>
        <button
          onclick={() => (previewMode = 'tile')}
          class="flex-1 rounded-md px-3 py-1.5 transition-colors {previewMode ===
          'tile'
            ? 'bg-[#5e6ad2]'
            : 'hover:bg-white/10'}"
        >
          Тайл
        </button>
      </div>
    </div>

    <button
      onclick={handleSave}
      class="mt-2 w-full rounded-md bg-white/10 py-2 text-center font-semibold transition-colors duration-300 hover:bg-white/20"
    >
      Добавить в загрузку
    </button>
  </div>

  <div
    class="flex aspect-video h-full w-full grow place-items-center items-center justify-center rounded-lg bg-black/20 shadow-inner"
    aria-label="Превью сгенерированного паттерна"
  >
    {#if previewData.type === 'infinite'}
      <div class="h-full w-full" style={previewData.style}></div>
    {:else if previewData.type === 'tile'}
      <img
        src={previewData.src}
        alt="Превью одиночного тайла"
        class="max-h-full max-w-full object-contain"
      />
    {/if}
  </div>
</div>
