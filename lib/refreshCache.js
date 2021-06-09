/**
 * @description：缓存刷新类，根据配置主动触发更新sw缓存
 *
 */
const { CACHE_PREFIX, CACHE_VERSION, CACHE_NAME, rules } = require("./utils");
const { fetchUrl, fetchAndCachePut } = require("./fetchAndCache");
const strategy = new Map();
function RefreshCache(source) {
  this.interface = source;
  this.refreshList = [];
  this.configList = [];
  /**
   * 获取缓存配置
   *
   */
  this.getConfigResponse = async () => {
    let list = [];
    if (!this.interface) {
      return list;
    }
    const configs = await fetchUrl(new Request(this.interface));
    if (configs instanceof Response && configs.body) {
      const body = await configs.json();
      body.data && (list = body.data);
    }

    return list;
  };
  /**
   * 比较本次和上次缓存更新列表，返回新增缓存更新项
   *
   * @param configList
   */
  this.filterNew = (configList) => {
    const list = [];
    configList.forEach((value) => {
      const isSame = (element) =>
        element._id === value._id &&
        Date.parse(element._mtime) >= Date.parse(value._mtime);
      const index = this.refreshList.findIndex(isSame);
      if (index < 0) {
        list.push(value);
      }
    });

    return list;
  };
  /**
   * 根据缓存配置，获取本项目和版本的缓存列表
   *
   */
  this.getConfigList = async () => {
    const config = await this.getConfigResponse();
    const list = [];
    config.forEach((value) => {
      if (
        value.project === CACHE_PREFIX &&
        ["", CACHE_VERSION].includes(value.version)
      ) {
        list.push(value);
      }
    });
    this.configList = this.filterNew(list);
  };
  /**
   * 根据需要更新的列表，从本地缓存列表中返回已缓存的request列表
   *
   * @param cacheList
   */
  this.filterRequest = (cacheList) => {
    const matchList = [];
    this.configList.forEach((value) => {
      cacheList.forEach((request) => {
        const filterDate = matchList.filter(
          (element) => element.url === request.url
        );
        if (!filterDate.length && new RegExp(value.regexp).test(request.url)) {
          matchList.push({ request: request.clone(), time: value._mtime });
        }
      });
    });

    return matchList;
  };
  /**
   * 获取本地缓存列表
   *
   */
  this.getMatchRequest = async () => {
    await this.getConfigList();
    if (!this.configList.length) {
      return [];
    }
    const cache = await caches.open(CACHE_NAME);
    const cacheList = await cache.keys();
    if (!cacheList.length) {
      return [];
    }

    return this.filterRequest(cacheList);
  };
  /**
   * 获取配置的请求头
   *
   */
  this.getHeader = (request) => {
    for (const [key, value] of strategy) {
      if (rules.some((element) => element(key, request))) {
        return value.request;
      }
    }
  };
  /**
   * 根据缓存时间判断是否需要重新请求
   *
   */
  this.fetch = async (obj, option) => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(obj.request);
    if (cachedResponse.headers.has("date")) {
      const dateHeader = cachedResponse.headers.get("date");
      const parsedDate = Date.parse(dateHeader);
      if (parsedDate > obj.time) {
        return true;
      }
    }

    await fetchAndCachePut(obj.request, option);
  };
  /**
   * 重新请求并缓存资源
   *
   */
  this.refresh = async () => {
    const list = await this.getMatchRequest();
    const promiseArr = [];
    if (list.length > 0) {
      list.forEach((obj) => {
        const option = this.getHeader(obj.request);
        promiseArr.push(this.fetch(obj, option));
      });
      Promise.all(promiseArr)
        .then(() => {
          this.refreshList = this.configList;
        })
        .catch(console.log);
    }
  };
}
module.exports = RefreshCache;
