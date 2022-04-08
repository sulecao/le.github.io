## webpack 是什么？

中文网站:<https://webpack.docschina.org>

本质上，`webpack` 是一个现代 `JavaScript` 应用程序的静态模块打包器(module bundler)。当 webpack 处理应用程序时，它会递归地构建一个依赖关系图(dependency graph)，其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个 bundle。

## 安装

```shell
 npm install -D webpack webpack-cli
 npm install -D webpack@4 webpack-cli@3
```

webpack-cli : 提供 webpack 命令、工具

webpack : webpack 代码

## 使用

##### 方法一

```bash
./node_modules/.bin/webpack

// 查看版本
./node_modules/.bin/webpack -v
```

##### 方法二

编辑 `package.json` 的 `scripts` 来简化输入

```json
// package.json
{
 ...,
 "scripts": {
  "start": "webpack" // scripts 中可以定位到 ./node_modules/.bin/ 目录下
 }
}
```

```js
//scripts 中使用 test、start、restart、stop 命名的时候，可以在调用的时候省略 run，即直接 npm start
npm start
```

##### 方法三

通过 `npx` 也可以帮助我们定位命令到 `./node_modules/.bin/` 目录下

> 注：npm5.2+ 增加，如果没有，可以使用 npm i -g npx 来安装

```bash
npx webpack
```

## 打包模块

#### 默认打包

跟上一个入口文件路径`webpack` 会从指定的入口文件开始分析所有需要依赖的文件，然后把打包成一个完整文件。

会使用 `webpack` 默认的配置对模块文件进行打包，并把打包后的文件输出到默认创建的 `./dist` 目录下，打包后的文件名称默认为 `main.js`。

```bash
npx webpack ./js/index.js
```

## 打包配置

`webpack` 命令在运行的时候，默认会读取运行命令所在的目录下的 `webpack.config.js` 文件。

也可以通过 `—config` 选项来指定配置文件路径：

```shell
webpack --config ./configs/my_webpack.config.js
```

```javascript
module.exports = {
  ... //配置项
}
```

### mode

模式 : `"production" | "development" | "none"`

不同的模式下，webpack设置了不同的默认配置，打包的时候进行一些对应的优化。

```bash
module.exports = {
  mode: 'production'
}
```

### entry

指定打包⼊口⽂文件，有三种不同的形式

一个入口、输出一个打包文件

```js
module.exports = {
  entry: './src/index.js'
}
```

多个入口、输出一个打包文件

```js
module.exports = {
  entry: [
    './src/index1.js',
    './src/index2.js',
  ]
}
```

多个入口、输出多打包文件，文件名为对象的key值。

```js
module.exports = {
  entry: {
    'index1': "./src/index1.js",
    'index2': "./src/index2.js"
  }
}
```

### output

默认放在dist目录下，可以通过output修改打包后的文件位置

```js
module.exports = {
  ...,
  output: {
    //path必须是绝对路径，__dirname当前目录
   path: path.resolve(__dirname, "./build"),
    filename: "bundle.js", //单文件出口可以指定固定文件名
    //多文件出口，name从entry的key取
 //filename: "[name].js"
 }
}
```

## WebpackDevServer

启动服务以后，`webpack` 不在会把打包后的文件生成到硬盘真实目录中，而是直接存在了内存中(同时虚拟了一个目录路径)

```bash
npm install --save-dev webpack-dev-server
```

启动命令：

```bash
npx webpack-dev-server
```

或者，`package.json` 中添加 `scripts`

```js
...,
"scripts": {
  "server": "webpack-dev-server"
}
```

webpack五可以使用webpack server

```js
...,
"scripts": {
  "server": "webpack server"
}
```

修改 `webpack.config.js`

```js
module.exports = {
  ...,
  devServer: {
   // 自动开启浏览器
   open: true,
   // 端口
   port: 8081
 }
}
```

### Proxy

##### 后端代码

```js
const Koa = require('koa');
const KoaRouter = require('koa-router');
const app = new Koa();
const router = new KoaRouter();

router.get('/info', async ctx => {
    ctx.body = {
        username: 'zMouse',
    }
})
app.use( router.routes() );
app.listen(8787);
```

##### 前端代码

```js
//会产生跨域请求
axios({
  url: 'http://localhost:8787/info'
}).then(res => {
  console.log('res',res.data);
})
//webpack配置后代码
axios({
  url: 'http://localhost:8787/api/info'
}).then(res => {
  console.log('res',res.data);
})
```

```js
module.exports = {
 ...,
 devServer: {
  proxy: {
   '/api': {
    target: 'http://localhost:8787',
    pathRewrite: {
     '^/api': ''
    }
   }
  }
 }
}
```

### Hot Module Replacement

实现不刷新页面，只更新变化的部分

开启 `HMR` 以后，当代码发生变化，`webpack` 即会进行编译，并通过 `websocket` 通知客户端(浏览器)，我们需要监听处理来自 `webpack` 的通知，然后通过 `HMR` 提供的  `API` 来完成我们的局部更新逻辑

```js
module.exports = {
  ...,
  devServer: {
   // 开启热更新，如果没写moudle.hot会回退为`live reload`
   hot:true,
   // 即使 HMR 不生效，也不去刷新整个页面(选择开启)
    hotOnly:true,
 }
}
```

