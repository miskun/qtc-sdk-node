var url = require("url");
var Collection = require("./qtc-eds-collection.js");

// for custom REST queries
var querystring = require("querystring");
var restRequest = require("../common/qtc-http-request.js").restRequest;

function noop(){}

/**
 * Enginio Data Storage - EDS
 * @param {object} options - An options for EDS instance
 * @constructor
 */
function Eds(options){
    // parse options
    this.options = options || {};
    this.address = options.address || "https://api.engin.io";
    this.backendId = options.backendId;
    this.secret = options.secret;

    // parse hostname and pathname for address
    var parsed = url.parse(this.address);
    this.hostname = parsed.hostname;
    this.apiPath = "/v1/";

    // validate
    if(!this.backendId) throw "Invalid EDS Backend Id!";
}

/**
 * Get API headers
 * @private
 */
Eds.prototype.getApiHeaders = function(){
    var headers = {
        "User-Agent": "qtc-sdk-node/1.0",
        "Enginio-Backend-Id": this.backendId
    };
    if(this.secret && (this.secret != "")) headers["Authorization"] = "Bearer " + this.secret;
    return headers;
};

/** ************************************************************************ *
    Custom Data Types - Helpers
*** ************************************************************************ */
Eds.prototype.Ref = function(collectionName, id){
    return {
        "$type": "ref",
        "$value": {
            "id": id,
            "objectType": collectionName
        }
    }
};

Eds.prototype.Time = function(utcTimeStamp){
    return {
        "$type": "time",
        "$value": utcTimeStamp
    }
};

Eds.prototype.Geoloc = function(latLongArray){
    return {
        "$type": "geoloc",
        "$value": latLongArray
    }
};

Eds.prototype.collection = function(name, useInternals){
    return new Collection(this, name, useInternals);
};

/**
 * Make custom REST request.
 * @param {string} verb - A HTTP request verb: GET, POST, PUT, DELETE
 * @param {string} path - A path for the request. Please see http://developer.qtc.io/eds/rest/reference
 * @param {object} options - An options for the request
 * @param {function} cb - A callback function to be called when request is completed.
 */
Eds.prototype.rest = function(verb, path, options, cb){
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

    // chop off the last "/"
    var basePath = this.apiPath.substring(0, this.apiPath.length - 1);

    var req = {
        method: verb.toUpperCase(),
        protocol: "https",
        hostname: this.hostname,
        path: basePath + path + qs,
        headers: this.getApiHeaders()
    };

    if((verb.toUpperCase() == "POST") || (verb.toUpperCase() == "PUT")){
        // for POST and PUT request, there is body; add it to request
        req.body = options.body;
    }

    if(this.debug) console.log(req);
    restRequest(req, cb);
};


module.exports = Eds;
