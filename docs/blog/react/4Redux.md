## Redux

官网：<https://www.redux.org.cn/>

安装 Redux

```bash
npm i redux 
yarn add redux 
```

#### 使用介绍

```tsx
import { createStore } from 'redux'

// 定义一个纯函数 接受初始值和action 返回更新后的值
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
// store  状态仓库
// - getState 获取当前状态
// - dispatch 发起一个 action,唯⼀改变 state 的⽅法就是触发 action
// - subscribe 监听state发生改变,返回的是一个取消监听的函数。
// - replaceReducer 替换掉reducer，传入新的reducer函数。
// action：对状态的修改动作，action 本身是一个普通对象，该对象有 type 属性 和 payload 属性
// - type 属性是对 state 做出何种修改的描述
// - payload 附带参数
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

#### combineReducers

合并多个Reducers

```tsx
//actions.js 定义actions的唯一type
const actions = {
    nub:{
        add: Symbol()
    },
    count: {
        add: Symbol()
    }
}
export default actions;
```

```tsx
//count.js 定义count相关
import actions from "../actions";
export default (count=1,action)=>{
    switch(action.type){
        case actions.count.add:
            return count + 1
    }
    return count;
}
```

```tsx
//nub.js 定义nub相关
import actions from "../actions";
export default (nub=5,action)=>{
     switch(action.type){
        case actions.nub.add:
            return nub+action.payload;
     }
    return nub;
}
```

```tsx
import {createStore, combineReducers} from "redux";
import count from "./reducers/count";
import nub from "./reducers/nub";
export default createStore(combineReducers({
    count,
    nub,
}));
```

## react-redux

将redux和react结合

安装：

```bash
npm install --save react-redux
```

### **在根组件用react-redux导出的Provider包裹下,并传入生成的store**

```tsx
import ReactDOM from "react-dom";
import {Provider} from "react-redux";
import App from "./App";
import store from "./store";
ReactDOM.render(
  <Provider
    store={store}
  >
    <App />
  </Provider>,
  document.querySelector("#root")
);
```

### 在子组件里使用

#### 1.高阶组件方法：connect

##### connect函数：接受一个select 函数，返回一个高阶组件

  **select 函数：从 state 截取，该组件需要的值，返回值类型必须是一个对象**

  **高阶组件：传入需要的组件，可以从props里获取到需要的值和dispatch方法。**

```tsx
import { connect } from "react-redux";
import actions from "./actions";

function Count(props) {
    const { count, dispatch } = props;
    const addCount = () => {
        dispatch({
            type: actions.count.add
        })
    }
    return <div>
        <p>count:{count}</p>
        <button onClick={addCount}>count-递增</button>
    </div>
}

const withConnent = connect(state=>({count:state.count}));
const NewCount = withConnent(Count);
export default NewCount;
// 连写
// export default connect(state => ({ count: state.count }))(Count)
```

#### 2.hooks写法

**useSelector获取需要的值**

**useDispatch获取dispatch方法**

**useStore获取整个store**

```tsx
import { useCallback } from "react";
import { useDispatch, useSelector, useStore } from "react-redux"
import actions from "./actions";

export default () => {
    const nub = useSelector(state => state.nub);
    const dispatch = useDispatch();
    console.log(useStore());
    //可以用useCallback缓存一下函数
    const addNub = useCallback(() => {
        dispatch({
            type: actions.nub.add
        })
    }, [])
    return <div>
        <p>nub:{nub}</p>
        <button onClick={addNub}>nub-递增</button>
    </div>
}
```

# Middleware

中间件-扩展redux的功能

#### redux-thunk

action可以是是函数，并且把 dispatch 和 getState 作为函数参数，可以在函数中，进⾏异步操作 。

```bash
npm install redux-thunk
```

引入thunk

```tsx
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers/index'

const store = createStore(rootReducer, applyMiddleware(thunk))
```

定义action

```tsx
const asyncActions = {
    topics:{
        getData:(dispatch,getState)=>{
            console.log(dispatch,getState);
            //异步操作...
            fetch(`url`)
                .then(response => response.json())
                .then(json => dispatch({ type: acitonType, payload: json }))
        }
    }
};
```

页面正常调用dispatch传入函数action

```tsx
  import {useSelector, useDispatch} from "react-redux";
  const dispatch = useDispatch();
  dispatch(asyncActions.topics.getData);
```
