import {
  LOGO,
  GITHUB_URL,
  BLOG_PREFIX,
  HAND_WRITE,
  RECODE,
  LEETCODE,
} from "./global";

export default {
  title: "Luowei's Blog",
  lang: "zh-CN",
  lastUpdated: true,
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  markdown: {
    theme: "material-palenight",
    lineNumbers: true,
  },
  themeConfig: {
    siteTitle: "Luowei's Blog",
    description: "个人博客",
    logo: LOGO,
    outlineTitle: "目录",
    lastUpdatedText: "上次更新时间",
    editLink: {
      pattern: GITHUB_URL,
      text: "在Github上编辑此页",
    },
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2022-present Luo Wei",
    },
    // 广告
    // carbonAds: {
    //   code: "your-carbon-code",
    //   placement: "your-carbon-placement",
    // },
    nav: [
      { text: "首页", link: "/" },
      { text: "博客", link: `${BLOG_PREFIX}/自我介绍.md` },
      { text: "面试", link: `${LEETCODE}/力扣算法题单.md` },
    ],
    sidebar: {
      "/guide/blog/": [
        {
          text: "博客",
          collapsible: true,
          items: [
            {
              text: "自我介绍",
              link: `${BLOG_PREFIX}/自我介绍.md`,
            },
            {
              text: "跨端框架强烈推荐Flutter",
              link: `${BLOG_PREFIX}/跨端框架强烈推荐Flutter.md`,
            },
            {
              text: "JavaScript中的浮点数",
              link: `${BLOG_PREFIX}/JavaScript中的浮点数.md`,
            },
            {
              text: "从0搭建一个命令行CLI工具",
              link: `${BLOG_PREFIX}/从0搭建一个命令行CLI工具.md`,
            },
            {
              text: "《React设计原理》笔记",
              link: `${BLOG_PREFIX}/《React设计原理》笔记.md`,
            },
          ],
        },
      ],
      "/guide/interview": [
        {
          text: "LeetCode",
          collapsible: true,
          items: [
            {
              text: "力扣算法题单",
              link: `${LEETCODE}/力扣算法题单.md`,
            },
          ],
        },
        {
          text: "面试手写题目",
          collapsible: true,
          items: [
            {
              text: "JS手撕题目",
              link: `${HAND_WRITE}/JS手撕题目.md`,
            },
            {
              text: "Promise类",
              link: `${HAND_WRITE}/Promise类.md`,
            },
            {
              text: "Axio响应拦截器",
              link: `${HAND_WRITE}/Axios响应拦截器.md`,
            },
            {
              text: "Promise并发调度",
              link: `${HAND_WRITE}/Promise并发调度.md`,
            },
            {
              text: "Promise请求重试",
              link: `${HAND_WRITE}/Promise请求重试.md`,
            },
            {
              text: "音乐播放器",
              link: `${HAND_WRITE}/音乐播放器.md`,
            },
          ],
        },
        {
          text: "面试记录",
          collapsible: true,
          items: [
            // {
            //   text: "面试模拟题",
            //   link: `${RECODE}/面试模拟题.md`,
            // },
            {
              text: "腾讯公众号&小程序团队实习一面",
              link: `${RECODE}/腾讯公众号小程序团队前端实习生一面.md`,
            },
            {
              text: "字节data部门实习一面",
              link: `${RECODE}/字节data部门前端实习生一面.md`,
            },
            {
              text: "站库前端实习生一面",
              link: `${RECODE}/站库前端实习生一面.md`,
            },
            {
              text: "字节商业化部门前端实习生一面",
              link: `${RECODE}/字节商业化部门前端实习生一面.md`,
            },
          ],
        },
      ],
    },
  },
};
