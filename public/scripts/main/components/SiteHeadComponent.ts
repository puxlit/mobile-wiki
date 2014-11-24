/// <reference path="../app.ts" />
/// <reference path="../../mercury/utils/browser.ts" />
'use strict';

App.SiteHeadComponent = Em.Component.extend({
	classNames: ['site-head'],
	tagName: 'nav',
	headroom: null,

	options: {
		// keep it consistent with values in _wikia-variables.scss
		smartBannerHeight: {
			android: 66,
			ios: 83
		}
	},

	offset: function (): number {
		if (this.get('smartBannerVisible')) {
			return this.get('options.smartBannerHeight.' + Mercury.Utils.Browser.getSystem());
		}
		return 0;
	}.property('smartBannerVisible'),

	actions: {
		expandSideNav: function (): void {
			this.set('sideNavCollapsed', false);
		}
	},

	/**
	 * @desc Hide top bar when scrolling down. Uses headroom.js plugin.
	 * Styles in styles/module/wiki/_site-head.scss and styles/state/_animated.scss
	 */
	didInsertElement: function () {
		this.initHeadroom();
	},

	initHeadroom: function (): void {
		var headroom = new Headroom(this.get('element'), {
			classes: {
				initial: 'headroom',
				pinned: 'pinned',
				unpinned: 'un-pinned',
				top: 'headroom-top',
				notTop: 'headroom-not-top'
			},
			offset: this.get('offset')
		});

		headroom.init();

		this.set('headroom', headroom);
	},

	/**
	 * Observes smartBannerVisible property which is controlled by SmartBannerComponent
	 * and goes through ApplicationController. Reinitializes Headroom when it changes.
	 */
	smartBannerVisibleObserver: function (): void {
		var headroom = this.get('headroom');

		headroom.destroy();
		this.initHeadroom();
	}.observes('smartBannerVisible')
});
