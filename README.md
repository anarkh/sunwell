# 用于 service 自动生成工具

## 用法：

文档地址：

## 参数：

### swDest

`类型：String `

设置生成文件的目录地址

例如：'./static/sw.js'

### CACHE_PREFIX

`类型：String `

cache storage 缓存名的前缀，建议使用项目名称

默认：'sunwell'

### CACHE_VERSION

`类型：String `

cache storage 缓存名的后缀，建议不填写，会取当前时间戳的分钟位与 CACHE_PREFIX 共同组成缓存名称

例如：sunwell_26460227

### urlsToCache

`类型：Array `

设置缓存的请求，不填写默认为[]，表示所有请求都将被缓存

如果只需要缓存特定请求，请以数组形式传入

### BLACKLIST

`类型：Array `

设置缓存黑名单，不填写默认为[]，表示所有请求都将被缓存

如果想让某些请求不缓存，请以数组的形式传入，会以正则匹配

例如：

```
[
     'iwan.qq.com/',
     '/community/cgi/'
]
```

### strategy

`类型：Array `

缓存策略，自定义页面请求所使用的缓存策略，目前支持五种：

- networkOnly -- 只走网络策略
- cacheOnly -- 只走缓存策略
- networkFirst -- 请求优先策略
- cacheFirst -- 缓存优先策略
- staleWhileRevalidate -- 读取缓存，但同时进行请求更新

接受的参数是以数组的形式传入，每个策略中都为两个参数，

第一个参数为策略选择判断：

- 以对象为模型的值判断，取`request[identity]`与`status`进行比较
- 以正则表达式适配 url 为格式的判断，传入正则字符串进行策略选择
- 以传入方法进行自定义返回判断，参数为`request`对象，通过定义方法 `(request)=>{return true}` 判断匹配缓存策略

第二个参数传入需要执行的缓存策略，请严格填下支持的缓存策略，否则将会忽略此条信息

- 具体参数为对象模式，`strategy`表示要执行的缓存策略，`request`可以为此策略的请求修改请求头
- 需要注意的是`user-agent`参数，在某些情况下（例如 app 的 webview） sw 无法获取到 webview 的 ua，此选项可以 sw 的进程里去设置发送给服务器请求的 ua 的 key 值，比如设置`'user-agent' : 'userAgent'`，具体表现为请求头会添加 userAgent 参数，期值为浏览器的 ua。
- 另外判断还接受字符串类型的值`default`，执行兜底的策略

例如：

```javascript
strategy: [
  [{ identity: "mode", status: "navigate" }, "networkFirst"],
  [{ identity: "mode", status: "same-origin" }, "networkOnly"],
  ["default", "cacheFirst"],
];
```

### error

`类型：Function `

错误处理函数，可以监控到 sw 执行报错时的堆栈信息，会以 enevt 参数传递给函数

例如：

```javascript
error: (event) => {
  console.log(event);
};
```

### redirectSource

`类型：String`

白名单重定向配置数据获取地址

如果想对页面的静态资源根据白名单进行重定向，可以配置此地址，然后在配置中进行白名单配置

例如：

```javascript
redirectSource: url,
```

tarckId：登录态的 vuserid，sunwell 会根据这个字段判断当前用户是否在白名单中
origin：页面请求连接

### refreshSource

`类型：String`

主动刷新缓存配置数据获取地址

可以根据配置对 cache storage 中的缓存进行主动刷新，防止上线了同名新的静态资源的情况下缓存无法更新

例如：

```javascript
refreshSource: url,
```

sunwell 会根据配置的 project 和 version 来匹配 CACHE_PREFIX 和 CACHE_VERSION，对符合条件的配置项根据 regexp 进行缓存连接的正则匹配，对匹配成功的数据进程重新请求并缓存
