const writeWsFile = require("./core/writeWsFile");
module.exports = async ({
  swDest,
  CACHE_PREFIX = "sunwell",
  CACHE_VERSION = 0,
  urlsToCache = [],
  BLACKLIST = [],
  redirectSource = "",
  refreshSource = "",
  uaKey = "userAgent",
  strategy = [],
  error,
}) => {
  await writeWsFile({
    swDest,
    CACHE_PREFIX,
    CACHE_VERSION,
    urlsToCache,
    BLACKLIST,
    redirectSource,
    refreshSource,
    uaKey,
    strategy,
    error,
  });
};
