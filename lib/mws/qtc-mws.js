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
    options = options || {};
    this.address = options.address || "https://mws-eu-1.qtc.io";
    this.gatewayId = options.gatewayId;
    this.secret = options.secret;

    // turn on/off debug
    this.debug = (typeof options.debug != "undefined") ? options.debug : false;

    // the WebSocket (https://github.com/einaros/ws)
    this.socket = WebSocket;

    // parse hostname and pathname for address
    var parsed = url.parse(this.address);
    this.hostname = parsed.hostname;
    this.apiPath = "/v1/gateways/" + this.gatewayId + "/";

    // validate
    if(!this.gatewayId) throw "Invalid MWS Gateway Id!";
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
 * @param {object|string} msg - Message to be sent
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

/** ************************************************************************ *
 *  FOLLOWING API'S REQUIRE SECRET TOKEN
 ** ************************************************************************ */

/**
 * Get Sockets
 * @description Returns a list of currently active WebSocket connections. This API requires secret token.
 * @param {function} cb - A callback function to be called
 */
Mws.prototype.getSockets = function(cb){
    if(!this.secret) throw "ERROR: Mws.getSockets() requires secret token!";
    this.rest("GET", "/sockets", cb);
};

/**
 * Get Sockets
 * @description Returns a list of currently active WebSocket connections. This API requires secret token.
 * @param {function} cb - A callback function to be called
 */
Mws.prototype.getSockets = function(cb){
    if(!this.secret) throw "ERROR: Mws.getSockets() requires secret token!";
    this.rest("GET", "/sockets", cb);
};

/**
 * Get Sockets
 * @description Returns a list of currently active WebSocket connections. This API requires secret token.
 * @param {string} id - Socket id
 * @param {function} cb - A callback function to be called
 */
Mws.prototype.getSocketInfo = function(id, cb){
    if(!this.secret) throw "ERROR: Mws.getSocketInfo() requires secret token!";
    this.rest("GET", "/sockets/" + id, cb);
};

/**
 * Create Socket
 * @description Creates a new WebSocket reservation (obtain ws url). This API requires secret token.
 * @param {Array.<String>} [tags] - A tag or an array of tags that can be included to identify this WebSocket user
 * @param {function} cb - A callback function to be called
 */
Mws.prototype.createSocket = function(tags, cb){
    if(!this.secret) throw "ERROR: Mws.getSockets() requires secret token!";

    if(!cb) {
        cb = tags;
        tags = [];
    }

    var tagsObj = {
        tags: []
    };

    // create tags array
    if((typeof tags != "undefined") && (tags != null)) {
        var tagsType = Object.prototype.toString.call(tags);
        switch(tagsType){
            case "[object Array]":
                tagsObj.tags = tags;
                break;
            case "[object Number]":
            case "[object String]":
                tagsObj.tags.push(tags);
                break;
            default:
                tagsObj.tags.push(JSON.stringify(tags));
                break;
        }
    }

    this.rest("POST", "/sockets", { body: JSON.stringify(tagsObj) }, cb);
};

/**
 * Get Configuration
 * @description Returns a WebSocket instance configuration. This API requires secret token.
 * @param {function} cb - A callback function to be called
 */
Mws.prototype.getConfiguration = function(cb){
    if(!this.secret) throw "ERROR: Mws.getSocketInfo() requires secret token!";
    this.rest("GET", "/configuration", cb);
};

/**
 * Set Configuration
 * @description Updates a WebSocket instance configuration. This API requires secret token.
 * @param {object} config - A new configuration
 * @param {function} cb - A callback function to be called
 */
Mws.prototype.setConfiguration = function(config, cb){
    if(!this.secret) throw "ERROR: Mws.getSocketInfo() requires secret token!";

    if(!cb) {
        cb = tags;
        config = {};
    }

    var newConfig = {};
    if(typeof config.name != "undefined") newConfig.name = config.name;
    if(typeof config.identityProvider != "undefined") newConfig.identityProvider = config.identityProvider;
    if(typeof config.permissions != "undefined") newConfig.permissions = config.permissions;

    this.rest("PUT", "/configuration", { body: JSON.stringify(newConfig) }, cb);
};

module.exports = Mws;
