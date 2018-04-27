import {computed} from '@ember/object';
import Service, {inject as service} from '@ember/service';
import LegacyAds from '../modules/legacyAds';
import getAdsModule, {isAdEngine3Module} from '../modules/ads';

export default Service.extend({
	module: null,
	wikiVariables: service(),
	currentUser: service(),
	siteHeadOffset: 0,
	noAdsQueryParam: null,
	noAds: computed('noAdsQueryParam', function () {
		return ['0', null, ''].indexOf(this.get('noAdsQueryParam')) === -1 || this.get('currentUser.isAuthenticated');
	}),
	adSlotComponents: null,

	init() {
		this._super(...arguments);
		this.adSlotComponents = {};
		getAdsModule().then((adsModule) => {
			this.module = adsModule;
		});
	},

	isAdEngine3ModuleLoaded() {
		return isAdEngine3Module(this.module);
	},

	pushAdSlotComponent(slotName, adSlotComponent) {
		this.get('adSlotComponents')[slotName] = adSlotComponent;
	},

	destroyAdSlotComponents() {
		const adSlotComponents = this.get('adSlotComponents');

		Object.keys(adSlotComponents).forEach((slotName) => {
			adSlotComponents[slotName].destroy();
		});

		this.set('adSlotComponents', {});
	}
});
