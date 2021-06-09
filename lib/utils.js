/**
 * @description：工具方法集
 */
const fs = require("fs");
const upath = require("upath");

const UA = "navigator.userAgent";
const BLACKLIST = [];
const CACHE_PREFIX = "";
const CACHE_NAME = "";
const currentUrl = "";
const fRequest = (request) => request;
const lintUnused = () => {};
/**
 * 缓存路由规则，根据相应的配置去判断当前请求是否使用缓存配置
 *
 */
const rules = [
  (key, request) =>
    typeof key === "object" &&
    key.identity &&
    request[key.identity] === key.status,
  (key, request) =>
    typeof key === "object" && key.url && new RegExp(key.url).test(request.url),
  (key, request) => typeof key === "function" && key(request.clone()),
  (key) => key === "default",
];
/**
 * node版本比较，把传入的版本号与运行环境的版本号就行对比
 * 传入版本还大于运行版本，则返回false，反之则返回true
 *
 * @return boolean
 * @param v
 */
const atLeastNode = (v) => {
  let version = v;
  const sVersion = process.versions.node.split(".").map((x) => parseInt(x, 10));
  version = version.split(".").map((x) => parseInt(x, 10));

  return (
    sVersion[0] > version[0] ||
    (sVersion[0] === version[0] &&
      (sVersion[1] > version[1] ||
        (sVersion[1] === version[1] && sVersion[2] >= version[2])))
  );
};
/**
 * 创建文件夹方法，并且兼容了低版本的node，对各种错误抛出异常情况
 *
 * @return boolean
 * @param input
 */
const mkDir = async (input) => {
  if (atLeastNode("10.12.0")) {
    const pth = upath.resolve(input);

    return fs.mkdir(
      pth,
      {
        recursive: true,
      },
      () => {}
    );
  }
  const make = async (pth) => {
    try {
      await fs.mkdir(
        pth,
        {
          recursive: true,
        },
        () => {}
      );
    } catch (e) {
      if (e.code === "EPERM") {
        throw e;
      }

      if (e.code === "ENOENT") {
        if (upath.dirname(pth) === pth) {
          throw new Error(
            `operation not permitted, mkdir '${pth}'    ${e.message}`
          );
        }
        if (e.message.includes("null bytes")) {
          throw e;
        }
        await make(upath.dirname(pth));

        return await make(pth);
      }

      const stats = await fs.stat(pth);
      if (!stats.isDirectory()) {
        throw new Error("The path is not a directory");
      }
    }
  };

  return make(upath.resolve(input));
};

module.exports = {
  UA,
  BLACKLIST,
  CACHE_PREFIX,
  CACHE_NAME,
  currentUrl,
  fRequest,
  lintUnused,
  rules,
  atLeastNode,
  mkDir,
};
