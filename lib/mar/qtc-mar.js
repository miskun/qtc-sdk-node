var url = require("url");

// for custom REST queries
var querystring = require("querystring");
var restRequest = require("../common/qtc-http-request.js").restRequest;

function noop(){}

/**
 * Managed Application Runtime - MAR
 * @param {object} options - An options for MAR instance
 * @constructor
 */
function Mar(options){
    // parse options
    options = options || {};
    this.address = options.address || "https://mar-eu-1.qtc.io";
    this.instanceId = options.instanceId;
    this.secret = options.secret;

    // turn on/off debug
    this.debug = (typeof options.debug != "undefined") ? options.debug : false;

    // parse hostname and pathname for address
    var parsed = url.parse(this.address);
    this.hostname = parsed.hostname;
    this.apiPath = "/v1/apps/" + this.instanceId + "/";
}

/**
 * Get API headers
 * @private
 */
Mar.prototype.getApiHeaders = function(authorization){
    var headers = {
        "User-Agent": "qtc-sdk-node/1.0"
    };
    if(authorization && (authorization != "")) {
        headers["Authorization"] = "Bearer " + authorization;
    } else if(this.secret && (this.secret != "")) {
        headers["Authorization"] = "Bearer " + this.secret;
    }
    return headers;
};

/** ************************************************************************ *
 *  MAIN
 ** ************************************************************************ */

/**
 * Make custom REST request.
 * @param {string} verb - A HTTP request verb: GET, POST, PUT, DELETE
 * @param {string} path - A path for the request. Please see http://developer.qtc.io/eds/rest/reference
 * @param {object} options - An options for the request
 * @param {function} cb - A callback function to be called when request is completed.
 */
Mar.prototype.rest = function(verb, path, options, cb){
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

/**
 * Get instance information.
 * @param {function} cb - A callback function to be called with instance info
 */
Mar.prototype.getInstanceInfo = function(cb){
    this.rest("GET", "/", cb);
};

/**
 * Get stdout/stderr logs.
 * @param {object} [options] - An options for the request. Supported values:
 *                               limit - Limit the number of log items retrieved
 *                               offset - Offset for 1st log item returned
 * @param {function} cb - A callback function to be called with log data
 */
Mar.prototype.getLogs = function(options, cb){
    if(!cb){
        if(!options) options = noop;
        cb = options;
        options = {};
    }

    this.rest("GET", "/logs", options, cb);
};

/**
 * Get custom env variables.
 * @param {function} cb - A callback function to be called with environment variables
 */
Mar.prototype.getEnvVars = function(cb){
    this.rest("GET", "/env_vars", cb);
};

/**
 * Get custom env variables.
 * @param {function} cb - A callback function to be called with environment variables
 */
Mar.prototype.setEnvVars = function(envVars, cb){
    envVars = envVars || {};
    this.rest("PUT", "/env_vars", { body: JSON.stringify(envVars) }, cb);
};

module.exports = Mar;
