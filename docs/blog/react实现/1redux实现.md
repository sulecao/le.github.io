## 实现createStore

##### 接受一个reducer函数，返回 dispatch, getState,subscribe等方法

```js
function createStore(reducer) {
    
    let currentState;
    let listeners = [];

    function dispatch(action) {
        currentState = reducer(currentState, action)
        listeners.forEach(fn => fn())
    }
    
    function getState() {
        return currentState
    }
    
    function subscribe(fn) {
        listeners.push(fn)
        //返回取消订阅的函数
        return () => {
            for (let i = 0; i < listeners.length; i++) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1)
                    break
                }
            }
        }
    }
	//调用一次dispatch，初始化State
    dispatch({ tyep: null })

    return {
        dispatch,
        getState,
        subscribe
    }
}
```

##### 测试代码

```js
const store = createStore(reducer, applyMiddleware(logger, thunk))

const reducer = function (state = { count: 1, nub: 1 }, action) {
    switch (action.type) {
        case "count-add":
            return { ...state, count: state.count + 1 }
        case "nub-add":
            return { ...state, nub: state.nub + action.payload }
        default:
            return state
    }
}

const store = createStore(reducer)

const unsubscribe = store.subscribe(() => {
    console.log('subscribe', store.getState());
});

store.dispatch({ type: 'count-add' })
store.dispatch({ type: 'nub-add', payload: 2 })
console.log(store.getState());
unsubscribe();
store.dispatch({ type: 'count-add' })
console.log(store.getState());
```

## 实现applyMiddleware

applyMiddleware是一个函数，接受n个中间件作为参数。
#### applyMiddleware的使用方式如下：

```js
const store = createStore(reducer, applyMiddleware(logger1, logger2))
```

##### 中间件的定义如下：

store:store对象。

next：下一个执行的中间件函数。

action：接受到的action对象。

```js
function logger1(store) {
    return function (next) {
        return function (action) {
            console.log('logger1');
            next(action)
        }
    }
}
```

#### applyMiddleware作为createStore的第二个参数

##### createStore修改如下：

```js
function createStore(reducer，enhancer) {
	//在原来代码基础上增加如下代码
    if (enhancer && typeof enhancer == 'function') {
        // 返回增强版的createStore
        return enhancer(createStore)(reducer)
    }
	...
	//其它不变
}
```

##### 所以applyMiddleware是一个函数

##### 接受中间件函数，返回的一个函数接受createStore，返回加强版的createStore函数

```js
//接受n个中间件函数
function applyMiddleware(...middlewares) {
    //接受createStore函数
    return function (createStore) {
        // 返回扩展的createStore函数
        return function (reducer) {
            
        }
    }
}
```

#### 实现applyMiddleware，可以接受中间件扩展dispatch功能

```js
function applyMiddleware(...middlewares) {
    return function (createStore) {
        return function (reducer) {
            // 首先创建一个初始的store
            let store = createStore(reducer)
            // 将store传入每一个中间件并获得返回的函数
            // newMiddlewares里的每一个函数形式变为
            // function logger1(next) {
            //     return function (action) {
            //         console.log('logger');
            //         next(action)
            //     }
            // }
            let newMiddlewares = middlewares.map(middleware => middleware(store));
            // 假设只有一个logger中间件，加强版的dispatch函数会变成
            // logger1(dispatch)
            // 即是
            // function (action) {
            //     console.log('logger');
            //     dispatch(action)
            // }
            // 若有两个
            // logger2(logger1(dispatch))
            let dispatch = store.dispatch
            for (let i = newMiddlewares.length - 1; i >= 0; i--) {
                dispatch = newMiddlewares[i](dispatch)
            }
            // 返回增强版的store api
            return {
                ...store,
                dispatch
            }
        }
    }
}
```

##### 测试代码

```js
function logger1(store) {
    return function (next) {
        return function (action) {
            console.log('logger1');
            next(action)
        }
    }
}

function logger2(store) {
    return function (next) {
        return function (action) {
            console.log('logger2');
            next(action)
        }
    }
}

const store = createStore(reducer, applyMiddleware(logger1, logger2))
```

## combineReducers实现

##### 接受多个reducer返回一个reducer

```js
function combineReducers(reducers) {
    let reducerKeys = Object.keys(reducers);
    return function reducer(state, action) {
        //第一次初始化时state为undefined
        if (!state) {
            state = {}
        }
        //防止修改值时的对象引用问题
        state = JSON.parse(JSON.stringify(state))
        for (let i = 0; i < reducerKeys.length; i++) {
            let key = reducerKeys[i];
            let reducer = reducers[key];
            state[key] = reducer(state[key], action)
        }
        return state
    }
}
```

##### 测试代码

```js
const countReducer = (count = { count1: 1, count2: 2 }, action) => {
    switch (action.type) {
        case 'count-add':
            count.count1 += 1
            return count
        default:
            return count
    }
}

const nubReducer = (nub = 1, action) => {
    switch (action.type) {
        case 'nub-add':
            return nub + action.payload;
        default:
            return nub
    }
}

const store = createStore(combineReducers({ countReducer, nubReducer }), applyMiddleware(logger1, logger2))
store.dispatch({ type: 'count-add' })
console.log(store.getState());
store.dispatch({ type: 'nub-add', payload: 2 })
console.log(store.getState());
store.dispatch({ type: 'count-add' })
console.log(store.getState());
```