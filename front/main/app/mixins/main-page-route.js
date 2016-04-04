import Ember from 'ember';
import {normalizeToWhitespace} from 'common/utils/string';
import {setTrackContext, trackPageView} from 'common/utils/track';

export default Ember.Mixin.create({
	/**
	 * @returns {void}
	 */
	activate() {
		this.controllerFor('application').set('enableShareHeader', true);
	},

	/**
	 * @returns {void}
	 */
	deactivate() {
		this.controllerFor('application').set('enableShareHeader', false);
	},

	/**
	 * @param {*} model
	 * @returns {void}
	 */
	afterModel(model, transition) {
		const title = model.get('title'),
			mainPageController = this.controllerFor('mainPage'),
			adsContext = $.extend({}, M.prop('mainPageData.adsContext'));

		let sectionOrCategoryName;

		// WOW!
		// Ember's RouteRecognizer does decodeURI while processing path.
		// We need to do it manually for titles passed using transitionTo, see the MainPageRoute.
		try {
			sectionOrCategoryName = decodeURIComponent(decodeURI(title));
		} catch (error) {
			sectionOrCategoryName = decodeURIComponent(title);
		}

		sectionOrCategoryName = normalizeToWhitespace(sectionOrCategoryName);

		mainPageController.setProperties({
			isRoot: false,
			title: sectionOrCategoryName,
			adsContext,
			ns: M.prop('mainPageData.ns')
		});

		transition.then(() => {
			this.updateTrackingData(model);
		});
	},

	updateTrackingData(model) {
		const uaDimensions = {},
			mainPageData = $.extend({}, M.prop('mainPageData')),
			adsContext = Ember.get(mainPageData, 'adsContext'),
			namespace = Ember.getWithDefault(mainPageData, 'details.ns', -1);

		if (adsContext) {
			uaDimensions[3] = Ember.get(adsContext, 'targeting.wikiVertical');
			uaDimensions[14] = Ember.get(adsContext, 'opts.showAds') ? 'yes' : 'no';
		}

		uaDimensions[25] = namespace;

		setTrackContext({
			a: model.get('title'),
			n: namespace
		});

		trackPageView(uaDimensions);
	},

	/**
	 * @param {*} controller
	 * @param {CuratedContentModel} model
	 * @returns {void}
	 */
	renderTemplate(controller, model) {
		this.render('main-page', {
			controller: 'mainPage',
			model: {
				curatedContent: model
			}
		});
	},

	actions: {
		/**
		 * @param {CuratedContentItem} item
		 * @returns {void}
		 */
		openCuratedContentItem(item) {
			/**
			 * We have to double encode because Ember's RouteRecognizer does decodeURI while processing path.
			 * If we didn't do encodeURI then it would do decodeURI on a result of our encodeURIComponent
			 * and the title would be malformed.
			 */
			if (item.type === 'section') {
				this.transitionTo('mainPageSection', encodeURI(encodeURIComponent(item.label)));
			} else if (item.type === 'category') {
				this.transitionTo('mainPageCategory', encodeURI(encodeURIComponent(item.categoryName)));
			} else {
				Ember.Logger.error('Can\'t open curated content item with type other than section or category', item);
			}
		}
	}
});
