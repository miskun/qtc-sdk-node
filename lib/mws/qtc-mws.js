var url = require("url");
var WebSocket = require("ws");

// for custom REST queries
var querystring = require("querystring");
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
    this.debug = (typeof options.debug != undefined) ? options.debug : false;

    // the WebSocket (https://github.com/einaros/ws)
    this.socket = WebSocket;

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
 * Get WebSocket Address
 * @param {function} cb - A callback function to be called
 */
Mws.prototype.getSocketAddress = function(cb){
    this.rest("GET", "/websocket_uri", cb);
};

/**
 * Send Message using REST API.
 * @param {any} msg - Message to be sent
 * @param {object} receivers - Receivers for this message
 * @param {function} cb - A callback function to be called
 */
Mws.prototype.send = function(msg, receivers, cb){
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

    this.rest("POST", "/messages", { body: JSON.stringify(payload) }, cb);
};

/**
 * Make custom REST request.
 * @param {string} verb - A HTTP request verb: GET, POST, PUT, DELETE
 * @param {string} path - A path for the request. Please see http://developer.qtc.io/eds/rest/reference
 * @param {object} options - An options for the request
 * @param {function} cb - A callback function to be called when request is completed.
 */
Mws.prototype.rest = function(verb, path, options, cb){
    if(!cb){
        if(!options) options = noop;
        cb = options;
        options = {};
    }

    var qs = querystring.stringify(options.querystring);
    if(qs.length > 0) {
        qs = "?" + qs;
    } else {
        qs = "";
    }

    // chop off "/" if first char in path
    if((path.length > 0) && (path[0] == "/")){
        path = path.substring(1);
    }

    var req = {
        method: verb.toUpperCase(),
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + path + qs,
        headers: this.getApiHeaders()
    };

    if((verb.toUpperCase() == "POST") || (verb.toUpperCase() == "PUT")){
        // for POST and PUT request, there is body; add it to request
        req.body = options.body;
    }

    if(this.debug) console.log(req);
    restRequest(req, cb);
};

module.exports = Mws;
