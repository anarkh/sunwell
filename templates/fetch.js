/**
 * @description：fetch监听，缓存策略路由，控制页面请求到具体的缓存策略选择
 */
const fetchFunList = require("../lib/fetchFunList");
const Silence = require("../lib/silence");
const Redirect = require("../lib/redirect");
const { lintUnused, rules } = require("../lib/utils");
let { UA } = require("../lib/utils");

const redirect = new Redirect();
const silence = new Silence();
module.exports = ({ strategy }) => {
  const supportStrategy = [
    "networkOnly",
    "cacheOnly",
    "networkFirst",
    "cacheFirst",
    "staleWhileRevalidate",
  ];
  const availableStrategy = [];
  let currentUrl = "";
  let funString = "";
  const strategyArr = [];

  /**
   * 获取用到的缓存方法，并判断当前设置缓存类型是否符合要求
   * 剔除问题配置
   *
   */
  try {
    const strategyMap = new Map(strategy);
    strategyMap.forEach((value, key) => {
      let valueString = "";
      let item = value;
      if (typeof item === "string") {
        valueString = `{"strategy":${value}}`;
        item = { strategy: value };
      } else {
        valueString = `{"strategy":${item.strategy}, "request":${JSON.stringify(
          item.request
        )}}`;
      }
      const itemStrategy = item.strategy;
      if (supportStrategy.indexOf(itemStrategy) > -1) {
        availableStrategy.push(itemStrategy);
        strategyArr.push(`[${JSON.stringify(key)}, ${valueString}]`);
      } else {
        console.warn(
          `${itemStrategy} strategy not support , please use ${supportStrategy.join(
            ","
          )}`
        );
      }
    });
  } catch (e) {
    throw new Error(`error : strategy-write-failure ${e.message}`);
  }
  /**
   * 写入策略方法
   *
   */
  try {
    new Set(availableStrategy).forEach((item) => {
      funString += `\n const ${item} = ${fetchFunList[item].toString()};`;
    });
  } catch (e) {
    throw new Error(`error : strategy-function-write-failure ${e.message}`);
  }

  /**
   * fetch生命周期方法，用于拦截页面请求
   * -对navigate页面请求，获取页面地址和浏览器UA
   * -对配置的重定向链接进行重定向请求处理
   * -检查请求是否符合缓存规则，并执行相应缓存策略
   *
   */
  const fetchSource = (event) => {
    const { request } = event;
    if (request.mode === "navigate") {
      currentUrl = request.url;
      UA = request.headers.get("user-agent");
    }
    const redirectUrl =
      typeof redirect === "object" ? redirect.getTarget(request.url) : null;
    if (redirectUrl) {
      event.respondWith(fetch(redirectUrl));
    } else if (request.method === "GET") {
      silence.silenceStart(request);
      for (const [key, value] of strategy) {
        if (rules.some((element) => element(key, request))) {
          const response = value.strategy.call(this, event, value.request);
          event.respondWith(response);
          break;
        }
      }
    }
  };
  lintUnused(UA, currentUrl);

  return `
        ${funString}
        let strategy = new Map([${strategyArr.join(",")}]);
        let rules = [${rules}];
        self.addEventListener('fetch',${fetchSource.toString()});
    `;
};
