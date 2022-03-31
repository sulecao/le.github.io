##### Redux实现见如下地址。

https://www.jianshu.com/p/41499425c475

##### react-redux可以帮助redux更好的在react中使用

##### 主要提供Provider，useSelector、useDispatch和connect方法

## Provider实现

依赖React的context让全局可访问store

```jsx
const context = React.createContext()

function Provider({ store, children }) {
    return <context.Provider value={store}>{children}</context.Provider>
}
```

## useSelector和useDispatch实现

```jsx
//一个强制组件更新的自定义hooks
function useForceUpdate() {
    const [, setState] = useReducer((x) => x + 1, 0);
    const update = useCallback(() => {
        setState()
    }, [])
    return update
}

function useSelector(mapState) {
    const store = useContext(context)
    const update = useForceUpdate()
    //它会在所有的 DOM 变更之后同步调用 effect。可以使用它来读取 DOM 布局并同步触发重渲染。
    //在浏览器执行绘制之前，useLayoutEffect 内部的更新计划将被同步刷新。
    useLayoutEffect(() => {
        const unsubscribe = store.subscribe(() => {
            update()
        })
        return () => {
            unsubscribe()
        }
    }, [store])

    return mapState(store.getState())
}

function useDispatch() {
    const store = useContext(context)
    return store.dispatch
}
```

## connect实现

```jsx
function connect(mapState, mapDispatch) {
    // 返回一个高阶组件函数
    return function (WrappedComponent) {
        //返回组件
        return function (props) {
            const store = useContext(context)
            const stateProps = mapState(store.getState())
            let dispatchProps = { dispatch: store.dispatch }
            // mapDispatch为对象的格式如下
            // {
            //    parapmsChange: (prams) => ({ type: prams })
            // }
            if (typeof mapDispatch === 'object') {
                let obj = {}
                Object.keys(mapDispatch).forEach(item => {
                    obj[item] = function (parapm) {
                        store.dispatch(mapDispatch[item](parapm))
                    }
                })
                dispatchProps = obj
            } else if (typeof mapDispatch === 'function') {
                dispatchProps = mapDispatch(store.dispatch)
            }
            
            const update = useForceUpdate()
            useLayoutEffect(() => {
                const unsubscribe = store.subscribe(() => {
                    update()
                })
                return () => {
                    unsubscribe()
                }
            }, [store])

            return <WrappedComponent {...props} {...stateProps} {...dispatchProps} />;
        }
    }
}
```

## 测试代码

```jsx
import { createStore } from './redux'

const reducer = function (state = { count: 1 }, action) {
    switch (action.type) {
        case 'increase':
            state.count += 1
            return JSON.parse(JSON.stringify(state))
        case 'decrease':
            state.count -= 1
            return JSON.parse(JSON.stringify(state))
        default:
            return JSON.parse(JSON.stringify(state))
    }
}

export default createStore(reducer)
```

```jsx
import store from './store/index'
import { Provider } from './react-redux'

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

```jsx
import React from 'react';
import { connect, useDispatch, useSelector } from './react-redux'
class ClassComp extends React.Component {
  render() {
    const { count, parapmsChange } = this.props
    return <div >
      <button onClick={() => parapmsChange('increase')}>parapmsChange+</button>
      ClassComp {count}
      <button onClick={() => parapmsChange('decrease')}>parapmsChange-</button>
    </div>
  }
}

const NewClassComp = connect(state => ({ count: state.count }), 
{ parapmsChange: (prams) => ({ type: prams }) })(ClassComp)

function FnComp() {
  const count = useSelector(state => state.count)
  const dispatch = useDispatch();
  return <div>
    <button onClick={() => dispatch({ type: 'increase' })}>+</button>
    FnComp {count}
    <button onClick={() => dispatch({ type: 'decrease' })}>-</button>
  </div>
}

function App() {
  return (
    <div className="App">
      <NewClassComp />
      <FnComp />
    </div>
  );
}
```