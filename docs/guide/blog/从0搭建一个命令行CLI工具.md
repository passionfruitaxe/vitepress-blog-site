# 从0搭建一个命令行CLI工具

## 背景

大多数人应该都面临过一个问题，每次项目都使用类似`create-react-app`这类工具，然后还要再根据自己的需求进行配置，添加各种依赖包。

又比如我会更加青睐于`Vite`，所以我更希望默认打包工具是`Vite`而不是`Webpack`，`Vite`官方提供的脚手架会有和上面一样的问题，当我想要去自己做一个`cli`时却发现无从下手，本篇文章就记录一下我做的一个交互式命令行`cli`过程

本文实现了一个基于`Node.js`的命令行CLI工具

目前常见的`cli`方案有很多，比如：

`degit`方案

`Yeoman`方案

……

这里就不一一介绍了，感兴趣可以自行了解

> degit应该是最简单的方案了，他的问题是需要手动执行命令，而我的需求是一条命令生成可以运行的项目



## 准备工作

确保已经安装`Node.js`（本文中使用的为`v18.16.0`）

#### 核心库：

在开始前我想要先介绍一下主要用到的几个核心`npm`包

1. `Commander.js`

   主要用于获取命令行参数解析，基于`Node.js`的`process`模块

2. `Inquirer.js`

   交互式命令行信息收集器，基于`Node.js`的`readline`模块

3. `execa`

   主要用于执行外部命令，基于`Node.js`的`child_process`模块

<br/>

这么描述不太清晰，我举个例子解释一下

假设我们生成脚手架有以下核心步骤：

| 步骤             | 命令行示例             | 使用的库       |
| ---------------- | ---------------------- | -------------- |
| 启动脚手架       | `create-spr-app start` | `Commander.js` |
| 交互获取项目信息 | `您的项目名称：______` | `Inquirer.js`  |
| 安装依赖         | `pnpm install`         | `execa`        |

<br/>

#### 主要流程：

我们先预先制定好脚手架的流程

大致如下：

| 步骤 | 描述         |
| ---- | ------------ |
| 1    | 启动脚手架   |
| 2    | 选择包管理器 |
| 3    | 选择模板     |
| 4    | 选择打包工具 |
| 5    | 选择默认依赖 |
| 6    | 项目生成     |

<br/>

#### 自动化流程：

> 工欲善其事，必先利其器

对于一个脚手架，我会希望他能够发布到`npm`上

更理想的是我本地推到GitHub仓库后自动发布，这里我选择了`Github Action`

配置文件如下：

```yaml
# release.yml
name: Release

on:
  push:
    branches:
      - main

defaults:
  run:
    shell: bash

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      # 设置 pnpm 指定版本7.0
      - name: Setup PNPM
        uses: pnpm/action-setup@v2.2.1
        with:
          version: ^7.0
      # 设置 Node
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 16
          cache: "pnpm"
      # 安装依赖
      - name: Install dependencies
        run: pnpm install
      # 打包
      - name: Build Packages
        run: pnpm run build
      # 创建.npmrc文件
      - name: Create .npmrc file
        run: echo "//registry.npmjs.org/:_authToken=${{secrets.NPM_AUTH_TOKEN}}" > ~/.npmrc
      # 发布
      - name: Publish to NPM
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }}
        run: npm publish --access public
```

这里我动态生成了一个`.npmrc`文件，是因为我在发布时的环境变量`NODE_AUTH_TOKEN`出现问题失效了，所以动态创建一个`.npmrc`解决了这个问题

<br/>

`NPM_AUTH_TOKEN`在[npm (npmjs.com)](https://www.npmjs.com/)登录后从`Access Tokens`获取

然后在GitHub仓库中`settings/Security/Secrets and variables/Actions`创建环境变量`NPM_AUTH_TOKEN`

![屏幕截图 2023-06-03 172210](/images/1.3.png)

具体我就不在这细说了，实在不会可以百度

总之，我们通过`Github Action`来完成自动发布这个工作

万事具备我们准备启程！



## 初始化项目

这个`cli`项目我打算采用`Node.js+TypeScript+ESM`，因为是`ESM`所以会有一些不同

接下来给出核心配置文件，会包含一些核心注释

<br/>

#### **`package.json：`**

```json
{
  "name": "create-spr-app",
  "version": "1.1.6",
  "author": "PassionFruit",
  "license": "MIT",
  "description": "a interactive javascript cli by node",
  "main": "./dist/index.js",
  "type": "module",
  "keywords": [
    "create-spr-app",
    "cli",
    "react",
    "vue"
  ],
  "files": [
    "dist/*",
    "template/.gitignore",
    "template/*"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/PassionFruitAXE/create-spr-app.git"
  },
  "bugs": {
    "url": "https://github.com/PassionFruitAXE/create-spr-app/issues"
  },
    // 这个很重要 它决定了你将用什么全局命令来启动脚手架
  "bin": {
    "create-spr-app": "./dist/index.js"
  },
  "scripts": {
      // 开发环境调试我是用的ts-node 需要全局安装ts-node
    "dev": "ts-node src/index.ts start",
      // 打包用的tsc
    "build": "npx rimraf dist && npx tsc",
    "serve": "create-spr-app start"
  },
  "dependencies": {
    "chalk": "^5.2.0",
    "commander": "^10.0.1",
    "execa": "^7.1.1",
    "inquirer": "^9.2.2"
  },
  "devDependencies": {
    "@types/inquirer": "^9.0.3",
    "@types/node": "^20.1.0",
    "rimraf": "^5.0.0",
    "typescript": "^5.0.4"
  }
}
```

<br/>

#### **`tsconfig.json：`**

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "module": "NodeNext",
    "forceConsistentCasingInFileNames": true,
    "sourceMap": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts", "src/index.ts"],
  "exclude": ["node_modules/*", "template/*.tsx"],
  "ts-node": {
    "esm": true
  }
}
```

<br/>

#### **安装依赖：**

```bash
$ pnpm install
```

代码入口是`src/index.ts`



## 项目需求获取

```ts
// src/index.ts
import { program } from "commander";

