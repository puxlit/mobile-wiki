import sinon from 'sinon';
import { module, test } from 'qunit';

import { adsSetup } from 'mobile-wiki/modules/ads/setup';

import { events, EventService } from '../eventService';

module('Unit | Module | ads | setup', (hooks) => {
  let eventService;

  hooks.beforeEach(() => {
    eventService = new EventService();

    // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions#Method_definitions_are_not_constructable
    window.Wikia.adEngine = {
      JWPlayerManager: function JWPlayerManager() {
        this.manage = () => {};
      },
      AdEngine: function AdEngine() {
        this.init = () => {};
      },
      AdSlot: {
        SLOT_RENDERED_EVENT: 'onRenderEnded',
      },
      bidderTracker: {
        add: () => window.Wikia.adEngine.bidderTracker,
        register: () => {},
      },
      billTheLizardEvents: {
        BILL_THE_LIZARD_REQUEST: '',
        BILL_THE_LIZARD_RESPONSE: '',
      },
      clickPositionTracker: {
        register: () => {},
      },
      context: {
        extend: () => {},
        get: () => {},
        push: () => {},
        set: () => {},
      },
      events,
      eventService,
      GAMOrigins: ['https://foo.com', 'https://bar.com'],
      InstantConfigService: {
        init: (globals = { wgAdDriverBillTheLizardConfig: {} }) => Promise.resolve({
          get: key => globals[key],
          isGeoEnabled: () => undefined,
        }),
      },
      PostmessageTracker: function PostmessageTracker() {
        this.add = () => this;
        this.register = () => {};
      },
      slotTracker: {
        onChangeStatusToTrack: [],
        add: () => window.Wikia.adEngine.slotTracker,
        register: () => {},
      },
      templateService: {
        register: () => {},
      },
      utils: {
        logger: () => {},
        geoService: {
          setUpGeoData: () => {},
        },
      },
      viewabilityTracker: {
        add: () => window.Wikia.adEngine.slotTracker,
        register: () => {},
      },
      ViewabilityCounter: {
        make: () => {},
      },
    };
    window.Wikia.adBidders = {};
    window.Wikia.adProducts = {
      setupNpaContext: () => {},
      setupRdpContext: () => {},
      playerEvents: {
        VIDEO_PLAYER_TRACKING_EVENT: Symbol('VIDEO_PLAYER_TRACKING_EVENT'),
      },
      porvataTracker: {
        register: () => {},
      },
    };

    const fake = sinon.fake.returns({});
    sinon.replace(adsSetup, 'setupAdContext', fake);
  });

  hooks.afterEach(() => {
    sinon.restore();
  });

  test('setupAdContext is called when page render event happens', async (assert) => {
    await adsSetup.configure();

    const adContext = { a: 'a' };

    window.Wikia.adEngine.eventService.emit(
      events.PAGE_RENDER_EVENT,
      { adContext },
    );

    assert.equal(adsSetup.setupAdContext.callCount, 2);

    assert.deepEqual(adsSetup.setupAdContext.getCall(1).args[1], adContext);
  });
});
