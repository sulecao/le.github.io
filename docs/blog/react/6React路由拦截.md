## React路由拦截

##### 路由版本 ：react-router-dom@5

##### demo功能：实现登录状态拦截：未登录时，访问页面跳转到登录页，登陆成功后返回之前要访问的页面

## 方案一：Hooks版本

**封装一个自定义hooks**

```tsx
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
export default function useGuard() {
    const { user } = useSelector(state => state)
    const dispatch = useDispatch();
    const history = useHistory()
    const { pathname } = useLocation();
    useEffect(() => {
        // 若没有用户信息，保存现在的地址，并跳转到登录页
        if (!user) {
            dispatch({
                type: 'prevPath',
                prevPath: pathname
            });
            history.replace("/login")
        }
    })
}
```

**登陆页写法**

```tsx
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
// 登录页面用户点击按钮登录成功后，user状态更新，跳转回指定的页面
export default function Login() {
    const { user, prevPath } = useSelector(state => state)
    const dispatch = useDispatch()
    const history = useHistory()
    useEffect(() => {
        if (user) {
            // 根据不同跳转来登录页的路由方式判断登录回到哪个页面
            switch (history.action) {
                case 'REPLACE':
                    history.push(prevPath)
                    break
                case 'POP':
                    history.replace("/");
                    break
                case 'PUSH':
                    history.goBack();
                    break
                default:
                    history.replace("/");
                    return
            }
        }
    }, [user])
    return (
        <>
            <div>{user}</div>
            <button onClick={() => dispatch({ type: 'login' })}>登录</button>
        </>
    )
}
```

**在函数组件中使用自定义**hooks

```tsx
import useGuard from '../hooks/useGuard'
export default function Invoices() {
    // 在函数组件中使用
    useGuard()
    //...
}
```

## 方案二：高阶组件

**高阶组件**

```tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, useLocation } from "react-router-dom";

function Guard({ Cmp, ...props }) {
    console.log('Cmp', Cmp, props);
    const { user } = useSelector(state => state);
    const dispatch = useDispatch();
    const { pathname } = useLocation();
    useEffect(() => {
        // 若没有用户信息,保存现在的地址
        if (!user) {
            dispatch({
                type: 'prevPath',
                prevPath: pathname
            })
           
        }
    }, [user])
    // 若有用户信息正常展示组件，若没有跳转到登录页
    return user?<Cmp {...props} />:<Redirect to="/login" />
}

// 一个高阶函数,将组件和props都传递给函数组件Guard
export default function withGuard(Cmp) {
    return (props) => <Guard Cmp={Cmp} {...props} />
}
```

**登陆页写法同**hooks

**在class组件里使用**

```tsx
import { Component } from 'react'
import { withRouter } from "react-router-dom"
import withGuard from './withGuard'
class Expenses extends Component {
 //...
}

export default withGuard(withRouter(Expenses));
```

#### **也可以在路由配置项里写，更方便管理**

```tsx
        <Route path="/expenses"
          render={(props) => {
            const NewExpenses = withGuard(Expenses)
            return <NewExpenses {...props} />
          }} />
```
