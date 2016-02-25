import DiscussionBaseModel from './discussion-base';
import DiscussionModerationModelMixin from '../mixins/discussion-moderation-model';
import DiscussionFilteringModelMixin from '../mixins/discussion-filtering-model';
import ajaxCall from '../utils/ajax-call';

const DiscussionForumModel = DiscussionBaseModel.extend(
	DiscussionModerationModelMixin,
	DiscussionFilteringModelMixin,
	{
		/**
		 * @param {number} pageNum
		 * @param {string} sortBy
		 * @returns {Ember.RSVP.Promise}
		 */
		loadPage(pageNum = 0, sortBy = 'trending') {
			this.set('pageNum', pageNum);

			return ajaxCall({
				data: {
					page: this.get('pageNum'),
					pivot: this.get('pivotId'),
					sortKey: this.getSortKey(sortBy),
					viewableOnly: false
				},
				url: M.getDiscussionServiceUrl(`/${this.wikiId}/forums/${this.forumId}`),
				success: (data) => {
					const newPosts = data._embedded['doc:threads'];
					let allPosts;

					newPosts.forEach((post) => {
						post.firstPost = post._embedded.firstPost[0];
						post.firstPost.isReported = post.isReported;
					});

					allPosts = this.posts.concat(newPosts);

					this.set('posts', allPosts);
				},
				error: (err) => {
					this.handleLoadMoreError(err);
				}
			});
		},

		/**
		 * Create new post in Discussion Service
		 * @param {object} postData
		 * @returns {Ember.RSVP.Promise}
		 */
		createPost(postData) {
			this.setFailedState(null);
			return ajaxCall({
				data: JSON.stringify(postData),
				method: 'POST',
				url: M.getDiscussionServiceUrl(`/${this.wikiId}/forums/${this.forumId}/threads`),
				success: (post) => {
					post._embedded.firstPost[0].isNew = true;
					post.firstPost = post._embedded.firstPost[0];

					this.posts.insertAt(0, post);
					this.incrementProperty('totalPosts');
				},
				error: (err) => {
					this.onCreatePostError(err);
				}
			});
		}
	}
);

DiscussionForumModel.reopenClass({
	/**
	 * @param {number} wikiId
	 * @param {number} forumId
	 * @param {string} sortBy
	 * @returns { Ember.RSVP.Promise}
	 */
	find(wikiId, forumId, sortBy = 'trending') {
		const forumInstance = DiscussionForumModel.create({
				wikiId,
				forumId
			}),
			requestData = {
				viewableOnly: false,
			};

		if (sortBy) {
			requestData.sortKey = forumInstance.getSortKey(sortBy);
		}

		return ajaxCall({
			context: forumInstance,
			data: requestData,
			url: M.getDiscussionServiceUrl(`/${wikiId}/forums/${forumId}`),
			success: (data) => {
				const contributors = [],
					posts = data._embedded ? data._embedded['doc:threads'] : [],
					pivotId = (posts.length > 0 ? posts[0].id : null),
					totalPosts = data.threadCount;

				posts.forEach((post) => {
					if (post.hasOwnProperty('createdBy')) {
						post.createdBy.profileUrl = M.buildUrl({
							namespace: 'User',
							title: post.createdBy.name
						});

						contributors.push(post.createdBy);
					}

					post.firstPost = post._embedded.firstPost[0];
					post.firstPost.isReported = post.isReported;
				});

				forumInstance.setProperties({
					contributors,
					name: data.name,
					pivotId,
					posts,
					totalPosts
				});
			},
			error: (err) => {
				this.onFindError(forumInstance, err);
			}
		});
	}
});

export default DiscussionForumModel;
