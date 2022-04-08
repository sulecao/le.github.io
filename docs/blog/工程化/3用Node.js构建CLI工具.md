## CLI 与GUI介绍

**命令行界面**（英语：Command Line Interface，缩写：CLI）用户通过键盘输入指令，计算机接收到指令后，予以执行。

**图形用户界面**（英语：Graphical User Interface，缩写：GUI）是指采用图形方式显示的计算机操作用户界面。与早期计算机使用的命令行界面相比，除了降低用户的操作负担之外，对于新用户而言，图形界面对于用户来说在视觉上更易于接受。

## CLI 程序中的一些概念

##### **命令**

通常我们执行的 CLI 程序本身就是一个命令（主命令），当 CLI 程序功能分类比较多的时候，可以根据子功能的不同提供更多的一些子命令，如：

```bash
// create 子命令
vue create <project-name>

// add 子命令
vue add <plugin-name>
```

##### **参数**

参数是配合着命令调用传入的数据，类似函数参数，如下 <project-name>  app1就是参数：

```bash
vue create app1
```

##### **选项**

选项是命令内置好的一些选项，以供调用命令的时候根据不同的需要进项选配：

```bash
// -f 或 --force 选项（当app1已存在的时候，-f 强制重新创建并覆盖）
vue create app1 -f
```

## bin 文件

通常，node.js 文件需要使用 node 命令来运行，如：

```bash
node test.js
```

我们可以使用如下的方式来简化脚本运行

```js
#!/usr/bin/env node
// #! 行必须写在文件第一行，指定该脚本解析器路径
// /usr/bin/env => env: 获取环境变量信息
// /usr/bin/env node => env | grep PATH => 从电脑的环境变量 PATH 中查找 node 并执行

console.log('hello');
```

现在可以命令行中省略 node 执行文件了

```
./test.js
```

## 命令行参数的获取

使用 Node.js 内置 `process` 对象的 `argv` 属性来获取这些数据：

```js
//app.js文件 
#!/usr/bin/env node

// process : 获取到当前程序运行的进程相关的一些信息和数据
// process.argv : 当前程序运行的参数信息
// output
// ['node的路径','当前执行文件的路径','参数、选项'...]
console.log( process.argv );

//命令行
$ ./app.js -v
[
  'C:\\Program Files\\nodejs\\node.exe',
  'C:\\Users\\Desktop\\test\\app.js',
  '-v'
]
```

## commander 库

该库对 process.argv 进行解析，并提供了更易用的 API

```bash
npm install commander
```

**Commander类**

通过实例化 Commander 类对象来完成 CLI 程序构建。

```
const { Command } = require('commander');
const program = new Command();
```

或直接调用内置构建好的一个 实例对象：

```
const { program } = require('commander');
```

**选项**

通过 `option` 方法指定要解析的选项：

```
program.option('-v, --version', '这是参数的描述');
// 设置选项参数
program.option('-p, --port', '端口', 80);
```

**可选**

`<>` 表示必填。

```
program.option('-p, --port <port>', '端口', 80);
```

**必填**

`[]` 表示可选

```
program.option('-p, --port [port]', '端口', 80);
```

**命令参数**

```
program.argument('<username>', '登录用户名', '默认值');
```

**处理函数**

当命令解析后的执行函数

```
program.action((参数1，参数2, 选项列表, program) => {
  //...
});
```

##### **解析**

```
program.parse(process.argv)
```

##### 使用示例

```js
const { Command } = require('commander');
const program = new Command();

program.option('-v, --version', '这是参数的描述');
program.option('-p,--port [port]', '端口', '8888');
console.log( process.argv );

// 执行动作 opts里包含传入的参数
program.action((opts) => {
    console.log(`输入的参数`, opts)
    if (opts.version) {
        console.log(`version: 1.0.0`)
    }
    if (opts.port) {
        console.log(`端口: ${opts.port}`)
    }
});

program.parse(process.argv)
```

## 命令行字体美化

## chalk 库

```js
//安装
npm i chalk
//使用
const chalk = require('chalk');
console.log(chalk.blue('Hello world!'));
```

## 交互式命令行

有时候，需要 CLI 程序能够与用户进行一些交互，比如提供给用户选项或者输入些文本。

```js
//安装
npm install inquirer
```

##### 使用示例

