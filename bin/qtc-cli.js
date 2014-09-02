#!/usr/bin/env node

var path = require('path');

// Configuration
var userHome = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var configFile = path.join(userHome,".qtcrc");

// do cli magic...