async function action(){
    // 执行操作
}

program.version("1.0.0");
program.command("start").description("启动cli").action(action);
program.parse(process.argv);
```

像这样就是`Commander.js`的简单调用了，接受命令为：`create-spr-app start`

**即使没有`start`参数，也会得到相应的提示和引导**，这得益于`Commander.js`提供的封装

<br/>

接下来将我们通过`Inquirer.js`实现**step2-step5**

```ts
// src/index.ts
async function action(){
  /** 获取项目名 包管理器 模板 打包工具 */
  const { projectName, packageManager, template, builder } =
    await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "输入项目名称",
      },
      {
        type: "list",
        name: "packageManager",
        message: "选择包管理器",
          // PackageManager为枚举类型
        choices: [PackageManager.PNPM, PackageManager.YARN, PackageManager.NPM],
      },
      {
        type: "list",
        name: "template",
        message: "选择模板",
          // Template为枚举类型
        choices: [Template.REACT],
      },
      {
        type: "list",
        name: "builder",
        message: "选择打包工具",
          // Builder为枚举类型
        choices: [Builder.VITE],
      },
    ]);

  /** 获取默认依赖包 */
  const { deps } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "deps",
      message: "默认依赖包",
      choices: createPackagesByTemplate(template),
    },
  ]);
}
```

`Inquirer.js`简单来说就是通过命令行交互选择的`choices`值赋值给对应的`name`属性，例如在获取默认依赖包中赋值给了`deps`属性

>  这个`choices`可以是任何类型

这里采用了一个工厂函数的原因也很简单，根据不同的模板返回不同的依赖包列表，并且这里先按下依赖包`choices`类型不表

至此，我们可以认为已经获取到了用户对这个项目的所有需求，接下来就是生成项目



## 生成项目

在上一个阶段我们已经获取了用户对生成项目的所有需求，下一个步骤是生成项目文件

```ts
async function action(){
	······
  /** 创建项目目录 */
  const rootPath = path.join(process.cwd(), `/${projectName}`);

  /** 创建项目实例 */
  const project = new Project({
    rootPath,
    projectName,
    packageManager,
    template,
    builder,
    deps,
  });
  /** 生成项目 */
  await project.run();
}
```

上方代码在`Project`对象中传入项目的所有参数，并且执行`project.run()`方法

所以`Project`类的实现是整个脚手架中的核心

我为一个前端项目划分了如下几个模块

| 模块名           | 对应值        |
| ---------------- | ------------- |
| package.json模块 | 依赖相关      |
| 构建工具模块     | 打包工具相关  |
| ts模块           | ts相关        |
| 文件模块         | 其他文件相关  |
| git模块          | git相关       |
| README.md模块    | README.md相关 |

其实到这儿为止一个简单的脚手架雏形已经构建完毕了，后面利用`fs`模块生成文件即可，方案也并非唯一

最后安装依赖即可，`execa`基本使用如下：

```ts
// utils/command.ts
async function useCommand(command: string, cwd: string) {
  await execa(`${command}`, [], {
    cwd,
    stdio: ["inherit", "pipe", "inherit"],
  });
}

