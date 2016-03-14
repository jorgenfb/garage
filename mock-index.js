const mockery = require('mockery');

const onoffMock = {
  Gpio: function() {
    return {
      read: function(callback) { callback(0); },
      write: function() { console.log('Mock write'); }
    }
  }
};

mockery.registerMock('onoff', onoffMock);
mockery.enable();

require('./index');
