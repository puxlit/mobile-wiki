import {getQueryParam} from '../../mercury/utils/queryString';

export function initialize(container, application) {
	const optimizelyScript = M.prop('optimizelyScript');

	if (!Ember.isEmpty(optimizelyScript) && !getQueryParam('noexternals')) {
		application.deferReadiness();

		Ember.$.getScript(optimizelyScript).always(() => {
			application.advanceReadiness();
		});
	}
}

export default {
	name: 'optimizely',
	initialize
};
