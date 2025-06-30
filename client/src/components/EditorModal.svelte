<script>
  import { gestures } from '../lib/actions/gestures';
  let { logo, onSave, onClose } = $props();

  const PAN_SENSITIVITY = 2.5;
  const ZOOM_SENSITIVITY = 0.001;

  let dialogElement;
  let originalSvgDimensions = $state({ width: 0, height: 0 });

  let editor = $state({
    canvasWidth: 512,
    canvasHeight: 384,
    logoX: 0,
    logoY: 0,
    logoScale: 1,
  });

  async function loadSvgDimensions(url) {
    try {
      const response = await fetch(url);
      const svgText = await response.text();
      const viewBoxMatch = svgText.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
      if (viewBoxMatch) {
        const width = parseFloat(viewBoxMatch[1]);
        const height = parseFloat(viewBoxMatch[2]);
        originalSvgDimensions = { width, height };
        return { width, height };
      }
    } catch (e) {
      console.error('Failed to load SVG dimensions', e);
      originalSvgDimensions = { width: 100, height: 100 };
    }
    return { width: 400, height: 300 };
  }

  $effect(() => {
    if (logo && dialogElement) {
      document.body.classList.add('modal-open');
      if (!dialogElement.open) {
        (async () => {
          const dims = await loadSvgDimensions(logo.url);
          const PADDING = 0;
          editor.canvasWidth = dims.width + PADDING * 2;
          editor.canvasHeight = dims.height + PADDING * 2;
          editor.logoX = editor.canvasWidth / 2;
          editor.logoY = editor.canvasHeight / 2;
          editor.logoScale = 1;
          dialogElement.showModal();
        })();
      }
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  });

  function handleSave() {
    const customAsset = {
      originalId: logo.id,
      ...editor,
      originalSvgDimensions,
    };
    onSave(customAsset);
    dialogElement.close();
  }

  function handleClose() {
    onClose();
    dialogElement.close();
  }

  function handleZoom(event) {
    event.preventDefault();
    const zoomFactor = 1 - event.detail.deltaY * ZOOM_SENSITIVITY;
    let newScale = editor.logoScale * zoomFactor;
    editor.logoScale = Math.max(0.1, Math.min(newScale, 5));
  }

  const logoTransform = $derived(
    `translate(${editor.logoX}, ${editor.logoY}) scale(${editor.logoScale}) translate(-${
      originalSvgDimensions.width / 2
    }, -${originalSvgDimensions.height / 2})`,
  );
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
      <button onclick={handleClose} class="p-1 rounded-full hover:bg-white/10"
        >×</button
      >
    </header>

    <main
      class="flex-1 grid grid-cols-1 md:grid-cols-[1fr,280px] gap-4 p-4 overflow-hidden"
    >
      <div
        class="bg-[#08090a] rounded-md grid place-items-center overflow-auto select-none"
      >
        <div
          class="relative touch-none"
          style="width: {editor.canvasWidth}px; height: {editor.canvasHeight}px; max-width: 100%; max-height: 100%;"
        >
          <svg
            class="w-full h-full border border-dashed border-white/20"
            style="background-color: {logo?.background};"
            viewBox="0 0 {editor.canvasWidth} {editor.canvasHeight}"
          >
            <g
              use:gestures
              onpan={(e) => {
                editor.logoX +=
                  e.detail.originalEvent.movementX * PAN_SENSITIVITY;
                editor.logoY +=
                  e.detail.originalEvent.movementY * PAN_SENSITIVITY;
              }}
              onzoom={handleZoom}
            >
              <g transform={logoTransform}>
                <image
                  href={logo?.url}
                  x="0"
                  y="0"
                  width={originalSvgDimensions.width}
                  height={originalSvgDimensions.height}
                />
              </g>
            </g>
          </svg>

          <div
            use:gestures
            onpan={(e) => {
              editor.canvasWidth += e.detail.originalEvent.movementX * 2;
            }}
            class="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-16 bg-blue-500 rounded-full cursor-ew-resize"
          ></div>
          <div
            use:gestures
            onpan={(e) => {
              editor.canvasHeight += e.detail.originalEvent.movementY * 2;
            }}
            class="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-16 bg-blue-500 rounded-full cursor-ns-resize"
          ></div>
        </div>
      </div>

      <aside class="flex flex-col gap-5 text-sm">
        <h4 class="font-bold">Холст</h4>
        <div>
          <p class="block mb-1">Ширина: {Math.round(editor.canvasWidth)}px</p>
          <p class="block mb-1">Высота: {Math.round(editor.canvasHeight)}px</p>
        </div>
        <hr class="border-white/10" />
        <h4 class="font-bold">Логотип</h4>
        <div>
          <label for="scale-slider" class="block mb-2 font-medium"
            >Масштаб ({Math.round(editor.logoScale * 100)}%)</label
          >
          <input
            id="scale-slider"
            type="range"
            min="0.1"
            max="5"
            step="0.01"
            bind:value={editor.logoScale}
            class="w-full"
          />
        </div>
        <div>
          <p class="block mb-1">X: {Math.round(editor.logoX)}</p>
          <p class="block mb-1">Y: {Math.round(editor.logoY)}</p>
        </div>
        <button
          onclick={() => {
            editor.logoX = editor.canvasWidth / 2;
            editor.logoY = editor.canvasHeight / 2;
            editor.logoScale = 1;
          }}
          class="w-full text-center py-2 rounded-md bg-white/10 hover:bg-white/20"
          >Центрировать логотип</button
        >
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
