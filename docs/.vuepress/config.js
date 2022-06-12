module.exports = {
  title: '曹乐乐的博客',
  description: '曹乐乐的博客',
  // "theme": "reco",
  themeConfig: {
    nav: [
      {
        text: '目录',
        items: [
          { text: '算法', link: '/blog/算法/0算法题' },
          { text: 'javascript', link: '/blog/js/1基础类型' },
          { text: 'typescript', link: '/blog/ts/1安装和编译' },
          { text: 'React', link: '/blog/react/1基础' },
          { text: 'React实现', link: '/blog/react实现/1redux实现' },
          { text: 'Node', link: '/blog/node/1Node入门' },
          { text: '工程化', link: '/blog/工程化/1webpack的常用loader和plugin' },
          { text: '通信', link: '/blog/通信/1AJAX' },
        ],
      },
      {
       text: '留言',
       items: [
        { text: '留言', link: '/blog/message/message' },
       ]
      }
    ],
    sidebar: [
      {
        title: '算法',
        sidebarDepth: 0, // 可选的, 默认值是 1
        children: [
          ['/blog/算法/0算法题', '算法题'],
          ['/blog/算法/1栈', '栈'],
          ['/blog/算法/2队列', '队列'],
          ['/blog/算法/3链表', '链表'],
          ['/blog/算法/4BitMap', 'BitMap'],
          ['/blog/算法/5二叉树', '二叉树'],
          ['/blog/算法/6堆', '堆'],
          ['/blog/算法/7Union-Find并查集', '并查集'],
          ['/blog/算法/8排序', '排序'],
        ],
      },
      {
        title: 'javascript',
        sidebarDepth: 0, // 可选的, 默认值是 1
        children: [
          ['/blog/js/1基础类型', '基础类型'],
          ['/blog/js/2数组和字符串', '数组和字符串'],
          ['/blog/js/3对象与类', '对象与类'],
          ['/blog/js/4函数', '函数'],
          ['/blog/js/5函数式编程', '函数式编程'],
          ['/blog/js/6异步', '异步'],
          ['/blog/js/7实现Promise', '实现Promise'],
          ['/blog/js/8正则表达式', '正则表达式'],
          ['/blog/js/9数据响应式', '数据响应式'],
          ['/blog/js/10设计模式', '设计模式'],
          ['/blog/js/11其它', '其它'],
        ],
      },
      {
        title: 'typescript',
        sidebarDepth: 0, // 可选的, 默认值是 1
        children: [
          ['/blog/ts/1安装和编译', '安装和编译'],
          ['/blog/ts/2基本类型', '基础类型'],
          ['/blog/ts/3接口和高级类型', '接口和高级类型'],
          ['/blog/ts/4函数', '函数'],
          ['/blog/ts/5类', '类'],
          ['/blog/ts/6泛型', '泛型'],
          ['/blog/ts/7装饰器', '装饰器'],
        ],
      },
      {
        title: 'React', // 必要的
        sidebarDepth: 0, // 可选的, 默认值是 1
        children: [
          ['/blog/react/1基础', '基础'],
          ['/blog/react/2类组件', '类组件'],
          ['/blog/react/3函数组件', '函数组件'],
          ['/blog/react/4Redux', 'Redux'],
          ['/blog/react/5Router6与Router5', 'Router6与Router5'],
          ['/blog/react/6React路由拦截', 'React路由拦截'],
        ],
      },
      {
        title: 'React实现',
        sidebarDepth: 0, // 可选的, 默认值是 1
        children: [
          ['/blog/react实现/1redux实现', 'redux'],
          ['/blog/react实现/2react-redux实现', 'react-redux'],
          ['/blog/react实现/3VDOM简单实现', 'VDOM'],
          ['/blog/react实现/4React的fiber简单实现', 'fiber'],
          ['/blog/react实现/5React的hook之useState简单实现', 'hook之useState'],
          ['/blog/react实现/6React的diff算法与渲染简单实现', 'diff算法与渲染'],
          ['/blog/react实现/7React的scheduler介绍与简单实现', 'scheduler'],
        ],
      },
      {
        title: 'Node',
        sidebarDepth: 0, // 可选的, 默认值是 1
        children: [
          ['/blog/node/1Node入门', 'Node入门'],
          ['/blog/node/2KOA', 'KOA'],
          ['/blog/node/3node里使用MySQL', 'node里使用MySQL'],
        ],
      },
      {
        title: '工程化',
        sidebarDepth: 0, // 可选的, 默认值是 1
        children: [
          [
            '/blog/工程化/1webpack的常用loader和plugin',
            'webpack的常用loader和plugin',
          ],
          ['/blog/工程化/2webpack配置', 'webpack配置'],
          ['/blog/工程化/3用Node.js构建CLI工具', '用Node.js构建CLI工具'],
        ],
      },
      {
       title: '通信',
       sidebarDepth: 0, // 可选的, 默认值是 1
       children: [
         [
           '/blog/通信/1AJAX',
           'AJAX',
         ],
         ['/blog/通信/2即时通信', '即时通信'],
         ['/blog/通信/3http', 'http'],
       ],
     },
    ],
    subSidebar: 'auto',
    smoothScroll: true,
    displayAllHeaders: true, // 默认值：false
  },
  plugins: ['@vuepress/back-to-top', '@vuepress/active-header-links',  
    [
   '@vssue/vuepress-plugin-vssue', {
     // 设置 `platform` 而不是 `api`
     platform: 'github',
     // 其他的 Vssue 配置
     owner: 'sulecao',
     repo: 'sulecao.github.io',
     clientId: '03c35413c67fa3115490',
     clientSecret: '2608e459469fcd18b4249fd5c5293d4211b79f8c',
   }
  ],
  // [
  //  '@vssue/vuepress-plugin-vssue', {
  //    // 设置 `platform` 而不是 `api`
  //    platform: 'gitee',
  //    // 其他的 Vssue 配置
  //    owner: 'caolele',
  //    repo: 'caolele',
  //    clientId: '44885be432a464f86b9c4575de3301d6f14dedd69bb49affa2200e2f9f1d0b35',
  //    clientSecret: '40e0b0b348fb6379773b18b2fb64812601880a9e8d20aaf6ca6742bcf1c34b7d',
  //  }
  // ],

],
};
