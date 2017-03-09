var jsummary = require('../lib/index.js');
var ndjson = require("ndjson");
var summarize  = jsummary.summarize;
var fs = require('fs');

exports.demo = function demo() {
    var data = fs.readFileSync(__dirname + '/data.json');
    var jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      console.log("Try to parse ndjson");
    }
    var stats = summarize({}, data);
    fs.writeFileSync(__dirname + "/output.json", JSON.stringify(stats, null, 2));
};
