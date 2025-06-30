<script>
  import Icons from './Icons.svelte';

  let {
    asset,
    checked = false,
    type = 'original',
    baseLogo,
    onEdit = null,
    onToggle = null,
  } = $props();

  function handleChange(event) {
    if (onToggle) {
      onToggle({
        id: asset.id,
        checked: event.currentTarget.checked,
      });
    }
  }

  const customPreviewStyle = $derived.by(() => {
    if (type !== 'custom') return '';
    return `aspect-ratio: ${asset.canvasWidth} / ${asset.canvasHeight};`;
  });
</script>

<li
  class="group aspect-[4/3] relative has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-[#5e6ad2] has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-offset-2 has-[button:focus-visible]:outline-[#5e6ad2] overflow-hidden transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] active:duration-75"
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
      class:w-full={type === 'original'}
      class:h-full={type === 'original'}
      class:grid={type === 'original'}
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
          class="pointer-events-none select-none max-w-[60%]"
        />
        <figcaption
          class="absolute top-4 left-4 font-semibold opacity-0 pointer-coarse:opacity-100 text-shadow-lg group-hover:opacity-100 transition-opacity duration-300"
          style="color: {asset.color}"
        >
          {asset.name}
        </figcaption>
      {:else}
        <svg
          class="w-full h-full"
          viewBox="0 0 {asset.canvasWidth} {asset.canvasHeight}"
        >
          <g
            transform="translate({asset.logoX}, {asset.logoY}) scale({asset.logoScale}) translate(-{asset
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
      {/if}
    </figure>

    <span
      class="absolute top-4 right-4 w-7 h-7 rounded-md border-2 border-white/80 bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 group-has-[input:checked]:opacity-100 group-has-[input:focus-visible]:opacity-100 group-has-[button:focus-visible]:opacity-100"
    >
      <Icons icon="check" />
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
      <Icons icon="edit" />
    </button>
  {/if}
</li>
