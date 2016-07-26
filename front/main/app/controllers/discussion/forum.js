import DiscussionModerationControllerMixin from '../../mixins/discussion-moderation-controller';
import DiscussionContributionControllerMixin from '../../mixins/discussion-contribution-controller';
import DiscussionForumActionsControllerMixin from '../../mixins/discussion-forum-actions-controller';
import ResponsiveMixin from '../../mixins/responsive';
import DiscussionBaseController from './base';


export default DiscussionBaseController.extend(
	DiscussionModerationControllerMixin,
	DiscussionContributionControllerMixin,
	DiscussionForumActionsControllerMixin,
	ResponsiveMixin,
	{
		catId: [],
		areGuidelinesVisible: false,

		actions: {
			createPost(entityData, forumId) {
				this.transitionToRoute({queryParams: {sort: 'latest'}}).promise.then(() => {
					this.createPost(entityData, forumId);
				});
			},

			updateCategories(categories) {
				this.get('target').send('updateCategories', categories);
			},

			gotoGuidelines() {
				this.get('target').send('gotoGuidelines');
			},

			/**
			 * This sets 'areGuidelinesVisible' property which results with Guidelines' modal open.
			 * @returns {void}
			 */
			openGuidelines() {
				this.set('areGuidelinesVisible', true);
			},
		}
	},
);
