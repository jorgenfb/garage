const express = require('express');
const garage = require('./garage');
const Observable = require('rxjs').Observable;

const app = express();

app.get('/garage-door', (req, resp) => {
	garage.isOpen()
		.then(value => resp.send({open: Boolean(value)}))
		.catch(() => resp.status(500).send('Unable to read sensor'));
});

// Handle requests to trigger port
app.post('/garage-door/trigger', (req, resp) => {
	garage.toggle()
		.then(() => resp.send('done'));
});


function retries(attempts) {
	// Retry after 1, 30, 60, 300, 600 seconds
	return Observable.of(1, 30, 60, 300, 600).zip(attempts, i => i).flatMap(i => {
		console.log("delay retry by " + i + " second(s)");
		return Observable.timer(i * 1000);
	});
}

const https = require('https');
function sendEvent(event) {
	const apiToken = process.env.MAKER_IFTTT_API_TOKEN;
	const path = '/trigger/' + event + '/with/key/' + apiToken;

	if (!apiToken) {
		throw new Error('API token missing');
	}

	return Observable.create(function (o) {
		const request = https.request({
			hostname: 'maker.ifttt.com',
			path: path,
			port: 443
		}, response => {
			console.log('Logged event');
			o.next(response.statusCode);
			o.complete();
		});

		request.on('error', err => {
			console.log('Req:');
			console.log(request);
			console.log('Err:');
			console.log(err);
			o.error(err);
		});
		request.end();

	}).retryWhen(function (attempts) {
		// Retry after 1, 30, 60, 300, 600 seconds
		return Observable.of(1, 30, 60, 300, 600).zip(attempts, i => i).flatMap(i => {
			console.log("delay retry by " + i + " second(s)");
			return Observable.timer(i * 1000);
		});
	}).subscribe();
}

// Setup watching for changes
const subscription = garage.watch()
	.distinctUntilChanged()
	.subscribe(value => {
		const event = value ? 'GARAGE_OPENED' : 'GARAGE_CLOSED';
		console.log('EVENT: ' + event);
		sendEvent(event);
	});

// Setup alarm if open too long
const observables = garage.watch()
	.distinctUntilChanged()
	.partition(Boolean);

const open$ = observables[0];
const close$ = observables[1];

const alarm$ = open$.flatMap(() => Observable.interval(5 * 60 * 1000).takeUntil(close$));

alarm$.subscribe(() => {
	console.log('Alarm');
	sendEvent('GARAGE_OPEN_TOO_LONG');
});
	
process.on('SIGINT', () => {
	subscription.unsubscribe();
	garage.release();
	process.exit();
})

module.exports = app;
