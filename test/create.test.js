const fs = require("fs");
const expect = require("chai").expect;
const sunwell = require("../index");
describe("测试生成sw文件", function () {
  it("create", function () {
    sunwell({
      swDest: "./static/sw.js",
      CACHE_PREFIX: "iwan-honour",
      BLACKLIST: ["iwan.qq.com/", "/honour/cgi/"],
      strategy: [
        [
          { identity: "mode", status: "navigate" },
          {
            strategy: "networkFirst",
            request: {
              headers: { "user-agent": "userAgent" },
              credentials: "include",
            },
          },
        ],
        [
          { url: "/vm.gtimg.cn|puui.qpic.cn|pic.iwan.qq.com/" },
          {
            strategy: "cacheFirst",
            request: { mode: "cors", credentials: "same-origin" },
          },
        ],
        ["default", { strategy: "cacheFirst" }],
      ],
      error: (event) => {
        console.log(event);
      },
      redirectSource:
        "https://v.qq.com/cache/wuji/object?appid=sunwell&schemaid=serviceworker&schemakey=60d95501e33d42e79688378177e513c6",
      refreshSource:
        "https://v.qq.com/cache/wuji/object?appid=sunwell&schemaid=refresh_cache&schemakey=7b48a9edeb97461596647577b3914df2",
    });
    const flag = fs.existsSync("./static/sw.js");
    expect(flag).to.be.true;
  });
});
