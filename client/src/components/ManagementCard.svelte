<script>
  let { photo } = $props();
</script>

<div class="flex flex-col items-center text-center">
  <img
    src={photo.imageUrl}
    alt="Фотография {photo.name}"
    class="mb-4 h-40 w-40 rounded-full border-4 border-white/10 object-cover"
  />
  <h4 class="text-lg font-bold">{photo.name}</h4>
  <p class="text-sm text-white/60">{photo.role}</p>
</div>
