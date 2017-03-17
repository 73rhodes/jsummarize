var jsummary = require('../lib/index.js');
var format = jsummary.format;
var ndjson = require("ndjson");
var summarize  = jsummary.summarize;
var fs = require('fs');
var GenerateSchema = require('generate-schema');

exports.demo = function demo() {
    var data = fs.readFileSync(__dirname + '/data.json');
    var jsonData;
    try {
      jsonData = JSON.parse(data);
      console.log(jsonData);
    } catch (e) {
      console.log("Try to parse ndjson");
    }
    var stats = summarize({}, jsonData);
    fs.writeFileSync(__dirname + "/output.json", JSON.stringify(stats, null, 2));

    var html = format(stats);
    fs.writeFileSync(__dirname + "/output.html", html);

    var schema = GenerateSchema.json(jsonData);
    fs.writeFileSync(__dirname + "/output.schema.json", JSON.stringify(schema, null, 2));

};
