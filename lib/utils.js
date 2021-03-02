/**
 * @description：工具方法集
 */
const fs = require("fs");
const upath = require("upath");
const Report = require("./report");

const report = new Report();
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

/**
 * 对发送的Request对象进行自定义配置，包括可修改的参数和Header的修改
 * 需要注意的是传入user-agent参数的value值并非直接修改user-agent，
 * 而是对Header添加一直键值对，记录页面正确的user-agent。
 *
 * 注意事项：
 * - service worker进程独立，无法获取页面的user-agent
 * - fetch会新建Header，使用sw进程的user-agent，且无法修改
 * - 新增Header字段传入页面user-agent，再在node端进行匹配修改
 *
 * @return {Request}
 * @param request 需要进行修改的Request对象
 * @param options 修改参数
 */
const modifyRequest = (request, options) => {
  let rRequest = request;
  if (request instanceof Request && options) {
    const credentials =
      options.credentials || request.credentials || "same-origin";
    const reqOpt = {
      mode: options.mode || request.mode || null,
      credentials,
      signal: options.signal || request.signal || null,
      referrer: request.referrer,
      destination: request.destination,
    };
    const methods = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"];
    const method = options.method || request.method || "GET";
    const upcased = method.toUpperCase();
    reqOpt.method = methods.indexOf(upcased) > -1 ? upcased : method;
    reqOpt.mode = reqOpt.mode === "navigate" ? "same-origin" : reqOpt.mode;

    if (options.headers) {
      const h = options.headers;
      if (h["user-agent"]) {
        h[h["user-agent"]] = UA;
        delete h["user-agent"];
      }
      reqOpt.headers = new Headers(h);
    }
    rRequest = new Request(request.url, reqOpt);
  }

  return rRequest;
};
/**
 * 添加缓存到cache storage，并且过滤掉黑名单的链接和POST请求
 *
 * @param request Request对象
 * @param response Response对象
 */
const putCache = async (request, response) => {
  let shouldCache = true;
  for (let i = 0; i < BLACKLIST.length; ++i) {
    const ignore = new RegExp(BLACKLIST[i]);
    if (ignore.test(request.url)) {
      shouldCache = false;
      break;
    }
  }
  if (request.method === "POST") {
    shouldCache = false;
  }
  if (shouldCache && response.body !== null && response.status === 200) {
    report.addAllNum();
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response);
  }
};
/**
 * 获取请求的cache storage缓存
 * 对使用缓存的数据进行量和大小进行统计
 *
 * @param request Request对象
 */
const getCache = async (request) => {
  const response = await caches.match(request);
  if (response) {
    report.addSuccessNum();
    report.addAllNum();
    report.addCacheSize(
      Math.ceil(response.headers.get("Content-Length") / 1024) || 0
    );
  }

  return response;
};

/**
 * 请求数据，在请求失败的时候进行兜底处理，防止因为参数修改而失败
 *
 * @param request Request对象
 * @param options Response对象
 */
const fetchUrl = async (request, options) => {
  let { url } = request;
  try {
    return await fetch(modifyRequest(request, options));
  } catch (e) {
    if (url.indexOf("http://") !== -1) {
      url = url.replace("http://", "https://");
    }

    return await fetch(url, {
      cache: "no-cache",
      credentials: "same-origin",
      method: request.method,
      mode: "no-cors",
    });
  }
};

/**
 * 请求数据，并且在请求完成后进行缓存
 *
 * @param request Request对象
 * @param options 参数修改
 */
const fetchAndCachePut = async (request, options) => {
  const response = await fetchUrl(request, options);
  const responseClone = response.clone();
  await putCache(request, responseClone);

  return response;
};

module.exports = {
  UA,
  CACHE_PREFIX,
  CACHE_NAME,
  currentUrl,
  fRequest,
  lintUnused,
  rules,
  atLeastNode,
  mkDir,
  modifyRequest,
  putCache,
  getCache,
  fetchUrl,
  fetchAndCachePut,
};
