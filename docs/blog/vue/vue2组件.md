## 注册组件

1. 必须要有一个根元素

2. data 须是一个function,防止使用多个组件时，引用的是相同的数据
3. 局部注册的组件使用时需要在components里声明下。

###  注册局部组件

```js
const Bar = {
  data() {
    return {
      count: 0,
    };
  },
  template: `<div>Bar
      {{count}}
      <button @click="count++"></button>
      </div>`,
};
```
### 注册全局组件和使用局部组件

```js
Vue.component("Foo", {
//需要在components里声明下局部组件
components: {
    Bar,
  },
  template: `<div>foo
      <Bar></Bar>
      <Bar></Bar>
      </div>`,
});
```
### 使用全局组件

```js
const app = new Vue({
  el: "#app",
  //全局组件不需要声明
  template: `
       <div>app
       <Foo></Foo>
       </div>
  `,
  data: {},
});
```

## 组件生命周期

```js
beforeCreate() {
// 刚初始化
},
created() {
// 数据初始化完毕，可以在这调用接口
},
beforeMount() {
// 挂载前
},
mounted() {
console.log("bar- mounted");
// 挂载完成 ，可以获取dom元素了
// window.addEventListener("")
},
beforeUpdate() {
// 更新前
},
updated() {
// 更新完成
},
beforeDestroy() {
// 销毁前
},
destroyed() {
// window.removeEventListener
// 销毁完
},
```

父子组件生命周期执行顺序

father:   beforeCreate
father:   created
father:   beforeMount

child:     beforeCreate
child:     created
child:     beforeMount

child:     mounted
father:   mounted

## 父子组件传值

####  父组件

```js
  <div id="app">
      <p>father{{ counter }}</p>
      <button-counter @increment="fatherIncrement" :counter="counter"></button-counter>
  </div>
  <script>
    const app = new Vue({
      el: "#app",
      data: {
        counter: 0
      },
      methods: {
        fatherIncrement(value) {
          this.counter += value
        }
      },
    });
  </script>
```

#### 子组件

```js
 Vue.component('button-counter', {
      props: ['counter'],
      template: '<button @click="incrementHandler">child{{ counter }}</button>',
      methods: {
        incrementHandler() {
          this.$emit('increment', 10)
        }
      },
    })
```

#### .sync 修饰符：

用来简写子组件给父组件传值，不再需要父组件特意定一个方法接受子组件参数

```html
  <div id="app">
    <div id="counter-event-example">
      <p>father{{ counter }}</p>
      <button-counter :counter.sync="counter"></button-counter>
    </div>
  </div>
  <script>

    Vue.component('button-counter', {
      props: ['counter'],
      template: '<button @click="changeCounter">child{{ counter }}</button>',
      methods: {
        changeCounter() {
          this.$emit('update:counter', 100)
        }
      },
    })

    const app = new Vue({
      el: "#app",
      data: {
        counter: 0
      },
    });
  </script>
```
## 插槽

#### 实现将父组件里分发内容给子组件

```html
<!--父组件-->
<!--引用子组件时内标签内写内容-->
<navigation-link url="/profile">
  Your Profile
</navigation-link>

<!--子组件-->
<!--子组件里预写了slot标签，最终会渲染为父组件传过来的“Your Profile”-->
<a
  v-bind:href="url"
  class="nav-link"
>
  <slot></slot>
</a>
```

#### 给插槽命名，以使用多个插槽,没有命名的为默认插槽。

```html
<!--子组件-->
<div class="container">
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <slot></slot>
  </main>
  <footer>
    <slot name="footer"></slot>
  </footer>
</div>
<!--父组件-->
<base-layout>
<!--v-slot:header 可以被缩写为 #header-->
  <template  #header>
    <h1>Here might be a page title</h1>
  </template>
  <p>A paragraph for the main content.</p>
  <p>And another one.</p>
  <template v-slot:footer>
    <p>Here's some contact info</p>
  </template>
</base-layout>
```

如果父组件想要访问子组件的数据。可以通过bind向父组件传递数据。

```html
<!--子组件-->
<span>
  <slot v-bind:user="user">
    {{ user.lastName }}
  </slot>
</span>
<!--父组件，接收对应插槽default的数据并定义一个名称。-->
<!--获取到一个对象，里面有子组件传过来的user，key为user-->
<current-user>
  <template v-slot:default="slotProps">
    {{ slotProps.user.firstName }}
  </template>
</current-user>

<!--解构插槽对象-->
<current-user v-slot="{ user }">
  {{ user.firstName }}
</current-user>
```

## 混入

出现命名冲突时：

数据对象在内部会进行递归合并，并在发生冲突时以组件数据优先。

同名钩子函数将合并为一个数组，因此都将被调用。另外，混入对象的钩子将在组件自身钩子**之前**调用。

值为对象的选项，例如 `methods`、`components` 和 `directives`，将被合并为同一个对象。两个对象键名冲突时，取组件对象的键值对。

#### 局部混入

```js
// 定义局部混入
const fooMixin = {
  data() {
    return {
      valueMixin: "foo - mixin",
    };
  },
};

const Foo = {
// 引入定义局部混入
  mixins: [fooMixin],
  data() {
    return {
      value: "foo - self",
    };
  },
  mounted() {
    console.log(this.value);//"foo - self"
    console.log(this.valueMixin);//"foo - mixin"
  },
}
```

#### 全局混入

```js
Vue.component("Foo", {
  data() {
    return {
      myOption: "Foo - option",
    };
  },
  template: `<div>Foo</div> `,
});

Vue.component("Bar", {
  data() {
    return {
      myOption: "Bar - option",
    };
  },
  template: `<div>Bar</div> `,
});

Vue.mixin({
  created: function () {
    console.log(this.myOption)
  }
})

new Vue({
  el: "#app",
  myOption: 'hell11o!',
  template: `<div> <Foo></Foo><Bar></Bar></div> `,
})

//控制台输出
Foo - option
Bar - option
```







## 动态组件is

使用:is属性来切换不同的子组件,is绑定的变量对应的值为组件的名称

```
<component :is="comName"></component>
```


## keep-alive

失活的组件将会被缓存,切换组件保持页面之前的状态,

keep-alive要求被切换到的组件都有自己的名字

`include` 和 `exclude` prop 允许组件有条件地缓存

被换成的组件有activated` 和 `deactivated两个钩子函数

```html
<keep-alive include="a,b">
  <component v-bind:is="currentTabComponent"></component>
</keep-alive>
```
