# 浅尝 Flutter

## 背景讲解

有幸尝试过构建跨端手机应用，我熟悉的技术框架为 React 系，而当时技术选型结果为：

- `React Native`

- `Uni-app`

- `Flutter`

`Flutter`大名早有耳闻，谷歌自己研发的跨端 APP 框架，想来应该是相当契合安卓系统的。但考虑到团队成员多数为前端开发者，最终选型技术为`Uni-app`，实际上`Uni-app`为我们解决了很多底层方面的问题，但是他所提供的功能却不能满足我们的需求，导致我们的开发在中途可能需要更换技术栈，由此我有些后悔没有选择`Flutter`。

当时不选择`Flutter`和`React Native`的原因有以下几个：

- `Flutter`是基于`Dart`语言的，要使用`Flutter`学习成本较高
- `React Native`环境配置很麻烦，而且我们也想尝试一下`Vue3`构建

于是我们选择了学习成更低的`Uni-app`来构建，结果已经提到过，开发过程被迫停滞，再考虑是否更换新的框架进行重构。

这一次借助校内开设的《移动互联技术与实践》课程，让我能够重新接触 Flutter 这个热门框架，我想借此分享一下一个前端仔开始使用`Flutter`的心路历程。

## 学习过程：

配置`Android`环境

下载`Android Studio`即可，IDE 里可以下载`Android SDK`

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

通过简单示例我了解了 Flutter 的组件编写风格

天啊！这和我想象中的完全不一样

`Flutter`的层级关系是通过父组件中的某个属性上绑定子组件实现的（如上所示）

这对于一个前端仔来说完全是噩梦构图，布局样式完全依赖于框架封装的类包含的属性。

恶心我几天后重整心态，不过是嵌套结构，在我看来只要将组件拆分的足够细致，想来嵌套结构也能够有条不紊的清晰展示。

这中间发生了一个小插曲，`Flutter`可以用浏览器启动，调试模式就和`Web`开发差不多，只是屏幕变成了一小块而已。但希望大家应以为戒，千万不要尝试浏览器方式，不采用虚拟机/真机开发，压根不知道能不能在安卓上跑起来，想偷懒是不行滴！

课程的实验指导书上需要使用`flutter-webview-plugin`库，这个包中调用了`Android`的`Webview`没有办法在`Web`端运行。于是我开始了真机调试之路。

`Android Studio`对真机调试比较友好，`Flutter`也支持`Android`的最新版（`RN`只支持特定版本的`Android`），看起来应该是一帆风顺的调试才是我噩梦的开始。

第一个问题是：

`flutter-webview-plugin`库中的`API`被弃用，影响了`Android`的打包编译（所以一定要真机调试！这很重要），oh my god 我现在才看到这实验指导书是好久以前做的，照着指导书写直接就是一个警告。

也算是给自己较劲，我死活不想降低`Android`版本反向兼容库，我开始在社区中(`pub.dev`)找能够代替`flutter-webview-plugin`的并且支持最新版本`Android`的库。

最终指导书的`http + flutter-webview-plugin`被替换为`Dio + webview-flutter`，虽然花费了更多时间去看文档，但积累了解决`Flutter`问题的经验，也算小有收获！

解决这个问题之后，也是从这里开始，我对`Flutter`有了不小的改观，`Flutter`的社区比我想象的好很多，有超级多大佬在帮我们解决一个个问题。

封装`shared_preferences`缓存操作就像在封装浏览器`localstorage`操作

封装`flutter-toast`搞得和`antd`一样把项目搞得一股`Web`风（如下）。

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

封装`sqlite`数据库操作对我这个前端仔是有些陌生了，不过好在也通过请教后端同学规范代码风格（感谢实验室后端同学），特别是`Flutter`调用原生`API`的文档非常完善，只能说不愧是`Google`，兼容性这一块无可挑剔。

## 总结：

`Flutter`在你不熟悉的阶段，假如你是一个前端开发者，可能完全无法接受这种风格的开发，我大概有好几天都处在一个非常烦躁的开发状态。

之后稍微熟悉了`Flutter`并掌握了一些技巧后，问题好像就迎刃而解了，`FLutter`确实是一个非常成熟且完善的框架，一套 UI 同时能渲染到`Android`和`IOS`端，一人干俩人活，不失为`KPI`神器。所以非常建议有此想法的同学，如果在开始关头被卡住很难受，不妨再坚持坚持，守得云开见月明！

如果你还在犹豫要不要入坑`Flutter`，我的建议是如果你想尝试跨端框架，那一定要尝试 Flutter，前端仔都没用`React`和`Vue`来学`Dart`，你还在等什么？

[PassionFruitAXE/qq-flutter: 基于 Flutter 的仿 QQ APP (github.com)](https://github.com/PassionFruitAXE/qq-flutter)
