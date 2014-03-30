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

    // turn on/off debug
    this.debug = (typeof options.debug != "undefined") ? options.debug : false;

    // parse hostname and pathname for address
    var parsed = url.parse(this.address);
    this.hostname = parsed.hostname;
    this.apiPath = "/v1/";

    // validate
    if(!this.backendId) throw "Invalid EDS Backend Id!";

    // pre-set users and usergroups
    this.users = this.collection("users", true);
    this.usergroups = this.collection("usergroups", true);

}

/** ************************************************************************ *
 *  Helpers
 ** ************************************************************************ */
Eds.prototype.Ref = function(objId, collectionId){
    return {
        $type: "ref",
        $value: {
            id: objId,
            objectType: collectionId
        }
    }
};

Eds.prototype.Time = function(utcTimeStamp){
    return {
        $type: "time",
        $value: utcTimeStamp
    }
};

Eds.prototype.Geoloc = function(geoloc){
    if(arguments.length == 2){
        return {
            $type: "geoloc",
            $value: [ arguments[0], arguments[1] ]
        }
    } else {
        return {
            $type: "geoloc",
            $value: geoloc
        }
    }
};

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
 *  MAIN
 ** ************************************************************************ */

Eds.prototype.collection = function(name, useInternals){
    var collection = new Collection(this, name, useInternals);
    collection.debug = this.debug;

    return collection;
};

/**
 * Search.
 * @param {string} phrase - A Search Phrase. See: https://developer.qtc.io/eds/key-concepts/full-text-search
 * @param {object} collections - A collection or an array of collections to perform search.
 * @param {object} options - An options for the request
 * @param {function} cb - A callback function to be called when request is completed.
 */
Eds.prototype.search = function(phrase, collections, options, cb) {
    if(!cb){
        if(!options) options = noop;
        cb = options;
        options = {};
    }

    // clean collections
    var cStr = "";
    var cType = Object.prototype.toString.call(collections);
    if(cType == "[object Array]"){
        for(var i=0; i<collections.length; i++){
            collections[i] = "objects." + collections[i];
        }
        cStr = collections.join(",");
    } else if(cType == "[object String]") {
        cStr = "objects." + collections;
    }
    if(cStr == ""){
        var err = "Eds.search(): Error, argument 'collections' must be an array or non empty string";
        throw(err);
    }

    // clean properties
    var propStr = null;
    var propType = Object.prototype.toString.call(options.properties);
    if(propType == "[object Array]"){
        propStr = options.properties.join(",");
    } else if(propType == "[object String]"){
        propStr = options.properties;
    }

    // clean defaultOperator
    var defaultOperator = options.defaultOperator || null;
    if(defaultOperator != null) defaultOperator = defaultOperator.toUpperCase();

    // search object
    var searchObject = {
        phrase: phrase,
        properties: propStr,
        defaultOperator: defaultOperator,
        near: options.near || null
    }

    // clean options
    delete options.properties;
    delete options.near;
    delete options.defaultOperator;

    // clean search object
    if(searchObject.properties == null) delete searchObject.properties;
    if(searchObject.defaultOperator == null) delete searchObject.defaultOperator;
    if(searchObject.near == null) delete searchObject.near;


    // add search && collections
    options.search = JSON.stringify(searchObject);
    options.objectTypes = cStr;

    // make the request
    this.rest("GET", "/search", { querystring: options }, cb);
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


module.exports = Eds;
