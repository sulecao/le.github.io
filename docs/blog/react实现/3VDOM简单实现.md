#### jsx是通过babel转换成react.CreateElement()方法的调用

转换前

```jsx
import React from 'react';

function App() {
  return <h1>Hello World</h1>;
}
```

转换后

```jsx
import React from 'react';

function App() {
  return React.createElement('h1', null, 'Hello world');
}
```

React 17 在 React 的 package 中引入了两个新入口，这些入口只会被 Babel 和 TypeScript 等编译器使用。

新的 JSX 转换**不会将 JSX 转换为 `React.createElement`**，而是自动从 React 的 package 中引入新的入口函数并调用

Babel 的 [v7.9.0](https://babeljs.io/blog/2020/03/16/7.9.0) 及以上版本可支持全新的 JSX 转换。

```js
function App() {
  return <h1>Hello World</h1>;
}
```

转换后

```js
// 由编译器引入（禁止自己引入！）
import {jsx as _jsx} from 'react/jsx-runtime';

function App() {
  return _jsx('h1', { children: 'Hello world' });
}
```

#### 参数表现不一样，但最后都是生成ReactElement，用js对象表示dom结构。

## react的主要元素类型

####  null，文本，元素标签，函数组件和类组件。

#### 示例jsx

```jsx
function FnComp() {
  return <div>Hello FnComp</div>
}

class ClassComp extends React.Component {
  render() {
    return <div>Hello ClassComp</div>
  }
}

const virtualDOM =
  <div>
    {null}
    react
    <h1>h1标签</h1>
    <FnComp></FnComp>
    <ClassComp></ClassComp>
  </div>
```

##### 转换后

```jsx
function FnComp() {
    return React.createElement("div", null, "Hello FnComp");
}

class ClassComp extends React.Component {
    render() {
        return React.createElement("div", null, "Hello ClassComp");
    }

}

const virtualDOM = React.createElement("div", null,
null,
"react", 
React.createElement("h1", null, "h1\u6807\u7B7E"), 
React.createElement(FnComp, null), 
React.createElement(ClassComp, null));
```

## 实现createElement

```jsx
function createElement(type, props, ...children) {
    let newChildren = []
    children.forEach(child => {
        if (child === null || child === false || child === true) {
            return
        }
        // 处理过的子节点
        if (typeof child === 'object') {
            newChildren.push(child)
        }
        //文本节点
        if (typeof child === 'string') {
            newChildren.push({
                type: 'text',
                props: { textContent: child },
            })
        }
    })

    return {
        type,
        props: Object.assign({ children: newChildren }, props),
    }
}
```

## 实现render

```jsx
function render(VDOM, container) {
    let element = mountElement(VDOM)
    container.appendChild(element)
}

function mountElement(VDOM) {
    let element = null
    if (typeof VDOM.type === 'function') {
        // class组件有render方法
        if (VDOM.type.prototype.render) {
            element = mountClassElement(VDOM)
        } else {
            element = mountFnElement(VDOM)
        }
    } else {
        element = mountNativeElement(VDOM)
    }
    return element
}

function mountNativeElement(VDOM) {
    let element = null
    if (VDOM.type === 'text') {
        element = document.createTextNode(VDOM.props.textContent)
    } else {
        element = document.createElement(VDOM.type)
        // 设置属性
        setAttr(element, VDOM)
        VDOM.props.children && VDOM.props.children.forEach(child => {
            element.appendChild(mountElement(child))
        })
    }
    return element
}

function mountFnElement(VDOM) {
    let element = VDOM.type()
    return mountElement(element)
}

function mountClassElement(VDOM) {
    let element = new VDOM.type()
    return mountElement(element.render())
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

#### Component先定义个空类就行

```js
class Component {

}
```

## 测试代码

#### 要借助babel编译jsx后给react调用

```jsx
import myReact from "./myReact"

function FnComp() {
  return <div>Hello FnComp</div>
}

class ClassComp extends myReact.Component {
  render() {
    return <div>Hello ClassComp</div>
  }
}

const virtualDOM =
  <div>
    {null}
    react
    <h1 className='myClass' extraProp='extraProp' onclick={() => { console.log(1111); }}>h1标签</h1>
    <FnComp></FnComp>
    <ClassComp></ClassComp>
  </div>

myReact.render(virtualDOM, document.getElementById("root"))
```