<script lang="ts">
  import { cached_lang } from '../../lang/i18n';
  import { jaTrans, enTrans } from '../../lang/translation';
  import { toggleMenuSel, loadArticle } from '../../../static/js/testFunctions';

  let language: string;
  cached_lang.subscribe((e) => (language = e));
  $: translator = () =>
    language == 'ja' ? jaTrans.side_menu : enTrans.side_menu;
</script>

<ul class="categories">
  <li id="toppage" class="category">
    <button on:click={toggleMenuSel} class="category_title" type="button">
      <span class="mark" />{translator().category_toppage['title']}
    </button>
    <ul class="sub_categories">
      <li class="sub_categories_list">
        <button
          id="home"
          class="sub_category"
          on:click={() => loadArticle('entry', 'link1')}
        >
          {translator().category_toppage['home']}
        </button>
        <button
          id="news"
          class="sub_category"
          on:click={() => loadArticle('entry', 'link2')}
        >
          {translator().category_toppage['news']}
        </button>
      </li>
    </ul>
  </li>
</ul>
