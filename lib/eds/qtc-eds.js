var url = require("url");
var Collection = require("./qtc-eds-collection.js");

function noop(){}

/**
 * Enginio Data Storage - EDS
 * @param {object} options - An options for EDS instance
 * @constructor
 */
function Eds(options){
    // parse options
    this.options = options || {};
    this.address = options.address || "https://api.engin.io/v1/";
    this.backendId = options.backendId;
    this.secret = options.secret;

    // parse hostname and pathname for address
    var parsed = url.parse(this.address);
    this.hostname = parsed.hostname;
    this.apiPath = parsed.pathname;
    if( (this.apiPath.charAt(this.apiPath.length - 1)) != "/" ) this.apiPath += "/";
    if(this.apiPath == "/") this.apiPath = "";

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
    if(this.secret) headers["Authorization"] = "Bearer " + this.secret;
    return headers;
}

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
}

Eds.prototype.Time = function(utcTimeStamp){
    return {
        "$type": "time",
        "$value": utcTimeStamp
    }
}

Eds.prototype.Geoloc = function(latLongArray){
    return {
        "$type": "geoloc",
        "$value": latLongArray
    }
}

Eds.prototype.collection = function(name, useInternals){
    return new Collection(this, name, useInternals);
}

module.exports = Eds;
