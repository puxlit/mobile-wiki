import Ember from 'ember';
import InfoboxImageMediaComponent from './infobox-image-media';
import LinkedGalleryMediaComponent from './linked-gallery-media';
import GalleryMediaComponent from './gallery-media';
import VideoMediaComponent from './video-media';
import ImageMediaComponent from './image-media';
import InfoboxImageCollectionComponent from './infobox-image-collection';
import WikiaMapComponent from './wikia-map';
import PortableInfoboxComponent from './portable-infobox';
import AdsMixin from '../mixins/ads';
import PollDaddyMixin from '../mixins/poll-daddy';
import TrackClickMixin from '../mixins/track-click';
import WidgetTwitterComponent from '../components/widget-twitter';
import WidgetVKComponent from '../components/widget-vk';
import WidgetPolldaddyComponent from '../components/widget-polldaddy';
import WidgetFliteComponent from '../components/widget-flite';
import {getRenderComponentFor, queryPlaceholders} from '../utils/render-component';
import {getExperimentVariationNumber} from 'common/utils/variant-testing';
import {track, trackActions} from 'common/utils/track';

/**
 * HTMLElement
 * @typedef {Object} HTMLElement
 * @property {Function} scrollIntoViewIfNeeded
 */

export default Ember.Component.extend(
	AdsMixin,
	PollDaddyMixin,
	TrackClickMixin,
	{
		tagName: 'article',
		classNames: ['article-content', 'mw-content'],

		adsContext: null,
		content: null,
		media: null,
		contributionEnabled: null,
		uploadFeatureEnabled: null,
		displayTitle: null,
		targetParagraphOffset: null,
		headers: null,
		highlightedEditorDemoEnabled: Ember.computed(() => {
			return getExperimentVariationNumber({dev: '5170910064', prod: '5164060600'}) === 1 &&
				!Ember.$.cookie('highlightedEditorDemoShown');
		}),

		newFromMedia(media) {
			if (media.context === 'infobox' || media.context === 'infobox-hero-image') {
				return InfoboxImageMediaComponent.create();
			} else if (Ember.isArray(media)) {
				if (media.some((media) => Boolean(media.link))) {
					return LinkedGalleryMediaComponent.create();
				} else {
					return GalleryMediaComponent.create();
				}
			} else if (media.type === 'video') {
				return VideoMediaComponent.create();
			} else {
				return ImageMediaComponent.create();
			}
		},

		articleContentObserver: Ember.on('init', Ember.observer('content', function () {
			const content = this.get('content');

			this.destroyChildComponents();

			Ember.run.scheduleOnce('afterRender', this, () => {
				if (content) {
					this.hackIntoEmberRendering(content);

					this.handleInfoboxes();
					this.replaceInfoboxesWithInfoboxComponents();

					this.renderedComponents = queryPlaceholders(this.$())
						.map(this.getAttributesForMedia, this)
						.map(this.renderComponent);

					this.loadIcons();
					this.loadTableOfContentsData();
					this.handleTables();
					this.replaceMapsWithMapComponents();
					this.replaceMediaPlaceholdersWithMediaComponents(this.get('media'), 4);
					this.replaceImageCollectionPlaceholdersWithComponents(this.get('media'));
					this.replaceWikiaWidgetsWithComponents();
					this.handleWikiaWidgetWrappers();
					this.handlePollDaddy();
					this.handleJumpLink();

					if (this.get('highlightedEditorDemoEnabled')) {
						this.setupHighlightedTextEditorDemo();
					}

					Ember.run.later(this, () => this.replaceMediaPlaceholdersWithMediaComponents(this.get('media')), 0);
				} else {
					this.hackIntoEmberRendering(i18n.t('app.article-empty-label'));
				}

				this.injectAds();
				this.setupAdsContext(this.get('adsContext'));
			});
		})),

		headerObserver: Ember.observer('headers', function () {
			if (this.get('contributionEnabled')) {
				const headers = this.get('headers');
				let $sectionHeader = null,
					$contributionComponent = null;

				headers.forEach((header) => {
					$contributionComponent = this.createArticleContributionComponent(header.section, header.id);
					$sectionHeader = this.$(header.element);
					$sectionHeader.prepend($contributionComponent).addClass('short-header');
					$contributionComponent.wrap('<div class="icon-wrapper"></div>');
				});
			}
		}),

		init() {
			this._super(...arguments);

			this.renderComponent = getRenderComponentFor(this);
			this.renderedComponents = [];
		},

		willDestroyElement() {
			this._super(...arguments);

			this.destroyChildComponents();
			this.destroyHighlightedEditorEvents();
		},

		click(event) {
			const $anchor = Ember.$(event.target).closest('a'),
				label = this.getTrackingEventLabel($anchor);

			if (label) {
				this.trackClick('article', label);
			}
		},

		actions: {
			/**
			 * @param {string} lightboxType
			 * @param {*} lightboxData
			 * @returns {void}
			 */
			openLightbox(lightboxType, lightboxData) {
				this.sendAction('openLightbox', lightboxType, lightboxData);
			},

			/**
			 * @param {string} title
			 * @param {number} sectionIndex
			 * @returns {void}
			 */
			edit(title, sectionIndex) {
				this.sendAction('edit', title, sectionIndex);
			},

			/**
			 * @param {string} title
			 * @param {number} sectionIndex
			 * @param {*} photoData
			 * @returns {void}
			 */
			addPhoto(title, sectionIndex, photoData) {
				this.sendAction('addPhoto', title, sectionIndex, photoData);
			},
		},

		/**
		 * This is due to the fact that we send whole article
		 * as an HTML and then we have to modify it in the DOM
		 *
		 * Ember+Glimmer are not fan of this as they would like to have
		 * full control over the DOM and rendering
		 *
		 * In perfect world articles would come as Handlebars templates
		 * so Ember+Glimmer could handle all the rendering
		 *
		 * @param {string} content - HTML containing whole article
		 * @returns {void}
		 */
		hackIntoEmberRendering(content) {
			this.$().html(content);
		},

		/**
		 * Native browser implementation of location hash often gets clobbered by custom rendering,
		 * so ensure it happens here.
		 *
		 * @returns {void}
		 */
		handleJumpLink() {
			if (window.location.hash) {
				window.location.assign(window.location.hash);
			}
		},

		/**
		 * @param {jQuery[]} $element — array of jQuery objects of which context is to be checked
		 * @returns {string}
		 */
		getTrackingEventLabel($element) {
			if ($element && $element.length) {

				// Mind the order -- 'figcaption' check has to be done before '.article-image',
				// as the 'figcaption' is contained in the 'figure' element which has the '.article-image' class.
				if ($element.closest('.portable-infobox').length) {
					return 'portable-infobox-link';
				} else if ($element.closest('.context-link').length) {
					return 'context-link';
				} else if ($element.closest('blockquote').length) {
					return 'blockquote-link';
				} else if ($element.closest('figcaption').length) {
					return 'caption-link';
				} else if ($element.closest('.article-image').length) {
					return 'image-link';
				}

				return 'regular-link';
			}

			return '';
		},

		getAttributesForMedia({name, attrs, element}) {
			const media = this.get('media.media');

			if (attrs.ref >= 0 && media && media[attrs.ref]) {
				if (name === 'article-media-thumbnail' || name === 'portable-infobox-hero-image') {
					attrs = Ember.$.extend(attrs, media[attrs.ref]);

					/**
					 * Ember has its own context attribute, that is why we have to use different attribute name
					 */
					if (attrs.context) {
						attrs.mediaContext = attrs.context;
						delete attrs.context;
					}
				} else if (name === 'article-media-gallery' || name === 'article-media-linked-gallery') {
					attrs = Ember.$.extend(attrs, {
						items: media[attrs.ref]
					});
				}
			} else if (name === 'portable-infobox-image-collection' && attrs.refs && media) {
				const collectionItems = attrs.refs.map((ref) => Ember.$.extend({ref}, media[ref]));

				attrs = Ember.$.extend(attrs, {
					items: collectionItems
				});
			}

			return {name, attrs, element};
		},

		/**
		 * @returns {void}
		 */
		destroyChildComponents() {
			this.renderedComponents.forEach((renderedComponent) => {
				renderedComponent.destroy();
			});
		},

		/**
		 * Creating components for small icons isn't good solution because of performance overhead
		 * Putting all icons in HTML isn't good solution neither because there are articles with a lot of them
		 * Thus we load them all after the article is rendered
		 *
		 * @returns {void}
		 */
		loadIcons() {
			this.$('.article-media-icon[data-src]').each(function () {
				this.src = this.getAttribute('data-src');
			});
		},

		/**
		 * Instantiate ArticleContributionComponent by looking up the component from container
		 * in order to have dependency injection.
		 *
		 * Read "DEPENDENCY MANAGEMENT IN EMBER.JS" section in
		 * http://guides.emberjs.com/v1.10.0/understanding-ember/dependency-injection-and-service-lookup/
		 *
		 * "Lookup" function defined in
		 * https://github.com/emberjs/ember.js/blob/master/packages/container/lib/container.js
		 *
		 * @param {number} section
		 * @param {string} sectionId
		 * @returns {JQuery}
		 */
		createArticleContributionComponent(section, sectionId) {
			const title = this.get('displayTitle'),
				edit = 'edit',
				addPhoto = 'addPhoto',
				addPhotoIconVisible = this.get('addPhotoIconVisible'),
				editIconVisible = this.get('editIconVisible'),
				editAllowed = this.get('editAllowed'),
				addPhotoAllowed = this.get('addPhotoAllowed'),
				contributionComponent =
					this.get('container').lookup('component:article-contribution', {
						singleton: false
					});

			contributionComponent.setProperties({
				section,
				sectionId,
				title,
				edit,
				addPhoto,
				addPhotoIconVisible,
				editIconVisible,
				editAllowed,
				addPhotoAllowed
			});

			return this.createChildView(contributionComponent).createElement().$();
		},

		/**
		 * Generates table of contents data based on h2 elements in the article
		 * TODO: Temporary solution for generating Table of Contents
		 * Ideally, we wouldn't be doing this as a post-processing step, but rather we would just get a JSON with
		 * ToC data from server and render view based on that.
		 *
		 * @returns {void}
		 */
		loadTableOfContentsData() {
			/**
			 * @param {number} i
			 * @param {HTMLElement} elem
			 * @returns {ArticleSectionHeader}
			 */
			const headers = this.$('h2[section]').map((i, elem) => {
				if (elem.textContent) {
					return {
						element: elem,
						level: elem.tagName,
						name: elem.textContent,
						id: elem.id,
						section: elem.getAttribute('section'),
					};
				}
			}).toArray();

			this.set('headers', headers);
			this.sendAction('updateHeaders', headers);
		},

		/**
		 * @param {HTMLElement} element
		 * @param {ArticleModel} model
		 * @returns {JQuery}
		 */
		createMediaComponent(element, model) {
			const ref = parseInt(element.dataset.ref, 10),
				media = model.find(ref),
				component = this.createChildView(this.newFromMedia(media), {
					ref,
					width: parseInt(element.getAttribute('width'), 10),
					height: parseInt(element.getAttribute('height'), 10),
					imgWidth: element.offsetWidth,
					media
				}).createElement();

			return component.$().attr('data-ref', ref);
		},

		/**
		 * @param {ArticleModel} model
		 * @param {number} [numberToProcess=-1]
		 * @returns {void}
		 */
		replaceMediaPlaceholdersWithMediaComponents(model, numberToProcess = -1) {
			const $mediaPlaceholders = this.$('.article-media:not([data-component])');

			if (numberToProcess < 0 || numberToProcess > $mediaPlaceholders.length) {
				numberToProcess = $mediaPlaceholders.length;
			}

			for (let index = 0; index < numberToProcess; index++) {
				$mediaPlaceholders.eq(index).replaceWith(this.createMediaComponent($mediaPlaceholders[index], model));
			}
		},

		/**
		 * @param {ArticleMedia} model
		 * @returns {void}
		 */
		replaceImageCollectionPlaceholdersWithComponents(model) {
			const $placeholders = this.$('.pi-image-collection:not([data-component])'),
				articleMedia = model.get('media'),
				numberToProcess = $placeholders.length,
				getCollectionMediaFromRefs = (ref) => {
					const image = model.find(ref);

					image.ref = articleMedia.length;
					return image;
				};

			for (let index = 0; index < numberToProcess; index++) {
				const $element = $placeholders.eq(index),
					refs = $element.data('refs')
						.split(',')
						.compact()
						.filter((ref) => ref.length > 0),
					collectionMedia = refs.map(getCollectionMediaFromRefs),
					component = this.createChildView(InfoboxImageCollectionComponent, {
						media: collectionMedia
					}).createElement();

				$element.replaceWith(component.$());

				articleMedia.push(collectionMedia);
			}

			model.set('media', articleMedia);
		},

		/**
		 * @returns {void}
		 */
		replaceMapsWithMapComponents() {
			/**
			 * @param {number} i
			 * @param {Element} elem
			 * @returns {void}
			 */
			this.$('.wikia-interactive-map-thumbnail').map((i, elem) => {
				this.replaceMapWithMapComponent(elem);
			});
		},

		/**
		 * @param {Element} elem
		 * @returns {void}
		 */
		replaceMapWithMapComponent(elem) {
			const $mapPlaceholder = $(elem),
				$a = $mapPlaceholder.children('a'),
				$img = $a.children('img'),
				mapComponent = this.createChildView(WikiaMapComponent.create({
					url: $a.data('map-url'),
					imageSrc: $img.data('src'),
					id: $a.data('map-id'),
					title: $a.data('map-title'),
					click: 'openLightbox',
				}));

			mapComponent.createElement();
			$mapPlaceholder.replaceWith(mapComponent.$());
			mapComponent.trigger('didInsertElement');
		},

		/**
		 * @returns {void}
		 */
		replaceInfoboxesWithInfoboxComponents() {
			/**
			 * @param {number} i
			 * @param {Element} elem
			 * @returns {void}
			 */
			this.$('.portable-infobox').map((i, elem) => {
				this.replaceInfoboxWithInfoboxComponent(elem);
			});
		},

		/**
		 * @param {Element} elem
		 * @returns {void}
		 */
		replaceInfoboxWithInfoboxComponent(elem) {
			const $infoboxPlaceholder = $(elem),
				infoboxComponent = this.createChildView(PortableInfoboxComponent.create({
					infoboxHTML: elem.innerHTML,
					height: $infoboxPlaceholder.outerHeight(),
					pageTitle: this.get('displayTitle'),
				}));

			infoboxComponent.createElement();
			$infoboxPlaceholder.replaceWith(infoboxComponent.$());
			infoboxComponent.trigger('didInsertElement');
		},

		/**
		 * @returns {void}
		 */
		replaceWikiaWidgetsWithComponents() {
			/**
			 * @param {number} i
			 * @param {Element} elem
			 * @returns {void}
			 */
			this.$('[data-wikia-widget]').map((i, elem) => {
				this.replaceWikiaWidgetWithComponent(elem);
			});
		},

		/**
		 * @param {Element} elem
		 * @returns {void}
		 */
		replaceWikiaWidgetWithComponent(elem) {
			const $widgetPlaceholder = $(elem),
				widgetData = $widgetPlaceholder.data(),
				widgetType = widgetData.wikiaWidget,
				widgetComponent = this.createWidgetComponent(widgetType, $widgetPlaceholder.data());

			let component;

			if (widgetComponent) {
				component = this.createChildView(widgetComponent);
				component.createElement();
				$widgetPlaceholder.replaceWith(component.$());
				component.trigger('didInsertElement');
			}
		},

		/**
		 * @param {string} widgetType
		 * @param {*} data
		 * @returns {string|null}
		 */
		createWidgetComponent(widgetType, data) {
			switch (widgetType) {
				case 'twitter':
					return WidgetTwitterComponent.create({data});
				case 'vk':
					return WidgetVKComponent.create({data});
				case 'polldaddy':
					return WidgetPolldaddyComponent.create({data});
				case 'flite':
					return WidgetFliteComponent.create({data});
				default:
					Ember.Logger.warn(`Can't create widget with type '${widgetType}'`);
					return null;
			}
		},

		/**
		 * @returns {void}
		 */
		handleWikiaWidgetWrappers() {
			this.$('script[type="x-wikia-widget"]').each(function () {
				const $this = $(this);

				$this.replaceWith($this.html());
			});
		},

		/**
		 * handles expanding long tables, code taken from WikiaMobile
		 *
		 * @returns {void}
		 */
		handleInfoboxes() {
			const shortClass = 'short',
				$infoboxes = this.$('table[class*="infobox"] tbody'),
				body = window.document.body,
				scrollTo = body.scrollIntoViewIfNeeded || body.scrollIntoView;

			if ($infoboxes.length) {
				$infoboxes
					.filter(function () {
						return this.rows.length > 6;
					})
					.addClass(shortClass)
					.append(
						`<tr class=infobox-expand><td colspan=2><svg viewBox="0 0 12 7" class="icon">` +
						`<use xlink:href="#chevron"></use></svg></td></tr>`
					)
					.on('click', function (event) {
						const $target = $(event.target),
							$this = $(this);

						if (!$target.is('a') && $this.toggleClass(shortClass).hasClass(shortClass)) {
							scrollTo.apply($this.find('.infobox-expand')[0]);
						}
					});
			}
		},

		/**
		 * @returns {void}
		 */
		handleTables() {
			this.$('table:not([class*=infobox], .dirbox, .pi-horizontal-group)')
				.not('table table')
				.each((index, element) => {
					const $element = this.$(element),
						wrapper = `<div class="article-table-wrapper${element.getAttribute('data-portable') ?
							' portable-table-wrappper' : ''}"/>`;

					$element.wrap(wrapper);
				});
		},

		/**
		 * TO BE THROWN AWAY ON APRIL 8, 2016
		 *
		 * Sets up everything for the Highlighted Text Editor demo:
		 * - a word selected for highlighting in the DOM
		 * - target paragraph offset
		 * - events binding
		 * @returns {void}
		 */
		setupHighlightedTextEditorDemo() {
			const highlightedId = 'highlighted-text',
				paragraphsLimit = 3,
				$paragraphs = this.$('>p').slice(0, paragraphsLimit);

			$paragraphs.toArray().some((paragraph) => {
				const $paragraph = Ember.$(paragraph),
					paragraphHtml = $paragraph.html(),
					words = Ember.$('<div>').html(paragraphHtml).children().remove().end().html().split(' '),
					minLettersLimit = 5;

				return words.some((word) => {
					if (word.length < minLettersLimit) {
						return false;
					} else {
						this.set('targetParagraphOffset', $paragraph.offset().top);
						$paragraph.html(paragraphHtml.replace(word, `<span id="${highlightedId}">${word}</span>`));
						Ember.$(document).on('touchmove.launchDemo', this, this.debouncedScroll);
						Ember.$(window).on('scroll.launchDemo', this, this.debouncedScroll);
						return true;
					}
				});
			});
		},

		/**
		 * TO BE THROWN AWAY ON MARCH 29, 2016
		 *
		 * Initializes a demo of a new Highlighted Text Editor.
		 * @returns {void}
		 */
		launchHighlightedTextEditorDemo() {
			const highlightedId = 'highlighted-text',
				$highlightedElement = Ember.$(`#${highlightedId}`),
				selection = window.getSelection(),
				range = document.createRange();

			this.destroyHighlightedEditorEvents();

			if ($highlightedElement) {
				const $paragraph = $highlightedElement.parent(),
					word = $highlightedElement.text();

				range.selectNodeContents($highlightedElement[0]);
				selection.removeAllRanges();

				Ember.$('body').animate({scrollTop: $highlightedElement.offset().top - 150}, () => {
					selection.addRange(range);
					$highlightedElement.addClass('highlighted');

					Ember.run.later(() => {
						$highlightedElement.trigger('mousedown');
						Ember.$.cookie('highlightedEditorDemoShown', true);
						Ember.$(document).one('selectionchange', () => {
							$paragraph.html($paragraph.html().replace($highlightedElement[0].outerHTML, word));
						});
					}, 500);
				});

				track({
					action: trackActions.impression,
					category: 'highlighted-editor',
					label: 'popover'
				});


			}
		},

		destroyHighlightedEditorEvents() {
			Ember.$(document).off('touchmove.launchDemo', this.debouncedScroll);
			Ember.$(window).off('scroll.launchDemo', this.debouncedScroll);
		},

		/**
		 * Debounces the scroll event
		 * @param {Object} event
		 * @returns {void}
		*/
		debouncedScroll(event) {
			if (event.data) {
				Ember.run.debounce(event.data, event.data.onScroll, 500);
			}
		},

		/**
		 * If a user has scrolled through the word selected for highlighting
		 * it launches the demo of the Hightlighted Text Editor
		 * @returns {void}
		 */
		onScroll() {
			if (window.scrollY > this.get('targetParagraphOffset')) {
				this.launchHighlightedTextEditorDemo();
			}
		}
	}
);
