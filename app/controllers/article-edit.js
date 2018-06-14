import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';
import { computed } from '@ember/object';
import { track, trackActions } from '../utils/track';
import { normalizeToUnderscore } from '../utils/string';

export default Controller.extend({
	application: controller(),
	i18n: service(),
	wikiVariables: service(),

	isPublishing: false,

	init() {
		this._super(...arguments);

		// FIXME: Cover more errors
		this.errorCodeMap = {
			autoblockedtext: 'edit.publish-error-autoblockedtext',
			blocked: 'edit.publish-error-blocked',
			noedit: 'edit.publish-error-noedit',
			'noedit-anon': 'edit.publish-error-noedit-anon',
			protectedpage: 'edit.publish-error-protectedpage'
		};
	},

	publishDisabled: computed('isPublishing', 'model.isDirty', function () {
		return this.isPublishing === true || this.get('model.isDirty') === false;
	}),

	actions: {
		/**
		 * @returns {void}
		 */
		publish() {
			this.set('isPublishing', true);
			this.application.set('isLoading', true);

			this.model.publish().then(
				this.handlePublishSuccess.bind(this),
				this.handlePublishError.bind(this)
			);

			track({
				action: trackActions.click,
				category: 'sectioneditor',
				label: 'publish'
			});
		},
		/**
		 * @returns {void}
		 */
		back() {
			this.transitionToRoute('wiki-page', this.get('model.title'));
			track({
				action: trackActions.click,
				category: 'sectioneditor',
				label: 'back',
				value: this.publishDisabled
			});
		}
	},

	/**
	 * @returns {void}
	 */
	handlePublishSuccess() {
		let title = this.get('model.title');

		if (title.indexOf(' ') > -1) {
			title = normalizeToUnderscore(title);
		}

		this.transitionToRoute('wiki-page', title).then(() => {
			this.application.addAlert({
				message: this.i18n.t('edit.success', {
					pageTitle: title
				}),
				type: 'success'
			});
			this.set('isPublishing', false);
		});

		track({
			action: trackActions.impression,
			category: 'sectioneditor',
			label: 'success'
		});
	},

	/**
	 * @param {*} error
	 * @returns {void}
	 */
	handlePublishError(error) {
		const appController = this.application,
			errorMsg = this.errorCodeMap[error] || 'edit.publish-error';

		appController.addAlert({
			message: this.i18n.t(errorMsg),
			type: 'alert'
		});

		appController.set('isLoading', false);

		this.set('isPublishing', false);

		track({
			action: trackActions.impression,
			category: 'sectioneditor',
			label: error || 'edit-publish-error'
		});
	}
});
