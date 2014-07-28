/// <reference path="../app.ts" />
'use strict';

App.ArticleIndexController = Em.ObjectController.extend({
	needs: ['application'],
	actions: {
		updateHeaders: function(headers): void {
			var article = this.get('model');
			article.set('sections', headers);
		},
		changePage: function(title) {
			this.transitionToRoute('article.index', title);
		},
		// Bubbled up from ArticleSectionHeaderView, which is a child of ArticleView
		scrollToTop: function () {
			window.scrollTo(0, 0);
		}
	},
	displayUsers: Ember.computed('users', function () {
		return this.get('users').slice(0, 5);
	})
});
