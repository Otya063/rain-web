<script lang="ts">
	import Tp from '../../template_pages.svelte';
	export let data;
</script>

<Tp>
	<slot slot="article">
		<h1>{data.article.title}</h1>
		<div>{@html data.article.content}</div>
	</slot>
</Tp>
