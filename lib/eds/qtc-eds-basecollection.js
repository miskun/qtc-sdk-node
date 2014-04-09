var Class = require( 'class-js2' );
var querystring = require("querystring");
var restRequest = require("../common/qtc-http-request.js").restRequest;
var edsFileUploadRequest = require("../common/qtc-http-request.js").edsFileUploadRequest;

function noop(){}

/**
 * Class: BaseCollection
 */
var BaseCollection = Class.create({
    /**
     * Constructor
     * @params {object} db - An instance of Eds class
     * @params {string} name - A name of collection
     * @constructor
     */
    constructor: function (db, objectType) {
        this.db = db;

        // internal vars
        this.name = "";
        this.namePath = "";
        this.objectType = "";
        this.setObjectType(objectType);

        // used for debugging purposes
        this.debug = false;
    },

    /**
     * Init collection from object type.
     * @private
     * @param {string} newType - An object type identified
     */
    setObjectType: function( newType ){
        var parts = newType.split(".");
        if(parts.length == 1){
            this.name = this.namePath = this.objectType = parts[0];
        } else {
            this.name = parts[1];
            this.objectType = newType;
            this.namePath = parts[0] + "/" + parts[1];
        }

        // namePath is ending with slash...
        this.namePath += "/";
    },

    /**
     * Insert an object.
     * @param {object} obj - An object to be inserted into EDS collection
     * @param {object} [options] - An optional options for this request
     * @param {function} cb - A callback function to be called after the object is inserted
     */
    insert: function(obj, options, cb){
        // check optional arguments
        if(!cb){
            cb = options;
            options = {};
        }
        var req = {
            method: "POST",
            protocol: "https",
            hostname: this.db.hostname,
            path: this.db.apiPath + this.namePath,
            headers: this.db.getApiHeaders(options.accessToken),
            body: JSON.stringify(obj)
        };
        if(this.debug) console.log(req);
        restRequest(req, cb);
    },

    /**
     * Update an object.
     * @param {string} objId - An object id
     * @param {object} obj - An updated object data
     * @param {object} [options] - An optional options for this request
     * @param {function} cb - A callback function to be called after the object is updated
     */
    update: function(objId, obj, options, cb){
        // check optional arguments
        if(!cb){
            cb = options;
            options = {};
        }
        var req = {
            method: "PUT",
            protocol: "https",
            hostname: this.db.hostname,
            path: this.db.apiPath + this.namePath + objId,
            headers: this.db.getApiHeaders(options.accessToken),
            body: JSON.stringify(obj)
        };
        if(this.debug) console.log(req);
        restRequest(req, cb);
    },

    /**
     * Remove an object.
     * @param {string} objId - An object id
     * @param {object} [options] - An optional options for this request
     * @param {function} cb - A callback function to be called after the object is removed
     */
    remove: function(objId, options, cb){
        // check optional arguments
        if(!cb){
            cb = options;
            options = {};
        }
        var req = {
            method: "DELETE",
            protocol: "https",
            hostname: this.db.hostname,
            path: this.db.apiPath + this.namePath + objId,
            headers: this.db.getApiHeaders(options.accessToken)
        };
        if(this.debug) console.log(req);
        restRequest(req, function(e, r){
            if(!e){
                cb(null, true);
            } else {
                cb(e, r);
            }
        });
    },

    /**
     * Returns the count of objects matching the query.
     * @param {object} query - An query
     * @param {object} [options] - An optional options for this request
     * @param {function} cb - A callback function to be called with query results
     */
    count: function(query, options, cb){
        // check optional arguments
        if(!cb){
            cb = options;
            options = {};
        }
        this.find(query, { count: 1, accessToken: options.accessToken }, function(e, res){
            if(!e){
                cb(null, res);
            } else {
                cb(e);
            }
        });
    },

    /**
     * Find matching objects based on query.
     * @param {object} query - An query
     * @param {object} [options] - An optional options for this request
     * @param {function} cb - A callback function to be called with query results
     */
    find: function(query, options, cb){
        if(!cb){
            cb = options;
            options = {};
        }

        // create query string
        var qsObj = {};
        qsObj.q = JSON.stringify(query);
        if(options.limit) qsObj.limit = options.limit;
        if(options.offset) qsObj.offset = options.offset;
        if(options.sort) qsObj.sort = JSON.stringify(options.sort);
        if(options.count) qsObj.count = 1;
        if(options.include) qsObj.include = JSON.stringify(options.include);

        var qs = querystring.stringify(qsObj);
        if(qs.length > 0) qs = "?" + qs;

        var req = {
            method: "GET",
            protocol: "https",
            hostname: this.db.hostname,
            path: this.db.apiPath + this.namePath + qs,
            headers: this.db.getApiHeaders(options.accessToken)
        };
        if(this.debug) console.log(req);
        restRequest(req, function(e,r){
            if(!e){
                if(qsObj.count == 1) {
                    // special case: requesting just item count
                    cb(null, r.count);
                } else {
                    // normal case; just return the results array
                    cb(null, r.results);
                }
            } else {
                cb(e,r);
            }
        });
    },

    /**
     * Find matching objects based on query.
     * @param {string} objId - An object id
     * @param {object} [options] - An optional options for this request
     * @param {function} cb - A callback function to be called with query results
     */
    findOne: function(objId, options, cb){
        if(!cb){
            cb = options;
            options = {};
        }

        var qsObj = {};
        if(options.include) qsObj.include = JSON.stringify(options.include);

        var qs = querystring.stringify(qsObj);
        if(qs.length > 0) qs = "?" + qs;

        var req = {
            method: "GET",
            protocol: "https",
            hostname: this.db.hostname,
            path: this.db.apiPath + this.namePath + objId + qs,
            headers: this.db.getApiHeaders(options.accessToken)
        };
        if(this.debug) console.log(req);
        restRequest(req, cb);
    },

    /**
     * Attach file to an object.
     * @param {string} objId - An object id
     * @param {string} fieldName - A field name file will be attached to
     * @param {string} filePath - A path to file to be attached
     * @param {object} [options] - An optional options for this request
     * @param {function} cb - A callback function to be called with query results
     */
    attachFile: function(objId, fieldName, filePath, options, cb){
        if(!cb){
            cb = options;
            options = {};
        }
        var req = {
            method: "POST",
            protocol: "https",
            hostname: this.db.hostname,
            path: this.db.apiPath + "files/",
            headers: this.db.getApiHeaders(options.accessToken),
            edsMultipartData: {
                objId: objId,
                objType: this.objectType,
                fieldName: fieldName,
                filePath: filePath
            }
        };
        if(this.debug) console.log(req);

        edsFileUploadRequest(req, cb);
    }
});

module.exports = BaseCollection;
