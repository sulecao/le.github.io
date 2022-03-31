## requestIdleCallback实现任务切片

```js
let tasks = 100
const doTasks = () => {
  const start = Date.now();
  console.log('新一轮任务');
  while (tasks && Date.now() - start < 5) {
    tasks--;
    console.log('执行task');
  }
  if (tasks) {
    requestIdleCallback(doTasks);
  }
}

requestIdleCallback(doTasks)
```
可以看到100个console被拆成了4轮执行完
![image.png](https://upload-images.jianshu.io/upload_images/17012856-432fbb5500867552.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


## 浏览器一轮循环流程

```js
一个task(宏任务) -- 队列中全部job(微任务) -- requestAnimationFrame -- 浏览器重排/重绘 -- requestIdleCallback
```

## scheduler介绍

**实现了js任务的中断和恢复。**

**使用MessageChannel模拟实现，接受一个任务，每一帧执行5ms的js任务后终止，将控制权交给浏览器，防止js执行过久阻塞浏览器执行其它任务。**

**scheduler中有两个任务最小堆timerQueue和taskQueue，分别存储着未过期的任务和过期的任务**

**每个任务可以设置优先级，处理时会给每个任务设置一定的执行延迟。**

#### scheduler有着三个循环

**浏览器eventloop循环**，执行MessageChannel任务

**scheduler开始执行，循环遍历taskQueue任务**：此时可能时间截止，任务暂停，如果还有任务发送Message，等待下一轮eventloop执行

**taskQueue任务里包含循环体，一直判断时间是否截止**：此时也可能时间截止，任务暂停，这时返回自身函数，scheduler通过是否返回函数判断任务是否执行完，没执行完仍然放在taskQueue任务堆里面，等下一轮scheduler调度。

## 没采用其它api原因

**requestIdleCallback**因为兼容和执行时间不稳定没有被react采用。

**requestAnimationFrame** 当页面处理未激活的状态下，requestAnimationFrame 会停止执行；当页面后面再转为激活时，requestAnimationFrame 又会接着上次的地方继续执行。

**setTimeout**在连续循环后会有很多ms的时间间隔

```js
let count = 0
let preTime = new Date()

function fn() {
  preTime = new Date()
  setTimeout(() => {
    ++count
    console.log("间隔时间", new Date() - preTime)
    if (count === 10) {
      return
    }
    fn()
  }, 0)
}

fn()
```

## scheduler简单实现



```js
// 未过期的任务
const timerQueue = [];
// 过期的任务
const taskQueue = [];
//是否发送message
let isMessageLoopRunning = false;
//需要执行的Callback函数
let scheduledHostCallback = null;
//一帧的执行js时间，5ms
let yieldInterval = 5;
//截止时间
let deadline = 0;
//是否已有执行任务调度
let isHostCallbackScheduled = false

const root = {
  //标识任务是否结束，结束了为null
  callbackNode: true
}
let workInProgress = 100

const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;


// 循环创建workInProgress树
function workLoopConcurrent(root) {
  console.log('新一轮任务');
  while (workInProgress !== 0 && !shouldYield()) {
    workInProgress = --workInProgress
    console.log('执行task');
  }
  // 没有任务了，进入commit阶段
  if (!workInProgress) {
    root.callbackNode = null;
    //进入commit阶段
    //commitRoot(root);
  }
}

function performConcurrentWorkOnRoot(root) {
  const originalCallbackNode = root.callbackNode;

  workLoopConcurrent(root);
  // 如果workLoopConcurrent被中断, 此判断为true，返回函数自己
  if (root.callbackNode === originalCallbackNode) {
    return performConcurrentWorkOnRoot.bind(null, root);
  }
  return null;
}

// 以上是构建任务执行代码

// 使用scheduler的入口函数，将任务和scheduler关联起来
scheduleCallback(performConcurrentWorkOnRoot.bind(null, root));

// 以下scheduler代码
function scheduleCallback(callback) {
  let currentTime = getCurrentTime(); //当前时间
  let startTime = currentTime; //任务开始执行的时间
  //会根据优先级给定不同延时，本文暂时都给一样的
  let timeout = 5; //任务延时的时间
  let expirationTime = startTime + timeout; //任务过期时间
  //创建一个新的任务
  let newTask = {
    callback, // callback = performConcurrentWorkOnRoot
    startTime,
    expirationTime,
    sortIndex: -1,
  };
  //将新建的任务添加进任务队列中
  //将过期时间作为排序id，越小排在越靠前
  // react中是用最小堆管理
  // 本文直接依次将任务加入数组
  newTask.sortIndex = expirationTime;
  taskQueue.push(newTask)
  //判断是否已有Scheduled正在调度任务
  //没有的话则创建一个调度者开始调度任务
  if (!isHostCallbackScheduled) {
    isHostCallbackScheduled = true;
    requestHostCallback(flushWork);
  }
}

function requestHostCallback(callback) {
  scheduledHostCallback = callback;
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    // 触发performWorkUntilDeadline
    port.postMessage(null);
  }
};

function flushWork(initialTime) {
  return workLoop(initialTime);
}

function workLoop(initialTime) {
  //scheduler里会通过此函数
  //将将过期的任务从startTime早于currentTime的timerQueue移入taskQueue
  //本文暂不处理
  // let currentTime = initialTime;
  //advanceTimers(currentTime);
  currentTask = taskQueue[0];
  while (currentTask) {
    // 如果需要暂停了，break循环
    if (shouldYield()) {
      break;
    }
    // 这个callback就是传入scheduleCallback的任务performConcurrentWorkOnRoot
    //在performConcurrentWorkOnRoot中，如果被暂停了，返回函数自己
    const callback = currentTask.callback;
    const continuationCallback = callback();
    // 如果返回函数,任务被中断,重新赋值
    if (typeof continuationCallback === 'function') {
      currentTask.callback = continuationCallback;
    } else {
      // 执行完,移除task
      taskQueue.shift()
    }
    // 执行下一个任务
    // advanceTimers(currentTime);
    currentTask = taskQueue[0];
  }

  if (currentTask) {
    return true;
  }

  return false;
}

function performWorkUntilDeadline() {
  // scheduledHostCallback就是flushWork
  if (scheduledHostCallback !== null) {
    const currentTime = getCurrentTime();
    deadline = currentTime + yieldInterval;
    // scheduledHostCallback就是flushWork,就是执行workLoop
    const hasMoreWork = scheduledHostCallback(currentTime);
    // workLoop执行完会返回是否还有任务没执行
    if (!hasMoreWork) {
      isMessageLoopRunning = false;
      scheduledHostCallback = null;
    } else {
      // 如果还有任务，发送postMessage，下轮任务执行performWorkUntilDeadline
      port.postMessage(null);
    }
  } else {
    isMessageLoopRunning = false;
  }
};

function shouldYield() {
  return getCurrentTime() >= deadline;
}
function getCurrentTime() {
  return performance.now();
}
```

实现了任务切割
![image.png](https://upload-images.jianshu.io/upload_images/17012856-b053312300ffe805.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
