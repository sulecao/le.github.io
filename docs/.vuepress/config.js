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
          { text: 'React', link: '/blog/react/1基础' },
          { text: 'React实现', link: '/blog/react实现/1redux实现' },
        ],
      },
    ],
    sidebar: [
      {
        title: '算法',
        collapsable: false, // 可选的, 默认值是 true,
        sidebarDepth: 0, // 可选的, 默认值是 1
        children: [
          ['/blog/算法/0算法题', '算法题'],
          ['/blog/算法/1栈', '栈'],
          ['/blog/算法/2队列', '队列'],
          ['/blog/算法/3链表', '链表'],
          ['/blog/算法/4BitMap', 'BitMap'],
        ],
      },
      {
        title: 'javascript',
        collapsable: true, // 可选的, 默认值是 true,
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
        title: 'React', // 必要的
        collapsable: true, // 可选的, 默认值是 true,
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
        collapsable: true, // 可选的, 默认值是 true,
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
    ],
    subSidebar: 'auto',
    smoothScroll: true,
    displayAllHeaders: true, // 默认值：false
  },
  plugins: ['@vuepress/back-to-top', '@vuepress/active-header-links'],
};
