/**
 * @description：静态请求重定向类，可以根据白名单，重定向页面的请求资源
 *
 */
const { fetchAndCachePut } = require("./utils");
function Redirect(source) {
  this.vid = "";
  this.mapping = [];
  this.targetList = [];
  this.interface = source;
  this.getVid = () => this.vid;
  /**
   * 初始化配置信息
   *
   */
  this.init = async () => {
    await this.getCookie();
    await this.getMapping();
    this.getMatch();
  };
  /**
   * 获取用户cookie中的vuserid
   *
   */
  this.getCookie = async () => {
    if (typeof cookieStore === "object") {
      // eslint-disable-next-line no-undef
      const vuseridObj =
        (await cookieStore.get("vuserid")) ||
        (await cookieStore.get("vqq_vuserid"));
      this.vid = vuseridObj && vuseridObj.value;
    }
  };
  /**
   * 获取配置的需要重定向表
   *
   */
  this.getMapping = async () => {
    if (!this.interface) {
      return [];
    }
    const mapping = await fetchAndCachePut(new Request(this.interface));
    if (mapping instanceof Response && mapping.body) {
      const body = await mapping.json();
      body.data && (this.mapping = body.data);
    }
  };
  /**
   * 根据用户登陆态，筛选其中符合当前用户的配置信息
   *
   */
  this.getMatch = () => {
    this.targetList = [];
    this.mapping.forEach((value) => {
      if (value.trackId === this.vid) {
        this.targetList.push({
          origin: value.origin,
          target: value.target,
        });
      }
    });
  };
  /**
   * 获取匹配当前请求的重定向链接
   *
   * @param url
   */
  this.getTarget = (url) => {
    for (let i = 0, l = this.targetList.length; i < l; i++) {
      const target = this.targetList[i];
      if (url.indexOf(target.origin) > -1) {
        return target.target;
      }
    }
  };
}
module.exports = Redirect;
