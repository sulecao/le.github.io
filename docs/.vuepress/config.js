module.exports = {
    title: '曹乐乐的博客',
    description: '曹乐乐的博客',
    // "theme": "reco",
    themeConfig: {
        nav: [
            {
                text: 'Docs',
                items: [
                    { text: 'React', link: '/blog/react/redux实现' },
                    { text: 'Vue', link: '/blog/vue/vue2基础' },
                ]
            },
        ],
        sidebar: [
            {
                title: 'Group 1',   // 必要的
                collapsable: false, // 可选的, 默认值是 true,
                sidebarDepth: 0,    // 可选的, 默认值是 1
                children: [
                    ['/blog/react/redux实现', 'redux实现'],
                    ['/blog/react/react-redux实现', 'Explicit link text']
                ]
            },
            {
                title: 'Group 2',
                collapsable: false, // 可选的, 默认值是 true,
                sidebarDepth: 0,    // 可选的, 默认值是 1
                children: [
                    ['/blog/react/redux实现', 'redux实现'],
                    ['/blog/react/react-redux实现', 'Explicit link text']
                ],
            }
        ],
        subSidebar: 'auto',
        smoothScroll: true,
        displayAllHeaders: true // 默认值：false
    },
    plugins: ['@vuepress/back-to-top', '@vuepress/active-header-links']
}