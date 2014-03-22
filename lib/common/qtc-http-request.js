// requires
var https = require('https');
var http = require('http');
var request = require('request');
var FormData = require('form-data');
var path = require('path');
var fs = require('fs');

// misc
var noop = function(){};

// generic HTTP request
var restRequest = function(options, callback){
    callback = callback || noop;
    options = options || {};

    // set protocol to HTTP or HTTPS
    options.protocol = options.protocol || "http";
    options.protocol = (options.protocol.toLowerCase() == "http") ? "http" : "https";
    var protocol = (options.protocol == "http") ? http : https;

    // automatically manage body submit & set content length if not specified
    if((options.body) && (options.body.length > 0) && (!options.headers["Content-Length"])){
        options.headers["Content-Length"] = Buffer.byteLength( options.body, 'utf8' );
    }
    var submitBody = options.body;

    // cleanup options from custom vars
    delete options.protocol;
    delete options.body;

    var req = protocol.request(options, function(res) {

        var body = "";
        res.on('data', function(d) {
            body += d;
        });
        res.on('end', function() {
            // parse JSON response
            if(res.headers["content-type"].toLowerCase().indexOf("application/json") !== -1){
                body = JSON.parse(body);
            }
            if(res.statusCode >= 400) {
                callback(res.statusCode, body);
            } else {
                callback(null, body);
            }
        });
    });

    req.on('error', function(e) {
        callback(e);
    });

    if(submitBody) req.write(submitBody);
    req.end();
}

var edsFileUploadRequest = function(options, callback){
    callback = callback || noop;

    var objData = {
        targetFileProperty: {
            id: options.edsMultipartData.objId,
            objectType: options.edsMultipartData.objType,
            propertyName: options.edsMultipartData.fieldName
        }
    };

    var filePath = options.edsMultipartData.filePath;
    var address = options.protocol + "://" + options.hostname + options.path;

    // create multipart/form data
    var form = new FormData();
    form.append('object', JSON.stringify(objData));
    form.append('filename', path.basename(filePath));
    form.append('file', fs.createReadStream(filePath));
    form.getLength(function(err, theLength){

        options.headers['Content-Length'] = theLength;

        var req = request.post(address, {
            headers: options.headers
        }, function(e, r, body) {
            // TODO: fix the statusCode. Should be 200?
            if(!e && (r.statusCode == 201)){
                body = JSON.parse(body);
                callback(null, body);
            } else {
                callback(r.statusCode, body);
            }
        });
        req._form = form
    });
};

var edsFileDownloadRequest = function(options, callback){
    callback = callback || noop;

    request({
        method: "GET",
        url: options.address,
        headers: options.headers
    }, function(e, r, body) {
        if(!e && (r.statusCode == 200)){
            callback(null, body);
        } else {
            callback(r.statusCode);
        }
    }).pipe(fs.createWriteStream(options.filePath));
};

module.exports = {
    restRequest: restRequest,
    edsFileUploadRequest: edsFileUploadRequest,
    edsFileDownloadRequest: edsFileDownloadRequest
}