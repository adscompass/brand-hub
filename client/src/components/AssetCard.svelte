<script>
  import Icon from './Icon.svelte';

  let {
    asset,
    checked = false,
    type = 'original',
    baseLogo,
    onEdit = null,
    onToggle = null,
    selectedFormats = [],
    onFormatChange = null,
  } = $props();

  const availableFormats = $derived.by(() => {
    if (asset.extension === 'svg') {
      return ['svg', 'png'];
    } else if (['png', 'jpg'].includes(asset.extension)) {
      return [asset.extension];
    }
    return [];
  });

  function handleChange(event) {
    if (onToggle) {
      onToggle({
        id: asset.id,
        checked: event.currentTarget.checked,
      });
    }
  }

  function handleFormatCheckboxChange(event, format) {
    if (onFormatChange) {
      onFormatChange({
        id: asset.id,
        format: format,
        checked: event.currentTarget.checked,
      });
    }
  }

  const customPreviewStyle = $derived.by(() => {
    if (type !== 'custom') return '';
    return `aspect-ratio: ${asset.canvasWidth} / ${asset.canvasHeight};`;
  });

  const formatButtonClasses = $derived((format, index) => {
    const isChecked = selectedFormats.includes(format);
    const totalFormats = availableFormats.length;

    let classes = `
      flex-1 text-center py-1.5 px-3 text-xs font-semibold whitespace-nowrap
      cursor-pointer transition-colors duration-200
      ${isChecked ? 'bg-white/90 text-black' : 'bg-black/40 text-white/70 hover:bg-black/60'}
    `;

    if (totalFormats === 1) {
      classes += ' rounded-full';
    } else if (totalFormats === 2) {
      if (index === 0) {
        classes += ' rounded-l-full';
      } else {
        classes += ' rounded-r-full';
      }
    }
    return classes;
  });
</script>

<li
  class="group aspect-[4/3] relative select-none has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-[#5e6ad2] has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-offset-2 has-[button:focus-visible]:outline-[#5e6ad2] overflow-hidden transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] active:duration-75"
  style="background-color: {baseLogo.background};"
>
  <input
    id={asset.id}
    bind:checked
    onchange={handleChange}
    value={asset.id}
    type="checkbox"
    class="sr-only"
  />
  <label
    for={asset.id}
    class="cursor-pointer w-full h-full flex items-center justify-center p-4"
  >
    <figure
      class="object-contain"
      class:w-full={type === 'original'}
      class:h-full={type === 'original'}
      class:grid={type === 'original' && asset.extension === 'svg'}
      class:place-items-center={type === 'original'}
      class:max-w-full={type === 'custom'}
      class:max-h-full={type === 'custom'}
      class:border={type === 'custom'}
      class:border-dashed={type === 'custom'}
      class:border-white={type === 'custom'}
      class:ring-1={type === 'custom'}
      class:ring-black={type === 'custom'}
      style={type === 'custom' ? customPreviewStyle : ''}
    >
      {#if type === 'original'}
        <img
          src={asset.url}
          alt={asset.name}
          class="pointer-events-none select-none w-full h-full object-contain"
        />
        <figcaption
          class="absolute top-4 left-4 font-semibold opacity-0 pointer-coarse:opacity-100 text-shadow-lg group-hover:opacity-100 transition-opacity duration-300"
          style="color: {asset.color}"
        >
          {asset.name}
        </figcaption>
      {:else if asset.extension === 'svg'}
        <svg
          class="w-full h-full"
          viewBox="0 0 {asset.canvasWidth} {asset.canvasHeight}"
        >
          <g
            transform="translate({asset.logoX}, {asset.logoY}) rotate({asset.logoRotate ||
              0}) scale({asset.logoScale}) translate(-{asset
              .originalSvgDimensions.width / 2}, -{asset.originalSvgDimensions
              .height / 2})"
          >
            <image
              href={baseLogo.url}
              x="0"
              y="0"
              width={asset.originalSvgDimensions.width}
              height={asset.originalSvgDimensions.height}
            />
          </g>
        </svg>
      {:else if ['png', 'jpg'].includes(asset.extension)}
        <img
          src={asset.dataUrl}
          alt={asset.name || 'Кастомный логотип'}
          class="w-full h-full object-contain pointer-events-none select-none"
        />
      {:else}
        <div class="text-white/60">
          Неподдерживаемый формат логотипа: {asset.extension}
        </div>
      {/if}
    </figure>

    <span
      class="absolute top-4 right-4 w-7 h-7 rounded-md border-2 border-white/80 bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 group-has-[input:checked]:opacity-100 group-has-[input:focus-visible]:opacity-100 group-has-[button:focus-visible]:opacity-100"
    >
      <Icon name="check" />
    </span>
  </label>

  {#if type === 'original'}
    <button
      type="button"
      onclick={onEdit}
      class="absolute bottom-4 right-4 z-10 p-2 rounded-full bg-black/30 backdrop-blur-sm opacity-0 pointer-coarse:opacity-100 transition-opacity pointer-fine:group-hover:opacity-100 pointer-fine:group-has-[input:focus-visible]:opacity-100 pointer-fine:group-has-[button:focus-visible]:opacity-100"
      title="Настроить логотип"
      aria-label="Настроить логотип"
    >
      <Icon name="edit" />
    </button>
  {/if}

  {#if checked && availableFormats.length > 0}
    <div
      class="absolute bottom-4 left-4 z-10 flex gap-0 w-28 h-8 rounded-full border-2 border-white/80 overflow-hidden"
    >
      {#each availableFormats as format, index (format)}
        <input
          type="checkbox"
          name={`${asset.id}-format-${format}`}
          id={`${asset.id}-format-${format}`}
          value={format}
          checked={selectedFormats.includes(format)}
          onchange={(e) => handleFormatCheckboxChange(e, format)}
          class="sr-only"
        />
        <label
          for={`${asset.id}-format-${format}`}
          class={formatButtonClasses(format, index)}
        >
          {format.toUpperCase()}
        </label>
      {/each}
    </div>
  {/if}
</li>
