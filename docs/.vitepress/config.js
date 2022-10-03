import { LOGO, GITHUB_URL, BLOG_PREFIX, LEETCODE_PREFIX } from "./global";

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
      { text: "博客", link: `${BLOG_PREFIX}/config` },
      { text: "LeetCode周赛题解", link: `${LEETCODE_PREFIX}/313-10-2` },
    ],
    sidebar: {
      "/guide/blog/": [
        {
          text: "博客",
          collapsible: true,
          items: [{ text: "config", link: `${BLOG_PREFIX}/config` }],
        },
      ],
      "/leetcode/": [
        {
          text: "2022年10月",
          items: [
            { text: "第313场(2022.10.2)", link: `${LEETCODE_PREFIX}/313-10-2` },
          ],
        },
      ],
    },
  },
};
