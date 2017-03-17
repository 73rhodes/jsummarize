exports.format = function format(stats) {
  var output = "";
  if (stats.type == "Array") {
    var types = Object.keys(stats.types);
    for (var i = 0; i < types.length; i += 1) {
      output += formatElementStats(stats.types[types[i]]);
    }
  } else if (stats.type == "Object") {
    output += "Object stats TBD";
  } else {
    output += "Not a valid JSON Object or Array.";
  }
  return "<div class='stats'>" + output + "</div>";
};

function numberOfElements(stats) {
  var numberOfElements = "";
  if (stats.minimumElements == stats.maximumElements) {
    return stats.minimumElements;
  } else {
    return "[" +
        stats.minimumElements + " to " +
        stats.maximumElements + "]";
  }
}

function formatElementStats(stat) {
  var output = "";
  console.log(JSON.stringify(stat, null, 2));
  if (stat.type == "Object") {
    var props = Object.keys(stat.properties);
    for (var j = 0; j < props.length; j += 1) {
      propname = props[j];
      details = stat.properties[propname];
      output += "<div class='propertyStat'><b>" + propname + "</b>" +
          formatPropertyStats(details, stat.count);
      //console.log(output);
    }
  } else if (stat.type == "Array") {
    console.log("TBD: Arrays in Arrays");
    output += formatStats(stat);
  } else {
    output += "TBD: " + stat.type + "<br/>";
    //output += formatPropertyStats(stat, stat.count);
  }
  return output;
}

// Given the details of an object property, iterate
// through the value types of the property and print
// statistics for each.
function formatPropertyStats(details, objectCount) {
  console.log(JSON.stringify(details, null, 2));
  var occurences = details.count;
  var occurencePct = Math.round(100 * occurences / objectCount);
  var keys = Object.keys(details.types);
  var propStr = "";
  var i, key, typePct, uniqueCount;
  for (i = 0; i < keys.length; i += 1) {
    key = keys[i];
    typePct = Math.round(details.types[key].count * 100 / occurences);
    propStr += typePct + "% " + key + " values";
    if (details.types[key].HLL) {
      uniqueCount = details.types[key].HLL.count();
      propStr += " with " + details.types[key].HLL.count() + " estimated unique values.";
    }
    if (occurencePct == 100 && typePct == 100 && uniqueCount == objectCount) {
      propStr += " 🆔  Possible unique ID.";
    }
    propStr += "<br/>\n";
    if (key == "Array") {
      propStr += "<ul>";
      var elementTypes = details.types.Array.types;
      var elementTypeKeys = Object.keys(elementTypes);
      for (var j = 0; j < elementTypeKeys.length; j++) {
        propStr += formatElementStats(elementTypes[elementTypeKeys[j]]);
      }
      propStr += "</ul>";
    }
    else if (key == "Object") {
      // TODO
      propStr += "Object details will be here.";
    }
  }
  return " occurs " + occurencePct + "% of the time [" +
      occurences + " times].<br/>\n" + "<ul>" + propStr +
      "</ul></div>\n";
}
