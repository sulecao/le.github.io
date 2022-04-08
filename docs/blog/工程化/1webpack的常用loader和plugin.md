 `webpack` 默认情况下只能处理 `js` 模块，如果需要处理其它类型的模块，则需要使用它提供的一些其它功能

- `loaders`：webpack 可以使用 loader 来预处理文件，处理非 js 类型的模块，这允许你打包除 JavaScript 之外的任何静态资源。
- `plugins`：主要是扩展 `webpack` 本身的一些功能。插件可以运行在 `webpack` 的不同阶段（钩子 / 生命周期）。

## Loaders

<https://webpack.js.org/loaders/>

当 `webpack` 碰到不识别的模块的时候，`webpack` 会在配置的 `module` 中进行该文件解析规则的查找

- `rules` 就是我们为不同类型的文件定义的解析规则对应的 loader，它是一个数组
- 通过 test 选项来匹配需要处理的文件，通常通过正则的方式来匹配文件后缀类型
- `use` 针对匹配到文件类型，调用对应的 `loader` 进行处理

```js
module.exports = {
    module: {
        rules: [
            {
                test: /\.xxx$/,
                use: {
                    loader: 'xxx-loader'
                }
            }
        ]
    }
}
```

## 处理js相关

##### Babel工具集：<https://www.babeljs.cn/>

##### 提供语法转换和Polyfill 方式添加缺失的特性

### 高级语法转换

```js
npm install --save-dev babel-loader @babel/core @babel/preset-env
```

```js
        {
            test: /\.js$/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            },
            ]
        }
```

```js
//打包前代码
const a = () => {
    console.log('a');
}
//打包后代码
eval("var a = function a() {\n  console.log('a');\n};\n\n//# sourceURL=webpack://test/./src/index.js?");
```

### Polyfill 方式添加缺失的特性

注意是需要打包到最终代码包里的

```js
npm install --save @babel/polyfill
```

```js
//打包前代码
import "@babel/polyfill";
new Promise(()=>{})
//打包后代码包里会包含Promise的polyfill
...polyfill代码
eval("new Promise(function () {});\n\n//# sourceURL=webpack://test/./src/index.js?");
```

### 按需引入特性Polyfill

##### 默认会把所有的Polyfill都导入进包里，实际上我们可能只使用了部分特性

##### useBuiltIns

##### entry：需要在入口导入文件，会自动检测按需导入

##### usage：不用再在主文件入口引入@babel/polyfill

```js
        {
            test: /\.js$/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: [
                        ['@babel/preset-env',
                            {
                                "useBuiltIns": "usage"
                            }
                        ]
                    ]
                }
            },
            ]
        }]
```

##### @babel/polyfill默认是安装的2.x版本的core-js，但是js特性一直在新增，如果需要，可以直接安装core-js获得最新的全部poliyfil

```js
npm i core-js
npm i regenerator-runtime
```

具体使用介绍去github搜索查看。

```js
// polyfill 仅稳定的特性 - ES 和 web 标准：
import "core-js/stable";
import "regenerator-runtime/runtime";
```

#### 配置项也可以在`babel.config.json`或者.babelrc（旧版本配置文件名）

也可以用js编写，以动态的生成配置。

```json
{
  "presets": ["@babel/preset-env"]
}
```

### 解析jsx

```js
npm install --save-dev @babel/preset-react
```

babel.config.json

```json
{
    "presets": [
        "@babel/preset-env",
        //配置解析jsx的插件
        "@babel/preset-react"
    ]
}
```

```js
//打包前代码
let a = <div>jsx</div>
//打包后代码
eval("var a = /*#__PURE__*/React.createElement(\"div\", null, \"jsx\");\n\n//# sourceURL=webpack://test/./src/index.js?");
```

### 解析TS

```
npm install --save-dev @babel/preset-typescript
```

```json
{
  "presets": ["@babel/preset-typescript"]
}
```

### 解析vue

见官网：<https://vue-loader.vuejs.org/zh>

### browserslist定义浏览器目标范围

```json
//可以在package.json添加配置项
  "browserslist": [
    "last 2 version",
    "> 1%"
  ]
 //也可以直接添加一个文件.browserslistrc配置
 last 2 version
 > 1%
```

## 处理文件图片相关

### file-loader

把识别出的资源模块，移动到指定的输出⽬目录，并且返回这个资源在输出目录的地址(字符串)

```bash
npm install --save-dev file-loader
```

