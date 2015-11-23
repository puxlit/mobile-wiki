/// <reference path="../app.ts" />
'use strict';

App.DiscussionEditorComponent = Em.Component.extend(App.ViewportMixin, {
	classNames: ['discussion-editor'],
	classNameBindings: ['isActive', 'hasError'],

	isActive: false,
	isSticky: false,

	submitDisabled: true,
	isLoading: false,
	showSuccess: false,
	hasError: false,

	offsetTop: 0,
	siteHeadHeight: 0,

	postBody: '',
	errorMessage: Em.computed.oneWay('requestErrorMessage'),
	layoutName: 'components/discussion-editor',

	getBreakpointHeight(): number {
		return this.offsetTop - (this.get('siteHeadPinned') ? this.siteHeadHeight : 0);
	},

	/**
	 * Display error message on post failure
	 */
	errorMessageObserver: Em.observer('errorMessage', function(): void {
		if (this.get('errorMessage')) {
			alert(i18n.t(this.get('errorMessage'), {ns: 'discussion'}));
		}
		this.set('isLoading', false);
	}),

	/**
	 * Handle clicks - focus in textarea and activate editor
	 * @returns {void}
	 */
	click(): void {
		this.$('.editor-textarea').focus();
	},

	/**
	 * Handle message for anon when activating editor
	 */
	isActiveObserver: Em.observer('isActive', function(): void {
		if (this.get('isActive')) {
			if (this.get('currentUser.userId') === null) {
				this.setProperties({
					isActive: false,
					errorMessage: 'editor.post-error-anon-cant-post'
				});
			}

			/*
			 iOS hack for position: fixed - now we display loading icon.
			 */
			if (/iPad|iPhone|iPod/.test(navigator.platform)) {
				$('html, body').css({
					height: '100%',
					overflow: 'hidden'
				});
			}
		} else {
			$('html, body').css({
				height: '',
				overflow: ''
			});
		}
	}),

	actions: {
		/**
		 * Enable/disable editor
		 * @returns {void}
		 */
		toggleEditorActive(active: boolean): void {
			this.set('isActive', active);
		},

		/**
		 * Update editor when typing - activate editor and activate submit button
		 * @returns {void}
		 */
		updateOnInput(): void {
			this.setProperties({
				submitDisabled: this.get('postBody').length === 0 || this.get('currentUser.userId') === null,
				isActive: true
			});
		},

		/**
		 * Handle keypress - post creation shortcut
		 * @returns {void}
		 */
		handleKeyPress(event: KeyboardEvent) :void {
			if ((event.keyCode == 10 || event.keyCode == 13) && event.ctrlKey) {
				// Create post on CTRL + ENTER
				this.send('create');
			}
		}
	}
});
