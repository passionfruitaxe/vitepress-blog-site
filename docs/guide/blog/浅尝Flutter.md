# 浅尝Flutter

先说背景，我因为选了一门叫做“移动互联软件技术实践”的课被要求学习使用`Flutter`搭建一个仿QQ的跨端`APP`.于是乎，我开始了第一次`Flutter`尝试，配置`Android`环境，`Dart`镜像源、`FLutter`镜像源。然后一个Demo就在我的手机上运行了起来。

```dart
return MaterialApp(
    title: 'QQ',
    theme: ThemeData(
        primarySwatch: Colors.blue,
    ),
    home: const Scaffold(body: Login()));
```

这大概就是前端开发者的噩梦吧，`Flutter`的层级关系是通过诸如此类的父组件中的某个属性上绑定子组件实现的。

写到这我的内心是崩溃的，在习惯`html`并且习惯`jsx`这种结构之后，对这类父子组件嵌套方式感到非常的不适，这时候我对`Flutter`的意见就相当大了，我已经能够想到接下来的开发体验一定糟透了。

不过无所谓，这点小难题还能够克服，不过是区区嵌套结构，只要拆分的够多就能够避免我预想中嵌套组件出现的混乱现象，我连忙去分了几个目录：

- `/pages`
- `/components`

`Flutter`可以用浏览器启动，对我而言就和`Web`开发差不多，只是屏幕变成了一小块而已，简直让人心情愉悦。直到`Flutter`开始调用了`Android`原生的`API`。

课程的实验指导书上需要使用`flutter-webview-plugin`库，这个包中调用了`Android`的`Webview`没有办法在`Web`端运行。于是我开始了真机调试之路。

`Android Studio`对真机调试比较友好，`Flutter`也支持`Android`的最新版（`RN`只支持特定版本的`Android`），看起来应该是一帆风顺的调试才是我噩梦的开始。

第一个问题是，编译`sdk`版本不对并且`Gradle`的镜像源下载不下来，之前在尝试`RN`的时候已经被`Gradle`折磨过一次了，这次又去换了一拨镜像源，然后跑到`.android`目录下修改编译`sdk`版本（他源代码里写的是按照`Flutter`的项目`Android`环境版本编译，按理说不应该需要手动制定版本的，可能是我操作不当吧）

然后幸运的出现了第二个问题，`flutter-webview-plugin`库中的`API`被弃用，影响了`Android`的打包编译，问题是别人的环境也会提示废弃，但是还是能够运行。我突然明白了为什么很多项目不会使用最新版本环境的原因，不出意外是我的`Android 33`开始作妖了。

也算是给自己较劲，我死活不想降低`Android`版本反向兼容库，我开始在社区中(`pub.dev`)找能够代替`flutter-webview-plugin`的并且支持最新版本`Android`的库，这在事后看来是非常容易的一件事，但在当时甚至对Dart语法都不算熟悉的情况下还算比较艰难，最终指导书的`http + flutter-webview-plugin`被替换为`Dio + webview-flutter`，虽然花费了更多时间去看文档，但积累了解决`Flutter`问题的经验，也算小有收获。

也是从这里开始，我对`Flutter`有了不小的改观，其中不乏有我在参与开发一款`Uni-app`项目的原因。`Flutter`使用是越来越得心应手。

封装`shared_preferences`缓存操作就像在封装`localstorage`操作，封装`Toast`搞得和`antd`一样把项目搞得一股`Web`风。

封装`sqlite`数据库操作也通过请教后端同学规范代码（这里感谢实验室后端同学不厌其烦的解答我幼稚的问题），特别是`Flutter`调用原生`API`的文档非常完善，不愧是`Google`，自己做的跨端框架兼容性拉满。反观`Uni-app`就显得不那么尽人意了，`Uni`的文档没有`Flutter`可读性好，在实际开发过程中还有些和文档描述不相符的内容（`swiper+scrollView`与下拉刷新问题），并且有很多`Uni`做不到的功能。这波跨端方案的对比`Flutter`以全盛之姿完胜`Uni`，`Flutter`我愿称之为跨端的神！

> 这么说有些过，`Uni`对`Vue`技术栈的同学更为友好，有效降低了学习成本，并且`DCloud`的服务也相当不错，我认为他不好用有部分原因是平时`ts`用的多根本没法接受`js`而`Vue3 + ts`能够使用的`Uni`资源几乎为0，期待`Uni`的不断发展完善

总结一下，`Flutter`在你不熟悉的阶段，假如你是一个前端开发者，可能完全无法接受这种开发模式，我大概有好几天都在一个非常烦躁的开发状态。之后稍微熟悉了`Flutter`并掌握了一些技巧后，问题好像就迎刃而解了，`FLutter`确实是一个非常成熟且完善的框架，核心是一套UI同时能渲染到`Android`和`IOS`端，一人干俩人活，不失为`KPI`神器。

不过有时候也会想为什么选择了`Dart`语言作为`Flutter`的基底，我粗浅的认为采用更流行的语言会让`Flutter`更加繁荣（为什么不用`JavaScript`！），不过这些都不重要，`Flutter`用实力证明了与语言无关，`Flutter`本身就会成为热门，也是目前最流行的跨端方案。

[PassionFruitAXE/qq-flutter: 基于Flutter的仿QQ APP (github.com)](https://github.com/PassionFruitAXE/qq-flutter)









