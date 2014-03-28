var Qtc = require("../lib/qtc.js");

// NOTE! Create settings.js file to use this example. You can use settings-default.js as a template
var ENV = require("./settings.js");

var mws = new Qtc.Mws({
    address: ENV.mws.address,
    gatewayId: ENV.mws.gatewayId,
    secret: ENV.mws.secret
});

mws.getSocketAddress(function(e,res){
    if(!e){
        var address = res.uri;
        console.log("Opening websocket at " + address);

        // open WebSocket
        var socket = new mws.socket(address);

        // set some event handlers
        socket.on('open', function() {
            console.log('connected');
        });
        socket.on('close', function() {
            console.log('disconnected');
        });
        socket.on('message', function(data) {
            console.log('message', data);
        });

    } else {
        console.log("Oops! Something went wrong!", e, res);
    }

});
