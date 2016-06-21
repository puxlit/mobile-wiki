import Ember from 'ember';

import DiscussionCategory from './discussion/domain/category';
import request from 'ember-ajax/request';

const DiscussionAttributesModel = Ember.Object.extend({
	data: null,
	wikiId: null,

	/**
	 * @param {object} apiData
	 *
	 * @returns {void}
	 */
	setNormalizedData(apiData) {

	},
});

DiscussionAttributesModel.reopenClass({
	/**
	 * @param {number} wikiId
	 * @returns {Ember.RSVP.Promise}
	 */
	getAttributes(wikiId) {
		return new Ember.RSVP.Promise((resolve) => {
			const attributesInstance = DiscussionModel.create({
				wikiId
			});

			resolve(attributesInstance);

			request(M.getDiscussionServiceUrl(`/${wikiId}/attr/guidelines`)).then((data) => {
				attributesInstance.setNormalizedData(data);


			}).catch(() => {
				// Categories fail silently
			});
		});
	}
});

export default DiscussionModel;
