import {
  LOGO,
  GITHUB_URL,
  BLOG_PREFIX,
  HAND_WRITE,
  RECODE,
  REACT_PREFIX
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
      { text: "面试", link: `${HAND_WRITE}/手撕题目.md` },
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
              text: "JavaScript中的浮点数",
              link: `${BLOG_PREFIX}/JavaScript中的浮点数.md`,
            },
            {
              text: "作用域和上下文",
              link: `${BLOG_PREFIX}/作用域和上下文.md`,
            },
            {
              text: "异步传染",
              link: `${BLOG_PREFIX}/异步传染.md`,
            },
            {
              text: "从0搭建一个命令行CLI工具",
              link: `${BLOG_PREFIX}/从0搭建一个命令行CLI工具.md`,
            },
            {
              text: "浏览器从输入URL后经过了什么",
              link: `${BLOG_PREFIX}/浏览器从输入URL后经过了什么.md`,
            },
          ],
        },
        {
          text: "React设计原理笔记",
          collapsible: true,
          items: [
            {
              text: "前言",
              link: `${REACT_PREFIX}/前言.md`,
            },
            {
              text: "render阶段",
              link: `${REACT_PREFIX}/render阶段.md`,
            },
            {
              text: "commit阶段",
              link: `${REACT_PREFIX}/commit阶段.md`,
            },
            {
              text: "schedule阶段",
              link: `${REACT_PREFIX}/schedule阶段.md`,
            },
          ],
        },
      ],
      "/guide/interview": [
        {
          text: "面试手写题目",
          collapsible: true,
          items: [
            {
              text: "手撕题目",
              link: `${HAND_WRITE}/手撕题目.md`,
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
            {
              text: "async_await自动执行器",
              link: `${HAND_WRITE}/async_await自动执行器.md`,
            },
          ],
        },
        {
          text: "面试记录",
          collapsible: true,
          items: [
            {
              text: "腾讯实习生一面",
              link: `${RECODE}/腾讯公众号小程序团队前端实习生一面.md`,
            },
            {
              text: "字节前端实习生一面",
              link: `${RECODE}/字节data部门前端实习生一面.md`,
            },
            {
              text: "字节前端实习生一面",
              link: `${RECODE}/字节商业化部门前端实习生一面.md`,
            },
            {
              text: "小米前端实习生一面",
              link: `${RECODE}/小米前端实习生一面.md`,
            },
            {
              text: "小米前端实习生二面",
              link: `${RECODE}/小米前端实习生二面.md`,
            },
            {
              text: "知乎校招前端一面",
              link: `${RECODE}/知乎校招前端一面.md`,
            },
            {
              text: "美团校招前端一面",
              link: `${RECODE}/美团快驴校招前端一面.md`,
            },
            {
              text: "美团校招前端二面",
              link: `${RECODE}/美团快驴校招前端二面.md`,
            }
          ],
        },
      ],
    },
  },
};
