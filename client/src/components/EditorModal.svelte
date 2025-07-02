<script>
  import { gestures } from '../lib/actions/gestures';
  import Icon from './Icon.svelte';
  let { logo, onSave, onClose } = $props();
  const ZOOM_SENSITIVITY = 0.001;

  let dialogElement;
  let originalSvgDimensions = $state({ width: 0, height: 0 });

  let panState = $state(null);
  let rotateState = $state(null);
  let resizeState = $state(null);
  let aspectRatio = $state(1);

  let editor = $state({
    canvasWidth: 512,
    canvasHeight: 384,
    logoX: 0,
    logoY: 0,
    logoScale: 1,
    logoRotate: 0,
    keepAspectRatio: false,
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
          editor.canvasWidth = dims.width;
          editor.canvasHeight = dims.height;
          if (dims.height > 0) {
            aspectRatio = dims.width / dims.height;
          }
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

  $effect(() => {
    if (!editor.keepAspectRatio) {
      if (editor.canvasHeight > 0) {
        aspectRatio = editor.canvasWidth / editor.canvasHeight;
      }
    }
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

  function handlePanStart(event) {
    panState = {
      initialLogoX: editor.logoX,
      initialLogoY: editor.logoY,
      initialPointerX: event.detail.x,
      initialPointerY: event.detail.y,
      axisLock: null,
    };
  }

  function handlePan(event) {
    if (!panState) return;

    const screenDeltaX = event.detail.x - panState.initialPointerX;
    const screenDeltaY = event.detail.y - panState.initialPointerY;

    let finalX = panState.initialLogoX + screenDeltaX;
    let finalY = panState.initialLogoY + screenDeltaY;

    if (event.detail.shiftKey) {
      if (!panState.axisLock) {
        if (Math.abs(screenDeltaX) > 5 || Math.abs(screenDeltaY) > 5) {
          if (Math.abs(screenDeltaX) > Math.abs(screenDeltaY)) {
            panState.axisLock = { axis: 'y', position: finalY };
          } else {
            panState.axisLock = { axis: 'x', position: finalX };
          }
        }
      }

      if (panState.axisLock) {
        if (panState.axisLock.axis === 'x') {
          finalX = panState.axisLock.position;
        } else {
          finalY = panState.axisLock.position;
        }
      }
    } else {
      panState.axisLock = null;
    }

    editor.logoX = finalX;
    editor.logoY = finalY;
  }

  function handlePanEnd() {
    panState = null;
  }

  function handleResizeStart(event) {
    resizeState = {
      initialCanvasWidth: editor.canvasWidth,
      initialCanvasHeight: editor.canvasHeight,
      initialLogoX: editor.logoX,
      initialLogoY: editor.logoY,
      initialPointerX: event.detail.x,
      initialPointerY: event.detail.y,
    };
  }

  function handleResize(event, edge) {
    if (!resizeState) return;

    const dx = event.detail.x - resizeState.initialPointerX;
    const dy = event.detail.y - resizeState.initialPointerY;

    let newWidth = resizeState.initialCanvasWidth;
    let newHeight = resizeState.initialCanvasHeight;
    let logoDeltaX = 0;
    let logoDeltaY = 0;

    switch (edge) {
      case 'right':
      case 'left': {
        const widthChange = (edge === 'right' ? dx : -dx) * 2;
        newWidth = resizeState.initialCanvasWidth + widthChange;
        if (editor.keepAspectRatio && aspectRatio > 0) {
          newHeight = newWidth / aspectRatio;
        }
        if (edge === 'left') {
          logoDeltaX = -dx * 2;
        }
        break;
      }

      case 'bottom':
      case 'top': {
        const heightChange = (edge === 'bottom' ? dy : -dy) * 2;
        newHeight = resizeState.initialCanvasHeight + heightChange;
        if (editor.keepAspectRatio && aspectRatio > 0) {
          newWidth = newHeight * aspectRatio;
        }
        if (edge === 'top') {
          logoDeltaY = -dy * 2;
        }
        break;
      }
    }

    editor.canvasWidth = Math.max(50, newWidth);
    editor.canvasHeight = Math.max(50, newHeight);
    editor.logoX = resizeState.initialLogoX + logoDeltaX;
    editor.logoY = resizeState.initialLogoY + logoDeltaY;
  }

  function handleResizeEnd() {
    resizeState = null;
  }

  function wrapAngle(angle) {
    return ((((angle + 180) % 360) + 360) % 360) - 180;
  }

  function handleZoom(event) {
    event.preventDefault();
    if (event.detail.shiftKey) {
      const rotateFactor = event.detail.deltaY * 0.1;
      let newRotate = editor.logoRotate + rotateFactor;
      editor.logoRotate = wrapAngle(newRotate);
    } else {
      const zoomFactor = 1 - event.detail.deltaY * ZOOM_SENSITIVITY;
      let newScale = editor.logoScale * zoomFactor;
      editor.logoScale = Math.max(0.1, Math.min(newScale, 5));
    }
  }

  const logoTransform = $derived(
    `translate(${editor.logoX}, ${editor.logoY}) rotate(${editor.logoRotate}) scale(${
      editor.logoScale
    }) translate(-${originalSvgDimensions.width / 2}, -${originalSvgDimensions.height / 2})`,
  );

  function handlePinch(event) {
    event.preventDefault();
    let newScale = editor.logoScale * (1 + (event.detail.scale - 1) * 0.5);
    editor.logoScale = Math.max(0.1, Math.min(newScale, 5));
  }

  function handleRotateStart() {
    rotateState = {
      initialLogoRotate: editor.logoRotate,
    };
  }

  function handleRotate(event) {
    if (!rotateState) return;
    editor.logoRotate = rotateState.initialLogoRotate + event.detail.rotation;
  }

  function handleRotateEnd() {
    editor.logoRotate = wrapAngle(editor.logoRotate);
    rotateState = null;
  }

  let scaleInput = $state('100');

  $effect(() => {
    const currentInputValue = parseFloat(scaleInput);
    const realScalePercent = Math.round(editor.logoScale * 100);

    if (currentInputValue !== realScalePercent) {
      scaleInput = realScalePercent.toString();
    }
  });

  $effect(() => {
    const newScale = parseFloat(scaleInput) / 100;
    if (!isNaN(newScale) && newScale > 0) {
      if (Math.abs(editor.logoScale - newScale) > 0.001) {
        editor.logoScale = Math.max(0.1, Math.min(newScale, 5));
      }
    }
  });
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
        <div
          class="relative touch-none"
          style="width: {editor.canvasWidth}px; height: {editor.canvasHeight}px; max-width: 100%; max-height: 100%;"
        >
          <svg
            class="w-full h-full border border-dashed border-white/20"
            style="background-color: {logo?.background};"
            viewBox="0 0 {editor.canvasWidth} {editor.canvasHeight}"
          >
            <rect
              use:gestures
              onpanstart={handlePanStart}
              onpan={handlePan}
              onpanend={handlePanEnd}
              onzoom={handleZoom}
              onpinch={handlePinch}
              onrotatestart={handleRotateStart}
              onrotate={handleRotate}
              onrotateend={handleRotateEnd}
              width={editor.canvasWidth}
              height={editor.canvasHeight}
              fill="transparent"
            />
            <g transform={logoTransform} class="pointer-events-none">
              <image
                href={logo?.url}
                x="0"
                y="0"
                width={originalSvgDimensions.width}
                height={originalSvgDimensions.height}
              />
            </g>
          </svg>

          <div
            use:gestures
            onpanstart={handleResizeStart}
            onpan={(e) => handleResize(e, 'top')}
            onpanend={handleResizeEnd}
            class="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-16 bg-blue-500 rounded-full cursor-ns-resize"
          ></div>
          <div
            use:gestures
            onpanstart={handleResizeStart}
            onpan={(e) => handleResize(e, 'right')}
            onpanend={handleResizeEnd}
            class="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-16 bg-blue-500 rounded-full cursor-ew-resize"
          ></div>
          <div
            use:gestures
            onpanstart={handleResizeStart}
            onpan={(e) => handleResize(e, 'bottom')}
            onpanend={handleResizeEnd}
            class="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-16 bg-blue-500 rounded-full cursor-ns-resize"
          ></div>
          <div
            use:gestures
            onpanstart={handleResizeStart}
            onpan={(e) => handleResize(e, 'left')}
            onpanend={handleResizeEnd}
            class="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-16 bg-blue-500 rounded-full cursor-ew-resize"
          ></div>
        </div>
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
