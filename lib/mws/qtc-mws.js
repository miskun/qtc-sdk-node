var url = require("url");

function noop(){}

/**
 * Managed WebSocket - MWS
 * @param {object} options - An options for MWS instance
 * @constructor
 */
function Mws(options){
    // parse options
    this.options = options || {};
    this.address = options.address || "https://mws-eu-1.qtc.io";
    this.socketId = options.socketId;
    this.secret = options.secret;

    // parse hostname and pathname for address
    var parsed = url.parse(this.address);
    this.hostname = parsed.hostname;
    this.apiPath = "/v1/instances/" + this.socketId + "/";

    // validate
    if(!this.socketId) throw "Invalid MWS Socket Id!";
}

/**
 * Get API headers
 * @private
 */
Mws.prototype.getApiHeaders = function(){
    var headers = {
        "User-Agent": "qtc-sdk-node/1.0"
    };
    if(this.secret && (this.secret != "")) headers["Authorization"] = "Bearer " + this.secret;
    return headers;
};

/**
 * Send message to WebSocket.
 * @param {any} msg - Message to be sent
 * @param {object} receivers - Receivers for this message
 * @param {function} cb - A callback function to be called
 */
Mws.prototype.sendMessage = function(msg, receivers, cb){
    cb = cb || noop;

    cb(null, msg);
};

module.exports = Mws;
