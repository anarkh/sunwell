/**
 * @description：基础信息设置
 */
const report = require("../lib/report");
const silence = require("../lib/silence");
const redirect = require("../lib/redirect");
const { UA } = require("../lib/utils");
const {
  modifyRequest,
  putCache,
  getCache,
  fetchUrl,
  fetchAndCachePut,
} = require("../lib/fetchAndCache");
module.exports = ({ urlsToCache, BLACKLIST, redirectSource }) => {
  let funString = "";
  const preFun = {
    modifyRequest,
    putCache,
    getCache,
    fetchUrl,
    fetchAndCachePut,
  };
  /**
   * 依次写入下列方法集：
   * -上报对象
   * -页面加载监听器
   * -工具方法集
   * -重定向功能对象
   *
   */
  try {
    funString += `\n ${report.toString()} \n const report = new Report();`;
    funString += `\n ${silence.toString()} \n const silence = new Silence();`;
    Object.keys(preFun).forEach((item) => {
      funString += `\n const ${item} = ${preFun[item].toString()};`;
    });
    if (redirectSource) {
      funString += `\n ${redirect.toString()} \n const redirect = new Redirect('${redirectSource}');`;
    }
  } catch (e) {
    throw new Error(`error : need-function-write-failure ${e.message}`);
  }

  return `
        const urlsToCache = ${JSON.stringify(urlsToCache)};
        const BLACKLIST = ${JSON.stringify(BLACKLIST)};
        let UA = ${UA};
        let currentUrl = '';
        ${funString}
    `;
};
