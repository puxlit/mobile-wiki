export default {
	data: {
		ns: 0,
		isMainPage: false,
		categories: [
			{
				title: 'TestA',
				url: '/wiki/TestA'
			}
		],
		details: {
			id: 312785,
			title: 'TestA',
			ns: 0,
			url: '/wiki/TestA',
			revision: {
				id: 123,
				user: 'Test User',
				user_id: 123,
				timestamp: '1400880644'
			},
			type: 'article',
			abstract: 'TestA',
			thumbnail: 'https://vignette.wikia.nocookie.net/fallout/images/d/d8/FO3_psycho.png/' +
				'revision/latest/window-crop/width/200/x-offset/0/y-offset/0/window-width/525/' +
				'window-height/525?cb=20110305205908',
			original_dimensions: {
				width: '525',
				height: '924'
			},
			description: 'TestA'
		},
		articleType: 'other',
		adsContext: {
			opts: {
				adsInContent: 1,
				delayBtf: true,
				enableAdsInMaps: true,
				pageType: 'all_ads',
				showAds: true,
				prebidBidderUrl: [
					'https://slot1-images.wikia.nocookie.net/__am/1522844606/group/-/pr3b1d_prod_js'
				]
			},
			targeting: {
				enableKruxTargeting: true,
				enablePageCategories: true,
				esrbRating: 'mature',
				mappedVerticalName: 'gaming',
				pageArticleId: 312785,
				pageIsArticle: true,
				pageName: 'Testfx',
				pageType: 'article',
				skin: 'mercury',
				wikiCategory: 'gaming',
				wikiCustomKeyValues: 'sex=m;age=under18;age=18-24;age=25-34;',
				wikiDbName: 'fallout',
				wikiIsTop1000: true,
				wikiLanguage: 'en',
				wikiVertical: 'games',
				newWikiCategories: [
					'gaming'
				],
				hasPortableInfobox: true
			},
			providers: {
				evolve2: true,
				audienceNetwork: true
			},
			slots: {
				invisibleHighImpact: true
			},
			forcedProvider: null
		},
		htmlTitle: 'Testfx',
		article: {
			content: 'TestA',
			categories: [],
			displayTitle: 'TestA',
			heroImage: null,
			hasPortableInfobox: true
		},
		topContributors: [
			{
				user_id: 3183960,
				title: 'Jspoelstra',
				name: 'Jspoelstra',
				url: '/wiki/User:Jspoelstra',
				numberofedits: 311816,
				avatar: 'https://vignette.wikia.nocookie.net/a97793a4-0a1a-418e-b517-d5f536254148/scale-to-width-down/100'
			},
			{
				user_id: 12806653,
				title: 'Tribal_Wisdom',
				name: 'Tribal Wisdom',
				url: '/wiki/User:Tribal_Wisdom',
				numberofedits: 13137,
				avatar: 'https://vignette.wikia.nocookie.net/895d722e-89eb-4181-9513-120163aad8e9/scale-to-width-down/100'
			},
			{
				user_id: 4629050,
				title: 'OfficialLolGuy',
				name: 'OfficialLolGuy',
				url: '/wiki/User:OfficialLolGuy',
				numberofedits: 6943,
				avatar: 'https://vignette.wikia.nocookie.net/dd78817a-6974-4575-8c52-0af66841f70c/scale-to-width-down/100'
			},
			{
				user_id: 3137087,
				title: 'Capital_X',
				name: 'Capital X',
				url: '/wiki/User:Capital_X',
				numberofedits: 80,
				avatar: 'https://vignette.wikia.nocookie.net/6b143499-9350-4cb4-811a-4f81d6d11856/scale-to-width-down/100'
			},
			{
				user_id: 8959313,
				title: 'Skire_bot',
				name: 'Skire bot',
				url: '/wiki/User:Skire_bot',
				numberofedits: 9530,
				avatar: 'https://vignette.wikia.nocookie.net/a7509a46-9c18-4d5b-860e-845cd3f137cf/scale-to-width-down/100'
			}
		]
	}
};
