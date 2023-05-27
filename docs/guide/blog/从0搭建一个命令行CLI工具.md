# 从0搭建一个命令行CLI工具

核心库：

- "commander"

- "execa"

- "inquirer"

> step1：
>
> 进入脚手架
>
> step2：
>
> 选择包管理器
>
> step3：
>
> 选择框架模板
>
> step4？：
>
> 选择打包工具
>
> step5：
>
> 选择默认依赖（默认最新，并且拷贝相应的配置文件）
>
> step6：
>
> 执行依赖安装命令，初始化git和其他





| 问题                                         | 解决方法                                                     |
| -------------------------------------------- | ------------------------------------------------------------ |
| export not define<br />require() not support | 方案1：<br />降低依赖版本<br />方案2：<br />package.json设置type: module<br />tsconfig设置module: NodeNext |
| ts报错需要显示扩展名                         | 导入ts模块以.js结尾                                          |
|                                              |                                                              |



- [x] #### 待解决问题1——如何选择安装依赖的版本

方案1 

模板生成package.json然后一次pnpm install完成

缺点 无法保证最新版本的包，需要手动更新？

解决方法1：版本号设为*  并不好需要重新找方法



方案2

维护package.json中依赖版本号

缺点 需要手动更新时间成本高

可能性：如果能够自动获取最新版本可以解放人力



- [x] #### 如何处理依赖包之间相互的配置？

方案

不同框架配置固定模板，直接copy即可



- [x] #### 如何处理依赖包的生命周期函数（或者说钩子函数）？

方案

设计beforeInstallCallback和afterInstallCallback



正在写作中~~~
