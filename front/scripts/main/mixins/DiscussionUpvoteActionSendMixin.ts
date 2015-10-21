/// <reference path="../app.ts" />
'use strict';

/**
 * Handles sending upvote action outside from the component.
 */
App.DiscussionUpvoteActionSendMixin = Em.Mixin.create({
	actions: {
		/**
		 * @param {?Object} post
		 * @returns {undefined}
		 */
		upvote(post: any): void {
			this.sendAction('upvote', post);
		}
	}
});
