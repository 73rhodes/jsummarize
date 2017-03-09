// jsonstats.js
var HLL = require('hll-native').HLL;

function summarizeObject(stats, obj) {
    'use strict';
    if (!stats || !obj) {
      throw new Error("Invalid number of arguments: stats, obj required.");
    }
    if (typeof stats !== 'object' || typeof obj !== 'object') {
      throw new Error("Invalid arguments: both args must be objects.");
    }
    var keys, i, key, val, stat, type, stattype;
    keys = Object.keys(obj);
    stats.properties = stats.properties || {};
    for (i = 0; i < keys.length; i += 1) {
        key = keys[i];
        val = obj[key];
        stats.properties[key] = stats.properties[key] || {count: 0};
        stat = stats.properties[key];
        stat.count += 1;
        if (val) {
            type = val.constructor.name;
        } else {
            type = null;
        }
        stat.types = stat.types || {};
        stat.types[type] = stat.types[type] || {count: 0};//, type: type};
        stattype = stat.types[type];
        stattype.count += 1;
        if (type === "Object") {
            summarizeObject(stattype, val);
        } else if (type === "Array") {
            stattype.elements = stattype.elements || {};
            summarizeArray(stattype.elements, val);
        } else {
          stattype.HLL = stattype.HLL || new HLL(20);
          stattype.HLL.add(val);
        }
    }
    return stats;
}

function summarizeArray(stats, array) {
    'use strict';
    if (!stats || !array) {
        throw new Error("Invalid number of arguments: stats, array required.");
    }
    if (typeof stats !== 'object' || array.constructor.name !== 'Array') {
      throw new Error("Invalid arguments: stats must be an object, array must be an array.");
    }
    stats.minimumElements = stats.minimumElements || array.length;
    stats.maximumElements = stats.maximumElements || 0;
    if (stats.minimumElements > array.length) {
        stats.minimumElements = array.length;
    }
    if (stats.maximumElements < array.length) {
        stats.maximumElements = array.length;
    }
    var i, item, type, stattype;
    for (i = 0; i < array.length; i += 1) {
        item = array[i];
        if (item) {
            type = item.constructor.name;
        } else {
            type = null;
        }
        stats.elementTypes = stats.elementTypes || {};
        stats.elementTypes[type] = stats.elementTypes[type] || {};
        stattype = stats.elementTypes[type];
        stattype.count = stattype.count || 0;
        stattype.count += 1;
        if (type === 'Object') {
            summarizeObject(stattype, item);
        } else if (type === 'Array') {
            stattype.elements = stattype.elements || {};
            summarizeArray(stattype.elements, item);
        } else {
          stattype.HLL = stattype.HLL || new HLL(20);
          stattype.HLL.add(item);
        }
    }
    return stats;
}

function summarize(stats, jsonData) {
  if (jsonData instanceof Array) {
    console.log("Array...");
    return summarizeArray(stats, jsonData);
  } else {
    console.log("Object...");
    return summarizeObject(stats, jsonData);
  }
}

/* */
// for testing export these helper functions.
exports.summarizeObject = summarizeObject;
exports.summarizeArray  = summarizeArray;
/* */
exports.summarize = summarize;
