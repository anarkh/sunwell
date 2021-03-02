/**
 * @description：install 事件，它发生在浏览器安装并注册 Service Worker 时event.waitUtil 用于在安装成功之前执行一些预装逻辑
 * 但是建议只做一些轻量级和非常重要资源的缓存，减少安装失败的概率安装成功后 ServiceWorker 状态会从 installing 变为 installed
 */
const { CACHE_NAME, urlsToCache } = require("../lib/utils");
module.exports = () => {
  /**
   * install生命周期方法，传教缓存库，并添加白名单
   * 如为[]，则所有请求适用
   *
   */
  const installSource = async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urlsToCache);
  };
  const install = (event) => {
    event.waitUntil(installSource());
  };

  return `
    const installSource = ${installSource.toString()};
    self.addEventListener('install', ${install.toString()});
    `;
};
