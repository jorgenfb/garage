const Gpio = require('onoff').Gpio;

const trigger = new Gpio(11, 'out');
const sensor = new Gpio(7, 'in', 'both');
const Observable = require('rxjs').Observable;

/**
 * Constructor
 *
 * Setup GPIO stuff and add convienient method to query / execute actions
 */
function Garage() {
	const trigger = new Gpio(11, 'out');
	const sensor = new Gpio(7, 'in', 'both');

	// Release resources
	function release() {
		trigger.unexport();
		sensor.unexport();
	}

	function isOpen() {
		return new Promise((resolve, reject) => {
				sensor.read((err, value) => {
					if (err) {
						reject(err);
					} else {
						resolve(Boolean(value));
					}
				});
		});
	}

	function toggle() {
		return new Promise(resolve => {
			trigger.write(1, () => {
				setTimeout(() => {
					pin.write(0, resolve);
				}, 200);
			});
		});
	}

	function watch() {
		return Observable.create(observer => {
			const watcher = (err, value) => {
					if (err) {
						observer.error(err);
						return;
					}
					observer.next(value);
			}

			sensor.watch(watcher);

			return () => {
				sensor.unwatch(watcher);
			}
		})
		.debounceTime(500);
	}

	// Expose methods
	this.release = release;
	this.isOpen = isOpen;
	this.toggle = toggle;
	this.watch = watch;
}

module.exports = new Garage();
