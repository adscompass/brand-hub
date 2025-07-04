<script>
  import Icon from './Icon.svelte';
  import RasterEditorPanel from './RasterEditorPanel.svelte';
  import VectorEditorPanel from './VectorEditorPanel.svelte';
  let { logo, onSave, onClose } = $props();

  let dialogElement;
  let activeEditorPanel = $state(null);

  let editor = $state({
    canvasWidth: 512,
    canvasHeight: 384,
    logoX: 0,
    logoY: 0,
    logoScale: 1,
    logoRotate: 0,
    keepAspectRatio: false,
  });

  $effect(() => {
    if (logo && dialogElement) {
      document.body.classList.add('modal-open');
      if (!dialogElement.open) {
        (async () => {
          editor.canvasWidth = logo.width;
          editor.canvasHeight = logo.height;
          editor.logoX = editor.canvasWidth / 2;
          editor.logoY = editor.canvasHeight / 2;
          editor.logoScale = 1;
          editor.logoRotate = 0;
          editor.keepAspectRatio = false;
          dialogElement.showModal();
        })();
      }
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  });

  async function handleSave() {
    if (
      !activeEditorPanel ||
      typeof activeEditorPanel.getExportData !== 'function'
    ) {
      console.error('Активный редактор не предоставляет метод getExportData()');
      return;
    }

    const exportData = await activeEditorPanel.getExportData();

    if (!exportData) {
      console.error('Не удалось получить данные для экспорта из редактора.');
      return;
    }

    const customAsset = {
      originalId: logo.id,
      canvasWidth: editor.canvasWidth,
      canvasHeight: editor.canvasHeight,
      logoX: editor.logoX,
      logoY: editor.logoY,
      logoScale: editor.logoScale,
      logoRotate: editor.logoRotate,
      ...exportData,
    };
    onSave(customAsset);
    dialogElement.close();
  }

  function handleClose() {
    onClose();
    dialogElement.close();
  }
</script>

<dialog
  bind:this={dialogElement}
  onclose={onClose}
  class="w-full max-w-5xl bg-transparent p-0 mx-auto my-auto text-white"
>
  <div class="bg-[#181a1b] rounded-lg shadow-2xl flex flex-col h-[90vh]">
    <header
      class="flex items-center justify-between p-4 border-b border-white/10 shrink-0"
    >
      <h3 class="text-lg font-semibold">Настройка: {logo?.name}</h3>
      <button onclick={handleClose} class="p-2 rounded-full hover:bg-white/10"
        ><Icon name="close" /></button
      >
    </header>

    <main
      class="flex-1 grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4 p-4 overflow-hidden"
    >
      <div
        class="bg-[#08090a] rounded-md grid place-items-center overflow-auto select-none"
      >
        {#if logo.extension === 'svg'}
          <VectorEditorPanel bind:editor {logo} bind:this={activeEditorPanel} />
        {:else if logo.extension === 'png' || logo.extension === 'jpg'}
          <RasterEditorPanel
            bind:editor
            {logo}
            bind:this={activeEditorPanel}
          />{:else}
          <div
            class="flex items-center justify-center w-full h-full text-white/60"
          >
            Логотип в формате {logo.extension} не поддерживается для редактирования.
          </div>
        {/if}
      </div>

      <aside class="flex flex-col gap-5 text-sm overflow-y-auto pr-2">
        <div>
          <h4 class="font-bold mb-2">Холст</h4>
          <div class="space-y-1.5 text-xs">
            <div
              class="grid grid-cols-[1fr_80px] place-content-center items-center mb-2"
            >
              <span class="text-white/60">Ширина:</span>
              <div class="grid grid-cols-[1fr_14px] items-center gap-1">
                <input
                  type="number"
                  name="canvas-width"
                  id="canvas-width"
                  bind:value={editor.canvasWidth}
                  class="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-white"
                />
                <span class="text-white/60">px</span>
              </div>
            </div>
            <div
              class="grid grid-cols-[1fr_80px] place-content-center items-center mb-2"
            >
              <span class="text-white/60">Высота:</span>
              <div class="grid grid-cols-[1fr_14px] items-center gap-1">
                <input
                  type="number"
                  name="canvas-height"
                  id="canvas-height"
                  bind:value={editor.canvasHeight}
                  class="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-white"
                />
                <span class="text-white/60">px</span>
              </div>
            </div>
            <div class="flex items-center justify-between mt-2">
              <label for="aspect-ratio-lock" class="text-white/60"
                >Сохранять пропорции</label
              >
              <input
                id="aspect-ratio-lock"
                type="checkbox"
                bind:checked={editor.keepAspectRatio}
                class="w-4 h-4"
              />
            </div>
          </div>
        </div>

        <hr class="border-white/10" />

        <div>
          <h4 class="font-bold mb-2">Логотип</h4>
          <div class="flex flex-col gap-4">
            <div>
              <div
                class="grid grid-cols-[1fr_80px] place-content-center items-center mb-2"
              >
                <label for="scale-slider" class="text-xs">Масштаб</label>
                <div class="flex justify-between items-center">
                  <input
                    id="scale-slider"
                    type="number"
                    min="0.1"
                    max="5"
                    step="0.1"
                    bind:value={editor.logoScale}
                    class="w-full bg-transparent border border-white/20 rounded px-2 py-0.5 text-white text-right"
                  />
                </div>
              </div>
              <input
                id="scale-slider"
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                bind:value={editor.logoScale}
                class="w-full"
              />
            </div>
            <div>
              <div
                class="grid grid-cols-[1fr_80px] place-content-center items-center mb-2"
              >
                <label for="rotate-slider" class="text-xs">Поворот</label>
                <div class="flex justify-between items-center">
                  <input
                    type="number"
                    bind:value={editor.logoRotate}
                    min="-180"
                    max="180"
                    class="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-white text-right"
                  />
                </div>
              </div>
              <input
                id="rotate-slider"
                type="range"
                min="-180"
                max="180"
                step="1"
                bind:value={editor.logoRotate}
                class="w-full"
              />
            </div>
            <div class="space-y-1.5 text-xs">
              <div
                class="grid grid-cols-[1fr_80px] place-content-center items-center mb-2"
              >
                <label for="logo-x" class="text-white/60">X:</label>
                <input
                  step="1"
                  name="logo-x"
                  id="logo-x"
                  type="number"
                  bind:value={editor.logoX}
                  class="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-white text-right"
                />
              </div>
              <div
                class="grid grid-cols-[1fr_80px] place-content-center items-center mb-2"
              >
                <label for="logo-y" class="text-white/60">Y:</label>
                <input
                  step="1"
                  name="logo-y"
                  id="logo-y"
                  type="number"
                  bind:value={editor.logoY}
                  class="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-white text-right"
                />
              </div>
            </div>
            <button
              onclick={() => {
                editor.logoX = editor.canvasWidth / 2;
                editor.logoY = editor.canvasHeight / 2;
                editor.logoScale = 1;
                editor.logoRotate = 0;
              }}
              class="w-full text-center py-2 rounded-md bg-white/10 hover:bg-white/20 text-xs"
              >Сбросить трансформации</button
            >
          </div>
        </div>
      </aside>
    </main>

    <footer
      class="flex justify-end gap-4 p-4 border-t border-white/10 shrink-0"
    >
      <button
        onclick={handleClose}
        class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
        >Отмена</button
      >
      <button
        onclick={handleSave}
        class="px-4 py-2 rounded-lg bg-[#5e6ad2] hover:bg-[#5058b8]"
        >Сохранить и добавить</button
      >
    </footer>
  </div>
</dialog>
