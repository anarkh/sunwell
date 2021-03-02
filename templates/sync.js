/**
 * @description：sync 事件，后台同步功能，可以在浏览器网页关闭后再后台继续执行相关逻辑
 *
 */
const RefreshCache = require("../lib/refreshCache");
const refreshCache = new RefreshCache();
const clients = {};
module.exports = ({ refreshSource }) => {
  /**
   * 刷新缓存
   *
   */
  const refreshCacheManager = async () => {
    await refreshCache.refresh();
  };
  /**
   * sync方法，接收到tag为unload的事件，然后判断是否还有控制页面，知道没有控制页面则调用刷新
   * 如为[]，则所有请求适用
   *
   */
  const syncSource = async () => {
    const allClients = await clients.matchAll();
    if (!allClients.length) {
      await refreshCacheManager();
    }
  };
  const sync = (event) => {
    if (event.tag === "refreshCache") {
      event.waitUntil(syncSource(event));
    }
  };
  /**
   * 如果浏览器不支持后台同步，则尝试从message中获取
   *
   */
  const message = (event) => {
    if (event.data === "refreshCache") {
      event.waitUntil(refreshCacheManager(event));
    }
  };
  if (refreshSource) {
    return `
    ${RefreshCache.toString()}
    const refreshCache = new RefreshCache('${refreshSource}');
    const refreshCacheManager = ${refreshCacheManager.toString()};
    const syncSource = ${syncSource.toString()};
    self.addEventListener('sync', ${sync.toString()});
    self.addEventListener('message', ${message.toString()});
    `;
  }

  return "";
};
