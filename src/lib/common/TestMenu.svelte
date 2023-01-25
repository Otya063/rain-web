<script lang="ts">
    import { loadArticle } from "../../../static/module/testFunctions";
</script>

<ul class="categories">
	<li id="toppage" class="category">
		<button class="category_title" type="button">
			<span class="mark" />category_title
		</button>
		<ul class="sub_categories" style="height: 141px;">
			<dl class="sub_categories_list">
				<li id="home" class="sub_category" on:click={() => loadArticle("entry", "link1")}>
					<!-- {translator().category_toppage['home']} -->
                    Link1
				</li>
				<li id="news" class="sub_category" on:click={() => loadArticle("entry", "link2")}>
					<!-- {translator().category_toppage['news']} -->
                    Link2
				</li>
			</dl>
		</ul>
	</li>
</ul>
