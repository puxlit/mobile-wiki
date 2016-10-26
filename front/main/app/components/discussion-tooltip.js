import Ember from 'ember';
import localStorageConnector from '../utils/local-storage-connector';
import ViewportMixin from '../mixins/viewport';
const {String} = Ember;

export default Ember.Component.extend(
	ViewportMixin,
	{
		/**
		 * Arrow vertical offset from 'pointingTo' element
		 */
		arrowOffset: 3,
		arrowDirection: 'down',
		attributeBindings: ['style'],
		classNameBindings: ['arrowDirection'],
		classNames: ['discussion-tooltip-wrapper'],
		localStorageId: null,
		/**
		 * Css selector for parent element (that has position: relative).
		 */
		parent: '',
		/**
		 * Css selector for element that this tooltip will pointing to
		 */
		pointingTo: '',
		/**
		 * Offset for right side, when tooltip would stick out from viewport
		 */
		rightOffset: 3,
		show: false,
		/**
		 * Controls whether tooltip should appear once, and never again
		 * (when some action changing seen property occurred)
		 */
		showOnce: true,
		/**
		 * Controls whether tooltip should show once in whole application.
		 * Even if there are multiple instances of this tooltip defined, if one will show, other will be invisible.
		 */
		showOnceInApplication: false,
		/**
		 * Default text, used by both desktop and mobile
		 */
		text: '',

		// position
		arrowMarginLeft: 0,
		left: 0,
		top: 0,

		/**
		 * @private
		 */
		init() {
			this._super(...arguments);
			this.attachObservers();
		},

		/**
		 * @private
		 */
		attachObservers() {
			if (this.get('showOnce') && !this.get('wasSeen')) {
				this.addObserver('seen', this.onSeenChange);
				this.addObserver('viewportDimensions.width', this.onViewportChange);
			}
		},

		/**
		 * @private
		 */
		onSeenChange() {
			if (this.get('seen')) {
				localStorageConnector.setItem(this.get('localStorageId'), true);
				this.removeObservers();
			}
		},

		/**
		 * @private
		 */
		removeObservers() {
			this.removeObserver('seen', this.onSeenChange);
			this.removeObserver('viewportDimensions.width', this.onViewportChange);
		},

		/**
		 * @private
		 */
		onViewportChange() {
			this.computePositionAfterRender();
		},

		/**
		 * @private
		 */
		computePositionAfterRender() {
			Ember.run.schedule('afterRender', this, function () {
				this.computeTooltipPosition();
			});
		},

		didInsertElement() {
			this._super(...arguments);
			this.computePositionAfterRender();
		},

		/**
		 * This method automatically finds tooltip position above element 'pointingTo' in element 'parent'.
		 * 'pointingTo' element will be pointed by arrow.
		 *
		 * @private
		 */
		computeTooltipPosition() {
			if (this.get('isVisible')) {
				const direction = this.get('arrowDirection');
				if (direction === 'down') {
					this.computeTooltipPositionWithArrowDown();
				} else if (direction === 'right') {
					this.computeTooltipPositionWithArrowRight();
				}
			}
		},

		computeTooltipPositionWithArrowDown() {
			const width = this.$().width(),
				parentOffset = this.$().parents(this.get('parent')).offset(),
				pointingToElement = this.$().parent().find(this.get('pointingTo')),
				elementOffset = pointingToElement.offset(),
				elementWidth = pointingToElement.width();

			let arrowMarginLeft = 0,
				left = (elementOffset.left - parentOffset.left) - (width / 2) + (elementWidth / 2),
				top = (elementOffset.top - parentOffset.top) - this.$().height() - this.get('arrowOffset');

			if (this.tooltipWillStickOutFromViewport(left + width)) {
				let leftInViewport = window.innerWidth - width - this.get('rightOffset');

				arrowMarginLeft = (left - leftInViewport) * 2;
				left = leftInViewport;
			}

			this.set('top', top);
			this.set('left', left);
			this.set('arrowMarginLeft', arrowMarginLeft);
		},

		computeTooltipPositionWithArrowRight() {
			const height = this.$().height(),
				width = this.$().width(),
				parentOffset = this.$().parents(this.get('parent')).offset(),
				pointingToElement = this.$().parent().find(this.get('pointingTo')),
				elementOffset = pointingToElement.offset(),
				elementHeight = pointingToElement.height();

			let top = elementOffset.top - parentOffset.top + (elementHeight / 2) - (height / 2),
				left = elementOffset.left - parentOffset.left - width - this.get('arrowOffset');

			this.set('top', top);
			this.set('left', left);
			this.set('arrowMarginLeft', 0);
		},

		/**
		 * @private
		 * @returns {boolean}
		 */
		tooltipWillStickOutFromViewport(elementRightCorner) {
			return window.innerWidth < elementRightCorner;
		},

		style: Ember.computed('top', 'left', function () {
			return String.htmlSafe(`top: ${this.get('top')}px; left: ${this.get('left')}px;`);
		}),

		arrowStyle: Ember.computed('arrowMarginLeft', function () {
			return String.htmlSafe(`margin-left: ${this.get('arrowMarginLeft')}px;`);
		}),

		isVisible: Ember.computed('show', 'seen', 'wasSeen', function () {
			return Boolean(this.get('show')) && (this.get('showOnce') ? (!this.get('seen') && !this.get('wasSeen')) : true);
		}),

		wasAlreadySeen() {
			return !this.get('seen') && !this.get('wasSeen');
		},

		wasSeen: Ember.computed('localStorageId', function () {
			return Boolean(localStorageConnector.getItem(this.get('localStorageId')));
		})
	});
