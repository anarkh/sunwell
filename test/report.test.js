const expect = require("chai").expect;
const Report = require("../lib/report");
describe("测试生成上报", function () {
  it("getPage", function () {
    const report = new Report();
    const page = report.getPage("https://iwan.qq.com/honour/growindex");
    expect(page).to.equal("growindex");
  });
});
