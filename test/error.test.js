const expect = require("chai").expect;
const ErrorTpl = require("../templates/error");

describe("测试errorTpl", function () {
  it("空值", async function () {
    const errorTpl = await ErrorTpl({});
    expect(errorTpl).to.contain("const swErrorFun");
  });
  it("传string", async function () {
    const errorTpl = await ErrorTpl({
      error: "test",
    });
    expect(errorTpl).to.contain("const swErrorFun");
  });
  it("传function", async function () {
    const errorTpl = await ErrorTpl({
      error: () => {
        console.log("123");
      },
    });
    expect(errorTpl).to.contain("const swErrorFun");
  });
});
