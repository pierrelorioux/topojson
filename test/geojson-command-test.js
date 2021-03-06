var fs = require("fs"),
    os = require("os"),
    path = require("path"),
    child = require("child_process"),
    vows = require("vows"),
    assert = require("./assert");

var suite = vows.describe("bin/geojson");

var testId = 0;

suite.addBatch({
  "Polygons": testConversion(
    {
      polygon: "polygon-feature"
    },
    "-- test/topojson/polygon.json"
  ),
  "Projected polygons": testConversion(
    {
      polygon: "polygon-feature-mercator"
    },
    "-- test/topojson/polygon-mercator.json"
  ),
  "Rounded polygons": testConversion(
    {
      polygon: "polygon-feature-rounded"
    },
    "--precision 2"
    + " -- test/topojson/polygon-mercator.json"
  )
});

function testConversion(output, options) {
  if (!options) options = "";
  var tmpdir = os.tmpdir() + "geojson-command-test-" + ++testId;
  fs.mkdirSync(tmpdir);
  return {
    topic: function() {
      var callback = this.callback;
      child.exec("bin/geojson -o " + tmpdir + " " + options, function(error) {
        if (error) return void callback(error);
        var actual = {};
        fs.readdirSync(tmpdir).forEach(function(file) {
          actual[path.basename(file, ".json")] = JSON.parse(fs.readFileSync(tmpdir + "/" + file), "utf-8");
          fs.unlinkSync(tmpdir + "/" + file);
        });
        fs.rmdir(tmpdir);
        callback(null, actual);
      });
    },
    "has the expected output": function(actual) {
      for (var file in output) {
        assert.deepEqual(actual[file], JSON.parse(fs.readFileSync("test/geojson/" + output[file] + ".json", "utf-8")));
      }
    }
  };
}

suite.export(module);
