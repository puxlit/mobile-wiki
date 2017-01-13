import Ember from 'ember';
import {normalizeToWhitespace} from 'common/utils/string';
import {setTrackContext, trackPageView} from 'common/utils/track';

export default Ember.Mixin.create({
	curatedMainPageData: Ember.inject.service(),
	ns: Ember.computed.oneWay('curatedMainPageData.ns'),
	adsContext: Ember.computed.oneWay('curatedMainPageData.adsContext'),
	mainPageDescription: Ember.computed.oneWay('curatedMainPageData.description'),
	articleId: Ember.computed.oneWay('curatedMainPageData.id'),

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
	 * @param {Ember.Transition} transition
	 * @returns {void}
	 */
	afterModel(model, transition) {
		this._super(...arguments);

		const title = model.get('title'),
			mainPageController = this.controllerFor('mainPage');

		let sectionName;

		// WOW!
		// Ember's RouteRecognizer does decodeURI while processing path.
		// We need to do it manually for titles passed using transitionTo, see the MainPageRoute.
		try {
			sectionName = decodeURIComponent(decodeURI(title));
		} catch (error) {
			sectionName = decodeURIComponent(title);
		}

		sectionName = normalizeToWhitespace(sectionName);

		mainPageController.setProperties({
			isRoot: false,
			title: sectionName,
			adsContext: this.get('adsContext'),
			ns: this.get('ns')
		});

		model.set('title', sectionName);

		transition.then(() => {
			this.updateTrackingData();
		});
	},

	updateTrackingData() {
		const uaDimensions = {},
			adsContext = this.get('adsContext'),
			ns = this.get('ns');


		if (adsContext) {
			uaDimensions[3] = Ember.get(adsContext, 'targeting.wikiVertical');
			uaDimensions[14] = Ember.get(adsContext, 'opts.showAds') ? 'Yes' : 'No';
		}

		uaDimensions[25] = ns;

		setTrackContext({
			a: this.get('articleId'),
			n: ns
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
	}
});
