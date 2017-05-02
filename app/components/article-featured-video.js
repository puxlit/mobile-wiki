import Ember from 'ember';
import VideoLoader from '../modules/video-loader';
import duration from '../helpers/duration';
import {track, trackActions} from '../utils/track';
import extend from '../utils/extend';

const {Component, inject, run} = Ember;

export default Component.extend(
	{
		classNames: ['article-featured-video'],
		classNameBindings: ['isPlayerLoading::player-ready', 'isPlayed:is-played', 'isVideoDrawerVisible:fixed'],
		isPlayerLoading: true,
		wikiVariables: inject.service(),
		hasRendered: false,

		init() {
			this._super(...arguments);

			this.set('videoContainerId', `ooyala-article-video${new Date().getTime()}`);
		},
		/**
		 * @returns {void}
		 */
		didRender() {
			this._super(...arguments);

			if (!this.get('hasRendered')) {
				this.initVideoPlayer();
				this.initOnScrollBehaviour();
				this.set('hasRendered', true);
			}
		},

		/**
		 * Manages video transformation on user's scroll action
		 *
		 * @returns {void}
		 */
		initOnScrollBehaviour() {
			let $video = this.$('.video-container'),
				videoBottomPosition = $video.offset().top + $video.height();

			$(window).on('scroll', () => {
				run.throttle(this, () => {
					let currentScroll = this.$(window).scrollTop();

					if (currentScroll >= videoBottomPosition && this.canVideoDrawerShow()) {
						this.set('isVideoDrawerVisible', true);
						this.toggleSiteHeadShadow(false);
					} else if (currentScroll < videoBottomPosition - $video.height()) {
						this.set('videoDrawerDismissed', false);
						this.closeVideoDrawer();
					}
				}, 200);
			});
		},

		willDestroyElement() {
			this._super(...arguments);

			if (this.player) {
				this.player.destroy();
			}
		},

		onCreate(player) {
			this.player = player;

			player.mb.subscribe(window.OO.EVENTS.PLAYBACK_READY, 'ui-title-update', () => {
				const videoTitle = player.getTitle(),
					videoTime = duration.compute([Math.floor(player.getDuration() / 1000)]);

				this.setProperties({
					videoTitle,
					videoTime,
					isPlayerLoading: false
				});
			});

			this.setupTracking(player);
		},

		/**
		 * Used to instantiate a video player
		 *
		 * @returns {void}
		 */
		initVideoPlayer() {
			const model = this.get('model.embed'),
				jsParams = {
					onCreate: this.onCreate.bind(this),
					containerId: this.get('videoContainerId'),
					cacheBuster: this.get('wikiVariables.cacheBuster')
				},
				data = extend({}, model, {jsParams}),
				videoLoader = new VideoLoader(data);
			videoLoader.loadPlayerClass();
		},

		setupTracking(player) {
			let playTime = -1,
				percentagePlayTime = -1;

			player.mb.subscribe(window.OO.EVENTS.INITIAL_PLAY, 'featured-video', () => {
				track({
					action: trackActions.playVideo,
					category: 'article-video',
					label: 'featured-video'
				});
			});

			player.mb.subscribe(window.OO.EVENTS.VOLUME_CHANGED, 'featured-video', (eventName, volume) => {
				if (volume > 0) {
					track({
						action: trackActions.click,
						category: 'article-video',
						label: 'featured-video-unmuted'
					});
					player.mb.unsubscribe(window.OO.EVENTS.VOLUME_CHANGED, 'featured-video');
				}
			});

			player.mb.subscribe(window.OO.EVENTS.PLAY, 'featured-video', () => {
				track({
					action: trackActions.click,
					category: 'article-video',
					label: 'featured-video-play'
				});
			});

			player.mb.subscribe(window.OO.EVENTS.PLAYED, 'featured-video', () => {
				track({
					action: trackActions.click,
					category: 'article-video',
					label: 'featured-video-played'
				});
			});

			player.mb.subscribe(window.OO.EVENTS.PAUSE, 'featured-video', () => {
				track({
					action: trackActions.click,
					category: 'article-video',
					label: 'featured-video-paused'
				});
			});

			player.mb.subscribe(window.OO.EVENTS.REPLAY, 'featured-video', () => {
				track({
					action: trackActions.click,
					category: 'article-video',
					label: 'featured-video-replay'
				});
			});

			player.mb.subscribe(window.OO.EVENTS.PLAYHEAD_TIME_CHANGED, 'featured-video',
				(eventName, time, totalTime) => {
					let secondsPlayed = Math.floor(time),
						percentage = Math.round(time / totalTime * 100);

					if (secondsPlayed % 5 === 0 && secondsPlayed !== playTime) {
						playTime = secondsPlayed;
						track({
							action: trackActions.view,
							category: 'article-video',
							label: `featured-video-played-seconds-${playTime}`
						});
					}

					if (percentage % 10 === 0 && percentage !== percentagePlayTime) {
						percentagePlayTime = percentage;
						track({
							action: trackActions.view,
							category: 'article-video',
							label: `featured-video-played-percentage-${percentagePlayTime}`
						});
					}
				});

			track({
				action: trackActions.impression,
				category: 'article-video',
				label: 'featured-video'
			});
		},

		canVideoDrawerShow() {
			return !this.get('isVideoDrawerVisible') &&
				!this.get('videoDrawerDismissed') &&
				!this.get('isPlayerLoading') &&
				!this.get('isPlayed');
		},

		closeVideoDrawer() {
			if (this.get('isVideoDrawerVisible')) {
				this.set('isVideoDrawerVisible', false);
				this.toggleSiteHeadShadow(true);
			}
		},

		actions: {
			playVideo() {
				if (this.player) {
					if (this.get('isVideoDrawerVisible')) {
						this.player.mb.publish(window.OO.EVENTS.WILL_CHANGE_FULLSCREEN, true);
					}

					this.set('isPlayed', true);
					this.closeVideoDrawer();
					this.player.play();
				}
			},
			closeVideoDrawer() {
				this.setProperties({
					isVideoDrawerVisible: false,
					videoDrawerDismissed: true
				});
			}
		}
	}
);
