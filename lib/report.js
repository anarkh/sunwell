/**
 * @description：上报方法
 */
const { UA, CACHE_PREFIX, CACHE_VERSION, currentUrl } = require("../lib/utils");
function Report() {
  this.successNum = 0;
  this.allNum = 0;
  this.cacheSize = 0;
  this.addSuccessNum = (num) => {
    this.successNum += num || 1;
  };
  this.addAllNum = (num) => {
    this.allNum += num || 1;
  };
  this.addCacheSize = (num) => {
    this.cacheSize += num || 1;
  };
  /**
   * 获取页面的标记，用于进行上报分析
   *
   * @param url
   */
  this.getPage = (url) => {
    const path = new URL(url).pathname;
    const pathArr = path.split("/");

    return pathArr.pop() || "";
  };
  /**
   * 上报基本方法
   *
   * @param options
   */
  this.reportAtta = (options) => {
    const ro = Object.assign(
      {
        projectname: CACHE_PREFIX,
        version: CACHE_VERSION,
        ua: UA,
        url: currentUrl,
        page: this.getPage(currentUrl),
      },
      options
    );
    let reportParams = "";
    Object.keys(ro).forEach((item) => {
      reportParams += `${item}=${ro[item]}&`;
    });
    fetch(`https://h.trace.qq.com/kv?${reportParams}_dc=${Math.random()}`, {
      mode: "no-cors",
    });
  };
  /**
   * 读取缓存上报上报的关键字段包括：
   * - 成功使用缓存的请求数量
   * - 总拦截请求数量
   * - 返回缓存数据大小
   *
   */
  this.reportCacheNum = () => {
    if (this.successNum > 0 || this.allNum > 0) {
      this.reportAtta({
        attaid: "",
        token: "",
        successnum: this.successNum,
        allnum: this.allNum,
        cachesize: this.cacheSize,
      });
    }
    this.allNum = 0;
    this.cacheSize = 0;
    this.successNum = 0;
  };
  /**
   * 错误信息上报
   *
   * @param options
   */
  this.reportError = (options) => {
    const ro = Object.assign(
      {
        attaid: "",
        token: "",
      },
      options
    );
    this.reportAtta(ro);
  };
}
module.exports = Report;
