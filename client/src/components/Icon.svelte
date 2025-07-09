<script>
  let { name } = $props();
</script>

{#if name === 'check'}
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 511.999 511.999"
    class="scale-50 p-1 opacity-0 transition-all duration-300 group-has-[input:checked]:scale-100 group-has-[input:checked]:opacity-100"
    aria-hidden="true"
  >
    <path
      fill="#FFFFFF"
      d="M506.231,75.508c-7.689-7.69-20.158-7.69-27.849,0l-319.21,319.211L33.617,269.163c-7.689-7.691-20.158-7.691-27.849,0 c-7.69,7.69-7.69,20.158,0,27.849l139.481,139.481c7.687,7.687,20.16,7.689,27.849,0l333.133-333.136 C513.921,95.666,513.921,83.198,506.231,75.508z"
    />
  </svg>
{/if}

{#if name === 'edit'}
  <svg
    class="h-5 w-5 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
{/if}

{#if name === 'arrow-right'}
  <svg
    class="h-5 w-5 text-white"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g id="_x33_-Padlock" fill="white">
      <path
        d="m23.71 15.29-14-14c-.39-.39-1.02-.39-1.41 0s-.39 1.02 0 1.41l13.29 13.3-13.3 13.29c-.39.39-.39 1.02 0 1.41.2.2.45.3.71.3s.51-.1.71-.29l14-14c.39-.39.39-1.03 0-1.42z"
      />
    </g>
  </svg>
{/if}

{#if name === 'arrow-left'}
  <svg
    class="h-5 w-5 text-white"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g id="_x33_-Padlock" fill="white">
      <path
        d="m10.41 16 13.3-13.29c.39-.39.39-1.02 0-1.41s-1.02-.39-1.41 0l-14 14c-.39.39-.39 1.02 0 1.41l14 14c.19.19.44.3.7.3s.51-.1.71-.29c.39-.39.39-1.02 0-1.41z"
      />
    </g>
  </svg>
{/if}

{#if name === 'close'}
  <svg
    version="1.1"
    class="h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    viewBox="0 0 513.552 513.552"
    style="enable-background:new 0 0 513.552 513.552;"
    xml:space="preserve"
    aria-hidden="true"
    ><g fill="currentColor"
      ><g
        ><path
          d="M510.132,489.755c-0.476-0.556-0.995-1.075-1.552-1.552L276.9,256.382l231.822-231.68c5.577-5.577,5.577-14.619,0-20.196 c-5.577-5.577-14.619-5.577-20.196,0l-231.68,231.822L25.167,4.506c-5.577-5.577-14.619-5.577-20.196,0s-5.577,14.619,0,20.196 l231.822,231.68L4.972,488.062c-5.966,5.109-6.661,14.087-1.552,20.053c5.109,5.966,14.087,6.661,20.053,1.552 c0.556-0.476,1.075-0.995,1.552-1.552l231.822-231.68l231.68,231.822c5.109,5.966,14.087,6.661,20.053,1.552 C514.546,504.699,515.241,495.721,510.132,489.755z"
        /></g
      ></g
    ></svg
  >
{/if}
