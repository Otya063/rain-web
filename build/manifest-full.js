export const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["img/common/backtotop_arrow.webp","img/common/bg.webp","img/common/bg1.webp","img/common/bg1_sp.webp","img/common/bg2.webp","img/common/bg2_sp.webp","img/common/bg3.webp","img/common/bg3_sp.webp","img/common/bg4.webp","img/common/bg4_sp.webp","img/common/bg_logo.webp","img/common/bg_ribbon.webp","img/common/body_bg.webp","img/common/extlink/beginnermark.webp","img/common/extlink/extlink_arrow.webp","img/common/extlink/extlink_beginner_bg.webp","img/common/extlink/extlink_beginner_chara.webp","img/common/extlink/extlink_faq_bg.webp","img/common/extlink/extlink_faq_chara.webp","img/common/extlink/extlink_frame.webp","img/common/extlink/faqmark.webp","img/common/featured/featured_festival_bg.webp","img/common/featured/featured_first_bg.webp","img/common/featured/featured_items_arrow.webp","img/common/featured/featured_ravi_bg.webp","img/common/featured/featured_return_bg.webp","img/common/featured/featured_road_bg.webp","img/common/featured/featured_tenrou_bg.webp","img/common/featured/featured_utahime_bg.webp","img/common/footer/footer_bg.webp","img/common/footer/footer_bg_sp.webp","img/common/footer/footer_list_items_arrow.webp","img/common/footer/pewpewdojo_server_icon.webp","img/common/footer/rain_discord_icon.webp","img/common/footer/rain_officialsite_icon.webp","img/common/frame_lower.webp","img/common/frame_upper.webp","img/common/global.webp","img/common/icon_192.png","img/common/icon_512.png","img/common/icon_paw.webp","img/common/landscape/landscape_mode.jpg","img/common/landscape/now_waiting_A.webp","img/common/landscape/now_waiting_G.webp","img/common/landscape/now_waiting_I1.webp","img/common/landscape/now_waiting_I2.webp","img/common/landscape/now_waiting_N1.webp","img/common/landscape/now_waiting_N2.webp","img/common/landscape/now_waiting_O.webp","img/common/landscape/now_waiting_T.webp","img/common/landscape/now_waiting_W1.webp","img/common/landscape/now_waiting_W2.webp","img/common/landscape/rotate_device.webp","img/common/lang_arrow.webp","img/common/manual_title.webp","img/common/ouch_cat.webp","img/common/platform_pc.webp","img/common/platform_sp_landscape.webp","img/common/platform_sp_portrait.webp","img/common/rainserver_logo.webp","img/common/rain_apple_icon.png","img/common/rain_favicon.ico","img/common/rain_footer_tempologo.jpg","img/common/rain_textlogo.webp","img/common/sns_share.webp","img/common/subtitle_lower.webp","img/common/subtitle_upper.webp","img/common/title_frame.webp","img/common/topimgspは500×400.txt","img/en/articles/signup/discord/discord_1.png","img/en/articles/signup/discord/discord_2_1.png","img/en/articles/signup/discord/discord_2_2.png","img/en/articles/signup/discord/discord_3_1.png","img/en/articles/signup/discord/discord_3_2.png","img/en/featured/featured_festival_chara.webp","img/en/featured/featured_first_chara.webp","img/en/featured/featured_ravi_chara.webp","img/en/featured/featured_return_chara.webp","img/en/featured/featured_road_chara.webp","img/en/featured/featured_tenrou_chara.webp","img/en/featured/featured_utahime_chara.webp","img/en/MHFZZ_logo.webp","img/ja/articles/signup/discord/discord_1.png","img/ja/articles/signup/discord/discord_2_1.png","img/ja/articles/signup/discord/discord_2_2.png","img/ja/articles/signup/discord/discord_3_1.png","img/ja/articles/signup/discord/discord_3_2.png","img/ja/featured/featured_festival_chara.webp","img/ja/featured/featured_first_chara.webp","img/ja/featured/featured_ravi_chara.webp","img/ja/featured/featured_return_chara.webp","img/ja/featured/featured_road_chara.webp","img/ja/featured/featured_tenrou_chara.webp","img/ja/featured/featured_utahime_chara.webp","img/ja/MHFZZ_logo.webp","js/main.ts","manifest.webmanifest","sass/common/_common.scss","sass/common/_index.scss","sass/common/_reset.scss","sass/error/_index.scss","sass/error/_pc.scss","sass/error/_sp.scss","sass/global/_index.scss","sass/global/_mixins.scss","sass/global/_variables.scss","sass/global.scss","sass/manual/_index.scss","sass/manual/_pc.scss","sass/manual/_sp.scss","sass/style_error.scss","sass/style_manual.scss"]),
	mimeTypes: {".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg",".ico":"image/vnd.microsoft.icon",".txt":"text/plain",".ts":"video/mp2t",".webmanifest":"application/manifest+json",".scss":"text/x-scss"},
	_: {
		client: {"start":{"file":"_app/immutable/entry/start.a5be66be.js","imports":["_app/immutable/entry/start.a5be66be.js","_app/immutable/chunks/index.1abc9ca4.js","_app/immutable/chunks/singletons.a54971d9.js","_app/immutable/chunks/index.58d4b228.js"],"stylesheets":[],"fonts":[]},"app":{"file":"_app/immutable/entry/app.3fb8eb11.js","imports":["_app/immutable/entry/app.3fb8eb11.js","_app/immutable/chunks/preload-helper.41c905a7.js","_app/immutable/chunks/i18n-util.b0b8c982.js","_app/immutable/chunks/index.1abc9ca4.js"],"stylesheets":[],"fonts":[]}},
		nodes: [
			() => import('./nodes/0.js'),
			() => import('./nodes/1.js'),
			() => import('./nodes/2.js'),
			() => import('./nodes/3.js'),
			() => import('./nodes/4.js'),
			() => import('./nodes/5.js'),
			() => import('./nodes/6.js'),
			() => import('./nodes/7.js'),
			() => import('./nodes/8.js'),
			() => import('./nodes/9.js')
		],
		routes: [
			{
				id: "/api/email",
				pattern: /^\/api\/email\/?$/,
				params: [],
				page: null,
				endpoint: () => import('./entries/endpoints/api/email/_server.ts.js')
			},
			{
				id: "/[lang=lang]/(officialsite)",
				pattern: /^\/([^/]+?)\/?$/,
				params: [{"name":"lang","matcher":"lang","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,4], errors: [1,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/[lang=lang]/(manual)/manual",
				pattern: /^\/([^/]+?)\/manual\/?$/,
				params: [{"name":"lang","matcher":"lang","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2], errors: [1,,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/[lang=lang]/(manual)/manual/workspace",
				pattern: /^\/([^/]+?)\/manual\/workspace\/?$/,
				params: [{"name":"lang","matcher":"lang","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/[lang=lang]/(manual)/manual/[maindir]/[subdir]",
				pattern: /^\/([^/]+?)\/manual\/([^/]+?)\/([^/]+?)\/?$/,
				params: [{"name":"lang","matcher":"lang","optional":false,"rest":false,"chained":false},{"name":"maindir","optional":false,"rest":false,"chained":false},{"name":"subdir","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/[lang=lang]/(member)/member",
				pattern: /^\/([^/]+?)\/member\/?$/,
				params: [{"name":"lang","matcher":"lang","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,3], errors: [1,,], leaf: 8 },
				endpoint: null
			}
		],
		matchers: async () => {
			const { match: lang } = await import ('./entries/matchers/lang.js')
			return { lang };
		}
	}
};
