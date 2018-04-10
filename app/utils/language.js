import config from '../config/environment';
import {escapeRegex} from './string';

/**
 * @param {Object} request - FastBoot request
 * @returns {string|null}
 */
export default function getLanguageCodeFromRequest(request = null) {
	const path = request ? request.get('path') : window.location.pathname,
		matches = path.match(/^(\/[\w]{2,3}(-[\w]{2,3})?)\//);

	return matches && matches[1];
}
