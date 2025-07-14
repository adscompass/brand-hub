<script>
  import Icon from './Icon.svelte';

  let { video } = $props();

  let isPlaying = $state(false);
  let videoElement = $state(null);

  function playVideo() {
    isPlaying = true;
  }

  $effect(() => {
    if (isPlaying && videoElement) {
      videoElement.play().catch((error) => {
        console.error('Ошибка автовоспроизведения видео:', error);
      });
    }
  });

  async function downloadVideo(url, ratio) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Ошибка сети при скачивании видео.');
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const filename = `${video.id}-${ratio}.mp4`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Ошибка скачивания видео:', error);
    }
  }
</script>

<div class="flex flex-col gap-4 rounded-lg bg-white/5 p-4 shadow-inner">
  <h3 class="text-lg font-semibold text-white/80">{video.title}</h3>

  <div class="relative aspect-video w-full overflow-hidden rounded-md bg-black">
    {#if !isPlaying}
      <div class="h-full w-full">
        <img
          src={video.thumbnailUrl}
          alt="Превью для {video.title}"
          class="h-full w-full object-cover"
        />
        <button
          onclick={playVideo}
          class="absolute inset-0 flex items-center justify-center bg-black/70 transition-colors duration-300 hover:bg-black/50"
          aria-label="Воспроизвести видео"
        >
          <div
            class="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:bg-white/30
            active:scale-[1.05]"
          >
            <Icon name="play" />
          </div>
        </button>
      </div>
    {:else}
      <video
        bind:this={videoElement}
        src={video.formats[0].url}
        class="h-full w-full object-contain"
        controls
        autoplay
        muted
        loop
      ></video>
    {/if}
  </div>

  <div class="flex flex-col gap-2">
    <h4 class="text-sm font-medium text-white/70">Скачать в формате:</h4>
    <div class="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
      {#each video.formats as format (format.name + format.resolution)}
        <button
          onclick={() => downloadVideo(format.url, format.ratio)}
          class="flex flex-col items-center justify-center gap-1 overflow-auto rounded-md bg-white/10 p-2 text-center text-white/80 transition-colors hover:bg-white/20"
        >
          <span class="font-semibold">{format.name}</span>
          <span class="text-white/50">{format.resolution}</span>
        </button>
      {/each}
    </div>
  </div>
</div>
