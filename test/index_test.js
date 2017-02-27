/* Given a collection of JSON objects, we want to build up
 * a view of what the objects contain, something like this:
*/

var expect = require('expect.js');
var jstats = require('../lib/index.js');
var analyzeObject = jstats.analyzeObject;
var analyzeArray  = jstats.analyzeArray;
describe("jsonsummary", function () {

  describe("#analyzeObject", function () {

    it("should throw error without correct number of args", function () {
      expect(analyzeObject).withArgs(null, null ).to.throwError();
    });

    it("should throw error for invalid args", function () {
      expect(analyzeObject).withArgs(1, 2).to.throwError();
      expect(analyzeObject).withArgs({}, 1).to.throwError();
      expect(analyzeObject).withArgs(1, {}).to.throwError();
      expect(analyzeObject).withArgs({}, {}).to.not.throwError();
    });

    it("should return stats", function () {
      var obj = {foo: "foo", bar: "bar"};
      var stats = analyzeObject({}, obj);
      expect(stats.properties.foo.count).to.be(1);
      expect(stats.properties.foo.types.String.count).to.be(1);
    });

    it("should gather stats on null values", function () {
      var obj = {foo: null};
      var stats = analyzeObject({}, obj);
      expect(stats.properties.foo.count).to.be(1);
      expect(stats.properties.foo.types.null.count).to.be(1);
    });

    it ("should analyze object values", function () {
      var obj = {
        foo: {label: "Foo", value: 1}
      };
      var stats = analyzeObject({}, obj);
      var fooObj = stats.properties.foo.types.Object;
      expect(fooObj.count).to.be(1);
      expect(stats.properties.foo.types.Object.properties.label.count).to.be(1);
    });


    it("should analyze array values", function () {
      var obj = {
        foo: ["This", "is", 1, "array"]
      };
      var stats = analyzeObject({}, obj);
      var arrayStats = stats.properties.foo.types.Array;
      expect(arrayStats.count).to.be(1);
      expect(arrayStats.elements.elementTypes.String.count).to.be(3);
    });
  });

  describe("#analyzeArray", function () {
    it("should throw an error for invalid arguments", function () {
      expect(analyzeArray).withArgs(null).to.throwError();
      expect(analyzeArray).withArgs(1, 1).to.throwError();
      expect(analyzeArray).withArgs({}, 1).to.throwError();
      expect(analyzeArray).withArgs(1, []).to.throwError();
      expect(analyzeArray).withArgs({},[]).to.not.throwError();
    });

    it("should set min and max values", function () {
        var stats = {};
        var array1 = [1, 2, 3];
        var array2 = [1, 2, 3, 4, 5];
        stats = analyzeArray(stats, array1);
        expect(stats.minimumElements).to.be(3);
        expect(stats.maximumElements).to.be(3);
        stats = analyzeArray(stats, array2);
        expect(stats.minimumElements).to.be(3);
        expect(stats.maximumElements).to.be(5);
    });

    it('should analyze an array of primitives', function () {
        var stats = {};
        var array1 = [1, 2, 3, "foo"];
        var array2 = ["bar", "fizz", "buzz"];
        var array3 = [{"foo": "bar"}, {"foo": "FOO", "fizz": "buzz"}];
        stats = analyzeArray(stats, array1);
        stats = analyzeArray(stats, array2);
        expect(stats.elementTypes).to.not.be.empty();
        expect(stats.elementTypes.Number.count).to.be(3);
        expect(stats.elementTypes.String.count).to.be(4);
        stats = analyzeArray(stats, array3);
    });

    it('should analyze array with null items', function () {
      var array1 = [
        {foo: 1, bar: 2},
        null,
        {foo: 2, bar: null}
      ];
      var stats = analyzeArray({}, array1);
      expect(stats.elementTypes.null.count).to.be(1);
    });

    it('should analyze an array of objects', function () {
      debugger;
      var array1 = [
        {foo: 1, bar: true,  fizz: "buzz"},
        {foo: 2, bar: true,  fizz: "fizz"},
        {foo: 3, bar: false, fizz: null, qux: "doo"},
        {foo: 4, bar: true,  fizz: "foobar"}
      ];
      var stats = {};
      var newstats = analyzeArray(stats, array1);
      expect(newstats.minimumElements).to.be(4);
      expect(newstats.maximumElements).to.be(4);
      expect(newstats.elementTypes.Object.count).to.be(4);
      expect(newstats.elementTypes.Object.properties.foo.count).to.be(4);
    });

    it('should analyze an array of arrays', function () {
        var stats = {};
        var array1 = ["foo", 1, [1, true, "bar"]];
        stats = analyzeArray(stats, array1);
        expect(stats.minimumElements).to.be(3);
        expect(stats.maximumElements).to.be(3);
        expect(stats.elementTypes.Array.count).to.be(1);
        expect(stats.elementTypes.Array.elements).to.not.be.empty();
        expect(stats.elementTypes.Array.elements.elementTypes.Boolean.count).to.be(1);
        expect(stats.elementTypes.Array.elements.elementTypes.String.count).to.be(1);
        expect(stats.elementTypes.Array.elements.elementTypes.Number.count).to.be(1);
    });

    it('should analyze nested arrays and objects', function () {
      var array1 = [
        {fizz: [1, 2, {buzz: "buzz", doo: ["doo", true, "doo"]}]},
        {fizz: [1, 2]}
      ];
      var newStats = analyzeArray({}, array1);
      var objData = newStats.elementTypes.Object;
      expect(objData.count).to.be(2);
      var fizz = objData.properties.fizz.types.Array;
      expect(fizz.count).to.be(2);
      expect(fizz.elements.minimumElements).to.be(2);
      expect(fizz.elements.maximumElements).to.be(3);
      expect(fizz.elements.elementTypes.Number.count).to.be(4);
      expect(fizz.elements.elementTypes.Object.count).to.be(1);
      // ridiculous nesting...
      var doo = fizz.elements.elementTypes.Object.properties.doo;
      expect(doo.types.Array.count).to.be(1);
    });

    it('should analyze and array of nested objects', function () {
      var arr = [
        {
          foo: {
            displayText: "Foo",
            value: 1
          }
        },
        {
          foo: {
            displayText: "FOO!",
            value: 2
          }
        }
      ];
      var stats = analyzeArray({}, arr);
      expect(stats.elementTypes.Object.count).to.be(2);
      var foo = stats.elementTypes.Object.properties.foo;
      expect(foo.count).to.be(2);
      expect(foo.types.Object.count).to.be(2);
      expect(foo.types.Object.properties.displayText.count).to.be(2);
    });

    it('should generate uniqueness of 1 for unique values', function () {
      var arr = [
        {foo: 1},
        {foo: 2},
        {foo: 3}
      ];
      var stats = analyzeArray({}, arr);
      var fooStats = stats.elementTypes.Object.properties.foo;
      expect(fooStats.types.Number.uniqueness).to.be(1);
    });

    it('should generate uniqueness < 1 for non-unique values', function () {
      var arr = [
        {foo: 1},
        {foo: 1},
        {foo: 2}
      ];
      var stats = analyzeArray({}, arr);
      var fooStats = stats.elementTypes.Object.properties.foo;
      expect(fooStats.types.Number.uniqueness).to.be.below(1);
    })
  });
});
