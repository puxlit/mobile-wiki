const onHeaders = require('on-headers');

function setResponseTime(res) {
	const startAt = process.hrtime();

	onHeaders(res, () => {
		const diff = process.hrtime(startAt);
		const timeSec = (diff[0] * 1e3 + diff[1] * 1e-6) / 1000;

		res.setHeader('x-backend-response-time', timeSec.toFixed(3));
	});
}

module.exports = function (req, res, next) {
	res.set('x-served-by', process.env.HOST || process.env.HOSTNAME || 'mobile-wiki');
	// req_id is generated by express-bunyan-logger
	req.headers['x-trace-id'] = req.log.fields.req_id;
	if (req.headers['fastly-ssl']) {
		const cspPolicy = 'default-src https:; script-src https: \'unsafe-inline\' \'unsafe-eval\'; ' +
			'style-src https: \'unsafe-inline\'; img-src https: data:;';
		const cspReport = 'report-uri https://services.wikia.com/csp-logger/csp';
		res.setHeader('content-security-policy-report-only', cspPolicy + cspReport);
	}
	setResponseTime(res);
	next();
};
