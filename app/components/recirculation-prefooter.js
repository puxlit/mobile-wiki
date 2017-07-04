import Ember from 'ember';
import InViewportMixin from 'ember-in-viewport';
import FandomPostsModel from '../models/fandom-posts';
import {track, trackActions} from '../utils/track';

const {Component, getOwner, on, run, inject, $} = Ember;

export default Component.extend(
	InViewportMixin,
	{
		classNames: ['recirculation-prefooter'],
		isVisible: false,
		liftigniter: inject.service(),
		config: {
			max: 9,
			flush: true,
			widget: 'wikia-impactfooter',
			source: 'fandom',
			opts: {
				resultType: 'cross-domain',
				domainType: 'fandom.wikia.com'
			}
		},
		didEnterViewport() {
			// const fandomPosts = FandomPostsModel.create(getOwner(this).ownerInjection());
			// console.log(this.get('liftigniter').getData(this.get('config')));
			this.get('liftigniter').getData(this.get('config')).done((model) => {
				this.setProperties({
					isVisible: true,
					model
				});
				console.log(this.get('model'));
			});
			// fandomPosts.fetch('recent_popular', 10).then((model) => {
			// 	this.setProperties({
			// 		isVisible: true,
			// 		model
			// 	});
			// });

			track({
				action: trackActions.impression,
				category: 'recirculation',
				label: 'footer'
			});
		},

		viewportOptionsOverride: on('willRender', function () {
			const viewportTolerance = 1000;

			this.set('viewportTolerance', {
				top: viewportTolerance,
				bottom: viewportTolerance
			});
		}),

		actions: {
			postClick(post, index) {
				const labelParts = ['footer', `slot-${index + 1}`, post.source, post.isVideo ? 'video' : 'not-video'];

				track({
					action: trackActions.click,
					category: 'recirculation',
					label: labelParts.join('=')
				});

				run.later(() => {
					window.location.assign(post.url);
				}, 200);
			}
		}
	}
);
