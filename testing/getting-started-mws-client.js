var Qtc = require("../lib/qtc.js");

// NOTE! Create settings.js file to use this example. You can use settings-default.js as a template
var ENV = require("./settings.js");

var mws = new Qtc.Mws({
    address: ENV.mws.address,
    gatewayId: ENV.mws.gatewayId,
    secret: ENV.mws.secret
});

mws.on('open', function(){
  console.log('connected');
});

mws.on('close', function(){
  console.log('disconnected');
});

mws.on('message', function(data){
  console.log('message', data);
});

mws.on('error', function(e, res){
  console.log(res);
});

// open WebSocket
mws.open();
