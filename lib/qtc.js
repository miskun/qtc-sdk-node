var Eds = require("./eds/qtc-eds.js");
var Mws = require("./mws/qtc-mws.js");
var Mar = require("./mar/qtc-mar.js");
var Platform = require("./platform/qtc-platform.js");

var Qtc = {
	Eds: Eds,
    Mws: Mws,
    Mar: Mar,
    Platform: Platform
};

module.exports = Qtc;
