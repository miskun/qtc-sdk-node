var url = require("url");
var WebSocket = require('ws');
var restRequest = require("../common/qtc-http-request.js").restRequest;

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

    // turn on/off debug
    this.debug = false;

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
 * Get WebSocket Uri.
 * @private
 * @param {function} cb - A callback function to be called
 */
Mws.prototype._getWebSocketUri = function(cb){
    cb = cb || noop;

    var req = {
        method: "GET",
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + "websocket_uri",
        headers: this.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
};

/**
 * Send Message using REST API.
 * @param {any} msg - Message to be sent
 * @param {object} receivers - Receivers for this message
 * @param {function} cb - A callback function to be called
 */
Mws.prototype.sendMessage = function(msg, receivers, cb){
    cb = cb || noop;

    // current api is requiring both sockets and tags... so brute force add them :)
    // todo: fix server side implementation to make these optional

    var sockets = receivers.sockets || null;
    var tags = receivers.tags || null;

    var payload = {
        data: msg,
        receivers: {
            sockets: sockets,
            tags: tags
        }
    };

    var req = {
        method: "POST",
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + "messages",
        headers: this.getApiHeaders(),
        body: JSON.stringify(payload)
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
};

module.exports = Mws;
