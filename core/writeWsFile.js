/**
 * @description：文件创建和写入
 */
const fs = require("fs");
const upath = require("upath");
const { mkDir } = require("../lib/utils");
const basicsSetLib = require("../lib/basicsSet");
const lifeCycleLib = require("../lib/lifeCycle");
module.exports = async ({
  swDest,
  CACHE_PREFIX,
  CACHE_VERSION,
  urlsToCache,
  BLACKLIST,
  strategy = {},
  error,
  redirectSource,
  refreshSource,
}) => {
  const outputDir = upath.dirname(swDest);
  try {
    await mkDir(outputDir);
  } catch (e) {
    throw new Error(`error : unable-to-make-sw-directory  ${e.message}`);
  }
  /**
   * 基本信息组装，包括方法库，基数
   *
   */
  const basicsSet = await basicsSetLib({
    swDest,
    CACHE_PREFIX,
    CACHE_VERSION,
    urlsToCache,
    BLACKLIST,
    redirectSource,
  });
  /**
   * 生命周期组装：
   * -install
   * -activate
   * -fetch
   * -cookiechange
   * -error
   *
   */
  const lifeCycle = await lifeCycleLib({
    strategy,
    refreshSource,
    error,
  });
  const content = basicsSet + lifeCycle;
  try {
    await fs.writeFileSync(swDest, content);
  } catch (e) {
    if (e.code === "EISDIR") {
      throw new Error("error : sw-write-failure-directory");
    }
    throw new Error(`error : sw-write-failure ${e.message}`);
  }
};
