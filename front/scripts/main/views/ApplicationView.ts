/// <reference path='../app.ts' />
/// <reference path="../../mercury/utils/browser.ts" />
/// <reference path='../../../../typings/headroom/headroom.d.ts' />
/// <reference path="../mixins/LanguagesMixin.ts" />

'use strict';

// TS built-in MouseEvent's target is an EventTarget, not an HTMLElement
interface HTMLMouseEvent extends MouseEvent {
	target: HTMLElement;
}

interface DOMStringMap {
	galleryRef: string;
	ref: string;
	trackingCategory: string;
}

interface EventTarget {
	tagName: string;
}

App.ApplicationView = Em.View.extend(App.LanguagesMixin, {
	classNameBindings: ['systemClass', 'smartBannerVisible', 'verticalClass'],

	verticalClass: Em.computed(function (): string {
		var vertical: string = Em.get(Mercury, 'wiki.vertical');
		return vertical + '-vertical';
	}),

	systemClass: Em.computed(function (): string {
		var system: string = Mercury.Utils.Browser.getSystem();
		return system ? 'system-' + system : '';
	}),

	smartBannerVisible: Em.computed.alias('controller.smartBannerVisible'),
	noScroll: Em.computed.alias('controller.noScroll'),
	scrollLocation: null,

	noScrollObserver: Em.observer('noScroll', function (): void {
		var $body = Em.$('body'),
			scrollLocation: number;

		if (this.get('noScroll')) {
			scrollLocation = $body.scrollTop();

			this.set('scrollLocation', scrollLocation);

			$body.css('top', -scrollLocation)
				.addClass('no-scroll');
		} else {
			$body.removeClass('no-scroll')
				.css('top', '');

			window.scrollTo(0, this.get('scrollLocation'));
			this.set('scrollLocation', null);
		}
	}),

	willInsertElement: function (): void {
		$('#article-preload').remove();
	},

	didInsertElement: function (): void {
		this.trackFirstContent();
		this.handleWikiaInYourLang();
	},

	trackFirstContent: function (): void {
		M.trackPerf({
			name: 'firstContent',
			type: 'mark'
		});
	},

	/**
	 * Necessary because presently, we open external links in new pages, so if we didn't
	 * cancel the click event on the current page, then the mouseUp handler would open
	 * the external link in a new page _and_ the current page would be set to that external link.
	 */
	click: function (event: MouseEvent): void {
		/**
		 * check if the target has a parent that is an anchor
		 * We do this for links in the form <a href='...'>Blah <i>Blah</i> Blah</a>,
		 * because if the user clicks the part of the link in the <i></i> then
		 * target.tagName will register as 'I' and not 'A'.
		 */
		var $anchor = Em.$(event.target).closest('a'),
			target: EventTarget = $anchor.length ? $anchor[0] : event.target,
			tagName: string;

		if (target && this.shouldHandleClick(target)) {
			tagName = target.tagName.toLowerCase();

			if (tagName === 'a') {
				this.handleLink(<HTMLAnchorElement>target);
				event.preventDefault();
			}
		}
	},

	/**
	 * Determine if we have to apply special logic to the click handler for MediaWiki / UGC content
	 */
	shouldHandleClick: function (target: EventTarget): boolean {
		var $target: JQuery = $(target),
			isReference: boolean = this.targetIsReference(target);

		return (
			$target.closest('.mw-content').length &&
			// ignore polldaddy content
			!$target.closest('.PDS_Poll').length &&
			// don't need special logic for article references
			!isReference
		);
	},

	/**
	 * Determine if the clicked target is an reference/in references list (in text or at the bottom of article)
	 */
	targetIsReference: function (target: EventTarget): boolean {
		var $target: JQuery = $(target);

		return !!(
			$target.closest('.references').length ||
			$target.parent('.reference').length
		);
	},

	handleLink: function (target: HTMLAnchorElement): void {
		var controller: typeof App.ApplicationController;

		Em.Logger.debug('Handling link with href:', target.href);

		/**
		 * If either the target or the target's parent is an anchor (and thus target == true),
		 * then also check if the anchor has an href. If it doesn't we assume there is some other
		 * handler for it that deals with it based on ID or something and we just skip it.
		 */
		if (target && target.href) {
			/**
			 * But if it does have an href, we check that it's not the link to expand the comments
			 * If it's _any_ other link than that comments link, we stop its action and
			 * pass it up to handleLink
			 */
			if (!target.href.match('^' + window.location.origin + '\/a\/.*\/comments$')) {
				controller = this.get('controller');

				controller.send('closeLightbox');
				controller.send('handleLink', target);
			}
		}
	},

	handleWikiaInYourLang: function(): void {
		if (this.shouldShowWikiaInYourLang()) {
			App.WikiaInYourLangModel.load()
			.then(function(model: typeof App.WikiaInYourLangModel): void {
				if (model) {
					this.createAlert(model);
					M.track({
						action: M.trackActions.impression,
						category: 'wikiaInYourLangAlert',
						label: 'shown'
					});
				}
			}.bind(this),
			(err: any) => {
				M.track({
					action: M.trackActions.impression,
					category: 'wikiaInYourLangAlert',
					label: err || 'error'
				});
			});
		}
	},

	createAlert: function(model: typeof App.WikiaInYourLangModel): void {
		var appController = this.get('controller'),
		    alertData = {
			message: model.message,
			expiry: 60000,
			unsafe: true,
			callbacks: {
				onInsertElement: function(alert: any): void {
					alert.on('click', 'a:not(.close)', (event: any) => {
						M.track({
							action: M.trackActions.click,
							category: 'wikiaInYourLangAlert',
							label: 'link'
						});
					});
				},
				onCloseAlert: function(): void {
					window.localStorage.setItem(this.getAlertKey(), new Date().getTime().toString());
					M.track({
						action: M.trackActions.click,
						category: 'wikiaInYourLangAlert',
						label: 'close'
					});
				}
			}
		};
		appController.addAlert(alertData);
	},

	shouldShowWikiaInYourLang: function(): boolean {
		var value = window.localStorage.getItem(this.getAlertKey()),
		    now = new Date().getTime(),
		    notDismissed = !value || (now - value > 86400000), //1 day 86400000
		    isJpOnNonJpWikia = this.get('isJapaneseBrowser') && !this.get('isJapaneseWikia');
		return notDismissed && isJpOnNonJpWikia;
	},

	getAlertKey: function(): string {
		return 'wikiaInYourLang.alertDismissed';
	}
});
