import Ember from 'ember';
import HeadroomMixin from '../mixins/headroom';
import {track, trackActions} from 'common/utils/track';

const {computed, inject} = Ember;

export default Ember.Component.extend(
	HeadroomMixin,
	{
		classNames: ['site-head', 'border-theme-color'],
		classNameBindings: ['themeBar'],
		tagName: 'nav',
		themeBar: false,
		pinned: true,
		navIcon: 'nav',
		searchIcon: 'search',
		activeIcon: null,


		wikiaHomepage: Ember.getWithDefault(Mercury, 'wiki.homepage', 'http://www.wikia.com'),

		currentUser: inject.service(),
		newFeaturesBadges: inject.service(),

		isUserAuthenticated: computed.oneWay('currentUser.isAuthenticated'),
		isNewBadgeVisible: computed.alias('shouldDisplayNewBadge'),
		// shouldDisplayNewBadge: computed('newFeaturesBadges.features.[]', function () {
		// 	return this.get('newFeaturesBadges').shouldDisplay('recent-wiki-activity');
		// }),
		shouldDisplayNewBadge: true, //TODO: delete this line and uncoment above when nav finished


		pinnedObserver: Ember.observer('pinned', function () {
			this.sendAction('toggleSiteHeadPinned', this.get('pinned'));
		}),

		didRender() {
			if (this.get('isNewBadgeVisible')) {
				track({
					action: trackActions.impression,
					category: 'recent-wiki-activity-blue-dot'
				});
			}
		},

		actions: {
			/**
			 * @param {String} icon
			 * @returns {void}
			 */
			siteHeadIconCLick(icon) {
				if (icon !== this.get('activeIcon')) {
					this.set('activeIcon', icon);

					if (icon === this.get('navIcon') && this.get('shouldDisplayNewBadge')) {
						track({
							action: trackActions.click,
							category: 'recent-wiki-activity-blue-dot',
							label: 'open-navigation'
						});
					}

					track({
						action: trackActions.click,
						category: 'side-nav',
						label: `${icon}-expanded`
					});

					this.sendAction('toggleSideNav', true);
				} else {
					track({
						action: trackActions.click,
						category: 'side-nav',
						label: `${icon}-collapsed`
					});

					this.set('activeIcon', null);
					this.sendAction('toggleSideNav', false);
				}
			},

			/**
			 * @returns {void}
			 */
			showUserMenu() {
				this.sendAction('toggleUserMenu', true);
			},

			/**
			 * @returns {void}
			 */
			trackWordmarkClick() {
				track({
					action: trackActions.click,
					category: 'wordmark'
				});
			}
		}
	}
);