一个js代码热更新示例：

当 fn1.js 模块代码发生变化的时候，把最新的 fn1 函数绑定到 box1.onclick 上

```js
//fn1.js
export default function() {
    console.log('start1!');
}
```

```js
import fn1 from './fn1.js';
box1.onclick = fn1;

if (module.hot) {//如果开启 HMR
    module.hot.accept('./fn1.js', function() {
      // 更新逻辑
      box1.onclick = fn1;
    })
}
```

`HMR` 以模块为单位，当模块代码发生修改的时候，通知客户端进行对应的更新，而客户端则根据具体的模块来更新我们的页面逻辑

当前一些常用的更新逻辑都有了现成的插件

**css热更新**

样式热更新，`style-loader` 中就已经集成实现

**react 热更新**

react 脚手架中已经集成

<https://github.com/gaearon/react-hot-loader>

**vue 热更新**

vue 脚手架中已经集成

<https://github.com/vuejs/vue-loader>

## sourceMap

<https://webpack.docschina.org/configuration/devtool/#devtool>

 `webpack` 会打包合并甚至是压缩混淆代码，所生成的代码运行在浏览器时不利于我们的调试和定位错误，

`sourceMap`是 记录了编译后代码与源代码的映射关系的文件

通过 `webpack` 的 `devtool` 选项来开启 `sourceMap`。

```js
module.exports = {
  mode: 'production',
  devtool: 'source-map',
  ...
}
```

编译后会为每一个编译文件生成一个对应的 `.map` 文件，同时在编译文件中添加一段对应的注释，和对应的 `map` 文件关联

```js
...
//# sourceMappingURL=main.js.map
```

```css
...
/*# sourceMappingURL=main.css.map*/
```

配置推荐：

```
devtool:"eval-cheap-module-source-map",// 开发环境
devtool:"source-map"||false,   // 生产环境
```

## Code Spliting

将代码分割到多个不同的bundle(打包后)文件中，可以通过按需加载等方式对资源进行加载

### 入口起点

通过设置多个入口文件的方式实现最简单的代码分割

```js
entry: {
  index: "./src/index.js",
  list: "./src/list.js",
},
output: {
  path: resolve(__dirname, "../dist"),
  // 多入口文件的filename不能写死名称，需要通过[name]配置
  filename: "js/[name].js",
}
```

### 防止重复

如果只按上述配置，若index和list都使用了axios，都会把axios代码打包其中。

可以通过设置dependOn配置多个模块之间的共享文件，将共享的axios代码提取成一个单独文件。

```js
entry: {
  index: {
    import: "./src/index.js",
    dependOn: "axios",
  },
  list: {
   import: "./src/list.js",
   dependOn: "axios",
  },
  axios: "axios",
},
//需要设置runtimeChunk为single，在所有生成 chunk 之间共享运行时文件，否则axios会生成两个实例
optimization: {
  runtimeChunk: 'single',
},
```

#### SplitChunksPlugin

将公共的依赖模块提取到已有的入口chunk文件或新的chunk文件当中

```js
entry: {
  index: "./src/index.js",
  list: "./src/list.js",
},
optimization: {
  splitChunks: {
    // async表示只从异步加载得模块（动态加载import()）里面进行拆分
    // initial表示只从入口模块进行拆分
    // all表示以上两者都包括
    chunks: "all",
  },
}
```

### 动态导入

通过`import()`动态导入模块，可以通过内联注释对chunk进行一些配置

[模块方法 | webpack 中文文档 (docschina.org)](https://webpack.docschina.org/api/module-methods/#magic-comments)

```js
import(/* webpackChunkName: 'data', webpackPreload: true*/ './data')
 .then(data => {
  console.log(data);
 })
```

### Prefetch`/Preload`

通过内联注释`webpackPrefetch`和`webpackPreload`两种资源提示告知浏览器对资源进行不同的加载处理

```js
const data = import(/* webpackChunkName: 'data', webpackPreload: true */ './data.js')
const data = import(/* webpackChunkName: 'data', webpackPrefetch: true */ './data.js')
```

 与 prefetch 指令相比，preload 指令有许多不同之处：

 preload chunk 会在父 chunk 加载时，以并行方式开始加载。prefetch chunk 会在父 chunk 加载结束后开始加载。
 preload chunk 具有中等优先级，并立即下载。prefetch chunk 在浏览器闲置时下载。
 preload chunk 会在父 chunk 中立即请求，用于当下时刻。prefetch chunk 会用于未来的某个时刻。

## 外部扩展

通过externals配置在输出的bundle中排除某些依赖，这些依赖将会在用户环境中所包含。

```js
externals: 
  lodash: '_'
},
```

## tree shaking

将上下文中的dead-code移除，就像摇树上的枯叶使其掉落一样

```js
optimization: {
  usedExports: true,
}
```

## 配置合并

```
npm install webpack-merge -D
```

```js
const merge = require("webpack-merge") 
const commonConfig = require("./webpack.common.js") 
const devConfig = { ... }
module.exports = merge(commonConfig,devConfig)
```
