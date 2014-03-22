var Qtc = require("../lib/qtc.js");

// NOTE! Create settings.js file to use this example. You can use settings-default.js as a template
var ENV = require("./settings.js");

var eds = new Qtc.Eds({
    address: ENV.eds.address,
    backendId: ENV.eds.backendId,
    secret: ENV.eds.secret
});

// Define collection used in this example
var contacts = eds.collection("contacts");

contacts.insert({
    name: "John",
    age: 31,
    likes: ["pizza", "coke"],
    address: {
        city: "Springfield",
        country: "USA"
    }
}, function(e, result){
    if(!e){
        console.log(result);
    } else {
        console.log("Ooops! Something went wrong!", e);
    }
});
