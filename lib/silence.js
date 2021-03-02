/**
 * @description：上报监听启动上报监听器
 */
const Report = require("./report");
const report = new Report();

function Silence() {
  this.noiseTime = "";
  this.noiseT = null;
  /**
   * 监听service worker是否已经开始去拦截请求
   *
   */
  this.silenceStart = () => {
    clearTimeout(this.noiseT);
    this.watchMan();
    this.noiseTime = new Date().getTime();
  };
  /**
   * 监听页面加载是否暂时停止
   *
   */
  this.watchMan = () => {
    this.noiseT = setTimeout(() => {
      if (new Date().getTime() - this.noiseTime > 500) {
        report.reportCacheNum();
      }
    }, 1000);
  };
}

module.exports = Silence;
