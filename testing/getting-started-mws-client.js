var Qtc = require("../lib/qtc.js");

// NOTE! Create settings.js file to use this example. You can use settings-default.js as a template
var ENV = require("./settings.js");

var mws = new Qtc.Mws({
    address: ENV.mws.address,
    socketId: ENV.mws.socketId,
    secret: ENV.mws.secret
});

// add event listener for incoming messages
mws.on("connect", function(){
    console.log("Connected to MWS WebSocket!");
    console.log("Listening for messages...");
})

mws.on("message", function(data){
    console.log(data);
})

// open socket connection
mws.open();
