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

        // attach file to newly created file
        var filePath = "./testdata.txt";

        contacts.attachFile(result.id, "someData", filePath, function(e, attachedFile){
            if(!e){
                console.log("Successfully attached file " + attachedFile.id);

                contacts.downloadFile(attachedFile.id, "./testdata.download.txt", function(e, downloadInfo){
                    if(!e){
                        console.log("Downloaded file (" + downloadInfo.length + " bytes)");
                    } else {
                        console.log("Ooops! Something went wrong!", e);
                    }
                })
            } else {
                console.log("Ooops! Something went wrong!", e);
            }
        });
    } else {
        console.log("Ooops! Something went wrong!", e);
    }
});
