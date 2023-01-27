<script lang="ts">
    import { toggleLangSel } from '../../../static/module/testFunctions';
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
		<a on:click={() => console.log('clicked')} />
	</p>
	<aside class="header_language">
		<ul>
			<li on:click={toggleLangSel} class="header_language_selector pointer">
				<p>
					<label class="current_language">{translator().label}</label>
				</p>
			</li>
			<li class="lang_sel_judge">
				<ul class="language_selectArea">
					<dl class="language_selectArea_list">
						<li id="ja" on:click={(e) => langSelect('ja')} class="LANG language_names pointer">
							<label class="language_mainName">日本語</label>
							<label class="language_subName">{translator().ja_subName}</label>
						</li>
						<li id="en" on:click={(e) => langSelect('en')} class="LANG language_names pointer">
							<label class="language_mainName">English</label>
							<label class="language_subName">{translator().en_subName}</label>
						</li>
					</dl>
				</ul>
			</li>
		</ul>
	</aside>
</div>
