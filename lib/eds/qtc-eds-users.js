var BaseCollection = require( './qtc-eds-basecollection.js' );

function noop(){}

var Users = BaseCollection.extend({
    constructor: function(db){
        this._super( [db, "users"] );
    }
});

module.exports = Users;