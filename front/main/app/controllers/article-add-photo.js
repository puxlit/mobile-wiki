import Ember from 'ember';
import ArticleAddPhotoModel from '../models/article-add-photo';
import {track, trackActions} from 'common/utils/track';
import {normalizeToUnderscore} from 'common/utils/string';

export default Ember.Controller.extend({
	application: Ember.inject.controller(),

	errorCodeMap: {
		invalidtitle: 'add-photo.section-title-error',
		noedit: 'edit.publish-error-noedit',
		'noedit-anon': 'edit.publish-error-noedit-anon'
	},

	/**
	 * @returns {void}
	 */
	handleAddContentSuccess() {
		let title = this.get('model.title');

		if (title.indexOf(' ') > -1) {
			title = normalizeToUnderscore(title);
		}

		this.transitionToRoute('wiki-page', title).then(() => {
			this.get('application').addAlert({
				message: i18n.t('add-photo.success'),
				type: 'success'
			});
		});

		track({
			action: trackActions.impression,
			category: 'sectionaddphoto',
			label: 'success'
		});
	},

	/**
	 * @param {*} data
	 * @returns {void}
	 */
	handleUploadSuccess(data) {
		ArticleAddPhotoModel.addToContent(data.title, this.get('model')).then(
			this.handleAddContentSuccess.bind(this),
			this.handleError.bind(this)
		);
	},

	/**
	 * @param {*} error
	 * @returns {void}
	 */
	handleError(error) {
		const appController = this.get('application'),
			errorMsg = this.errorCodeMap[error] || 'add-photo.error';

		appController.addAlert({
			message: i18n.t(errorMsg),
			type: 'alert'
		});

		appController.set('isLoading', false);

		track({
			action: trackActions.impression,
			category: 'sectionaddphoto',
			label: error || 'add-photo-error'
		});
	},

	actions: {
		/**
		 * @returns {void}
		 */
		upload() {
			this.get('application').set('isLoading', true);
			ArticleAddPhotoModel.upload(this.get('model')).then(
				this.handleUploadSuccess.bind(this),
				this.handleError.bind(this)
			);
		},

		/**
		 * @returns {void}
		 */
		back() {
			this.transitionToRoute('wiki-page', this.get('model.title'));
		}
	}
});
