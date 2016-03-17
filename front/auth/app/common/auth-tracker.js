import {getQueryParam} from 'common/utils/querystring';
import {track as mercuryTrack, trackActions, trackPageView as mercuryTrackPageView, setTrackContext}
	from 'common/utils/track';

/**
 * @class AuthTracker
 *
 * @property {string} gaCategory
 */
export default class AuthTracker {
	/**
	 * @param {string} gaCategory
	 * @param {string} pageType
	 * @returns {void}
	 */
	constructor(gaCategory, pageType) {
		this.gaCategory = gaCategory;
		setTrackContext({
			a: pageType,
			n: -1
		});
	}

	/**
	 * @param {HTMLElement} element
	 * @param {string} label
	 * @param {Object} [action=trackActions.click]
	 *
	 * @returns {void}
	 */
	trackClick(element, label, action = trackActions.click) {
		if (!element) {
			return;
		}

		/**
		 * @returns {void}
		 */
		element.addEventListener('click', () => {
			this.track(label, action);
		});
	}

	/**
	 * @returns {void}
	 */
	trackPageView() {
		// All trackers on auth page are called inside their partials.
		// UA doesn't have such paritial - hence we have to call it manully here
		// We still need to call mercuryTrackPageView in order to call Internal tracking
		M.tracker.UniversalAnalytics.trackPageView({
			// Skin
			4: 'mercury',
			// LoginStatus
			5: 'anon',
			// Page type
			8: 'authPage',
			// IsCorporatePage
			15: 'No',
			// newAuthEntryPage
			10: getQueryParam('redirect')
		});
		mercuryTrackPageView();
	}

	/**
	 * @param {HTMLFormElement} form
	 * @param {string} label
	 *
	 * @returns {void}
	 */
	trackSubmit(form, label) {
		if (!form) {
			return;
		}

		/**
		 * @returns {void}
		 */
		form.addEventListener('submit', () => {
			this.track(label, trackActions.submit);
		});
	}

	/**
	 * @param {string} label
	 * @param {string} action
	 *
	 * @returns {void}
	 */
	track(label, action) {
		const trackOptions = {
				trackingMethod: 'both',
				category: this.gaCategory,
				action,
				label
			},
			sourceUrl = getQueryParam('redirect');

		if (sourceUrl) {
			trackOptions.sourceUrl = sourceUrl;
		}

		mercuryTrack(trackOptions);
	}
}