```js
const inquirer = require('inquirer');

const promptOptions = [];

promptOptions.push({
    type: "input",
    name: "serverName",
    message: "请输入应用名称",
    default: "app",
});
promptOptions.push({
    type: "checkbox",
    name: "middlewares",
    message: "请选择要安装的中间件",
    choices: ['koa-static-cache', 'koa-router', 'koa-body'],
    default: ['koa-static-cache', 'koa-router'],
});

inquirer.prompt(promptOptions).then(answer => {
    console.log('answer', answer)
    // answer {
    //     serverName: ' app2',
    //     middlewares: [ 'koa-static-cache', 'koa-router', 'koa-body' ]
    //   }
})
```

## 如何执行shell

##### 通过指令获取参数和创建对应的文件夹后，需要执行npm init 和等npm i 指令

在这之前需要先了解下node如何实现多进程通信。因为我们需要在新创建的文件夹内执行命令。而在当前cli的路径内打印出执行消息。

##### Node.js 内置 process_child（子进程）

process_child 提供了几种方式来新建子进程

官网介绍地址：<https://nodejs.org/dist/latest-v6.x/docs/api/child_process.html#child_process_child_process_spawn_command_args_options>

新建子进程的方式

**spawn ：**

子进程中执行的是非node程序，提供一组参数后，执行的结果以流（Stream）的形式返回。

**exec：**

子进程执行的是非node程序，传入一串shell命令，执行后结果以回调的形式（Buffer）返回，与execFile不同的是exec可以直接执行一串shell命令。

**execFile：**

子进程中执行的是非node程序，提供一组参数后，执行的结果以回调的形式返回。

**fork：**

子进程执行的是node程序，提供一组参数后，执行的结果以流的形式返回，与spawn不同，fork生成的子进程只能执行node应用。

##### 子进程的和父进程的通信有三类信息stdin、stdout、stderr，通过来设置

介绍地址：<https://nodejs.org/dist/latest-v6.x/docs/api/child_process.html#child_process_options_stdio>

**stdio** 设置

**pipe：**

相当于['pipe', 'pipe', 'pipe']，子进程的stdio和父进程的stdio通过管道进行连接。

**ignore：**

相当于['ignore','ignore', 'ignore']，子进程的stdio绑定到/dev/null,丢弃数据的输入输出。

**inherit：**

继承父进程相关的stdio,等同于[process.stdin,process.stdout,process.sterr]或者[0,1,2],此时子进程的stdio都是绑定在同一个地方。

##### 使用示例

```js
const spawn = require('child_process').spawn;

const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
//或者
const spawn = require('child_process').spawn;
// 在node里执行shell命令
spawn('ls', ['-lh', '/usr'],{
    stdio: [ 'inherit',  'inherit',  'inherit' ]
});
```

### 一个执行shell的便捷库

```js
//安装
npm install execa
```

```js
// 使用 同步模式执行指定命令。
const cmd = `npm init -y`;
execa.commandSync(cmd, {
  //指令执行路径
  cwd: options.rootDirectory,
  //通信方式设置
  stdio: ["inherit", "inherit", "inherit"],
});
```

## 其它一些工具库

**package name 验证库**

