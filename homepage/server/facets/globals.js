/**
 * Wikia (Japan) Homepage
 *
 * @author Per Johan Groland <pgroland@wikia-inc.com>
 */

var util = require('../util');

function globals(request, reply) {
	var loginUrl = util.getLoginUrl(),
		signupUrl = util.getSignupUrl(),
		script = 'function getGlobals () {' +
			'	return { ' +
			'		loginUrl: \''  + loginUrl + '\', ' +
			'		signupUrl: \'' + signupUrl + '\' ' +
			'}}\n';

	return reply(script);
}

module.exports = globals;
