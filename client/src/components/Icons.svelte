<script>
  let { icon } = $props();
</script>

{#if icon === 'check'}
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 511.999 511.999"
    class="p-1 opacity-0 group-has-[input:checked]:opacity-100 transition-all duration-300 scale-50 group-has-[input:checked]:scale-100"
  >
    <path
      fill="#FFFFFF"
      d="M506.231,75.508c-7.689-7.69-20.158-7.69-27.849,0l-319.21,319.211L33.617,269.163c-7.689-7.691-20.158-7.691-27.849,0 c-7.69,7.69-7.69,20.158,0,27.849l139.481,139.481c7.687,7.687,20.16,7.689,27.849,0l333.133-333.136 C513.921,95.666,513.921,83.198,506.231,75.508z"
    />
  </svg>
{/if}

{#if icon === 'edit'}
  <svg
    class="w-5 h-5 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
{/if}

{#if icon === 'arrow-right'}
  <svg
    class="w-5 h-5 text-white"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="_x33_-Padlock" fill="white">
      <path
        d="m23.71 15.29-14-14c-.39-.39-1.02-.39-1.41 0s-.39 1.02 0 1.41l13.29 13.3-13.3 13.29c-.39.39-.39 1.02 0 1.41.2.2.45.3.71.3s.51-.1.71-.29l14-14c.39-.39.39-1.03 0-1.42z"
      />
    </g>
  </svg>
{/if}

{#if icon === 'arrow-left'}
  <svg
    class="w-5 h-5 text-white"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g id="_x33_-Padlock" fill="white">
      <path
        d="m10.41 16 13.3-13.29c.39-.39.39-1.02 0-1.41s-1.02-.39-1.41 0l-14 14c-.39.39-.39 1.02 0 1.41l14 14c.19.19.44.3.7.3s.51-.1.71-.29c.39-.39.39-1.02 0-1.41z"
      />
    </g>
  </svg>
{/if}
