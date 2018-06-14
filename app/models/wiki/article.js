import { inject as service } from '@ember/service';
import BaseModel from './base';
import fetch from '../../utils/mediawiki-fetch';

export default BaseModel.extend({
	wikiUrls: service(),
	wikiVariables: service(),
	comments: 0,
	content: null,
	curatedMainPageData: null,
	featuredVideo: null,
	hasPortableInfobox: false,
	isCuratedMainPage: false,
	isMainPage: false,
	user: null,
	heroImage: null,

	/**
	 * @returns {RSVP.Promise}
	 */
	getArticleRandomTitle() {
		return fetch(this.wikiUrls.build({
			host: this.get('wikiVariables.host'),
			path: '/api.php',
			query: {
				action: 'query',
				generator: 'random',
				grnnamespace: 0,
				format: 'json'
			}
		}), {
			cache: 'no-store'
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.query && data.query.pages) {
					const articleId = Object.keys(data.query.pages)[0],
						pageData = data.query.pages[articleId];

					if (pageData.title) {
						return pageData.title;
					}
				}

				throw new Error({
					message: 'Data from server misshaped',
					data
				});
			});
	},

	/**
	 * @param {Object} data
	 * @returns {void}
	 */
	setData({ data }) {
		this._super(...arguments);

		let articleProperties = {},
			details;

		if (data) {
			if (data.details) {
				details = data.details;

				articleProperties = {
					comments: details.comments,
					details
				};
			}

			if (data.article) {
				articleProperties.content = data.article.content;

				if (data.article.hasPortableInfobox) {
					articleProperties.hasPortableInfobox = data.article.hasPortableInfobox;
				}

				if (data.article.heroImage) {
					articleProperties.heroImage = data.article.heroImage;
				}
			}

			if (data.topContributors) {
				// Same issue: the response to the ajax should always be valid and not undefined
				articleProperties.topContributors = data.topContributors;
			}

			articleProperties.isMainPage = data.isMainPage || false;
			articleProperties.amphtml = data.amphtml;

			if (data.curatedMainPageData) {
				articleProperties.curatedMainPageData = data.curatedMainPageData;
				articleProperties.isCuratedMainPage = true;
			}
		}

		this.setProperties(articleProperties);
	}
});
