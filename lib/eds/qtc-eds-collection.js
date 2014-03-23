var path = require("path");
var url = require("url");
var querystring = require("querystring");
var restRequest = require("../common/qtc-http-request.js").restRequest;
var edsFileUploadRequest = require("../common/qtc-http-request.js").edsFileUploadRequest;
var edsFileDownloadRequest = require("../common/qtc-http-request.js").edsFileDownloadRequest;

function noop(){}

/**
 * EDS Collection
 * @params {object} db - An instance of Eds class
 * @params {string} name - A name of collection
 * @constructor
 */
function Collection(db, name, useInternals){
    this.db = db;
    this.name = name;
    this.namePath = "";
    this.debug = false;

    // construct address to namePath
    var tmpPath = name.toLowerCase();
    var parts = tmpPath.split(".");
    if(parts.length > 1){
        // the name is supplied as dotted notation; verify
        if((parts[0] == "objects") && (parts[1].length > 0)){
            this.namePath = "objects/"+parts[1]+"/";
        } else {
            throw "Can not create valid API path for collection: " + tmpPath;
        }
    } else {
        // simple notation; assume all collections are custom collections (belong to objects.*)
        this.namePath = "objects/" + tmpPath + "/";

        // override users and usergroups if useInternals
        if(useInternals){
            if(tmpPath == "users"){
                this.namePath = "users/";
            } else if(tmpPath == "usergroups"){
                this.namePath = "usergroups/";
            }
        }
    }
}

/**
 * Insert an object.
 * @param {object} obj - An object to be inserted into EDS collection
 * @param {function} cb - A callback function to be called after the object is inserted
 */
Collection.prototype.insert = function(obj, cb){
    cb = cb || noop;
    var req = {
        method: "POST",
        protocol: "https",
        hostname: this.db.hostname,
        path: this.db.apiPath + this.namePath,
        headers: this.db.getApiHeaders(),
        body: JSON.stringify(obj)
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
}

/**
 * Update an object.
 * @param {string} objId - An object id
 * @param {object} obj - An updated object data
 * @param {function} cb - A callback function to be called after the object is updated
 */
Collection.prototype.update = function(objId, obj, cb){
    cb = cb || noop;
    var req = {
        method: "PUT",
        protocol: "https",
        hostname: this.db.hostname,
        path: this.db.apiPath + this.namePath + objId,
        headers: this.db.getApiHeaders(),
        body: JSON.stringify(obj)
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
}

/**
 * Remove an object.
 * @param {string} objId - An object id
 * @param {function} cb - A callback function to be called after the object is removed
 */
Collection.prototype.remove = function(objId, cb){
    cb = cb || noop;
    var req = {
        method: "DELETE",
        protocol: "https",
        hostname: this.db.hostname,
        path: this.db.apiPath + this.namePath + objId,
        headers: this.db.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, function(e){
        if(!e){
            cb(null, true);
        } else {
            cb(e);
        }
    });
}

/**
 * Returns the count of objects matching the query.
 * @param {object} query - An query
 * @param {function} cb - A callback function to be called with query results
 */
Collection.prototype.count = function(query, cb){
    this.find(query, { count: 1 }, function(e,res){
        if(!e){
            cb(null, res.count);
        } else {
            cb(e);
        }
    });
}

/**
 * Find matching objects based on query.
 * @param {object} query - An query
 * @param {object} options - An options for the query
 * @param {function} cb - A callback function to be called with query results
 */
Collection.prototype.find = function(query, options, cb){
    if(!cb){
        if(!options) options = noop;
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
        headers: this.db.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
}

/**
 * Find matching objects based on query.
 * @param {string} objId - An object id
 * @param {function} cb - A callback function to be called with query results
 */
Collection.prototype.findOne = function(objId, cb){
    cb = cb || noop;
    var req = {
        method: "GET",
        protocol: "https",
        hostname: this.db.hostname,
        path: this.db.apiPath + this.namePath + objId,
        headers: this.db.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
}

/**
 * Find matching objects based on query.
 * @param {string} objId - An object id
 * @param {string} fieldName - A field name file will be attached to
 * @param {string} filePath - A path to file to be attached
 * @param {function} cb - A callback function to be called with query results
 */
Collection.prototype.attachFile = function(objId, fieldName, filePath, cb){
    cb = cb || noop;

    var objType = this.namePath.split("/").join(".");
    if( (objType.charAt(objType.length - 1)) == "." ) {
        objType = objType.substring(0, objType.length - 1);
    }

    var req = {
        method: "POST",
        protocol: "https",
        hostname: this.db.hostname,
        path: this.db.apiPath + "files/",
        headers: this.db.getApiHeaders(),
        edsMultipartData: {
            objId: objId,
            objType: objType,
            fieldName: fieldName,
            filePath: filePath
        }
    };
    if(this.debug) console.log(req);

    edsFileUploadRequest(req, cb);
}

/**
 * Get file info.
 * @param {string} fileId - A file id
 * @param {function} cb - A callback function to be called with file info
 */
Collection.prototype.getFileInfo = function(fileId, cb){
    cb = cb || noop;
    var req = {
        method: "GET",
        protocol: "https",
        hostname: this.db.hostname,
        path: this.db.apiPath + "files/" + fileId,
        headers: this.db.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
}

/**
 * Get file download url.
 * @param {string} fileId - A file id
 * @param {string} [variant] - A file variant name
 * @param {function} cb - A callback function to be called with file info
 */
Collection.prototype.getFileDownloadUrl = function(fileId, variant, cb){
    if(!cb){
        if(!variant || (variant == "")){
            variant = noop;
        } else {
            cb = variant;
            variant = "";
        }
    }

    var qs = (variant == "") ? "" : "?variant=" + variant;
    var req = {
        method: "GET",
        protocol: "https",
        hostname: this.db.hostname,
        path: this.db.apiPath + "files/" + fileId + "/download_url" + qs,
        headers: this.db.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
}

/**
 * Download file.
 * @param {string} fileId - A file id
 * @param {string} filePath - A path where file will be stored on local filesystem. You can also rename the file here.
 * @param {string} [variant] - A file variant name
 * @param {function} cb - A callback function to be called with query results
 */
Collection.prototype.downloadFile = function(fileId, filePath, variant, cb){
    if(!cb){
        if(!variant || (variant == "")){
            variant = noop;
        } else {
            cb = variant;
            variant = "";
        }
    }

    var self = this;

    // sanitize filePath
    filePath = path.normalize(filePath);

    this.getFileDownloadUrl(fileId, variant, function(e,res){
       if(!e){
           var originalFileName = path.basename(url.parse(res.expiringUrl).pathname);
           if ((filePath.charAt(filePath.length - 1) == "/") || (filePath.charAt(filePath.length - 1) == "\\")) {
               filePath = filePath + originalFileName;
           }

           var req = {
               address: res.expiringUrl,
               headers: self.db.getApiHeaders(),
               filePath: filePath
           };
           if(this.debug) console.log(req);

           edsFileDownloadRequest(req, cb);
       } else {
           cb(e, res);
       }
    });
}

module.exports = Collection;
