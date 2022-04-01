## 三种状态

##### pending,resolved,rejected,状态一旦确定不可更改

```js
class MyPromise {
    constructor(handle) {
        this['[[PromiseStatus]]'] = "pending"
        this['[[PromiseValue]]'] = undefined
        handle(this.resolve.bind(this), this.reject.bind(this))
    }
    resolve(val) {
        if (this['[[PromiseStatus]]'] === "pending") {
            this['[[PromiseStatus]]'] = "resolved"
            this['[[PromiseValue]]'] = val
        }
    }
    reject(err) {
        if (this['[[PromiseStatus]]'] === "pending") {
            this['[[PromiseStatus]]'] = "rejected"
            this['[[PromiseValue]]'] = err
        }
    }
}
```

## then方法

需要异步执行resolveFn和rejectFn，不然MyPromise里执行resolve或reject时，then里面的方法还没读取到。

可以用MutationObserver模拟微任务。

```js
class MyPromise {
    constructor(handle) {
        this['[[PromiseStatus]]'] = "pending"
        this['[[PromiseValue]]'] = undefined
        handle(this.resolve.bind(this), this.reject.bind(this))
    }
    resolve(val) {
        if (this['[[PromiseStatus]]'] === "pending") {
            this['[[PromiseStatus]]'] = "resolved"
            this['[[PromiseValue]]'] = val
            const run = () => {
                this.resolveFn(val)
            }
            const observer = new MutationObserver(run);
            observer.observe(document.body, {
                attributes: true
            });
            document.body.setAttribute("key", "value");
        }

    }
    reject(err) {
        if (this['[[PromiseStatus]]'] === "pending") {
            this['[[PromiseStatus]]'] = "rejected"
            this['[[PromiseValue]]'] = err
            const run = () => {
                this.rejectFn(err)
            }
            const observer = new MutationObserver(run);
            observer.observe(document.body, {
                attributes: true
            });
            document.body.setAttribute("key", "value");
        }

    }
    then(resolveFn, rejectFn) {
        this.resolveFn = resolveFn
        this.rejectFn = rejectFn
    }
}
```

## 支持并列多个then

并列的then都是获取到调用then的Promise对象的值。

```js
let p = new Promise((resolve, reject) => {
    resolve('success');
    // reject("err");
})
p.then(res => {
    console.log(1, res);
})
p.then(res => {
    console.log(2, res);
})
// 1 "success"
// 2 "success"
```

##### 需要用一个数组存储then传进来的函数。在resolved或rejected后遍历执行

```js
class MyPromise {
    constructor(handle) {
        this['[[PromiseStatus]]'] = "pending"
        this['[[PromiseValue]]'] = undefined
        this.resolveQueue = []
        this.rejectQueue = []
        handle(this.resolve.bind(this), this.reject.bind(this))
    }
    resolve(val) {
        if (this['[[PromiseStatus]]'] === "pending") {
            this['[[PromiseStatus]]'] = "resolved"
            this['[[PromiseValue]]'] = val
            const run = () => {
                let cb;
               // 直接删除而不是forEach遍历执行，是因为都是用的事件监听，不然后面会被重复执行
                while (cb = this.resolveQueue.shift()) {
                    cb && cb(val);
                }
            }
            const observer = new MutationObserver(run);
            observer.observe(document.body, {
                attributes: true
            });
            document.body.setAttribute("key", "value");
        }
    }
    reject(err) {
        if (this['[[PromiseStatus]]'] === "pending") {
            this['[[PromiseStatus]]'] = "rejected"
            this['[[PromiseValue]]'] = err
            const run = () => {
                let cb;
                while (cb = this.rejectQueue.shift()) {
                    cb && cb(err);
                }
            }
            const observer = new MutationObserver(run);
            observer.observe(document.body, {
                attributes: true
            });
            document.body.setAttribute("key", "value");
        }
    }
    then(resolveFn, rejectFn) {
        this.resolveQueue.push(resolveFn)
        this.rejectQueue.push(rejectFn)
    }
}
```

## 链式调用then

then执行返回的是一个新的promise对象，

可以返回正常值，若返回promise对象，会自动解析入参传递给下一个then。

```js
let p2 = new Promise((resolve, reject) => {
    resolve("success");
    // reject("err");
}).then(res => {
    console.log(1, res);//1 "success"
    return 1
}).then(res => {
    console.log(2, res);//2 1
    return new Promise((resolve) => {
        resolve('2promise')
    })
}).then(res => {
    console.log(3, res);//3 "2promise"
})
```

