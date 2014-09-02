var url = require("url");

// for custom REST queries
var querystring = require("querystring");
var restRequest = require("../common/qtc-http-request.js").restRequest;

function noop(){}

/**
 * Qt Cloud Services Platform SDK
 * @param {object} options - An options for platform instance
 * @constructor
 */
function Platform(options){
    // parse options
    options = options || {};
    this.address = options.address || "https://api.qtc.io";
    this.secret = options.secret;

    // turn on/off debug
    this.debug = (typeof options.debug != "undefined") ? options.debug : false;

    // parse hostname and pathname for address
    var parsed = url.parse(this.address);
    this.hostname = parsed.hostname;
    this.apiPath = "/v1/";
}

/**
 * Get API headers
 * @private
 */
Platform.prototype.getApiHeaders = function(authorization){
    var headers = {
        "User-Agent": "qtc-sdk-node/1.0",
        "Accept": "application/json",
        "Content-Type": "application/json"
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
Platform.prototype.rest = function(verb, path, options, cb){
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
 * Get user info.
 * @param {function} cb - A callback function to be called with user info.
 */
Platform.prototype.getUser = function(cb){
    cb = cb || noop;
    var req = {
        method: "GET",
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + "user",
        headers: this.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
};

/*****************************************************************************
 * Clouds
 *****************************************************************************/

/**
 * Get clouds.
 * @param {function} cb - A callback function to be called with clouds.
 */
Platform.prototype.getClouds = function(cb){
    cb = cb || noop;
    var req = {
        method: "GET",
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + "user/accounts",
        headers: this.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
};

/**
 * Create new cloud.
 * @param {string} name - A name for new cloud.
 * @param {function} cb - A callback function to be called with new cloud.
 */
Platform.prototype.createCloud = function(name, cb){
    cb = cb || noop;
    var req = {
        method: "POST",
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + "accounts",
        headers: this.getApiHeaders(),
        body: JSON.stringify({ name: name })
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
};

/**
 * Remove cloud.
 * @param {string} id - An id of cloud to be removed.
 * @param {function} cb - A callback function to be called.
 */
Platform.prototype.removeCloud = function(id, cb){
    cb = cb || noop;
    var req = {
        method: "DELETE",
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + "accounts/" + id,
        headers: this.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
};

/**
 * Get cloud info.
 * @param {string} id - An id of cloud.
 * @param {function} cb - A callback function to be called with cloud info.
 */
Platform.prototype.getCloudInfo = function(id, cb){
    cb = cb || noop;
    var req = {
        method: "GET",
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + "accounts/" + id,
        headers: this.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
};

/**
 * Get cloud log.
 * @param {string} id - An id of cloud.
 * @param {function} cb - A callback function to be called with cloud info.
 */
Platform.prototype.getCloudLog = function(id, cb){
    cb = cb || noop;
    var req = {
        method: "GET",
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + "accounts/" + id + "/log",
        headers: this.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
};

/*****************************************************************************
 * Instances
 *****************************************************************************/

/**
 * Get cloud instances.
 * @param {string} id - An id of cloud.
 * @param {string} [filter] - An id of cloud.
 * @param {function} cb - A callback function to be called with cloud info.
 */
Platform.prototype.getCloudInstances = function(id, filter, cb){
    // handle optional filter argument
    if(!cb){
        if(!filter){
            filter = "";
            cb = noop;
        } else {
            if(typeof filter == "function") {
                cb = filter;
                filter = "";
            } else {
                cb = noop;
            }
        }
    }

    // just normalize (lowercase) the query string parameters
    filter = filter.toLowerCase();

    var req = {
        method: "GET",
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + "accounts/" + id + "/instances?provider=" + filter,
        headers: this.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
};

/**
 * Get instance info.
 * @param {string} id - An instance id.
 * @param {function} cb - A callback function to be called with instance info.
 */
Platform.prototype.getInstanceInfo = function(id, cb){
    cb = cb || noop;
    var req = {
        method: "GET",
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + "instances/" + id,
        headers: this.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
};

/**
 * Get instance tokens.
 * @param {string} id - An instance id.
 * @param {function} cb - A callback function to be called with instance info.
 */
Platform.prototype.getInstanceTokens = function(id, cb){
    cb = cb || noop;
    var req = {
        method: "GET",
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + "instances/" + id + "/authorizations",
        headers: this.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
};

/**
 * Rename instance.
 * @param {string} id - An instance id.
 * @param {string} name - A new instance name.
 * @param {function} cb - A callback function to be called with instance info.
 */
Platform.prototype.renameInstance = function(id, name, cb){
    cb = cb || noop;
    var self = this;

    var dbgBak = this.debug;
    this.debug = false;
    this.getInstanceInfo(id, function(e, currentInfo){
        self.debug = dbgBak;

        if(e){
            cb(e, currentInfo);
            return;
        }

        var updateObj = {
            name: name,
            tags: currentInfo.tags
        };

        var req = {
            method: "PUT",
            protocol: "https",
            hostname: self.hostname,
            path: self.apiPath + "instances/" + id,
            headers: self.getApiHeaders(),
            body: JSON.stringify(updateObj)
        };
        if(self.debug) console.log(req);
        restRequest(req, cb);
    });
};

/**
 * Set instance tags.
 * @param {string} id - An instance id.
 * @param {array} tags - A new instance tags.
 * @param {function} cb - A callback function to be called with instance info.
 */
Platform.prototype.setInstanceTags = function(id, tags, cb){
    cb = cb || noop;
    var self = this;

    var dbgBak = this.debug;
    this.debug = false;
    this.getInstanceInfo(id, function(e, currentInfo){
        self.debug = dbgBak;

        if(e){
            cb(e, currentInfo);
            return;
        }

        var updateObj = {
            name: currentInfo.name,
            tags: tags
        };

        var req = {
            method: "PUT",
            protocol: "https",
            hostname: self.hostname,
            path: self.apiPath + "instances/" + id,
            headers: self.getApiHeaders(),
            body: JSON.stringify(updateObj)
        };
        if(self.debug) console.log(req);
        restRequest(req, cb);
    });
};

/**
 * Create instance.
 * @private
 * @param {string} cloudId - A cloud id.
 * @param {object} obj - A new instance data. The parameters:
 *      name - The instance name
 *      serviceProviderId - The service; one of following: "eds", "mws" or "mar"
 *      datacenterId - The datacenter. Currently only supported value: "eu-1"
 *      config - The instance configuration object. Required for "mar" service instances. The parameters:
 *              runtimeType - The runtime type; one of following: "app", "service_container"
 *              runtimeSize - The runtime size; one of following: 1, 2, 4
 *              serviceImage - The runtime image (if type is service_container) one of following "qtcs/mongodb:2.6", "qtcs/mysql:5.6" or "qtcs/redis:2.8"
 * @param {function} cb - A callback function to be called with new instance info.
 */
Platform.prototype._createInstance = function(cloudId, obj, cb){
    cb = cb || noop;

    // quick n dirty sanitize
    obj = obj || {};
    obj.name = obj.name || "";
    obj.serviceProviderId = obj.serviceProviderId || "";
    obj.datacenterId = obj.datacenterId || "eu-1";

    if(obj.service == "mar"){
        obj.config = obj.config || {};
    }

    var req = {
        method: "POST",
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + "accounts/" + cloudId + "/instances",
        headers: this.getApiHeaders(),
        body: JSON.stringify(obj)
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
};

/**
 * Create EDS instance.
 * @param {string} cloudId - A cloud id.
 * @param {string} name - A new EDS instance name.
 * @param {object} [options] - An options for new EDS instance.
 * @param {function} cb - A callback function to be called with new instance info.
 */
Platform.prototype.createEdsInstance = function(cloudId, name, options, cb){
    // handle optional arguments
    if(!cb){
        if(!options){
            cb = noop;
            options = {}
        } else {
            if(typeof options == "function"){
                cb = options;
                options = {}
            } else {
                cb = noop;
            }
        }
    }

    var instanceObj = {
        name: name,
        serviceProviderId: "eds"
    };

    // options
    if(options.datacenter){
        instanceObj.datacenterId = options.datacenter;
    }

    this._createInstance(cloudId, instanceObj, cb);
};

/**
 * Create MWS instance.
 * @param {string} cloudId - A cloud id.
 * @param {string} name - A new MWS instance name.
 * @param {object} [options] - An options for new MWS instance.
 * @param {function} cb - A callback function to be called with new instance info.
 */
Platform.prototype.createMwsInstance = function(cloudId, name, options, cb){
    // handle optional arguments
    if(!cb){
        if(!options){
            cb = noop;
            options = {}
        } else {
            if(typeof options == "function"){
                cb = options;
                options = {}
            } else {
                cb = noop;
            }
        }
    }

    var instanceObj = {
        name: name,
        serviceProviderId: "mws"
    };

    // options
    if(options.datacenter){
        instanceObj.datacenterId = options.datacenter;
    }

    this._createInstance(cloudId, instanceObj, cb);
};

/**
 * Create MAR App Instance.
 * @param {string} cloudId - A cloud id.
 * @param {string} name - A new MAR instance name.
 * @param {string} size - A new MAR instance size. Options: 1, 2 or 4
 * @param {object} [options] - An options for new MAR instance.
 * @param {function} cb - A callback function to be called with new instance info.
 */
Platform.prototype.createMarAppInstance = function(cloudId, name, size, options, cb){
    // handle optional arguments
    if(!cb){
        if(!options){
            cb = noop;
            options = {}
        } else {
            if(typeof options == "function"){
                cb = options;
                options = {}
            } else {
                cb = noop;
            }
        }
    }

    var instanceObj = {
        name: name,
        serviceProviderId: "mar",
        config: {
            runtimeType: "app",
            runtimeSize: size
        }
    };

    // options
    if(options.datacenter){
        instanceObj.datacenterId = options.datacenter;
    }

    this._createInstance(cloudId, instanceObj, cb);
};

/**
 * Create MDB Instance.
 * @param {string} cloudId - A cloud id.
 * @param {string} name - A new MDB instance name.
 * @param {number} size - A new MDB instance size. Options: 1, 2 or 4
 * @param {string} kind - A new MDB instance kind. Options: "mongodb:2.6", "mysql:5.6" or "redis:2.8"
 * @param {object} [options] - An options for new MDB instance.
 * @param {function} cb - A callback function to be called with new instance info.
 */
Platform.prototype.createMdbInstance = function(cloudId, name, size, kind, options, cb){
    // handle optional arguments
    if(!cb){
        if(!options){
            cb = noop;
            options = {}
        } else {
            if(typeof options == "function"){
                cb = options;
                options = {}
            } else {
                cb = noop;
            }
        }
    }

    var latestMdbVersions = {
        "redis": "2.8",
        "mysql": "5.6",
        "mongodb":"2.6"
    };

    kind = kind.toLowerCase();

    // easy kind support; if no DB version specified, always use the latest
    var parts = kind.split(":");
    if(parts.length == 1){
        kind = kind + ":" + latestMdbVersions[kind];
    }

    var instanceObj = {
        name: name,
        serviceProviderId: "mar",
        config: {
            runtimeType: "service_container",
            runtimeSize: size,
            serviceImage: "qtcs/"+kind
        }
    };

    // options
    if(options.datacenter){
        instanceObj.datacenterId = options.datacenter;
    }

    this._createInstance(cloudId, instanceObj, cb);
};

/*****************************************************************************
 * Access Tokens
 *****************************************************************************/

/**
 * Get access tokens.
 * @param {function} cb - A callback function to be called with access tokens.
 */
Platform.prototype.getAccessTokens = function(cb){
    cb = cb || noop;
    var req = {
        method: "GET",
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + "authorizations",
        headers: this.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
};

/**
 * Create new access token.
 * @param {function} cb - A callback function to be called with new access token.
 */
Platform.prototype.createAccessToken = function(cb){
    cb = cb || noop;
    var req = {
        method: "POST",
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + "authorizations",
        headers: this.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
};

/**
 * Remove access token.
 * @param {number} id - An id of access token to be removed.
 * @param {function} cb - A callback function to be called.
 */
Platform.prototype.removeAccessToken = function(id, cb){
    cb = cb || noop;
    var req = {
        method: "DELETE",
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + "authorizations/" + id,
        headers: this.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
};

/*****************************************************************************
 * SSH Keys
 *****************************************************************************/

/**
 * Get user SSH keys.
 * @param {function} cb - A callback function to be called with SSH keys.
 */
Platform.prototype.getSSHKeys = function(cb){
    cb = cb || noop;
    var req = {
        method: "GET",
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + "user/ssh_keys",
        headers: this.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
};

/**
 * Create new SSH key.
 * @param {string} name - A name for SSH key.
 * @param {string} key - A SSH key (ssh-rsa).
 * @param {function} cb - A callback function to be called with new SSH key.
 */
Platform.prototype.addSSHKey = function(name, key, cb){
    cb = cb || noop;

    var req = {
        method: "POST",
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + "user/ssh_keys",
        headers: this.getApiHeaders(),
        body: JSON.stringify({ name: name, key: key })
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
};

/**
 * Remove SSH key.
 * @param {string} id - An id of SSH key to be removed.
 * @param {function} cb - A callback function to be called.
 */
Platform.prototype.removeSSHKey = function(id, cb){
    cb = cb || noop;
    var req = {
        method: "DELETE",
        protocol: "https",
        hostname: this.hostname,
        path: this.apiPath + "user/ssh_keys/" + id,
        headers: this.getApiHeaders()
    };
    if(this.debug) console.log(req);
    restRequest(req, cb);
};

module.exports = Platform;
