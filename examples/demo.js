var jsummary = require('../lib/index.js');
var analyzeArray  = jsummary.analyzeArray;
var analyzeObject = jsummary.analyzeObject;
var fs = require('fs');

exports.demo = function demo() {
    var data = JSON.parse(fs.readFileSync(__dirname + '/data.json'));
    var stats = {};
    if (data instanceof Array) {
      stats = analyzeArray({}, data);
    } else {
      stats = analyzeObject({}, data);
    }
    fs.writeFileSync(__dirname + "/output.json", JSON.stringify(stats, null, 2));
}
