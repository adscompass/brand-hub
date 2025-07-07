<script>
  let { styles } = $props();

  let inputText = $state('Каждая буква имеет смысл.');
</script>

<div class="flex flex-col gap-8">
  <textarea
    bind:value={inputText}
    class="min-h-32 w-full resize-y rounded-lg bg-white/10 p-4 text-base text-white focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]"
    placeholder="Введите текст для предпросмотра типографики..."
    aria-label="Текст для предпросмотра типографики"
  ></textarea>

  {#each styles as style (style.id)}
    <div class="flex flex-col gap-4 rounded-lg bg-white/5 p-6 shadow-inner">
      <h3 class="text-lg font-semibold text-white/80">{style.name}</h3>
      <div class="rounded-md bg-black/20 py-4 sm:px-4">
        <p class={style.className}>
          {inputText || 'Пустой текст для предпросмотра.'}
        </p>
      </div>

      <div class="space-y-1.5 text-xs">
        <h4 class="mb-2 font-medium text-white/80">CSS Свойства:</h4>
        <div class="flex flex-col gap-1.5">
          {#each Object.entries(style.properties) as [prop, value] (prop)}
            <div class="flex items-start">
              <span class="w-28 shrink-0 font-mono text-white/50">{prop}:</span>
              <span class="flex-grow break-words font-mono text-white/90"
                >{value};</span
              >
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/each}
</div>
