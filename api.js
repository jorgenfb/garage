const express = require('express')
const Gpio = require('onoff').Gpio;

const app = express();

const trigger = new Gpio(11, 'out');
const sensor = new Gpio(7, 'in', 'both');

function singlePulse(pin, duration, callback) {
	pin.write(1, () => {
		setTimeout(() => {
			pin.write(0, callback);
		}, duration);
	});
}

// 
app.get('/garage-door', (req, resp) => {
	sensor.read((err, value) => {
		if (err) {
			resp.status(500).send('Unable to read sensor');
		} else {
			resp.send({open: Boolean(value)});
		}
	});
});


// Handle requests to trigger port
app.post('/garage-door/trigger', (req, resp) => {
	singlePulse(trigger, 200, () => {
		resp.send('done');
	});
});

module.exports = app;
