/**
 * @description：基础信息设置
 */
const cacheNameTpl = require("../templates/cacheName");
const basicsSetTpl = require("../templates/basicsSet");
module.exports = async ({
  CACHE_PREFIX,
  CACHE_VERSION,
  urlsToCache,
  BLACKLIST,
  redirectSource,
}) => {
  let cacheName;
  let basicsSet;
  try {
    cacheName = await cacheNameTpl({
      CACHE_PREFIX,
      CACHE_VERSION,
    });
  } catch (e) {
    throw new Error(`error : cacheNameTpl-failure ${e.message}`);
  }
  try {
    basicsSet = basicsSetTpl({
      urlsToCache,
      BLACKLIST,
      redirectSource,
    });
  } catch (e) {
    throw new Error(`error : basicsSetTpl-failure ${e.message}`);
  }

  return cacheName + basicsSet;
};
