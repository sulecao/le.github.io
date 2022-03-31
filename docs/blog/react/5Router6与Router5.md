## Router6

官网：<https://reactrouter.com/>

安装

```
npm i -S react-router-dom
```

#### demo(router5写法见下半部分)

```tsx
//index.js
import ReactDOM from 'react-dom';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate
} from "react-router-dom";
import App from './App';
import Expenses from "./routes/expenses";
import Invoices from "./routes/invoices";
import Invoice from "./routes/invoice";
import { useEffect } from 'react';

const router6 = {}

//class组件没有支持编程式导航的方法，可以在最外围用hooks组件包裹一下，并保存navigate
//另一个方案见expenses文件
function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    router6.navigate = navigate
  }, [])

  return (
    <Routes>
      <Route path="/" element={<App />} >
        <Route path="expenses" element={<Expenses />} />
        <Route path="invoices" element={<Invoices />} >
          {/* 默认路由 */}
          <Route
            index
            element={
              <main style={{ padding: "1rem" }}>
                <p>Select an invoice</p>
              </main>
            }
          />
          {/* 嵌套子路由 */}
          <Route path=":invoiceId" element={<Invoice />} />
        </Route>
        <Route
          path="*"
          element={
            <main style={{ padding: "1rem" }}>
              <p>There's nothing here!</p>
            </main>
          }
        />
      </Route>
    </Routes>
  );
}

ReactDOM.render(
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>,
  document.getElementById('root')
);


export default router6
```

```tsx
//App.js
import { Outlet, Link } from "react-router-dom";
export default function App() {
  return (
    <div>
      <h1>Bookkeeper</h1>
      <nav
        style={{
          borderBottom: "solid 1px",
          paddingBottom: "1rem"
        }}
      >
        {/* link组件，导航 */}
        <Link to="/invoices">Invoices</Link> |{" "}
        <Link to="/expenses">Expenses</Link>
      </nav>
      {/* Outlet组件用来展示匹配到的路由对应的element */}
      <Outlet />
    </div>
  );
}
```

```tsx
./routes/invoices.jsx
import { NavLink, Outlet, useSearchParams, useLocation } from "react-router-dom";
import { getInvoices, } from "../data";

export default function Invoices() {
    let invoices = getInvoices();
    // 获取和设置SearchParams
    let [searchParams, setSearchParams] = useSearchParams();
    return (
        <div style={{ display: "flex" }}>
            <nav
                style={{
                    borderRight: "solid 1px",
                    padding: "1rem"
                }}
            >
                <input
                    value={searchParams.get("filter") || ""}
                    onChange={event => {
                        let filter = event.target.value;
                        if (filter) {
                            setSearchParams({ filter });
                        } else {
                            setSearchParams({});
                        }
                    }}
                />
                {invoices
                    .filter(invoice => {
                        let filter = searchParams.get("filter");
                        if (!filter) return true;
                        let name = invoice.name.toLowerCase();
                        return name.startsWith(filter.toLowerCase());
                    })
                    .map(invoice => (
                        // 有激活样式的link
                        <NavLink
                            style={({ isActive }) => ({
                                display: "block",
                                margin: "1rem 0",
                                color: isActive ? "red" : ""
                            })}
                            to={`/invoices/${invoice.number}`}
                            key={invoice.number}
                        >
                            {invoice.name}
                        </NavLink>
                    ))}
            </nav>
            <Outlet />
        </div>
    );
}

//可以用他来替换NavLink，实现跳转后保存输入框里的过滤条件
// function QueryNavLink({ to, ...props }) {
//     let location = useLocation();
//     return <NavLink to={to + location.search} {...props} />;
// }
```

```tsx
./routes/invoice.js
import { useParams,useNavigate  } from "react-router-dom";
import { getInvoice, deleteInvoice} from "../data";
export default function Invoice() {
  // hooks里的编程式路由导航
  let navigate = useNavigate();
  let params = useParams();
  let invoice = getInvoice(parseInt(params.invoiceId, 10));
  console.log(params);//{invoiceId: "2000"}
  return (
    <main style={{ padding: "1rem" }}>
      <h2>Total Due: {invoice.amount}</h2>
      <p>
        {invoice.name}: {invoice.number}
      </p>
      <p>Due Date: {invoice.due}</p>
      <p>
        <button
          onClick={() => {
            deleteInvoice(invoice.number);
            navigate("/invoices");
          }}
        >
          Delete
        </button>
      </p>
    </main>
  );
}
```

```tsx
./routes/expenses.jsx
import { Component } from 'react'
//另一种类组件编程式导航 设置一个state改变Navigate显隐，Navigate渲染时会自动跳转。
// import { Navigate } from "react-router-dom";
// class Expenses extends Component {
//   state = {
//     user: null,
//   }
//   render() {
//     return (
//       <main style={{ padding: "1rem 0" }}>
//         {this.state.user && (
//           <Navigate to='/invoices' replace='true' />
//         )}
//         <h2>Expenses</h2>
//         <p>
//           <button
//             onClick={() => {
//               this.setState({
//                 user:true
//               })
//             }}
//           >
//             toInvoices
//           </button>
//         </p>
//       </main>
//     );
//   }
// }

// export default Expenses

import router6 from '../index'
class Expenses extends Component {
  render() {
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Expenses</h2>
        <p>
          <button
            onClick={() => {;
              router6.navigate("/invoices")
            }}
          >
            toInvoices
          </button>
        </p>
      </main>
    );
  }
}

export default Expenses
```

