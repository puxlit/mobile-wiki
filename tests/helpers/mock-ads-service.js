import { Promise } from 'rsvp';
import Service from '@ember/service';
import sinon from 'sinon';
import Ads from 'mobile-wiki/modules/ads';

export function getAdsModuleMock(adsContext) {
  let context = {
    init() {
    },
    pushSlotToQueue() {
    },
    onTransition() {
    },
    reload() {
    },
    afterTransition() {
    },
    removeSlot() {
    },
    registerActions() {
    },
    waitForUapResponse: () => Promise.resolve(true),
    onMenuOpen() {
    },
    getAdSlotComponentAttributes: name => (
      {
        name,
        hiddenClassName: 'hidden',
        disableManualInsert: false,
        isAboveTheFold: false,
      }
    ),
  };

  if (adsContext) {
    context = Object.assign({}, context, { adsContext });
  }

  context.ready = Promise.resolve(context);

  return context;
}

export function mockAdsService(owner) {
  owner.register('service:ads/ads', Service.extend({
    init() {
      this._super(...arguments);

      this.module = getAdsModuleMock();
      this.slotNames = {
        bottomLeaderBoard: 'bottom_leaderboard',
        invisibleHighImpact2: 'invisible_high_impact_2',
        mobilePreFooter: 'mobile_prefooter',
        topLeaderBoard: 'top_leaderboard',
        incontentBoxad: 'incontent_boxad',
        floorAdhesion: 'floor_adhesion',
      };
    },
    destroyAdSlotComponents() {
    },
    pushAdSlotComponent() {
    },
    addWaitFor() {
    },
    getWaitsOf() {
      return Promise.resolve();
    },
    clearWaitsOf() {
    },
    setupAdsContext() {
    },
  }));
}

export function mockAdsInstance() {
  const adsInstanceMock = getAdsModuleMock({});

  const adsLoadedInstanceStub = sinon.stub(Ads, 'getLoadedInstance').returns(Promise.resolve(adsInstanceMock));
  const adsInstanceStub = sinon.stub(Ads, 'getInstance').returns(adsInstanceMock);

  return {
    restore: () => {
      adsLoadedInstanceStub.restore();
      adsInstanceStub.restore();
    },
  };
}

export const adEngineMock = {
  context: {
    get: () => [],
    push: () => {},
  },
  scrollListener: {
    addSlot: () => {},
  },
  utils: {
    getViewportHeight: () => {},
  },
};

export default mockAdsService;
