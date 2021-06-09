/**
 * @description：请求和缓存相关方法
 */
const { UA, BLACKLIST, CACHE_NAME } = require("./utils");
const Report = require("./report");

const report = new Report();
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
  modifyRequest,
  putCache,
  getCache,
  fetchUrl,
  fetchAndCachePut,
};
