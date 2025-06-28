<script>
	const assets = {
		logos: [
			{
				id: 'adscompass-logo-light',
				name: 'Light Logo',
				url: '/logos/adscompass-logo-light.svg',
				background: '#5e6ad2',
				color: '#ffffff',
				extension: 'svg',
			},
			{
				id: 'adscompass-logo-dark',
				name: 'Dark Logo',
				url: '/logos/adscompass-logo-dark.svg',
				background: '#f4f2f4',
				color: '#ffffff',
				extension: 'svg',
			},
			{
				id: 'goldlead-logo-light',
				name: 'Dark Logo',
				url: '/logos/goldlead-logo-light.svg',
				background: '#5e6ad2',
				color: '#ffffff',
				extension: 'svg',
			},
			{
				id: 'goldlead-logo-dark',
				name: 'Dark Logo',
				url: '/logos/goldlead-logo-dark.svg',
				background: '#f4f2f4',
				color: '#ffffff',
				extension: 'svg',
			},
		],
	};

	let selectedAssets = [];

	import JSZip from 'jszip';

	async function download() {
		let zip = new JSZip();
		let logosFolder = zip.folder('logos');

		let selectedObjects = assets.logos.filter((logo) =>
			selectedAssets.includes(logo.id),
		);

		if (selectedObjects.length === 0) {
			return;
		}

		await Promise.all(
			selectedObjects.map(async (logo) => {
				try {
					const response = await fetch(logo.url);
					if (!response.ok)
						throw new Error(`Не удалось получить ассет ${logo.url}`);
					const file = response.blob();
					const extension = logo.extension;
					const filename = `${logo.id.replace(/ /g, '_')}.${extension}`;
					logosFolder.file(filename, file);
				} catch (error) {
					console.error(error);
				}
			}),
		);

		const archive = await zip.generateAsync({ type: 'blob' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(archive);
		link.download = `AdsCompass_Brand_Assets.zip`;
		document.body.append(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(link.href);
	}
</script>

<div class="flex flex-col grow min-h-screen bg-[#08090a] text-white">
	<header class="container flex flex-col items-center py-10 gap-4">
		<h1 class="text-5xl font-semibold flex flex-col items-center">
			<span>AdsCompass</span>
			<span>Brand Guidelines</span>
		</h1>
		<p class="bg-white/10 px-6 py-1 rounded-2xl">Lite version</p>
		<button
			type="button"
			class="mt-3 px-6 py-3 bg-[#5e6ad2] rounded-lg font-semibold"
			onclick={download}>
			{selectedAssets.length
				? `Download ${selectedAssets.length} assets`
				: `Download all assets`}
		</button>
	</header>

	<main class="h-full">
		<section>
			<div class="container">
				<output>{selectedAssets}</output>
				<h2 class="text-2xl font-semibold">Logos</h2>
				<ul class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
					{#each assets.logos as logo (logo.id)}
						<li
							class="group aspect-[4/3] relative"
							style="background-color: {logo.background};">
							<figure class="grid place-items-center w-full h-full">
								<img
									src={logo.url}
									alt={logo.name}
									class="pointer-events-none select-none" />
								<figcaption
									class="absolute top-5 left-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-black">
									{logo.name}
								</figcaption>
							</figure>
							<input
								id={logo.id}
								bind:group={selectedAssets}
								value={logo.id}
								type="checkbox"
								class="absolute top-5 right-5 not-checked:opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
						</li>
					{/each}
				</ul>
			</div>
		</section>
		<section>
			<div class="container">
				<h2 class="text-2xl font-semibold">Colors</h2>
			</div>
		</section>
	</main>
</div>
