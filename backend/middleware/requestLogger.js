const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
const logFile = path.join(logsDir, 'requests.log');

// ensure logs directory exists
try {
	if (!fs.existsSync(logsDir)) {
		fs.mkdirSync(logsDir, { recursive: true });
	}
} catch (err) {
	// if directory creation fails, continue but logs to file will fail
	console.error('Failed to ensure logs directory:', err);
}

/**
 * Express request logger middleware
 * Logs to console and appends JSON lines to backend/logs/requests.log
 */
module.exports = function requestLogger(req, res, next) {
	const start = process.hrtime.bigint();
	const { method, originalUrl: url } = req;
	const ip = req.ip || req.connection?.remoteAddress || '-';
	const userAgent = req.get('User-Agent') || '-';

	// capture when response finishes
	res.on('finish', () => {
		const durationNs = Number(process.hrtime.bigint() - start);
		const durationMs = (durationNs / 1e6).toFixed(2);
		const logEntry = {
			timestamp: new Date().toISOString(),
			method,
			url,
			status: res.statusCode,
			durationMs: Number(durationMs),
			ip,
			userAgent
		};

		// console output (concise)
		console.log(`${logEntry.timestamp} ${method} ${url} ${res.statusCode} ${logEntry.durationMs}ms`);

		// append to file as a single JSON line
		try {
			fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n', { encoding: 'utf8' });
		} catch (err) {
			// non-fatal: log file write errors to console
			console.error('Failed to write request log:', err);
		}
	});

	next();
};