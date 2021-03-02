const expect = require("chai").expect;
const ActivateTpl = require("../templates/activate");

describe("测试activateTpl", function () {
  it("空值", async function () {
    const activateTpl = await ActivateTpl();
    expect(activateTpl).to.contain("event.waitUntil");
  });
});
