const expect = require("chai").expect;
const CacheNameTpl = require("../templates/cacheName");
const BasicsSetTpl = require("../templates/basicsSet");
const BasicsSet = require("../lib/basicsSet");

describe("测试cacheNameTpl", function () {
  it("只传CACHE_PREFIX", async function () {
    const cacheName = await CacheNameTpl({
      CACHE_PREFIX: "test",
    });
    expect(cacheName).to.contain("const CACHE_PREFIX = 'test';");
  });
  it("传全部", async function () {
    const cacheName = await CacheNameTpl({
      CACHE_PREFIX: "test",
      CACHE_VERSION: "6666",
    });
    expect(cacheName).to.contain("const CACHE_VERSION = '6666';");
  });
});

describe("测试basicsSetTpl", function () {
  it("空值", function () {
    const basicsSet = BasicsSetTpl({
      urlsToCache: [],
      BLACKLIST: [],
    });
    expect(basicsSet).to.contain("const urlsToCache = [];");
  });
  it("传值", function () {
    const basicsSet = BasicsSetTpl({
      urlsToCache: ["iwan.qq.com"],
      BLACKLIST: ["iwan.qq.com/", "/honour/cgi/"],
    });
    expect(basicsSet).to.contain('const urlsToCache = ["iwan.qq.com"];');
  });
});

describe("basicsSet", function () {
  it("传CACHE_PREFIX", async function () {
    const basicsSet = await BasicsSet({
      CACHE_PREFIX: "test",
      urlsToCache: [],
      BLACKLIST: [],
    });
    expect(basicsSet).to.contain("const CACHE_PREFIX = 'test';");
    expect(basicsSet).to.contain("const urlsToCache = [];");
  });
  it("传CACHE_PREFIX, urlsToCache, BLACKLIST", async function () {
    const basicsSet = await BasicsSet({
      CACHE_PREFIX: "test",
      urlsToCache: ["iwan.qq.com"],
      BLACKLIST: ["iwan.qq.com/", "/honour/cgi/"],
    });
    expect(basicsSet).to.contain("const CACHE_PREFIX = 'test';");
    expect(basicsSet).to.contain('const urlsToCache = ["iwan.qq.com"];');
  });
});
