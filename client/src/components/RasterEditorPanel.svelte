<script>
  import { gestures } from '../lib/actions/gestures';

  let { editor = $bindable(), logo } = $props();

  let panState = $state(null);
  let rotateState = $state(null);
  let resizeState = $state(null);

  let canvasElement;
  let ctx;
  let rasterImage = null;

  const dpr = window.devicePixelRatio || 1;
  const ZOOM_SENSITIVITY = 0.001;

  const originalRasterAspectRatio = $derived.by(() => {
    if (logo && logo.height > 0) {
      return logo.width / logo.height;
    }
    return 1;
  });

  function drawCanvas() {
    if (!ctx || !rasterImage) return;

    canvasElement.width = editor.canvasWidth * dpr;
    canvasElement.height = editor.canvasHeight * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, editor.canvasWidth, editor.canvasHeight);

    // ctx.fillStyle = logo.background || '#000000';
    // ctx.fillRect(0, 0, editor.canvasWidth, editor.canvasHeight);

    ctx.save();

    ctx.translate(editor.logoX, editor.logoY);
    ctx.rotate((editor.logoRotate * Math.PI) / 180);
    ctx.scale(editor.logoScale, editor.logoScale);

    ctx.drawImage(
      rasterImage,
      -rasterImage.width / 2,
      -rasterImage.height / 2,
      rasterImage.width,
      rasterImage.height,
    );

    ctx.restore();
  }

  $effect(() => {
    if (canvasElement && logo && ['png', 'jpg'].includes(logo.extension)) {
      ctx = canvasElement.getContext('2d');
      const img = new Image();
      img.onload = () => {
        rasterImage = img;
        if (
          editor.canvasWidth === 0 ||
          editor.canvasHeight === 0 ||
          (editor.canvasWidth === 512 && editor.canvasHeight === 384)
        ) {
          editor.canvasWidth = img.width;
          editor.canvasHeight = img.height;
          editor.logoX = img.width / 2;
          editor.logoY = img.height / 2;
          editor.logoScale = 1;
          editor.logoRotate = 0;
        }
        drawCanvas();
      };
      img.onerror = (e) => {
        console.error('Failed to load raster image:', logo.url, e);
        rasterImage = null;
        editor.canvasWidth = logo.width || 400;
        editor.canvasHeight = logo.height || 300;
        drawCanvas();
      };
      img.src = logo.url;
    }
  });

  $effect(() => {
    console.log(
      editor.canvasWidth,
      editor.canvasHeight,
      editor.logoX,
      editor.logoY,
      editor.logoScale,
      editor.logoRotate,
    );
    drawCanvas();
  });

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

    switch (edge) {
      case 'right':
        newWidth = resizeState.initialCanvasWidth + dx;
        if (editor.keepAspectRatio && originalRasterAspectRatio > 0) {
          newHeight = newWidth / originalRasterAspectRatio;
        }
        break;
      case 'left':
        newWidth = resizeState.initialCanvasWidth - dx;
        if (editor.keepAspectRatio && originalRasterAspectRatio > 0) {
          newHeight = newWidth / originalRasterAspectRatio;
        }
        editor.logoX = resizeState.initialLogoX - dx;
        break;
      case 'bottom':
        newHeight = resizeState.initialCanvasHeight + dy;
        if (editor.keepAspectRatio && originalRasterAspectRatio > 0) {
          newWidth = newHeight * originalRasterAspectRatio;
        }
        break;
      case 'top':
        newHeight = resizeState.initialCanvasHeight - dy;
        if (editor.keepAspectRatio && originalRasterAspectRatio > 0) {
          newWidth = newHeight * originalRasterAspectRatio;
        }
        editor.logoY = resizeState.initialLogoY - dy;
        break;
    }
    editor.canvasWidth = Math.max(50, newWidth);
    editor.canvasHeight = Math.max(50, newHeight);
  }

  function handleResizeEnd() {
    resizeState = null;
  }

  function handleZoom(event) {
    event.preventDefault();
    if (event.detail.shiftKey) {
      const rotateFactor = event.detail.deltaY * 0.1;
      let newRotate = editor.logoRotate + rotateFactor;
      editor.logoRotate = ((((newRotate + 180) % 360) + 360) % 360) - 180;
    } else {
      const zoomFactor = 1 - event.detail.deltaY * ZOOM_SENSITIVITY;
      let newScale = editor.logoScale * zoomFactor;
      editor.logoScale = Math.max(0.1, Math.min(newScale, 5));
    }
  }

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
    editor.logoRotate = ((((editor.logoRotate + 180) % 360) + 360) % 360) - 180;
    rotateState = null;
  }

  export function getExportData() {
    if (!canvasElement) {
      console.error('Canvas element not available for export.');
      return null;
    }
    const dataUrl = canvasElement.toDataURL(
      `image/${logo.extension === 'jpg' ? 'jpeg' : 'png'}`,
      1.0,
    );

    return {
      dataUrl: dataUrl,
      extension: logo.extension,
    };
  }
</script>

<div
  class="relative touch-none"
  style="width: {editor.canvasWidth}px; height: {editor.canvasHeight}px; max-width: 100%; max-height: 100%;"
>
  <canvas
    bind:this={canvasElement}
    class="w-full h-full border border-dashed border-white/20"
    style="background-color: {logo?.background};"
    width={editor.canvasWidth * dpr}
    height={editor.canvasHeight * dpr}
  ></canvas>

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
    width="100%"
    height="100%"
    fill="transparent"
    class="absolute inset-0"
    style="pointer-events: auto;"
  ></rect>

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
