<script>
  let { content } = $props();
</script>

<div class="mx-auto flex max-w-3xl flex-col gap-6 text-center">
  <div>
    <h3 class="mb-2 text-2xl font-bold">Наша миссия</h3>
    <p class="text-lg leading-relaxed text-white/80">{content.mission}</p>
  </div>
  <div>
    <h3 class="mb-2 text-2xl font-bold">Наше видение</h3>
    <p class="text-lg leading-relaxed text-white/80">{content.vision}</p>
  </div>
</div>
