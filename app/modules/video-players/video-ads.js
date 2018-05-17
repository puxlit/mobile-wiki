import JWPlayerTracker from '../ads/tracking/jwplayer-tracker';

const moatTrackingPartnerCode = 'wikiajwint101173217941';
const moatJwplayerPluginUrl = 'https://z.moatads.com/jwplayerplugin0938452/moatplugin.js';

/**
 * Calculate depth
 *
 * @param {number} depth
 * @returns {number}
 */
function calculateRV(depth) {
	const {context} = window.Wikia.adEngine;

	const capping = context.get('options.video.adsOnNextVideoFrequency');

	return (depth < 2 || !capping) ? 1 : (Math.floor((depth - 1) / capping) + 1);
}

/**
 * @param {number} depth
 * @returns {boolean}
 */
function shouldPlayAdOnNextVideo(depth) {
	const {context} = window.Wikia.adEngine;
	const capping = context.get('options.video.adsOnNextVideoFrequency');

	return context.get('options.video.playAdsOnNextVideo') && capping > 0 && (depth - 1) % capping === 0;
}

/**
 * @param {number} depth
 * @returns {boolean}
 */
function canAdBePlayed(depth) {
	const isReplay = depth > 1;

	return !isReplay || (isReplay && shouldPlayAdOnNextVideo(depth));
}

/**
 * @param {number} videoDepth
 * @returns {boolean}
 */
function shouldPlayPreroll(videoDepth) {
	return canAdBePlayed(videoDepth);
}

/**
 * @param {number} videoDepth
 * @returns {boolean}
 */
function shouldPlayMidroll(videoDepth) {
	const {context} = window.Wikia.adEngine;
	return context.get('options.video.isMidrollEnabled') && canAdBePlayed(videoDepth);
}

/**
 * @param {number} videoDepth
 * @returns {boolean}
 */
function shouldPlayPostroll(videoDepth) {
	const {context} = window.Wikia.adEngine;
	return context.get('options.video.isPostrollEnabled') && canAdBePlayed(videoDepth);
}

/**
 * @param {Object} slot
 * @param {string} position
 * @param {number} depth
 * @param {number} correlator
 * @param {Object} slotTargeting
 * @returns {string}
 */
function getVastUrl(slot, position, depth, correlator, slotTargeting) {
	const {buildVastUrl} = window.Wikia.adEngine;
	return buildVastUrl(16 / 9, slot.getSlotName(), {
		correlator,
		vpos: position,
		targeting: Object.assign({
			passback: 'jwplayer',
			rv: calculateRV(depth),
		}, slotTargeting),
	});
}

/**
 * Setup ad events for jw player
 *
 * @param {Object} player
 * @param {Object} options
 * @param {Object} slotTargeting
 * @returns {void}
 */
function init(player, options, slotTargeting) {
	const {
		AdSlot,
		btfBlockerService,
		context,
		slotService,
		vastDebugger,
		vastParser
	} = window.Wikia.adEngine;

	const slotId = options.featured ? 'gpt-featured-video' : 'gpt-inline-video';
	const slot = slotService.get(slotId) || new AdSlot({id: slotId});
	const adProduct = slot.config.trackingKey;
	const videoElement = player && player.getContainer && player.getContainer();
	const videoContainer = videoElement && videoElement.parentNode;
	const tracker = new JWPlayerTracker({
		adProduct,
		slotName: slot.getSlotName(),
		withAudio: !player.getMute(),
	});
	const targeting = slotTargeting;

	let correlator;
	let depth = options.depth || 0;
	let prerollPositionReached = false;

	slot.element = videoContainer;

	if (context.get('options.jwplayer.audio.exposeToSlot')) {
		const key = context.get('options.jwplayer.audio.key');
		const segment = context.get('options.jwplayer.audio.segment');

		slot.config.audioSegment = player.getMute() ? '' : segment;
		slot.config.targeting[key] = player.getMute() ? 'no' : 'yes';
	}

	if (!slotService.get(slotId)) {
		slotService.add(slot);
	}

	if (context.get('options.video.moatTracking.enabledForArticleVideos')) {
		player.on('adImpression', (event) => {
			if (window.moatjw) {
				window.moatjw.add({
					adImpressionEvent: event,
					partnerCode: moatTrackingPartnerCode,
					player,
				});
			}
		});
	}

	player.on('adBlock', () => {
		tracker.updateType(adProduct);
	});

	player.on('beforePlay', () => {
		const currentMedia = player.getPlaylistItem() || {};

		targeting.v1 = currentMedia.mediaid;

		if (prerollPositionReached) {
			return;
		}

		// tracker.updateType(adProduct);
		correlator = Math.round(Math.random() * 10000000000);
		depth += 1;

		if (shouldPlayPreroll(depth)) {
			/**
			 * Fill in slot handle
			 * @returns {void}
			 */
			const fillInSlot = () => {
				player.playAd(getVastUrl(slot, 'preroll', depth, correlator, targeting));
			};

			// tracker.updateType(`${adProduct}-preroll`);

			if (options.featured) {
				fillInSlot();
			} else {
				btfBlockerService.push(slot, fillInSlot);
			}
		}

		prerollPositionReached = true;
	});

	player.on('videoMidPoint', () => {
		if (shouldPlayMidroll(depth)) {
			tracker.updateType(`${adProduct}-midroll`);
			player.playAd(getVastUrl(slot, 'midroll', depth, correlator, targeting));
		}
	});

	player.on('beforeComplete', () => {
		if (shouldPlayPostroll(depth)) {
			tracker.updateType(`${adProduct}-postroll`);
			player.playAd(getVastUrl(slot, 'postroll', depth, correlator, targeting));
		}
	});

	player.on('complete', () => {
		prerollPositionReached = false;
	});

	player.on('adRequest', (event) => {
		const vastParams = vastParser.parse(event.tag, {
			imaAd: event.ima && event.ima.ad,
		});
		vastDebugger.setVastAttributes(videoContainer, 'success', vastParams);

		if (options.featured) {
			// featuredVideoDelay.markAsReady(vastParams.lineItemId);
		}
	});

	player.on('adError', (event) => {
		vastDebugger.setVastAttributes(videoContainer, event.tag, 'error', event.ima && event.ima.ad);

		if (options.featured) {
			// featuredVideoDelay.markAsReady();
		}
	});

	tracker.register(player);
}

const jwPlayerMOAT = {
	loadTrackingPlugin: () => window.M.loadScript(moatJwplayerPluginUrl, true)
};

export default {
	init,
	jwPlayerMOAT
};