[npm: validate-npm-package-name](https://www.npmjs.com/package/validate-npm-package-name)

**增强版的 fs 模块**

[npm: fs-extra](https://www.npmjs.com/package/fs-extra)

**打开浏览器**

[npm: open](https://www.npmjs.com/package/open)

## package.json 中的 bin 字段

安装依赖时，如果包的 `package.json` 文件有 bin 字段，就会在 `node_modules` 文件夹下面的 `.bin` 目录中复制了 bin 字段链接的执行文件。我们在调用执行文件时，可以不带路径，直接使用命令名来执行相对应的执行文件。

```js
{
  "bin": "./xxx.js"
}
```

```js
scripts: {  
  start: './node_modules/bin/xxx.js build'
}
// 简写为
scripts: {  
  start: 'xxx build'
}
```

## 完整的使用例子

地址：<https://www.npmjs.com/package/le-koa-server>

```
//安装
npm i le-koa-server -g
//执行命令
le-koa-server
```

le-koa-server.js

```
#!/usr/bin/env node
const { Command } = require('commander');
const packageJson = require('./package.json')
const fs = require('fs')
const chalk = require('chalk');
const validateNpmProjectName = require('validate-npm-package-name')
const inquirer = require('inquirer');
const execa = require('execa')
const open = require("open")
const program = new Command();


program.version(packageJson.version);
// 设置选项信息
program.option('-p,--port [port]', '端口');
// 设置参数
// le-koa-server app -p 9999
program.argument('[server-name]', 'server 的名称，英文、数字、_组成');

// 执行动作，参数是一一对应的。选项会集中解析到对象，放在最后一项。(参数1，参数2，...选项)
program.action(async (webServerName, opts) => {
    const promptOptions = [];

    promptOptions.push({
        type: "input",
        name: "serverName",
        message: "请输入应用名称",
        default: "app",
    });
    promptOptions.push({
        type: "input",
        name: "serverPort",
        message: "请输入应用端口",
        default: 8888,
    });
    promptOptions.push({
        type: "checkbox",
        name: "middlewares",
        message: "请选择要安装的中间件",
        choices: ['koa-static-cache', 'koa-router', 'koa-body'],
        default: ['koa-static-cache', 'koa-router'],
    });

    //第二个参数说明：如果用户已经通过指令输入了值，不必再询问用户。
    const answer = await inquirer.prompt(promptOptions, {
        serverName: webServerName,
        serverPort: opts.port,
    });

    // 整理用户输入和选择的信息。process.cwd()当前用户执行指令的路径
    const options = {
        serverName: answer.serverName,
        serverPort: answer.serverPort,
        rootDirectory: process.cwd() + `/${answer.serverName}`,
        dependencies: ['nodemon', 'koa', ...answer.middlewares]
    }

    //校验名称是否合法
    if (validateNpmProjectName(options.serverName).errors?.length) {
        console.error(chalk.red(`无效的项目名称：${options.serverName}`))
        process.exit(1);
    }

    //创建文件夹
    try {
        fs.mkdirSync(options.serverName);
    } catch (e) {
        console.error(chalk.red.bgWhite(`${options.serverName} 已经存在了`))
        process.exit(1);
    }

    // 初始化package.json
    const cmd = `npm init -y`;
    execa.commandSync(cmd, {
        cwd: options.rootDirectory,
        stdio: ["ignore", "ignore", "ignore"],
    });

    // 安装依赖
    const dependeniesCmd = `npm install ${options.dependencies.join(' ')}`

    execa.commandSync(dependeniesCmd, {
        cwd: options.rootDirectory,
        stdio: ["inherit", "inherit", "inherit"],
    });


    // 生成入口文件
    const log = `"服务启动成功：http://localhost:${options.serverPort}"`
    const content = `
        const Koa = require('koa');

        const app = new Koa();
        
        app.use((ctx, next) => {
            ctx.body = 'Hello';
        });
        
        app.listen(${options.serverPort}, () => {
            console.log(${log});
        });
    `;
    const entryFile = options.rootDirectory + "/app.js";
    fs.writeFileSync(entryFile, content, {
        encoding: "utf-8",
    });

    // 打开浏览器
    await open(`http://localhost:${options.serverPort}`);

    // 启动应用
    const runCmd = `nodemon app.js --port=${options.serverPort}`;
    execa.commandSync(runCmd, {
        cwd: options.rootDirectory,
        stdio: ["inherit", "inherit", "inherit"],
    });


});


// 开始解析
program.parse();
```

package.json

```
{
"name": "le-koa-server",
"version": "1.0.0",
"description": "",
"main": "app.js",
"dependencies": {
"chalk": "^4.1.2",
"commander": "^8.2.0",
"execa": "^5.1.1",
"inquirer": "^8.1.5",
"open": "^8.2.1",
"validate-npm-package-name": "^3.0.0"
},
"devDependencies": {},
"scripts": {
"test": "echo "Error: no test specified" && exit 1"
},
"bin": "./le-koa-server.js",
"keywords": [],
"author": "",
"license": "ISC"
}
```

## 在 NPM 上发布 package

我们可以把本地的 package 发布到 npm 仓库让其他人使用，相关操作如下：

#### 1、注册 npm 账户

注册：<https://www.npmjs.com/signup> 。
如果要发布npm包，需要验证邮箱也完成。

#### 2、登录

使用 npm login 登录授权

```
npm login
// 后续会提示输入用户名和密码
```

#### 3、发布

使用 npm publish 命令发布

```
npm publish
```

也可以登录 npm 的 web 端，对已发布的应用进行管理

#### 注意

发布到 npm 仓库上的 package，必须包含 package.json 文件，且内容格式必须满足特定要求：

<https://docs.npmjs.com/cli/v7/configuring-npm/package-json>

package 的名字除了满足格式要求外，要发布到 npm 仓库中的 package 名称不能重复，可以使用 scope 来进行命名

#### 4、更新

```
npm update
```

#### 5、删除

```
npm unpublish
```
