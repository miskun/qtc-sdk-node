var Qtc = require("../lib/qtc.js");

// NOTE! Create settings.js file to use this example. You can use settings-default.js as a template
var ENV = require("./settings.js");

var mws = new Qtc.Mws({
    address: ENV.mws.address,
    socketId: ENV.mws.socketId,
    secret: ENV.mws.secret
});

mws.send("Hello World!", { sockets: ["*"] }, function(e,res){
    console.log(e,res);
});
