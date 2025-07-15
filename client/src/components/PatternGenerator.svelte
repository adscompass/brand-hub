<script>
  import { onMount } from 'svelte';

  let { patterns, brandColors, onSave } = $props();

  let basePatternSvg = $state('');

  // Состояния для кастомизации
  let selectedPattern = $state(patterns[0]);
  let patternColor = $state(brandColors[0].items[0].hex);
  let backgroundColor = $state(brandColors[0].items[1].hex);

  onMount(async () => {
    if (selectedPattern) {
      const response = await fetch(selectedPattern.url);
      basePatternSvg = await response.text();
    }
  });

  const previewStyle = $derived.by(() => {
    if (!basePatternSvg) return '';

    const innerSvgContent =
      basePatternSvg.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1] || '';

    const coloredInnerSvg = innerSvgContent.replace(
      /currentColor/g,
      patternColor,
    );

    const viewBoxMatch = basePatternSvg.match(
      /viewBox="0 0 ([\d.]+) ([\d.]+)"/,
    );
    const patternWidth = viewBoxMatch ? viewBoxMatch[1] : '50';
    const patternHeight = viewBoxMatch ? viewBoxMatch[2] : '50';

    const finalSvgForPreview = `
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
      btoa(unescape(encodeURIComponent(finalSvgForPreview)));
    return `background-image: url('${dataUrl}'); background-size: cover;`;
  });

  function handleSave() {
    onSave({
      baseId: selectedPattern.id,
      basePatternUrl: selectedPattern.url,
      patternColor: patternColor,
      backgroundColor: backgroundColor,
    });
  }
</script>

<div class="flex flex-col items-start gap-8 md:flex-row">
  <div class="flex w-full shrink-0 flex-col gap-6 md:w-64">
    <div>
      <h4 class="mb-2 font-semibold">Цвет паттерна</h4>
      <div class="flex flex-wrap gap-2">
        {#each brandColors.flatMap((g) => g.items) as color (color.hex)}
          <button
            onclick={() => (patternColor = color.hex)}
            class="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
            class:border-white={patternColor === color.hex}
            class:border-transparent={patternColor !== color.hex}
            style="background-color: {color.hex};"
            aria-label="Выбрать цвет {color.name || color.hex}"
          ></button>
        {/each}
      </div>
    </div>
    <div>
      <h4 class="mb-2 font-semibold">Цвет фона</h4>
      <div class="flex flex-wrap gap-2">
        {#each brandColors.flatMap((g) => g.items) as color (color.hex)}
          <button
            onclick={() => (backgroundColor = color.hex)}
            class="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
            class:border-white={backgroundColor === color.hex}
            class:border-transparent={backgroundColor !== color.hex}
            style="background-color: {color.hex};"
            aria-label="Выбрать цвет фона {color.name || color.hex}"
          ></button>
        {/each}
      </div>
    </div>
    <button
      onclick={handleSave}
      class="w-full rounded-md bg-white/10 py-2 text-center hover:bg-white/20"
    >
      Добавить в загрузку
    </button>
  </div>

  <div
    class="aspect-video w-full rounded-lg bg-black/20 shadow-inner"
    style={previewStyle}
  ></div>
</div>
