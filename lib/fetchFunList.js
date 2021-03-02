/**
 * @description：核心缓存策略方法集
 */
const { getCache, fetchAndCachePut } = require("./utils");
/**
 * 策略：只走网络
 *
 * @param event event对象
 * @param options 参数修改
 */
const networkOnly = async (event, options) =>
  await fetchAndCachePut(event.request, options);
/**
 * 策略：只走缓存
 *
 * @param event event对象
 */
const cacheOnly = async (event) => await getCache(event.request);
/**
 * 策略：网络优先
 * 在网络请求失败的情况下进行缓存查找，如果存在，返回缓存
 *
 * 注意事项：
 * - 请求失败包括response的Page-Tag参数不包括error，防止node端返回错误页面而错误认为页面返回成功
 *
 * @param event event对象
 * @param options 参数修改
 */
const networkFirst = async (event, options) => {
  const req = event.request;
  const requestToCache = req.clone();
  let response = null;
  try {
    response = await fetchAndCachePut(req, options);
    if (
      response.status !== 200 ||
      response.headers.get("Page-Tag") === "error"
    ) {
      response = (await getCache(requestToCache)) || response;
    }
  } catch (e) {
    response = await getCache(requestToCache);
  }

  return response;
};
/**
 * 策略：缓存优先
 * 优先查找缓存，如存在则直接返回，否则去进行网络请求
 *
 * @param event event对象
 * @param options 参数修改
 */
const cacheFirst = async (event, options) => {
  const req = event.request;
  let response = await getCache(req);
  if (!response) {
    response = await fetchAndCachePut(req, options);
  }

  return response;
};
/**
 * 策略：后台缓存刷新
 * 优先查找缓存，如存在则返回，并且去进行网络请求更新缓存
 * 如缓存不存在，进行网络请求并更新缓存
 *
 * @param event event对象
 * @param options 参数修改
 */
const staleWhileRevalidate = async (event, options) => {
  const req = event.request;
  const fetchAndCachePromise = fetchAndCachePut(req, options);
  let response = await getCache(req);
  if (!response) {
    response = await fetchAndCachePromise;
  }

  return response;
};

module.exports = {
  networkOnly,
  cacheOnly,
  networkFirst,
  cacheFirst,
  staleWhileRevalidate,
};
