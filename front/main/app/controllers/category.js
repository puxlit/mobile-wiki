import Ember from 'ember';
import TrackClickMixin from '../mixins/track-click';

const {Controller, inject, computed, get, getWithDefault} = Ember;

export default Controller.extend(
	TrackClickMixin,
	{
		application: inject.controller(),
		article: inject.controller(),
		noAds: computed.alias('application.noAds'),

		/**
		 * @returns {void}
		 */
		init() {
			this._super(...arguments);
			this.setProperties({
				mainPageTitle: get(Mercury, 'wiki.mainPageTitle'),
				siteName: getWithDefault(Mercury, 'wiki.siteName', 'Wikia')
			});
		},

		actions: {
			loadBatch(index, batch, label) {
				window.document.getElementById(arguments[0]).scrollIntoView();
				window.scrollBy(0, -50);

				this.trackClick('category-load-batch', label);

				return this.get('model').loadMore(...arguments);
			},

			/**
			 * @returns {void}
			 */
			edit() {
				this.get('article').send('edit', ...arguments);
			},

			/**
			 * @returns {void}
			 */
			addPhoto() {
				this.get('article').send('addPhoto', ...arguments);
			},

			/**
			 * @returns {void}
			 */
			articleRendered() {
				this.get('article').send('articleRendered', ...arguments);
			}
		}
	}
);
