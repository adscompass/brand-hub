<script>
  import { gestures } from '../lib/actions/gestures.js';
  import convert from 'color-convert';
  import Icon from './Icon.svelte';

  let { color } = $props();
  let copied = $state(false);
  let currentFormatIndex = $state(0);
  let copyTimeout = null;

  let clickCount = $state(0);
  let lastClickTime = 0;
  const CLICK_THRESHOLD = 10;
  const TIME_THRESHOLD = 1000;
  let exploded = $state(false);
  let explodeTimeout = null;

  const FORMATS = [
    { key: 'hex', label: 'HEX' },
    { key: 'rgb', label: 'RGB' },
    { key: 'hsl', label: 'HSL' },
    { key: 'cmyk', label: 'CMYK' },
  ];

  const allColorFormats = $derived.by(() => {
    const hexValue = color.hex.replace('#', '');
    const rgbValue = convert.hex.rgb(hexValue);
    const hslValue = convert.hex.hsl(hexValue);
    const cmykValue = convert.hex.cmyk(hexValue);
    return {
      hex: `#${hexValue.toUpperCase()}`,
      rgb: `rgb(${rgbValue.join(', ')})`,
      hsl: `hsl(${hslValue[0]}, ${hslValue[1]}%, ${hslValue[2]}%)`,
      cmyk: `cmyk(${cmykValue[0]}%, ${cmykValue[1]}%, ${cmykValue[2]}%, ${cmykValue[3]}%)`,
    };
  });

  const currentValue = $derived(
    allColorFormats[FORMATS[currentFormatIndex].key],
  );

  const textColor = $derived.by(() => {
    const hex = color.hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luma > 0.5 ? '#000000' : '#FFFFFF';
  });

  function copyText() {
    if (copied) return;
    const text = currentValue;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(showCopiedMessage)
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      if (document.execCommand('copy')) showCopiedMessage();
    } catch (err) {
      console.error('Fallback-копирование не удалось', err);
    }
    document.body.removeChild(textArea);
  }

  function showCopiedMessage() {
    copied = true;
    clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
      copied = false;
    }, 2000);
  }

  function cycleFormat(direction) {
    const step = direction === 'next' ? 1 : -1;
    const newIndex =
      (currentFormatIndex + step + FORMATS.length) % FORMATS.length;
    currentFormatIndex = newIndex;
  }

  function handleTap(event) {
    const currentTime = Date.now();
    if (currentTime - lastClickTime < TIME_THRESHOLD) {
      clickCount++;
    } else {
      clickCount = 1;
    }
    lastClickTime = currentTime;

    if (clickCount >= CLICK_THRESHOLD) {
      exploded = true;
      console.log(
        `%cКАРТОЧКА ${color.name} ВЗОРВАЛАСЬ! 💥`,
        'color: orange; font-size: 18px;',
      );
      clearTimeout(explodeTimeout);
      explodeTimeout = setTimeout(() => {
        exploded = false;
        clickCount = 0;
      }, 500);
      return;
    }

    const trueTarget = event.detail.trueTarget;
    const arrowButton = trueTarget?.closest('[data-arrow]');

    if (arrowButton) {
      cycleFormat(arrowButton.dataset.arrow);
    } else {
      copyText();
    }
  }
</script>

<div
  use:gestures={{ preventWheel: false, recognizeDoubleTap: false }}
  ontap={handleTap}
  onswipeleft={() => cycleFormat('next')}
  onswiperight={() => cycleFormat('prev')}
  class="group relative w-full aspect-square rounded-lg flex flex-col justify-between p-4 text-left transition-all duration-200 border border-white/10 hover:-translate-y-1 active:scale-95 cursor-pointer select-none touch-pan-y"
  class:exploded
  style:background-color={color.hex}
  style:color={textColor}
  title="Нажмите, чтобы скопировать. Свайпните, чтобы изменить формат."
  role="button"
  tabindex="0"
>
  <div class="pointer-events-none">
    <header class="font-semibold text-lg">{color.name}</header>
    <footer class="absolute bottom-4 left-4 max-w-[calc(100%-4rem)]">
      <div class="text-xs opacity-70">{FORMATS[currentFormatIndex].label}</div>
      <div class="font-mono font-semibold truncate">{currentValue}</div>
    </footer>
  </div>

  <div
    class="absolute inset-0 hidden pointer-fine:group-hover:flex justify-between items-center px-2"
  >
    <button
      type="button"
      class="p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
      aria-label="Предыдущий формат"
      data-arrow="prev"
    >
      <Icon name="arrow-left" />
    </button>
    <button
      type="button"
      class="p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
      aria-label="Следующий формат"
      data-arrow="next"
    >
      <Icon name="arrow-right" />
    </button>
  </div>

  <div class="absolute bottom-4 right-4 flex gap-1.5 pointer-events-none">
    {#each FORMATS as _, index (index)}
      <div
        class="w-1.5 h-1.5 rounded-full transition-all {currentFormatIndex ===
        index
          ? 'bg-current'
          : 'bg-current/30'}"
      ></div>
    {/each}
  </div>

  {#if copied}
    <div
      class="absolute inset-0 grid place-items-center bg-black/70 backdrop-blur-sm rounded-lg z-10"
      aria-live="polite"
    >
      <span class="font-bold text-white">Скопировано!</span>
    </div>
  {/if}

  {#if exploded}
    <div
      class="absolute inset-0 grid place-items-center bg-red-800/70 backdrop-blur-sm rounded-lg z-30 animation-explode"
    >
      <span class="font-bold text-white text-2xl animate-pulse">BOOM!</span>
    </div>
  {/if}
</div>

<style>
  @keyframes explode-fade-out {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2) rotate(10deg);
      opacity: 0.8;
    }
    100% {
      transform: scale(0) rotate(30deg);
      opacity: 0;
    }
  }

  .exploded {
    animation: explode-fade-out 0.5s forwards;
    pointer-events: none;
  }
</style>
