import Ember from 'ember';
import {track, trackActions} from '../utils/discussion-tracker';
import DiscussionCategoriesComponent from '../mixins/discussion-categories-component';

export default Ember.Component.extend(
	DiscussionCategoriesComponent,
	{
		allCategorySelected: false,

		visibleCategoriesCount: null,

		init() {
			this._super();
			this.setLocalCategories();
		},

		disabledObserver: Ember.observer('disabled', function () {
			if (this.get('disabled', true)) {
				this.send('onAllCategoryClick', false);
			}
		}),

		setLocalCategories() {
			const categories = this.get('categories'),
				localCategories = new Ember.A();

			categories.forEach((category) => {
				localCategories.pushObject({
					category,
					selected: category.selected
				});
			});

			this.setProperties({
				localCategories,
				allCategorySelected: this.get('isAllCategories'),
			});
		},

		setAllCategorySelected(localCategories) {
			const isNothingSelected = localCategories.isEvery('selected', false),
				allCategorySelected = this.get('allCategorySelected');

			if (!allCategorySelected && isNothingSelected) {
				this.set('allCategorySelected', true);
			} else if (allCategorySelected && !isNothingSelected) {
				this.set('allCategorySelected', false);
			}
		},

		actions: {
			/**
			 * Resets categories module to default state
			 *
			 * @returns {void}
			 */
			reset() {
				const localCategories = this.get('localCategories');

				track(trackActions.CategoriesResetTapped);
				localCategories.setEach('selected', false);

				this.sendAction('updateCategories', localCategories);
			},

			onAllCategoryClick(shouldTrack) {
				const localCategories = this.get('localCategories');

				if (shouldTrack) {
					this.trackCategory(true);
				}

				localCategories.setEach('selected', false);
				this.setAllCategorySelected(localCategories);

				this.sendAction('updateCategories', localCategories);
			},

			/**
			 * @param {boolean} isAllCategories
			 *
			 * @returns {void}
			 */
			onCategoryClick(category, event) {
				const localCategories = this.get('localCategories');

				this.trackCategory(false);
				event.preventDefault();

				Ember.set(category, 'selected', !category.selected);

				this.setAllCategorySelected(localCategories);

				this.sendAction('updateCategories', this.get('localCategories'));
			}
		}
	}
);