```js
class MyPromise {
    constructor(handle) {
        this['[[PromiseStatus]]'] = "pending"
        this['[[PromiseValue]]'] = undefined
        this.resolveQueue = []
        this.rejectQueue = []
        handle(this.resolve.bind(this), this.reject.bind(this))
    }
    resolve(val) {
        if (this['[[PromiseStatus]]'] === "pending") {
            this['[[PromiseStatus]]'] = "resolved"
            this['[[PromiseValue]]'] = val
            const run = () => {
                let cb;
                while (cb = this.resolveQueue.shift()) {
                    cb && cb(val);
                }
            }
            const observer = new MutationObserver(run);
            observer.observe(document.body, {
                attributes: true
            });
            document.body.setAttribute("key", "value");
        }
    }
    reject(err) {
        if (this['[[PromiseStatus]]'] === "pending") {
            this['[[PromiseStatus]]'] = "rejected"
            this['[[PromiseValue]]'] = err
            const run = () => {
                let cb;
                while (cb = this.rejectQueue.shift()) {
                    cb && cb(err);
                }
            }
            const observer = new MutationObserver(run);
            observer.observe(document.body, {
                attributes: true
            });
            document.body.setAttribute("key", "value");
        }
    }
    then(resolveFn, rejectFn) {
        return new MyPromise((resolve, reject) => {
            // 返回一个新的Promise
            // 需要取到上一个then的返回值
            // 判断返回的结果是正常值直接返回，是Promise值需要取出来返回
            function TResolveFn(val) {
                let result = resolveFn && resolveFn(val)
                if (result instanceof MyPromise) {
                    result.then(res => {
                        resolve(res)
                    }, err => {
                        reject(err)
                    })
                } else {
                    resolve(result)
                }
            }
            this.resolveQueue.push(TResolveFn)

            function TRejectFn(val) {
                let result = rejectFn && rejectFn(val)
                if (result instanceof MyPromise) {
                    result.then(res => {
                        resolve(res)
                    }, err => {
                        reject(err)
                    })
                } else {
                    reject(result)
                }
            }
            this.rejectQueue.push(TRejectFn)
        })
    }
}
```

## catch和finally方法

```js
    catch(fn) {
        return this.then(undefined, fn);
    }
    finally(fn) {
        //不管成功失败都会执行
        this.then(fn, fn)
    }
```

## 静态方法

#### resolve

返回一个成功状态Promise

```js
    static resolve(result) {
        return new MyPromise((resolve) => {
            resolve(result)
        })
    }
```

#### reject

返回一个失败状态Promise

```js
    static reject(result) {
        return new MyPromise((resolve, reject) => {
            reject(result)
        })
    }
```

#### all

接受一个Promise数组，返回一个新的Promise，
如果Promise都成功，按数组顺序返回成功状态，
若有一个失败，返回最先被reject的值。

```js
        static all(promiseAry) {
        let result = []
        let num = 0
        return new MyPromise((resolve, reject) => {
            for (let i = 0; i < promiseAry.length; i++) {
                promiseAry[i].then((res) => {
                    result[i] = res
                    num++
                    if (num === promiseAry.length) {
                        resolve(result)
                    }
                }, err => {
                    reject(err)
                })
            }
        })
    }
```

#### race

 接受一个Promise数组，返回一个新的Promise，
 返回最快响应的Promise

```js
    static race(promiseAry) {
        return new MyPromise((resolve, reject) => {
            for (let i = 0; i < promiseAry.length; i++) {
                promiseAry[i].then((res) => {
                    resolve(res)
                }, err => {
                    reject(err)
                })
            }
        })
    }
```

#### allSettled

  接受一个Promise数组，返回一个新的Promise，

  不管成功和失败都会返回，数据结构如下

```js
  //成功：
  {
  status: "fulfilled"
  value: "success"
  }
  //失败
  {
  reason: "err"
  status: "rejected"
  }
```

```js
    static allSettled(promiseAry) {
        let result = []
        let num = 0
        return new MyPromise((resolve, reject) => {
            for (let i = 0; i < promiseAry.length; i++) {
                promiseAry[i].then((res) => {
                    result[i] = {
                        status: "fulfilled",
                        value: res
                    }
                    num++
                    if (num === promiseAry.length) {
                        resolve(result)
                    }
                }, err => {
                    result[i] = {
                        status: "rejected",
                        value: err
                    }
                    num++
                    if (num === promiseAry.length) {
                        resolve(result)
                    }
                })
            }
        })
    }
```
