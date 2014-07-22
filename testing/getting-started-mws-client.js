var Qtc = require("../lib/qtc.js");

// NOTE! Create settings.js file to use this example. You can use settings-default.js as a template
var ENV = require("./settings.js");

var mws = new Qtc.Mws({
    address: ENV.mws.address,
    gatewayId: ENV.mws.gatewayId,
    secret: ENV.mws.secret
});

options = {
  onOpen: function() {
      console.log('connected');
  },
  onClose: function() {
      console.log('disconnected');
  },
  onMessage: function(data) {
      console.log('message', data);
  },
  onError: function(e, res) {
    console.log(res);
  }
}
// open WebSocket
mws.open(options);
