<script lang="ts">
    import { toggleLangSel } from '../../../static/js/testFunctions';
	import { cached_lang } from '../../lang/i18n';
	import { jaTrans, enTrans } from '../../lang/translation';
	import { onMount } from 'svelte';

	let language: string;
	cached_lang.subscribe((e) => (language = e));
	$: translator = () => (language == 'ja' ? jaTrans.header : enTrans.header);

	// select for languages
	const langSelect = (lang: 'ja' | 'en') => {
        location.reload(); // reload to reset style of selected language name
		//just update global state on click, and reload current page
		cached_lang.set(lang);
	};
	
	// style of selected language
	onMount(async () => {
		const lang_code: string = document.documentElement.lang;
		const now_lang = document.getElementById(lang_code) as HTMLLIElement;
		now_lang.classList.add('selected');
	});
</script>

<div class="header_inner">
	<picture class="header_platform">
		<source srcset="/img/common/platform_sp.webp" media="(max-width: 899px)" type="image/webp" />
		<img src="/img/common/platform_pc.webp" alt="pc" />
	</picture>
	<p class="header_logo">
		<!-- svelte-ignore a11y-missing-content -->
		<a class="header_logo_button" href="/" />
	</p>
	<aside class="header_language">
		<ul>
			<button on:click={toggleLangSel} class="header_language_selector pointer">
				<p>
					<span class="current_language">{translator().label}</span>
				</p>
			</button>
			<li class="lang_sel_judge">
				<ul class="language_selectArea">
					<dl class="language_selectArea_list">
						<button id="ja" on:click={() => langSelect('ja')} class="LANG language_names pointer">
							<span class="language_mainName">日本語</span>
							<span class="language_subName">{translator().ja_subName}</span>
						</button>
						<button id="en" on:click={() => langSelect('en')} class="LANG language_names pointer">
							<span class="language_mainName">English</span>
							<span class="language_subName">{translator().en_subName}</span>
						</button>
					</dl>
				</ul>
			</li>
		</ul>
	</aside>
</div>
