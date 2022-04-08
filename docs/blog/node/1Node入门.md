# 安装Node.js

[Node.js官网](https://nodejs.org)下载稳定版

通过指令 node -v 来查看是否安装完成和查看node版本号；npm -v 来查看npm版本。

nodemon监听文件修改

```
npm install -g nodemon
nodemon index.js
```

# 模块化

## 1、自定义模块

##### 引入一个文件形式模块

  home.js执行文件

  ```js
  require("./aModule"); //注意一定要有"./"，文件后缀可加可不加。
  ```

  amodule.js文件

  ```js
  console.log("我是amodule模块111");
  ```

##### 引入文件夹形式模块

  home.js执行文件

  ```js
  require("./aModuledir"); //必须加"./"
  ```

  aModuleDir里的index.js文件,(node会自动查找文件夹下的index.js文件执行)

  ```js
  console.log("我是aModule模块文件夹");
  ```

  也可以配置默认文件入口，在文件夹内新建package.json来修改

  ```json
  {
    "name":"aModule",
    "version":"1.0.0",
    "main":"main.js"//默认文件入口为main.js,不再是index.js
  }
  ```

 #####自定义模块的导出

 1.module.exports

  ```js
  module.exports = {
      a:"我是a的值",
      b(){
          console.log("我是导出的b函数");
      }
  }
  ```

  引入文件

  ```js
  let mymodule = require("bModule");
  console.log(mymodule.a);
  mymodule.b();
  ```

  2.exports

  ```
  exports.fn = function(){
      console.log("我是fn函数");  
  }
  ```

  引入文件

  ```js
  let { fn } = require("bModule");
  fn();
  ```

  #####文件和目录同名时，先文件。

## 2、内置模块

```js
const http = require('http')
```

# fs模块

fs是文件操作模块，所有文件操作都是有同步和异步之分，特点是同步会加上 "Sync" .

如：异步读取文件  "readFile"，同步读取文件 "readFileSync"；

node本身风格都是回调风格，可以用promisify或者.promises转化为promise风格。

```js
const fs = require("fs").promises
fs.readFile('./m.js').then((res, err) => {
    console.log(res);
})
//或者
const { promisify } = require('util')
const fs = require("fs")
const readFile = promisify(fs.readFile)
readFile('./m.js').then((res, err) => {
    console.log(res);
})
```

  ```js
  let fs = require("fs");
  //文件读取
  fs.readFile("1.txt",(err,data)=>{
      if(err){
          return console.log(err);
      }
      console.log(data.toString());
  })
//  同步读取文件
  let res = fs.readFileSync("1.txt");
  console.log(res.toString());
 
//删除文件夹（当文件夹不为空时无法删除，需要一层层删除文件）
function deleteall(path) {
 var files = [];
 if(fs.existsSync(path)) {
  files = fs.readdirSync(path);
  files.forEach(function(file, index) {
   var curPath = path + "/" + file;
   if(fs.statSync(curPath).isDirectory()) { // 是否目录
    deleteall(curPath);
   } else { // 删除文件
    fs.unlinkSync(curPath);
   }
  });
  fs.rmdirSync(path);
 }

  ```

### Buffer

Buffer是二进制数据,打印出来用16进制展示

```js
let buffer = Buffer.from("大家好");
 console.log(buffer);//<Buffer e5 a4 a7 e5 ae b6 e5 a5 bd>
console.log(buffer.toString());//"大家好"

```

```js
//可以直接写成16进制数组也能解析出对应的字符
let buffer = Buffer.from([0xe5,0xa4,0xa7,0xe5,0xae,0xb6,0xe5,0xa5,0xbd]);
console.log(buffer.toString());//"大家好"
```

```js
let buffer1 = Buffer.from([0xe5, 0xa4, 0xa7, 0xe5]);
let buffer2 = Buffer.from([0xae, 0xb6, 0xe5, 0xa5, 0xbd]);
console.log(buffer1.toString());//字符无法解析显示部分乱码 大�
let newbuffer = Buffer.concat([buffer1, buffer2]);//可以像数组一样直接拼接被截断的buffer
console.log(newbuffer.toString());//"大家好"
```

```js
//也可以用StringDecoder处理
let { StringDecoder } = require("string_decoder");
let decoder =  new StringDecoder();
let res1 = decoder.write(buffer1);
let res2 = decoder.write(buffer2);
console.log(res1+res2);//"大家好"
```

# stream流

fs模块是对文件整体操作，stream会把文件切割成多块进行传递，文件过大时使用性能更好。

```js
let rs = fs.createReadStream("1.txt");//创建读取流
let ws = fs.createWriteStream("2.txt");//创建写入流
rs.pipe(ws);//通过pipe实现文件复制


let str = "";
//监听流的每一文件块传输事件
rs.on("data", chunk => {
    str += chunk;
    console.log(chunk);
})
// 流完成了事件
rs.on("end", () => {
    console.log(str);
})
```

# 使用Node.js实现第一个服务器

```js
const http = require('http')


const serve = http.createServer((req, res) => {
    console.log(`有客户端请求`);
    // 获取请求相关信息
    // 当前请求的 url 字符串
    console.log(req.url);
    
    // 使用 WHATWG（HTML5） 中的 URL API 解析 URL 字符串
        const urlObj = new URL(`${req.headers.host}${req.url}`);
    console.log(urlObj);
    res.end('hello world')
})
//  或者
// serve.on('request', (req, res) => {
//     console.log(`有客户端请求`);
//     res.end('Hello');
// });

serve.listen(3000,'0.0.0.0')
```

**参数**

- 第一个参数表示端口，如果省略或为0，讲默认分配一个未被使用的端口。
  - 端口取值范围：1-65535。
- 第二个参数表示主机（IP），省略的时候，当 IPv6 可用时值为：`'::'` ，否则为 IPv4 的地址：`'0.0.0.0'` 。
  - `'0.0.0.0'` 表示主机所有可用的 IP。

# 静态资源与动态资源

通俗来讲，`静态资源` 指的是通过资源地址（URL）访问到的内容就是资源内容本身，不经过程序的特殊处理（如：逻辑判断处理、数据库读取、随机内容等……），一般我们把网站的 `HTML文件、CSS文件、JS文件、图片文件` 等称为静态资源。

### 静态资源处理

通常，我们会把静态特性的资源存储到其它媒介（硬盘文件）中，在需要访问的时候根据一些自定义规则进行读取访问

```javascript
server.on('request', (req, res) => {
  // 1、获取当前客户端请求的url
  // 2、解析 url 字符串
  // 3、获取 url 中 path 部分的值
  // 4、根据 path 中的读取我们存放在硬盘中的对应资源文件
  // 5、把读取到的资源文件内容作为响应内容返回给客户端
});
```

### 使用 content-type 响应头返回资源类型

无论是请求还是响应，都会涉及到各种不同类型的资源要进行处理。为了能够让接收方知道当前接收到内容类型，以便针对该类型进行对应的处理，所以需要在发送正文数据的同时需要同时告知该正文内容的类型格式。

`Content-Type` 用于说明请求或相应中正文内容的 `MIME` 类型。

使用 `setHeader` 方法就可以向响应中设置对应的头信息。

```javascript
server.on('request', (req, res) => {
  res.setHeader('Content-Type', 'text/html;charset="utf-8"');
});
```

### 动态资源处理

服务端还可能会提供一些动态处理的资源，比如会根据当前时间，当前客户端访问用户的身份权限等条件进行一些逻辑处理后返回对应的资源

通常情况下，我们需要对不同的 URL 进行不同的处理。

- 把不同的 URL 对应的一些逻辑分别保存（通常是函数）。
- 准备一个路由表（可以使用对象格式进行存储，key是 URL，value是对应的函数）。
- 根据当前访问的 URL ，找到路由表中的对应的函数并执行。

```javascript
// 路由表
const routesMap = new Map();
routesMap.set('/', async (req, res) => {
  res.setHeader('Content-Type', 'text/html;charset="utf-8"');
  res.end('首页');
});
routesMap.set('/list', async (req, res) => {
  res.setHeader('Content-Type', 'text/html;charset="utf-8"');
  res.end('列表');
});

server.on('request', async (req, res) => {
  const urlObj = new URL(req.url);
  const pathname = urlObj.pathname;
  // 根据当前的 pathname 指定 routeMap 中对应的函数
  let routeHandler = routesMap.get(pathname);
  if (routeHandler) {
      await routeHandler(req, res);
  }
});
```

### URL 重定向

```javascript
server.on('request', async (req, res) => {
  const urlObj = new URL(req.url);
  const pathname = urlObj.pathname;
  // 根据当前的 pathname 指定 routeMap 中对应的函数
  let routeHandler = routesMap.get(pathname);
  if (routeHandler) {
      await routeHandler(req, res);
  } else {
    // 告知客户端你应该重新发送请求，新的请求地址在 Location 头中。
    res.statusCode = 302;
    res.setHeader('Location', '/');
    res.end();
  }
});
```

### 404 Not Found

```javascript
server.on('request', async (req, res) => {
  const urlObj = new URL(req.url);
  const pathname = urlObj.pathname;
  // 根据当前的 pathname 指定 routeMap 中对应的函数
  let routeHandler = routesMap.get(pathname);
  if (routeHandler) {
      await routeHandler(req, res);
  } else {
    // 返回一个404的状态码与提示页面
    res.statusCode = 404;
    res.end('<h1>页面丢失了</h1>');
  }
});
```

# 后端渲染

除了一些静态文件数据以外，服务端还会通过诸如：`数据库`、`程序运算` 等各种方式产生数据，同时我们又需要把这些数据通过页面（HTML，CSS）的方式进行组织返回给客户端。

```javascript
let users = [
  {id: 1, username: '大海'},
  {id: 2, username: '子鼠'},
  {id: 3, username: '小蕊'},
];
  res.setHeader('Content-Type', 'text/html;charset="utf-8"');
  res.end(`
      <ul>
        ${users.map(u => {
          return `<li>${u.username}</li>`
        }).join('')}
      </ul>
  `);


```

### 数据与视图分离

把前端相关的内容提取到外部文件中，在利用 `Node.js` 的 `fs` 模块进行文件读取，并进行一些简单的替换。

```javascript
const routesMap = new Map();
routesMap.set('/', async (req, res) => {
  res.setHeader('Content-Type', 'text/html;charset="utf-8"');
  let userListHtml = users.map(u => {
          return `<li>${u.username}</li>`
        }).join('');
  res.end( fs.readFileSync('./template/index.html').toString().replace(/${users}/gi, userListHtml) );
});
...

server.on('request', async (req, res) => {
  ...
});
```

`./template/index.html`

```html
...
<ul>${users}</ul>
...
```

### 模板渲染库

如Nunjucks

<http://mozilla.github.io/nunjucks/>
