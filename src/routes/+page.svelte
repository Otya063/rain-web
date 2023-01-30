<script lang="ts">
	import Tp from './template_pages.svelte';
	import TestTop from '../lib/articles/TestTop.svelte';

	// random numbers for selecting background images (1 ≦ randNum ≦ 4)
	const randNum: number = Math.floor(Math.random() * 4) + 1;
</script>

<Tp>
	<div class="top_images" slot="top_img">
		<picture>
			<source
				srcset="/img/common/bg{randNum}_sp.webp"
				media="(max-width: 899px)"
				type="image/webp"
			/>
			<img class="top_img" src="/img/common/bg{randNum}.webp" alt="top_pc" />
		</picture>
	</div>

	<TestTop slot="article" />
</Tp>
