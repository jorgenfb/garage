const express = require('express')
const garage = require('./garage');

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


// Setup watching for changes
const http = require('http');
const subscription = garage.watch().subscribe(value => {
	const apiToken = process.env.MAKER_IFTTT_API_TOKEN;

	if (!apiToken) {
		throw new Error('API token missing');
	}

	const event = value ? 'GARAGE_OPENED' : 'GARAGE_CLOSED';

	console.log('EVENT: ' + value);

	Observable.create(function (o) {
		const request = http.request({
			protocol: 'https',
			hostname: 'maker.ifttt.com',
			path: '/trigger/' + event + '/with/key/' + apiToken
			port: 80
		}, response => {
			o.next(response.statusCode);
			o.complete();
		});

		request.on('error', err => o.error(err));

  }).retryWhen(function (attempts) {
		// Retry after 1, 30, 60, 300, 600 seconds
    return Observable.of(1, 30, 60, 300, 600).zip(attempts, i => i).flatMap(i => {
      console.log("delay retry by " + i + " second(s)");
      return Observable.timer(i * 1000);
  	});
	}).subscribe();
});

process.on('SIGINT', () => {
	subscription.unsubscribe();
	garage.release();
	process.exit();
})

module.exports = app;
