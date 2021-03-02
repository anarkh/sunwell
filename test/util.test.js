const fs = require("fs");
const upath = require("upath");
const expect = require("chai").expect;
const { atLeastNode, mkDir } = require("../lib/utils");

describe("测试Util", function () {
  it("atLeastNode", function () {
    const ver = atLeastNode("10.12.0");
    expect(ver).to.be.ok;
  });
  it("mkDir", async function () {
    const outputDir = upath.dirname("./static/test");
    await mkDir(outputDir);
    const flag = fs.existsSync(outputDir);
    expect(flag).to.be.true;
  });
});
