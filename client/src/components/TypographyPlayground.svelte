<script>
  let { styles } = $props();

  let inputText = $state('Каждая буква имеет смысл.');
</script>

<div class="flex flex-col gap-8">
  <textarea
    bind:value={inputText}
    class="w-full p-4 bg-white/10 rounded-lg text-base text-white focus:outline-none focus:ring-2 focus:ring-[#5e6ad2] min-h-32 resize-y"
    placeholder="Введите текст для предпросмотра типографики..."
    aria-label="Текст для предпросмотра типографики"
  ></textarea>

  {#each styles as style (style.id)}
    <div class="flex flex-col gap-4 p-6 bg-white/5 rounded-lg shadow-inner">
      <h3 class="text-lg font-semibold text-white/80">{style.name}</h3>
      <div class="py-4 sm:px-4 bg-black/20 rounded-md">
        <p class={style.className}>
          {inputText || 'Пустой текст для предпросмотра.'}
        </p>
      </div>

      <div class="space-y-1.5 text-xs">
        <h4 class="font-medium text-white/80 mb-2">CSS Свойства:</h4>
        <div class="flex flex-col gap-1.5">
          {#each Object.entries(style.properties) as [prop, value] (prop)}
            <div class="flex items-start">
              <span class="font-mono text-white/50 w-28 shrink-0">{prop}:</span>
              <span class="font-mono text-white/90 flex-grow break-words"
                >{value};</span
              >
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/each}
</div>
