<script lang="ts">
	import Tp from '../../template_pages.svelte';
	export let data;
	const { article } = data;
</script>

<Tp>
	<slot slot="article">
		<h1>{article.title}</h1>
		{@html article.content}
	</slot>
</Tp>
