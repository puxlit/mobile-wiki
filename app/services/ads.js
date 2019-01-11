import { Promise } from 'rsvp';
import { computed } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import Ads from '../modules/ads';

export default Service.extend({
  module: Ads.getInstance(),
  fastboot: service(),
  wikiVariables: service(),
  currentUser: service(),
  siteHeadOffset: 0,
  slotNames: null,
  noAdsQueryParam: null,
  disableAdsInMobileApp: null,
  noAds: computed('noAdsQueryParam', function () {
    return ['0', null, ''].indexOf(this.noAdsQueryParam) === -1
      || ['0', null, ''].indexOf(this.disableAdsInMobileApp) === -1
      || this.get('currentUser.isAuthenticated');
  }),
  adSlotComponents: null,
  waits: null,

  init() {
    this._super(...arguments);
    this.setProperties({
      adSlotComponents: {},
      waits: {},
      slotNames: {
        bottomLeaderBoard: 'bottom_leaderboard',
        invisibleHighImpact: 'invisible_high_impact',
        invisibleHighImpact2: 'invisible_high_impact_2',
        mobileInContent: 'mobile_in_content',
        mobilePreFooter: 'mobile_prefooter',
        mobileTopLeaderBoard: 'mobile_top_leaderboard',
      },
    });

    if (!this.get('fastboot.isFastBoot')) {
      this.module.showAds = !this.noAds;
    }
  },

  pushAdSlotComponent(slotName, adSlotComponent) {
    this.adSlotComponents[slotName] = adSlotComponent;
  },

  beforeTransition() {
    this.module.beforeTransition();

    Object.keys(this.adSlotComponents).forEach((slotName) => {
      this.adSlotComponents[slotName].destroy();
    });

    this.set('adSlotComponents', {});
  },

  addWaitFor(key, promise) {
    this.waits[key] = this.waits[key] || [];
    this.waits[key].push(promise);
  },

  getWaits(key) {
    return Promise.all(this.waits[key] || []);
  },

  clearWaits(key) {
    this.waits[key] = [];
  },
});
