# 浅尝Flutter

先说背景，本人因选修 “移动互联软件技术实践” 被要求学习使用`Flutter`搭建一个仿QQ的跨端`APP`。在此之前早已久仰`Flutter`大名，一直犹豫于`Dart`语言学习成本而没有多加尝试，趁着这个机会突破一下舒适圈！

配置`Android`环境

下载`Android Studio`即可，IDE里可以下载`Android SDK`

`Dart`镜像源

[dart-pub | 镜像站使用帮助 | 清华大学开源软件镜像站 | Tsinghua Open Source Mirror](https://mirrors.tuna.tsinghua.edu.cn/help/dart-pub/)

```shell
export PUB_HOSTED_URL="https://mirrors.tuna.tsinghua.edu.cn/dart-pub" # pub: pub get 
export PUB_HOSTED_URL="https://mirrors.tuna.tsinghua.edu.cn/dart-pub" # flutter: flutter packages get 
```

`FLutter`镜像源

[在中国网络环境下使用 Flutter - Flutter 中文文档 - Flutter 中文开发者网站 - Flutter](https://flutter.cn/community/china)

```shell
export PUB_HOSTED_URL=https://pub.flutter-io.cn
$ export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
$ git clone -b dev https://github.com/flutter/flutter.git
$ export PATH="$PWD/flutter/bin:$PATH"
$ cd ./flutter
$ flutter doctor
```

`Demo`：

```dart
return MaterialApp(
    title: 'QQ',
    theme: ThemeData(
        primarySwatch: Colors.blue,
    ),
    home: const Scaffold(body: Login()));
```

我大概了解了一下Flutter的编码风格，心里想——这一定是一个噩梦。

`Flutter`的层级关系是通过父组件中的某个属性上绑定子组件实现的（如上所示）。

我的内心是崩溃的，作为一个`Web`前端这种方式就像在`CSS`里连接数据库一样难受啊！



重整心态，不过是区区嵌套结构，我想只要拆分的够多够细就能够避免我预想中嵌套组件出现的混乱现象，我连忙去分了几个目录：

- `/pages`
- `/components`

突然发现`Flutter`可以用浏览器启动，调试模式就和`Web`开发差不多，只是屏幕变成了一小块而已。

这简直让人心情愉悦，梦回`Web`。直到`Flutter`开始调用了`Android`原生的`API`。



课程的实验指导书上需要使用`flutter-webview-plugin`库，这个包中调用了`Android`的`Webview`没有办法在`Web`端运行。于是我开始了真机调试之路。

`Android Studio`对真机调试比较友好，`Flutter`也支持`Android`的最新版（`RN`只支持特定版本的`Android`），看起来应该是一帆风顺的调试才是我噩梦的开始。



第一个问题是：

`flutter-webview-plugin`库中的`API`被弃用，影响了`Android`的打包编译，oh my god我现在才看到这实验指导书是好久以前做的。照着指导书写直接就是一个警告。

问题是别人的环境也会提示废弃，但是还是能够运行。我突然明白了为什么很多项目不会使用最新版本环境的原因，不出意外是我尝新心理选择的`Android 33`开始作妖了。

也算是给自己较劲，我死活不想降低`Android`版本反向兼容库，我开始在社区中(`pub.dev`)找能够代替`flutter-webview-plugin`的并且支持最新版本`Android`的库，一开始还不知道`pub.dev`上怎么找到需要的包（现在想想也是被自己蠢到了）。

最终指导书的`http + flutter-webview-plugin`被替换为`Dio + webview-flutter`，虽然花费了更多时间去看文档，但积累了解决`Flutter`问题的经验，也算小有收获！

解决这个问题之后，也是从这里开始，我对`Flutter`有了不小的改观，与此同时我有在参与开发一款基于`Uni-app`的跨端APP，虽然他用的是我还算了解的技术栈，但是文档实在不敢恭维...



封装`shared_preferences`缓存操作就像在封装`localstorage`操作，封装`flutter-toast`搞得和`antd`一样把项目搞得一股`Web`风。

```dart
class GlobalMessage {
  static void success(String message, [ToastGravity? gravity]) {
    message = message.length > 100 ? message.substring(0, 100) : message;
    Fluttertoast.showToast(
        msg: message,
        toastLength: Toast.LENGTH_SHORT,
        gravity: gravity ?? ToastGravity.TOP,
        timeInSecForIosWeb: 1,
        backgroundColor: Colors.green[400],
        textColor: Colors.white,
        fontSize: 16.0);
  }

  static void error(String message, [ToastGravity? gravity]) {
    message = message.length > 100 ? message.substring(0, 100) : message;
    Fluttertoast.showToast(
        msg: message,
        toastLength: Toast.LENGTH_SHORT,
        gravity: gravity ?? ToastGravity.TOP,
        timeInSecForIosWeb: 1,
        backgroundColor: Colors.red,
        textColor: Colors.white,
        fontSize: 16.0);
  }

  static void warning(String message, [ToastGravity? gravity]) {
    message = message.length > 100 ? message.substring(0, 100) : message;
    Fluttertoast.showToast(
        msg: message,
        toastLength: Toast.LENGTH_SHORT,
        gravity: gravity ?? ToastGravity.TOP,
        timeInSecForIosWeb: 1,
        backgroundColor: Colors.orange[400],
        textColor: Colors.white,
        fontSize: 16.0);
  }

  static void info(String message, [ToastGravity? gravity]) {
    message = message.length > 100 ? message.substring(0, 100) : message;
    Fluttertoast.showToast(
        msg: message,
        toastLength: Toast.LENGTH_SHORT,
        gravity: gravity ?? ToastGravity.TOP,
        timeInSecForIosWeb: 1,
        backgroundColor: Colors.blue[400],
        textColor: Colors.white,
        fontSize: 16.0);
  }
}
```



封装`sqlite`数据库操作也通过请教后端同学规范代码风格（感谢实验室后端同学不厌其烦的解答我粗俗且低级的问题），特别是`Flutter`调用原生`API`的文档非常完善，不愧是`Google`，自己做的跨端框架兼容性拉满。`Uni`的文档没有`Flutter`可读性好，在实际开发过程中还有些和文档描述不相符的内容（`swiper+scrollView`与下拉刷新问题）。`Flutter`我愿称之为跨端的神！

> `Uni`对`Vue`技术栈的同学更为友好，有效降低了学习成本，并且`DCloud`的服务也相当不错，我认为他不好用有部分原因是平时`ts`用的多根本没法接受`js`而`Vue3 + ts`能够使用的`Uni`资源几乎为0，期待`Uni`的不断发展完善



总结一下，`Flutter`在你不熟悉的阶段，假如你是一个前端开发者，可能完全无法接受这种开发模式，我大概有好几天都在一个非常烦躁的开发状态。之后稍微熟悉了`Flutter`并掌握了一些技巧后，问题好像就迎刃而解了，`FLutter`确实是一个非常成熟且完善的框架，核心是一套UI同时能渲染到`Android`和`IOS`端，一人干俩人活，不失为`KPI`神器。所以非常建议有此想法的同学，如果在开始关头被卡住很难受，不妨再坚持坚持，守得云开见月明！

`Flutter`用实力证明了与语言无关，`Flutter`本身就会成为热门，也是目前最流行的跨端方案。

要是他能用`TS`写那就更好了!

[PassionFruitAXE/qq-flutter: 基于Flutter的仿QQ APP (github.com)](https://github.com/PassionFruitAXE/qq-flutter)









