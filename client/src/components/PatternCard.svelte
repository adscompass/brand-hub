<script>
  import Icon from './Icon.svelte';

  let { pattern, checked = false, onToggle = null } = $props();

  const previewStyle = $derived.by(() => {
    if (!pattern.dataUrl) {
      return `background-color: ${pattern.backgroundColor};`;
    }
    return `background-image: url('${pattern.dataUrl}'); background-size: cover; background-position: center;`;
  });

  function handleChange(event) {
    if (onToggle) {
      onToggle({
        id: pattern.id,
        checked: event.currentTarget.checked,
      });
    }
  }
</script>

<li
  class="group relative aspect-[4/3] select-none overflow-hidden outline-offset-2 outline-[#5e6ad2] transition-all
  duration-300 ease-in-out hover:scale-[1.02]
  active:scale-[0.98] active:duration-75 has-[:focus-visible]:outline-2"
>
  <input
    id={pattern.id}
    bind:checked
    onchange={handleChange}
    value={pattern.id}
    type="checkbox"
    class="sr-only"
    data-selected={checked}
  />
  <label
    for={pattern.id}
    class="flex h-full w-full cursor-pointer items-center justify-center"
  >
    <div
      class="h-full w-full border border-dashed border-white/20 ring-1 ring-black/10"
      style={previewStyle}
    ></div>

    <div
      class="pointer-coarse:opacity-100
      text-shadow-lg absolute left-4 top-4 font-semibold opacity-0 transition-opacity duration-300
      group-hover:opacity-100"
    >
      {pattern.id}
    </div>

    <span
      class="absolute right-4 top-4 h-7 w-7 cursor-pointer rounded-md border-2 border-white/80 bg-black/20 opacity-0
      outline-offset-2 backdrop-blur-sm transition-all duration-300 hover:bg-black/30
      active:bg-black/40 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100
      group-has-[input:checked]:opacity-100"
    >
      <Icon name="check" />
    </span>
  </label>
</li>
