#!/usr/bin/env node

var analyzeArray = require('../lib/index.js').analyzeArray;

var runningInTestMode = (typeof global.describe !== 'undefined');
if (!runningInTestMode) {
    var data = require('./data.json');
    var stats = {};
    analyzeArray(stats, data);
    console.log(JSON.stringify(stats, null, 2));
}
