/// <reference path="../app.ts" />
/// <reference path="../../main/mixins/TrackClickMixin.ts" />
/// <reference path="../../main/mixins/HeadroomMixin.ts" />
'use strict';

App.SiteHeadComponent = Em.Component.extend(
	App.TrackClickMixin,
	App.HeadroomMixin,
	{
		classNames: ['site-head', 'border-theme-color'],
		classNameBindings: ['themeBar'],
		tagName: 'nav',
		themeBar: false,
		wikiaHomepage: Em.getWithDefault(Mercury, 'wiki.homepage', 'http://www.wikia.com'),

		pinned: true,

		actions: {
			/**
			 * @returns {void}
			 */
			expandSideNav(): void {
				this.sendAction('toggleSideNav', true);
			},

			/**
			 * @returns {void}
			 */
			showUserMenu(): void {
				this.sendAction('toggleUserMenu', true);
			}
		},

		pinnedObserver: Em.observer('pinned', function ():void {
			this.sendAction('toggleSiteHeadPinned', this.get('pinned'));
		})
	}
);