```javascript
rules: [
    {
        test: /\.(png|jpe?g|gif)$/,
        use: {
            loader: "file-loader",
            options: {
                // [name] 原来资源的名称
                // [ext] 原来资源的后缀
                name: "[name]_[hash].[ext]",
                //打包后的存放位置,相对于打包目标文件夹
                outputPath: "./images",
                // 相对于此config配置的路径，控制打包后文件引入图片的url，需要注意是否匹配。
                publicPath: './images',
            }
        }
    }
]
```

### url-loader

本身也依赖于file-loader

```
npm i url-loader
```

```js
        rules: [{
            test: /\.png$/,
            use: {
                loader: 'url-loader',
                options: {
                 //低于2kb的图片转成base64，注意不要设置太大，影响代码体积。
                    limit: 2 * 1024
                }
            }
        }]
```

### image-webpack-loader

可以压缩图片

```js
npm i image-webpack-loader
```

```js
rules: [{
    test: /\.(gif|png|jpe?g|svg)$/i,
    use: [
        'url-loader',
        'image-webpack-loader',
    ],
}]
```

## 处理css相关

### css-loader

分析 `css` 模块之间的关系，并合成⼀个 `css`，只是生成js字符串，无法实际生效

```bash
npm install --save-dev css-loader
```

```js
rules: [
    {
        test: /\.css$/,
        use: {
            loader: "css-loader",
            options: {
                // 启用/禁用 url() 处理
                url: true,
                // 启用/禁用 @import 处理
                import: true,
                // 启用/禁用 Sourcemap
                sourceMap: false
            }
        }
    }
]
```

### style-loader

把 `css-loader` 生成的内容，用 `style` 标签挂载到⻚面的 `head` 中

```bash
npm install --save-dev style-loader
```

```js
rules: [
    {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
    }
]
```

##### 同一个任务的 `loader` 可以同时挂载多个，处理顺序为：从右到左，也就是先通过 `css-loader` 处理，然后把处理后的 `css` 字符串交给 `style-loader` 进行处理

##### 定义多个options可以把数组里元素写成对象模式

```js
rules: [
    {
        test: /\.css$/,
        use: [
            {
                loader: 'style-loader',
                options: {}
            },
            'css-loader'
        ]
    }
]
```

### mini-css-extract-plugin

提取 `CSS` 到一个单独的文件中

```bash
npm install --save-dev mini-css-extract-plugin
```

```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    "css-loader"]
            },
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css'
        }),
    ]
}
```

### postcss-loader

一个css工具集,可以实现css各种需求

```js
npm i postcss-loader postcss
```

##### 实现添加前缀，以兼容浏览器

```js
npm i autoprefixer
```

增加postcss.config.js文件

```js
module.exports = {
    plugins: [require("autoprefixer")],
};
```

webpack配置

```js
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    'css-loader',
                    'postcss-loader'
                ]
            },
```

测试：

```css
/* 打包前 */
::placeholder {
    color: gray;
  }
/* 打包后 */
::-moz-placeholder {
    color: gray;
  }
:-ms-input-placeholder {
    color: gray;
  }
::placeholder {
    color: gray;
  }  
```

## Plugins

扩展 `webpack` 本身的一些功能，它们会运行在 `webpack` 的不同阶段（钩子 / 生命周期）。webpack 自身也是构建于插件系统之上！

### HtmlWebpackPlugin

在打包结束后，⾃动生成⼀个 `html` 文件，并把打包生成的 js 模块引⼊到该 `html` 中

```bash
npm install --save-dev html-webpack-plugin
```

```js
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  plugins: [
     new HtmlWebpackPlugin({
       title: "My App",
       filename: "app.html",
       //可以传入设置html的模板
       template: "./src/html/index.html"
     }) 
  ]
};
```

```html
<!--./src/html/index.html-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <!--会替换为配置里的title值 My App-->
    <title><%=htmlWebpackPlugin.options.title%></title>
</head>
<body>
    <h1>html-webpack-plugin</h1>
</body>
</html>
```

### clean-webpack-plugin

删除构建目录，在新一轮构建时，把之前的包都清理掉

```bash
npm install --save-dev clean-webpack-plugin
```

```js
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
module.exports = {
  plugins: [
    new CleanWebpackPlugin(),
  ]
}
```

### webpack5可以直接在output配置clean选项

```js
const path = require('path')
module.exports = {
  output: {
   path: path.resolve(__dirname, "./build"),
 clean:true
 }
}
```
