下方链接的文章实现了将vdom直接渲染到页面上的逻辑。

https://www.jianshu.com/p/87620bce827d

#### react后来又引入了fiber

#### fiber是在vdom的基础上的扩展，增加了一些关联属性，方便更新的时候查找下一个工作单元。

## fiber对象里的一些关键属性如下

```js
function createFiber(vnode, returnFiber) {
    let fiber = {
        /**
         * 节点类型
         */
        type: vnode.type,
        /**
         * 属性 里面包含chidren
         */
        props: vnode.props,
        /** 
         * 下一个兄弟节点
         */
        sibling: null,
        /** 
         * 父节点
         */
        return: returnFiber,
        /** 
         * 原生元素是节点对象
         = function组件是null
         */
        stateNode: null,
    }
    return fiber
}
```

## render函数

##### 不再是直接去渲染页面，改为先去构建fiber

```js
function render(VDOM, container) {
    // 根root的fiber对象
    const fiberRoot = {
        type: container.nodeName.toLocaleLowerCase(),
        stateNode: container,
        props: { children: VDOM },
    }
    scheduleUpdateOnFiber(fiberRoot);
}


// 根元素
let wipRoot = null
// 下一个要更新的任务
let nextUnitOfWork = null

function scheduleUpdateOnFiber(fiberRoot) {
    wipRoot = fiberRoot
    nextUnitOfWork = fiberRoot
}
```

##### requestIdleCallback函数获得浏览器是否有空余时间

https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback

实际上react自己实现了此方法，后面分析。

```js
function workLoop(IdleDeadline) {
    // 当有时间结余和剩余的要构建的Fiber时
    while (nextUnitOfWork &&IdleDeadline.timeRemaining() > 0 ) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
    // 没有任务了，开始渲染
    if (!nextUnitOfWork && wipRoot) {
        commitRoot(wipRoot);
    }
}

requestIdleCallback(workLoop);
```

## performUnitOfWork

从根节点开始依次更新fiber并返回下一个要更新的fiber。和requestIdleCallback配合，当浏览器空余时去更新。

```js
// 要构建的Fiber,每次返回下一轮需要构建的Fiber
function performUnitOfWork(fiberRoot) {
    // 构建自己的Fiber对象
    const { type } = fiberRoot
    if (typeof type === 'string') {
        updateNativeFiber(fiberRoot)
    }
    if (typeof type === 'function') {
        updateFnFiber(fiberRoot)
    }

    // 自己的Fiber对象构建完后，有了child和sibling属性
    // 深度优先构建
    // 先构建子节点
    if (fiberRoot.child) {
        return fiberRoot.child
    }
    // 子节点没有了构建兄弟节点
    while (fiberRoot) {
        // 如果有兄弟节点构建兄弟节点
        if (fiberRoot.sibling) {
            return fiberRoot.sibling
        }
        // 没有的话返回上一级,即父节点,去查父节点的兄弟节点
        fiberRoot = fiberRoot.return
    }
}
```

## 将原生dom和函数类型元素转换为fiber的函数

```js
function updateNativeFiber(fiber) {
    // 第一次更新没有stateNode
    if (!fiber.stateNode) {
        if (fiber.type === 'text') {
            fiber.stateNode = document.createTextNode(fiber.props.textContent)
        } else {
            fiber.stateNode = document.createElement(fiber.type)
            // 设置属性
            setAttr(fiber.stateNode, fiber)
        }
    }
    reconcileChildren(fiber, fiber.props.children)
}

// 函数fiber
function updateFnFiber(fiber) {
    const { type, props } = fiber;
    let children = type(props);
    reconcileChildren(fiber, children);
}

function reconcileChildren(fiber, children) {
    if (!children) {
        return
    }
    // children可能只有一个，是个对象
    if (!Array.isArray(children)) {
        children = [children]
    }
    //循环指向兄弟节点
    let preFiber = null

    for (let i = 0; i < children.length; i++) {
        let newFiber = createFiber(children[i], fiber);
        // 第一个节点
        if (!preFiber) {
            //指向第一个子节点
            fiber.child = newFiber
        }
        if (preFiber) {
            preFiber.sibling = newFiber
        }
        preFiber = newFiber
    }
}


function setAttr(element, VDOM) {
    VDOM.props && Object.keys(VDOM.props).forEach((propName) => {
        let value = VDOM.props[propName]
        if (propName.startsWith('on')) {
            let eventName = propName.substring(2)
            element.addEventListener(eventName, value)
        } else if (propName === 'className') {
            element.setAttribute('class', value)
            //children属性不需要在标签上显示
        } else if (propName !== "children") {
            element.setAttribute(propName, value)
        }
    })
}
```

##### 通过上面函数的处理，最终会生成一个fiber对象。

##### 它通过return，child和sibling指向了各个节点的父节点，首个子节点和兄弟节点。

## commitRoot

##### 接受fiber对象，渲染到页面中

```js
function commitRoot(wipRoot) {
    //根节点是自己定义在html的root元素，不需要处理，所以从第一个子节点开始渲染。
    commitWorker(wipRoot.child)
}

function commitWorker(wip) {
    if (!wip) {
        return;
    }
    let parent = wip.return.stateNode
    // 函数节点的stateNode是null
    while (!wip.stateNode) {
        wip = wip.child
    }
    parent.appendChild(wip.stateNode)
    commitWorker(wip.child)
    commitWorker(wip.sibling)
}
```

## 测试代码

```js
function FnComp() {
  return <div>Hello FnComp</div>
}

const virtualDOM =
  <div>
    {null}
    react
    <h1 className='myClass' extraProp='extraProp' onclick={() => { console.log(1111); }}>h1标签</h1>
    <FnComp></FnComp>
  </div>

myReact.render(virtualDOM, document.getElementById("root"))
```