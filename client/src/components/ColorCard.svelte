<script>
  let { color } = $props();

  let copied = $state(false);
  let timeoutId = null;

  function copyToClipboard() {
    navigator.clipboard.writeText(color.hex);
    copied = true;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      copied = false;
    }, 2000);
  }
</script>

<button
  type="button"
  onclick={copyToClipboard}
  class="relative w-full h-24 rounded-lg flex flex-col justify-end p-3 text-left transition-transform hover:-translate-y-1 active:scale-95"
  style="background-color: {color.hex}"
  title="Нажмите, чтобы скопировать {color.hex}"
>
  <div class="font-semibold" style="color: {color.textColor || 'auto'}">
    {color.name}
  </div>
  <div class="text-sm opacity-70" style="color: {color.textColor || 'auto'}">
    {color.hex}
  </div>

  {#if copied}
    <div
      class="absolute inset-0 grid place-items-center bg-black/50 backdrop-blur-sm rounded-lg"
    >
      <span class="font-bold text-white">Скопировано!</span>
    </div>
  {/if}
</button>
