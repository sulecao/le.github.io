## hook状态在哪保存

函数组件的fiber上，有着memorizedState属性，并且以{ memorizedState: null, next: null }的链表形式保存着每一个hook函数状态。

形如：

```js
fiber = {
    memorizedState: {
        memorizedState: value,
        next: {
            memorizedState: value,
            next: null
        }
    }
}
```

## 首次渲染和更新时的状态处理准备

fiber的alternate属性保存着上次渲染fiber

```js
function scheduleUpdateOnFiber(fiberRoot) {
    fiberRoot.alternate = { ...fiberRoot }
    wipRoot = fiberRoot
    nextUnitOfWork = fiberRoot
    scheduleCallback(workLoop);
}
```

渲染到函数组件时,renderHook函数获取当前的函数fiber，初始化本轮渲染的属性

```js
// 函数组件首次渲染或更新
function updateFnFiber(fiber) {
    renderHooks(fiber);
    const { type, props } = fiber;
    let children = type(props);
    reconcileChildren(fiber, children);
}
```

初始化本轮渲染的属性

```js
// 调用当前hook函数的函数fiber
let currentlyRenderingFiber = null;
// 尾hook节点
let workInProgressHook = null;

function renderHooks(wip) {
    currentlyRenderingFiber = wip;
    currentlyRenderingFiber.memorizedState = null; 
    workInProgressHook = null;
}
```

## useState方法实现

react组件函数的执行会调用useState

```js
export function useState(initialState) {
    // 获取到当前 useState对应的hook链表节点
    const hook = updateWorkProgressHook();

    if (!currentlyRenderingFiber.alternate) {
        // 若是初次渲染节点，保存初始值
        hook.memorizedState = initialState;
    }
    //  dispatch方法因为闭包，引用着对应的hook，修改了hook状态值，开始新一轮更新。
    //
    const dispatch = (state) => {
        hook.memorizedState = state;
        //从函数组件开始往下协调更新
        scheduleUpdateOnFiber(currentlyRenderingFiber);
    };

    return [hook.memorizedState, dispatch];
}
```

## updateWorkProgressHook函数

updateWorkProgressHook函数处理和获取当前hook对应状态

```js
//获取当前hook , 也是构建fibe上hook链表的过程
function updateWorkProgressHook() {
    let hook = null;
    //  第一次渲染时函数fiber上没有alternate
    //  更新时alternate上存在最新的hook状态
    const current = currentlyRenderingFiber.alternate;
    if (current) {
        // 更新
        // fiber的memorizedState指向新一轮的hook链表
        currentlyRenderingFiber.memorizedState = current.memorizedState;
        if (workInProgressHook) {
            //有尾hook节点,新的hook为尾hook节点的下一个
            hook = workInProgressHook = workInProgressHook.next;
        } else {
           //没尾hook节点,获取第一个hook节点，current.memorizedState指向第一个节点
            hook = workInProgressHook = current.memorizedState;
        }
    } else {
        // 初次渲染，返回空hook
        hook = { memorizedState: null, next: null };
        currentHook = null;
        if (workInProgressHook) {
            //有尾hook节点,新的hook加入链表末尾
            workInProgressHook = workInProgressHook.next = hook;
        } else {
            //没有尾hook节点，新的hook为hook链表开端
            workInProgressHook = currentlyRenderingFiber.memorizedState = hook;
        }
    }

    return hook;
}
```

## useReducer方法实现

和useState类似，只是dispatch方法里，每次新的值是用reducer函数的返回

```js
export function useReducer(reducer, initialState) {
    const hook = updateWorkProgressHook();

    if (!currentlyRenderingFiber.alternate) {
        hook.memorizedState = initialState;
    }
    //  定义一个dispatch，调用时执行reducer方法获取计算后的状态值
    const dispatch = (action) => {
        hook.memorizedState = reducer(hook.memorizedState, action);
        scheduleUpdateOnFiber(currentlyRenderingFiber);
    };

    return [hook.memorizedState, dispatch];
}
```