var Qtc = require("../lib/qtc.js");
var eds = new Qtc.Eds({
    address: "https://api.engin.io/v1",     // your EDS instance address
    backendId: "524d53a6e5bde570640010b3"   // your EDS backend id
});

// Define collection used in this example
var contacts = eds.collection("contacts");

// Insert object to EDS
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
        console.log("Successfully created object " + result.id);

        // remove the object
        contacts.remove(result.id, function(e){
            if(!e){
                console.log("Successfully removed object " + result.id);

                // ensure object is really deleted
                contacts.findOne(result.id, function(e,res){
                    if(e == 404){
                        console.log("Yippee! The object is really removed!");
                    } else {
                        console.log("Ooops! Something went wrong!", e);
                    }
                });

            } else {
                console.log("Ooops! Something went wrong!", e);
            }
        });
    } else {
        console.log("Ooops! Something went wrong!", e);
    }
});
