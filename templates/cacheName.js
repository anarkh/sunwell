/**
 * @description：缓存名称设置
 */
module.exports = async ({ CACHE_PREFIX, CACHE_VERSION }) => {
  const PREFIX = CACHE_PREFIX || "sunwell";
  let version = 0;
  /**
   * 设置缓存库名称和版本
   * 如果未自定义版本号，则使用时间戳自增
   *
   */
  if (CACHE_VERSION) {
    version = CACHE_VERSION;
  } else {
    version = Math.floor(Date.now() / 60000);
  }
  const CACHE_NAME = `${PREFIX}_${version}`;

  return `
        const CACHE_PREFIX = '${PREFIX}';
        const CACHE_VERSION = '${version}';
        const CACHE_NAME = '${CACHE_NAME}';
    `;
};