// packageModule.ts
async function packageInstall(): Promise<void> {
    console.log(chalk.cyan("安装依赖中~~~"));
	// Project类实例化时传递了packageManager和rootPath
    await useCommand(
        `${this.config.packageManager} install`,
        this.config.rootPath
    );
    console.log(chalk.cyan("依赖安装完成"));
}
```

如果你有兴趣可以去[PassionFruitAXE/create-spr-app](https://github.com/PassionFruitAXE/create-spr-app)查看具体源代码，目前这个项目还有很多缺陷，这里我就不讲源码设计过程了，接下来主要讲几个遇到的问题



## 遇到的问题

#### 问题1：

报错`export not define`和`require() not support`

这个报错主要是因为依赖中仍采用的`CJS`代码，而这个项目我采用的为`ESM`

解决方法：

1. 直接全换`CJS`，降低部分依赖版本
2. `package.json`设置`type: module`、`tsconfig`设置`module: NodeNext`、更新依赖为最新版本，目前核心的三个库都有`ESM`版本

<br>

#### 问题2：

脚手架中我默认将`prettier` `eslint` `stylelint`等依赖加入了，然而引入一些新的包会需要修改一些配置文件（比如`tailwindcss`）

解决方法：

其实也没太好的方法，为每种组合单独实现一个类，利用面向对象方法的继承+多态实现，再辅以工厂模式+策略模式

实际上我**几乎所有模块**都这么做的，我暂时寄希望于不会有太多”交叉“的依赖配置文件

```ts
// project.ts
/**
   * Project类构造函数
   * @param config 项目配置对象
   */
constructor(public config: TConfig) {
    this.gitModule = new GitModule(config);
    this.readmeModule = new ReadmeModule(config);
    this.fileModule = createFileModule(config);
    this.tsModule = createTSModule(config);
    this.builder = createBuilder(config);
    this.packageJsonModule = createPackageJsonModule(config);
    /** 添加构建工具到依赖中 */
    this.packageJsonModule.addDependencies(this.builder.value);
}
```

```ts
// packageModule.ts
class reactPackageJsonModule extends PackageJsonModule {
  constructor(config: TConfig) {
    super(config);
    const {
      react,
      reactDom,
      reactRouterDom,
      typesNode,
      typesReact,
      typesReactDom,
      eslintPluginReact,
    } = globalDependencies;
    this.mergeConfig({
      dependencies: {
        ...react,
        ...reactDom,
        ...reactRouterDom,
      },
      devDependencies: {
        ...typesNode,
        ...typesReact,
        ...typesReactDom,
        ...eslintPluginReact,
      },
    });
  }
}

export function createPackageJsonModule(config: TConfig) {
  if (config.template === Template.REACT) {
    return new reactPackageJsonModule(config);
  } else {
    throw new CommanderError(500, "500", `无${config.template}对应的依赖模板`);
  }
}
```

<br>

#### 问题3：

有一些依赖可能需要执行一些特别的操作

比如`vite`这类可能需要在`package.json`中添加一些`script`，并且在`Project`类实例中是维护了一个`package.json`配置对象的，我并不希望生成配置文件后在对他进行修改，最好是在生成`package.json`文件前对属性进行修改

又比如`prettier`绑定`Git hook`，需要在项目生成结束后执行

解决方法：

还记得上面有说`inquirer.js`交互时按下依赖包`choices`类型不表吗，我设计的`choices`类型如下

```ts
export type TDependence = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  beforeInitCallback?: (project: Project) => void;
  afterInitCallback?: (project: Project) => void;
};
```

依赖项存在两个生命周期的回调函数

`beforeInitCallback`会在项目文件生成前执行，`afterInitCallback`会在项目文件生成后执行

修改`package.json`中`script`字段通常在`beforeInitCallback`执行

绑定`Git hook`通常在`afterInitCallback`执行

示例如下：（打包工具是一个特殊的`package`）

```ts
class ViteBuilderForReact extends ViteBuilder {
  constructor() {
    super();
    const newValue: TDependence = {
      devDependencies: {
        "@vitejs/plugin-react": "^4.0.0",
      },
      beforeInitCallback: (project: Project) => {
        project.packageJsonModule?.mergeConfig({
          scripts: {
            build: "vite build",
            dev: "vite",
            preview: "vite preview",
            commit: "git-cz",
            prepare: "husky install",
            lint: "npm run lint:script && npm run lint:style",
            "lint:script": "eslint --ext .js,.jsx,.ts,.tsx --fix --quiet ./",
            "lint:style": 'stylelint --fix "src/**/*.{css,scss}"',
          },
        });
      },
      afterInitCallback: (project: Project) => {
        fs.copyFileSync(
          path.join(__dirname, REACT_VITE_PREFIX, "/vite.config.ts"),
          path.join(project.config.rootPath, "/vite.config.ts")
        );
      },
    };
    this.value = mergeObject<TDependence>(this.value, newValue);
  }
}
```

其实我们可以做的更好，比如借鉴vite，webpack这类库暴露一系列生命周期函数，这些就是后话了

<br>

#### 问题4：

如何维护安装依赖的版本

解决方法：

这个目前为止我也没想到什么好办法，因为要考虑的太多了

依赖之间的版本依赖，不同的版本还会有一些API废弃等，所以目前还是人工维护依赖，希望之后能找到更好的方法



后续更新需求：

开箱即用模板，基于配置文件修改内容的degit+execa方案，修改配置文件即可实现修改
