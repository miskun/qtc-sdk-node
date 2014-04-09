var BaseCollection = require( './qtc-eds-basecollection.js' );

function noop(){}

var Collection = BaseCollection.extend({
    constructor: function(db, name){
        this._super( [db, "objects."+name] );
    },

    // DEPRECATED; WILL BE REMOVED SOON
    getFileInfo: function(fileId, cb){
        console.log("WARNING: deprecated function call to eds.collection.getFileInfo()! Use eds.getFileInfo() instead.");
        this.db.getFileInfo(fileId, cb);
    },
    getFileDownloadUrl: function(fileId, variant, cb){
        console.log("WARNING: deprecated function call to eds.collection.getFileDownloadUrl()! Use eds.getFileDownloadUrl() instead.");
        this.db.getFileDownloadUrl(fileId, variant, cb);
    },
    downloadFile: function(fileId, filePath, variant, cb){
        console.log("WARNING: deprecated function call to eds.collection.downloadFile()! Use eds.downloadFile() instead.");
        this.db.downloadFile(fileId, filePath, variant, cb);
    }
});

module.exports = Collection;
