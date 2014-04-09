var BaseCollection = require( './qtc-eds-basecollection.js' );

function noop(){}

var UserGroups = BaseCollection.extend({
    constructor: function(db){
        this._super( [db, "usergroups"] );
    }
});

module.exports = UserGroups;