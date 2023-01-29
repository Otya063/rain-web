<script lang="ts">
  export let data;
  const { article } = data;
</script>

<slot>
  <h1>{article.title}</h1>
  {@html article.content}
</slot>