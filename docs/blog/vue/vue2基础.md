## Hello World

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
  </head>
  <body>
    <div id="app">{{msg}}</div>
    <script>
      new Vue({
        el: "#app",
        data: {
          msg: "Hello World",
        },
      });
    </script>
  </body>
</html>
```

### v-bind

缩写：`:`

```js
<div :title="msg"></div>
```

## 事件处理

 v-on 缩写:@

```html
<button @click="count++">click</button>
<button @click="onClick">click</button>
<button @click="handleClick(1,$event)">click</button>
```
## 条件渲染

- v-if  新增和移除元素
- v-show 通过display控制元素展示
- v-if vs v-show
  - `v-if` 是“真正”的条件渲染，因为它会确保在切换过程中条件块内的事件监听器和子组件适当地被销毁和重建。
  - v-if` 是惰性的：如果初始渲染时条件为假，则直到条件第一次变为真时，才会开始渲染。` 
  - `v-show`不管初始条件是什么，元素总是会被渲染，只是简单地用display 进行切换。
  - 一般来说，`v-if` 有更高的切换开销，而 `v-show` 有更高的初始渲染开销。因此，如果需要非常频繁地切换，则使用 `v-show` 较好；如果在运行时条件很少改变，则使用 `v-if` 较好。

## 列表渲染

v-for，添加唯一的key值，不建议使用index

```html
<!-- 遍历数组 -->
<li v-for="(user,index) in users" :key="index">
{{index}} -- {{user.age}} -- {{user.name}}
</li>
<!-- 遍历对象 -->
<li v-for="(val,key,index) in userInfo">{{index}} --{{key}} - {{val}}</li>
```

## class

可以和正常的class共存

数组写法：

```js
<div class="static" :class="['box1', 'box2', isactive ? 'active' : '']]"></div>
```

对象写法：

```js
<div class="static" :class="{'box1': isActive, 'box2': isChecked}"></div>
```

## style

可以和正常的style共存

对象形式:

```js
<div style="color: red;" :style=" {background: 'green' }"></div>
```

数组形式 :将多个样式对象应用到同一个元素上

```js
<div style="height: 20px;" :style="[style1, style2]"></div>
```

## v-model

```js
<input type="text" v-model="title" />
```

原理

```js
<input type="text" @input="handleInput" :value="content" />
 
app = new Vue({
        el: "#app",
        data: {
          content: "test",
        },
        methods: {
          handleInput(e) {
            this.content = e.target.value;
          },
        },
      });
```
## computed

新增了变量名，拥有可读性

依赖数据没有变化时不会多次执行，可缓存

```js
computed: {
    reverseMsg() {
        // 可缓存，即使多个地方使用此变量，仍然只执行一次
        console.log("once");
        return this.msg.split("").reverse().join("");
    },
},
```

## watch

当需要在数据变化时执行异步或开销较大的操作时使用

deep 深度监听对象的值变化。

immediate 初始化是立即执行一次

```js
watch: {
    msg: {
        handler(newValue, oldValue) {
            console.log(newValue, oldValue);
            // 更新多个值
            this.msg1 = newValue + ":msg1";
            this.msg2 = newValue + ":msg2";
            this.msg3 = newValue + ":msg3";

            // 请求后端接口，获取数据
            axios("test").then((res) => {
                console.log(res);
            });
        },
            immediate: true,
    },
        "info": {
            handler(newValue, oldValue) {
                console.log(newValue, oldValue);
            },
                deep: true,
        },
```