```js
./data.js 静态数据
let invoices = [
    {
      name: "Santa Monica",
      number: 1995,
      amount: "$10,800",
      due: "12/05/1995"
    },
    {
      name: "Stankonia",
      number: 2000,
      amount: "$8,000",
      due: "10/31/2000"
    },
    {
      name: "Ocean Avenue",
      number: 2003,
      amount: "$9,500",
      due: "07/22/2003"
    },
    {
      name: "Tubthumper",
      number: 1997,
      amount: "$14,000",
      due: "09/01/1997"
    },
    {
      name: "Wide Open Spaces",
      number: 1998,
      amount: "$4,600",
      due: "01/27/2998"
    }
  ];
  
  export function getInvoices() {
    return invoices;
  }

  export function getInvoice(number) {
    return invoices.find(
      invoice => invoice.number === number
    );
  }

  export function deleteInvoice(number) {
    invoices = invoices.filter(
      invoice => invoice.number !== number
    );
  }
```

## Router5

安装

```bash
npm i -S react-router-dom@5
```

#### demo(实现了和router6一样的功能)

```tsx
./index.js
import ReactDOM from 'react-dom';
import {
  BrowserRouter,
} from "react-router-dom";
import App from './App';

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter >,
  document.getElementById('root')
);
```

```tsx
./App.js
import { Switch, Route, Link } from "react-router-dom";
import Expenses from "./routes/expenses";
import Invoices from "./routes/invoices";

export default function App() {
  return (
    <div>
      <h1>Bookkeeper</h1>
      <nav
        style={{
          borderBottom: "solid 1px",
          paddingBottom: "1rem"
        }}
      >
        {/* link组件，导航 */}
        <Link to="/invoices">Invoices</Link> |{" "}
        <Link to="/expenses">Expenses</Link>
      </nav>
      {/* 路由匹配的组件显示位置 */}
      <Switch>
        <Route path="/invoices">
          <Invoices />
        </Route>
        <Route path="/expenses">
          <Expenses />
        </Route>
      </Switch>
    </div>
  );
}
```

```tsx
./routes/invoices.jsx
import { useState } from 'react'
import { NavLink, Route } from "react-router-dom";
import { getInvoices, } from "../data";
import Invoice from "./invoice";
export default function Invoices() {
    let invoices = getInvoices();
    const [searchParams, setSearchParams] = useState('');
    return (
        <div style={{ display: "flex" }}>
            <nav
                style={{
                    borderRight: "solid 1px",
                    padding: "1rem"
                }}
            >
                <input
                    value={searchParams}
                    onChange={event => {
                        let filter = event.target.value;
                        if (filter) {
                            setSearchParams(filter);
                        } else {
                            setSearchParams('');
                        }
                    }}
                />
                {invoices
                    .filter(invoice => {
                        if (!searchParams) return true;
                        let name = invoice.name.toLowerCase();
                        return name.startsWith(searchParams.toLowerCase());
                    })
                    .map(invoice => (
                        // 有激活样式的link
                        <NavLink
                            style={isActive => ({
                                display: "block",
                                margin: "1rem 0",
                                color: isActive ? "red" : ""
                            })}
                            to={`/invoices/${invoice.number}`}
                            key={invoice.number}
                        >
                            {invoice.name}
                        </NavLink>
                    ))}
            </nav>
            {/* 动态路由参数后面加个？表示可选的 */}
            <Route path="/invoices/:invoiceId?">
                <Invoice />
            </Route>
        </div>
    );
}
```

```tsx
./routes/invoice.js
import { useParams, useHistory } from "react-router-dom";
import { getInvoice, deleteInvoice } from "../data";
export default function Invoice() {
  // hooks里的编程式路由导航
  let history = useHistory();
  let params = useParams();
  let invoice = getInvoice(parseInt(params.invoiceId, 10));
  console.log('Invoice',params);//{invoiceId: "2000"}
  return (
    <main style={{ padding: "1rem" }}>
      {!params.invoiceId &&
        <p>Select an invoice</p>
      }
      {params.invoiceId &&
        <>
          <h2>Total Due: {invoice.amount}</h2>
          <p>
            {invoice.name}: {invoice.number}
          </p>
          <p>Due Date: {invoice.due}</p>
          <p>
            <button
              onClick={() => {
                deleteInvoice(invoice.number);
                history.push("/invoices");
              }}
            >
              Delete
            </button>
          </p>
          </>
      }
    </main>
  );
}
```

```tsx
./routes/expenses.jsx
import { Component } from 'react'
import { withRouter } from "react-router-dom";
//类组件可以用withRouter包裹一下，props上会有路由方法
class Expenses extends Component {
  render() {
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Expenses</h2>
        <p>
          <button
            onClick={() => {
              console.log(this.props);
              this.props.history.push("/invoices")
            }}
          >
            to-Invoices
          </button>
        </p>
      </main>
    );
  }
}

export default withRouter(Expenses);
```

./data.js
同Router6文件
