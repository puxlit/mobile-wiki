import {module, test} from 'qunit';
import {setupTest} from 'ember-qunit';

module('Unit | Component | featured content', (hooks) => {
	setupTest(hooks);

	test('detects if there are multiple items in the model', function (assert) {
		const component = this.owner.factoryFor('component:featured-content').create();

		component.currentItemIndexObserver = function () {
		};

		component.set('model', [{
			title: 'Item 1'
		}]);
		assert.equal(component.get('hasMultipleItems'), false);

		component.set('model', [{
			title: 'Item 1'
		}, {
			title: 'Item 2'
		}]);
		assert.equal(component.get('hasMultipleItems'), true);
	});

	test('returns the current item', function (assert) {
		const component = this.owner.factoryFor('component:featured-content').create();

		component.currentItemIndexObserver = function () {
		};

		component.set('model', [{
			title: 'Item 1'
		}, {
			title: 'Item 2'
		}]);

		component.set('currentItemIndex', 0);
		assert.deepEqual(component.get('currentItem'), {
			title: 'Item 1'
		});

		component.set('currentItemIndex', 1);
		assert.deepEqual(component.get('currentItem'), {
			title: 'Item 2'
		});
	});

	test('sets proper index in the prevItem function', function (assert) {
		const component = this.owner.factoryFor('component:featured-content').create();

		component.updatePagination = function () {
		};

		component.set('model', [{
			title: 'Item 1'
		}, {
			title: 'Item 2'
		}, {
			title: 'Item 3'
		}]);

		component.prevItem();
		assert.equal(component.get('currentItemIndex'), 2);

		component.prevItem();
		assert.equal(component.get('currentItemIndex'), 1);

		component.prevItem();
		assert.equal(component.get('currentItemIndex'), 0);
	});

	test('sets proper index in the nextItem function', function (assert) {
		const component = this.owner.factoryFor('component:featured-content').create();

		component.updatePagination = function () {
		};

		component.set('model', [{
			title: 'Item 1'
		}, {
			title: 'Item 2'
		}, {
			title: 'Item 3'
		}]);

		component.nextItem();
		assert.equal(component.get('currentItemIndex'), 1);

		component.nextItem();
		assert.equal(component.get('currentItemIndex'), 2);

		component.nextItem();
		assert.equal(component.get('currentItemIndex'), 0);
	});
});
