# 跨端框架强烈推荐Flutter

## 背景

在前端开始转入移动端的阶段 React Native、Uni-app 逐渐称为跨端最佳实践，届时 Google 亲自下台，通过一个 Flutter 框架 + 一个小众的 Dart 语言，意图重新洗牌跨端框架

回归正文，最近恰好想写一个 APP，由于人力资源不足，只能考虑跨端方案了，我们考虑了如下的常见方案：

- `React Native`

  【图】

- `Uni-app`

  【图】

- `Flutter`

  【图】

由于我们的开发人员以前端开发者居多，技术栈也主要是`React`，按理说应该直接选到`React Native`这类`React`系框架，`Uni-app`支持`Vue`，`Flutter`采用`Dart`

但是`Uni-app`真正是属于开箱即用，配合`HBuilder`几乎可以不用考虑写代码之外的事，它自身提供了非常好的平台支持，所以我们最后选择了`Uni-app`，他借用`Uni`的平台可以托管操作，并且基于`Vue`和`js`学习成本低

反之`Dart`由于是一门全新的语言，学习成本过高是我们没有采用他的主要原因。

借助校内开设的《移动互联技术与实践》课设，让我有机会能够重新接触 `Flutter` 这个热门框架，借此分享一下一个前端开发者开始使用`Flutter`的心路历程。

## 学习过程：

【曲线图】

Flutter 环境配置就是第一道坎，只要坚持迈过这第一道坎，后面就会有更多的坎需要迈过去！

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

IDE 生成了个`Flutter`项目模板，我来看看他长啥样

`Demo`：

```dart
return MaterialApp(
    title: 'QQ',
    theme: ThemeData(
        primarySwatch: Colors.blue,
    ),
    home: const Scaffold(body: Login()));
```

这`Flutter`的组件咋一股子`Java`味儿啊，感觉跟用`JavaScript`写的`Java Swing`一样？

组件间的的布局是通过，组件类传参来实现的，连样式都是预设好的参数，差点没直接给我劝退，之前被`Java Swing`折磨太惨了

恶心我几天后重整心态，不过是嵌套结构，在我看来只要将组件拆分的足够细致，想来嵌套结构也能够有条不紊的清晰展示。

这中间发生了一个小插曲，`Flutter`可以用浏览器启动，调试模式就和`Web`开发差不多，只是屏幕变成了一小块而已。但希望大家应以为戒，千万不要尝试浏览器方式，不采用虚拟机/真机开发，压根不知道能不能在安卓上跑起来，想偷懒是不行滴！

课程的实验指导书上需要使用`flutter-webview-plugin`库，这个包中调用了`Android`的`Webview`没有办法在`Web`端运行。于是我开始了真机调试之路。

`Android Studio`对真机调试比较友好，`Flutter`也支持`Android`的最新版（`RN`只支持特定版本的`Android`）。

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
}
```

越到后面越发现，我要把 Web 那一套搬过来也没啥问题啊

| Flutter            | Web          |
| ------------------ | ------------ |
| shared_preferences | localStorage |
| flutter-toast      | antd-message |
| sqlite             | indexDB      |

你再回头来看看，这俩开发起来好像也差不太多嘛

## 总结：

`Flutter`在你不熟悉的阶段，假如你是一个前端开发者，可能完全无法接受这种风格的开发，我大概有好几天都处在一个非常烦躁的开发状态。

之后稍微熟悉了`Flutter`并掌握了一些技巧后，问题好像也就没那么明显，`FLutter`确实是一个非常成熟且完善的跨端框架，一套 UI 同时能渲染到`Android`和`IOS`端，一人干俩人活，也是刷`KPI`的神器。非常建议有此想法的同学，如果在开始关头被卡住很难受，不妨再坚持坚持，守得云开见月明！

如果你想尝试跨端框架，那一定要尝试`Flutter`，虽然可以在舒适圈中躺平选 React Vue，但有时向前走一步，新的风景就会出现了

[PassionFruitAXE/qq-flutter: 基于 Flutter 的仿 QQ APP (github.com)](https://github.com/PassionFruitAXE/qq-flutter)
