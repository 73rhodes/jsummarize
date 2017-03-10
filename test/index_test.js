/* Given a collection of JSON objects, we want to build up
 * a view of what the objects contain, something like this:
*/

var expect = require('expect.js');
var jstats = require('../lib/index.js');
var summarizeObject = jstats.summarizeObject;
var summarizeArray  = jstats.summarizeArray;
describe("jsonsummary", function () {

  describe("#summarizeObject", function () {

    it("should throw error without correct number of args", function () {
      expect(summarizeObject).withArgs(null, null ).to.throwError();
    });

    it("should throw error for invalid args", function () {
      expect(summarizeObject).withArgs(1, 2).to.throwError();
      expect(summarizeObject).withArgs({}, 1).to.throwError();
      expect(summarizeObject).withArgs(1, {}).to.throwError();
      expect(summarizeObject).withArgs({}, {}).to.not.throwError();
    });

    it("should return stats", function () {
      var obj = {foo: "foo", bar: "bar"};
      var stats = summarizeObject({}, obj);
      expect(stats.properties.foo.count).to.be(1);
      expect(stats.properties.foo.types.String.count).to.be(1);
    });

    it("should gather stats on null values", function () {
      var obj = {foo: null};
      var stats = summarizeObject({}, obj);
      expect(stats.properties.foo.count).to.be(1);
      expect(stats.properties.foo.types.null.count).to.be(1);
    });

    it ("should analyze object values", function () {
      var obj = {
        foo: {label: "Foo", value: 1}
      };
      var stats = summarizeObject({}, obj);
      var fooObj = stats.properties.foo.types.Object;
      expect(fooObj.count).to.be(1);
      expect(stats.properties.foo.types.Object.properties.label.count).to.be(1);
    });


    it("should analyze array values", function () {
      var obj = {
        foo: ["This", "is", 1, "array"]
      };
      var stats = summarizeObject({}, obj);
      var arrayStats = stats.properties.foo.types.Array;
      expect(arrayStats.count).to.be(1);
      expect(arrayStats.types.String.count).to.be(3);
    });
  });

  describe("#summarizeArray", function () {
    it("should throw an error for invalid arguments", function () {
      expect(summarizeArray).withArgs(null).to.throwError();
      expect(summarizeArray).withArgs(1, 1).to.throwError();
      expect(summarizeArray).withArgs({}, 1).to.throwError();
      expect(summarizeArray).withArgs(1, []).to.throwError();
      expect(summarizeArray).withArgs({},[]).to.not.throwError();
    });

    it("should set min and max values", function () {
        var stats = {};
        var array1 = [1, 2, 3];
        var array2 = [1, 2, 3, 4, 5];
        stats = summarizeArray(stats, array1);
        expect(stats.minimumElements).to.be(3);
        expect(stats.maximumElements).to.be(3);
        stats = summarizeArray(stats, array2);
        expect(stats.minimumElements).to.be(3);
        expect(stats.maximumElements).to.be(5);
    });

    it('should analyze an array of primitives', function () {
        var stats = {};
        var array1 = [1, 2, 3, "foo"];
        var array2 = ["bar", "fizz", "buzz"];
        var array3 = [{"foo": "bar"}, {"foo": "FOO", "fizz": "buzz"}];
        stats = summarizeArray(stats, array1);
        stats = summarizeArray(stats, array2);
        expect(stats.types).to.not.be.empty();
        expect(stats.types.Number.count).to.be(3);
        expect(stats.types.String.count).to.be(4);
        stats = summarizeArray(stats, array3);
    });

    it('should analyze array with null items', function () {
      var array1 = [
        {foo: 1, bar: 2},
        null,
        {foo: 2, bar: null}
      ];
      var stats = summarizeArray({}, array1);
      expect(stats.types.null.count).to.be(1);
    });

    it('should analyze an array of objects', function () {
      var array1 = [
        {foo: 1, bar: true,  fizz: "buzz"},
        {foo: 2, bar: true,  fizz: "fizz"},
        {foo: 3, bar: false, fizz: null, qux: "doo"},
        {foo: 4, bar: true,  fizz: "foobar"}
      ];
      var stats = {};
      var newstats = summarizeArray(stats, array1);
      expect(newstats.minimumElements).to.be(4);
      expect(newstats.maximumElements).to.be(4);
      expect(newstats.types.Object.count).to.be(4);
      expect(newstats.types.Object.properties.foo.count).to.be(4);
    });

    it('should analyze an array of arrays', function () {
        var stats = {};
        var array1 = ["foo", 1, [1, true, "bar"]];
        stats = summarizeArray(stats, array1);
        expect(stats.minimumElements).to.be(3);
        expect(stats.maximumElements).to.be(3);
        expect(stats.types.Array.count).to.be(1);
        expect(stats.types.Array).to.not.be.empty();
        expect(stats.types.Array.types.Boolean.count).to.be(1);
        expect(stats.types.Array.types.String.count).to.be(1);
        expect(stats.types.Array.types.Number.count).to.be(1);
    });

    it('should analyze nested arrays and objects', function () {
      var array1 = [
        {fizz: [1, 2, {buzz: "buzz", doo: ["doo", true, "doo"]}]},
        {fizz: [1, 2]}
      ];
      var newStats = summarizeArray({}, array1);
      var objData = newStats.types.Object;
      expect(objData.count).to.be(2);
      var fizz = objData.properties.fizz.types.Array;
      expect(fizz.count).to.be(2);
      expect(fizz.minimumElements).to.be(2);
      expect(fizz.maximumElements).to.be(3);
      expect(fizz.types.Number.count).to.be(4);
      expect(fizz.types.Object.count).to.be(1);
      // ridiculous nesting...
      var doo = fizz.types.Object.properties.doo;
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
      var stats = summarizeArray({}, arr);
      expect(stats.types.Object.count).to.be(2);
      var foo = stats.types.Object.properties.foo;
      expect(foo.count).to.be(2);
      expect(foo.types.Object.count).to.be(2);
      expect(foo.types.Object.properties.displayText.count).to.be(2);
    });

    it('should have correct hll count', function () {
      var arr = [
        {foo: 1},
        {foo: 2},
        {foo: 3}
      ];
      var stats = summarizeArray({}, arr);
      var fooStats = stats.types.Object.properties.foo;
      expect(fooStats.types.Number.HLL.count()).to.be(3);
      var arr2 = [
        {foo: 1},
        {foo: 1},
        {foo: 2}
      ];
      stats = summarizeArray({}, arr2);
      fooStats = stats.types.Object.properties.foo;
      expect(fooStats.types.Number.HLL.count()).to.be(2);
    });
  });
});
