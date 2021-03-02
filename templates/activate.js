/**
 * @description：activate 生命周期
 */
const Redirect = require("../lib/redirect");
const { CACHE_NAME, CACHE_PREFIX } = require("../lib/utils");
const redirect = new Redirect();
module.exports = () => {
  /**
   * 查找Cache Storage中旧的缓存库，并删除，防止存储溢出
   * 判断当前浏览器是否支持cookieStore，如支持：
   * -初始化当前用户的重定向列表
   * -订阅vuserid和vqq_vuserid的cookie变化监听
   *
   */
  const activateSource = async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map((cacheName) => {
        if (
          cacheName &&
          cacheName !== CACHE_NAME &&
          cacheName.indexOf(CACHE_PREFIX) !== -1
        ) {
          return caches.delete(cacheName);
        }

        return false;
      })
    );
    if (self.registration.cookies && typeof redirect === "object") {
      await redirect.init();
      await self.registration.cookies.subscribe([
        { name: "vuserid" },
        { name: "vqq_vuserid" },
      ]);
    }
  };
  const activate = (event) => {
    event.waitUntil(activateSource());
  };
  /**
   * 如用户登陆态改变，则初始化重定向列表
   *
   */
  const cookieSource = async () => {
    await redirect.init();
  };
  const cookiechange = (event) => {
    event.waitUntil(cookieSource(event));
  };

  return `
    const activateSource = ${activateSource.toString()};
    self.addEventListener('activate', ${activate.toString()});
    const cookieSource = ${cookieSource.toString()};
    self.addEventListener('cookiechange', ${cookiechange.toString()});
    `;
};
