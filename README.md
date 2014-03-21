# Qt Cloud Services SDK for Node.js

The official Qt Cloud Services SDK for Node.js.

* The Qt Cloud Services home page is at https://www.qtc.io
* The Developer Documentation page is at https://developer.qtc.io

## Installing
The preferred way to install the SDK for Node.js is to use the [npm](http://npmjs.org) package manager for Node.js. Simply type the following into a terminal window:

```sh
npm install qtc
```

## Getting Started

You can find a getting started guide for Qt Cloud Services at:

http://developer.qtc.io/qtc/getting-started?snippets=node

If you are looking for service specific guides, please see:

* [Enginio Data Storage](http://developer.qtc.io/eds/getting-started?snippets=node
* [Managed WebSocket](http://developer.qtc.io/mws/getting-started?snippets=node

## Quick Start

Qt Cloud Services SDK is designed to be the most easy way possible to use any of the services of Qt Cloud Services. It supports all the latest APIs by default. The following example shows how to access Enginio Data Storage (EDS) with the Node.js SDK.

```javascript
var qtc = require("qtc");
var eds = new qtc.Eds({ address: "YOUR_EDS_ADDRESS", backendId: "YOUR_BACKEND_ID"});

// Define collection used in this example
var contacts = eds.collection("contacts");

// Insert object to EDS
contacts.insert({
   name: "John",
   age: 31,
   likes: ["pizza", "coke"],
   address: {
      city: "Springfield",
      country: "USA",
   }
}, function(e, result){
   if(!e){
      console.log(result);
   } else {
      console.log("Ooops! Something went wrong!", e);
   }
});
```
