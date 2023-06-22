# 前端开发者的 Flutter 体验

## 背景

最近有一个移动APP需求，由于人力资源不足，只能考虑跨端方案了，我们考虑了如下的常见方案：

- `React Native`

  ![image-20230527122127018](/images/react-native.png)

- `Uni-app`

  ![image-20230527122258952](/images/uni-app.png)

- `Flutter`

  ![image-20230527122342197](/images/flutter.png)

我们的开发人员以前端开发者居多，技术栈也主要是`React`

按理说应该直接选到`React Native`这类`React`系框架，因为`Uni-app`采用`Vue`，`Flutter`采用`Dart`

但是`Uni-app`真正是属于开箱即用，`Dcloud`配合`HBuilder`几乎可以不用考虑写代码之外的事，它自身提供了非常好的支持，所以我们最后选择了`Uni-app`

`Dart`由于是一门全新的语言，考虑到学习成本过高是我们没有采用他的主要原因。

借助校内开设的《移动互联技术与实践》课设，让我有机会能够重新接触 `Flutter` 这个热门框架，借此分享一下一个前端开发者开始使用`Flutter`的心路历程。

## 学习过程：

**Flutter 环境配置就是第一道坎，只要坚持迈过这第一道坎，后面就会有更多的坎需要迈过去！**

配置`Android`环境（下载`Android Studio`即可，IDE 里可以下载`Android SDK`）

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

这`Flutter`的组件一股子`Java`味儿啊，感觉跟用`Java Swing`一样？

尤其是布局组件，`Column`、`Row`类布局组件差点没给我劝退

```dart
body: Container(
  color: Colors.orange,
  child: Column(
    crossAxisAlignment: CrossAxisAlignment.center,
    verticalDirection: VerticalDirection.down,
    mainAxisAlignment: MainAxisAlignment.start,
    mainAxisSize: MainAxisSize.max,
    children: const [
      FlutterLogo(size: 100,),
      FlutterLogo(size: 200,),
      FlutterLogo(size: 50,),
    ],
  ),
),
```

恶心我几天后重整心态，嵌套结构意味着要将组件拆分的足够细致，才能够有条不紊的清晰展示

**接下来讲几个遇到的坑：**

1. 官网上有时候不太好找到想要的信息，我通常会结合这个一起看[《Flutter 实战·第二版》](https://book.flutterchina.club/)

<br/>

2. `Flutter`不要用浏览器启动

Flutter 当然是可以使用浏览器启动的，但如果你正在做一个 APP，使用浏览器调试是非常不建议的！

重要的事情说三遍：

一定真机/虚拟机调试！

一定真机/虚拟机调试！

一定真机/虚拟机调试！

不然到时候就会和我一样重新改布局，重新找依赖。有的依赖已经不支持 Android 最新版本但仍可在浏览器端运行

<br/>

3. Dart 中很多地方的`Future<>`可以类比`Promise<>`理解，他是一个异步的概念，并且可以调用`.then`

<br/>

4. 多使用`ListView.builder`，类比 React 中 JSX 里的`{arr.map()}`

<br/>

这里举一个坑的实例：

实验指导书上采用的`flutter-webview-plugin`库中的`API`被弃用，影响了`Android`的打包编译（所以一定要真机调试！这很重要）

我不想降低`Android`版本反向兼容库，我开始在社区中(`pub.dev`)找能够代替`flutter-webview-plugin`的并且支持最新版本`Android`的库。

最终指导书的`http + flutter-webview-plugin`被替换为`Dio + webview-flutter`，虽然花费了更多时间去看文档，但积累了解决`Flutter`问题的经验，也算小有收获！

解决这个问题之后我会发现的是，`Flutter`具有一个非常优秀的社区

<br/>

最后，这个项目仍然被我搞得一股`Web`风格

封装`shared_preferences`缓存操作就像在封装浏览器`localstorage`操作

封装`flutter-toast`搞得和`antd`一样

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

越到后面越发现，要把`Web`那一套搬过来也没啥问题啊

| Flutter            | Web          |
| ------------------ | ------------ |
| shared_preferences | localStorage |
| flutter-toast      | antd/message |
| sqlite             | indexDB      |

## 总结：

`Flutter`在你不熟悉的阶段，假如你是一个前端开发者，可能完全无法接受这种风格的开发，我大概有好几天都处在一个非常烦躁的开发状态。

之后稍微熟悉了`Flutter`并掌握了一些技巧后，问题好像也就没那么明显，`FLutter`确实是一个非常成熟且完善的跨端框架，一套 UI 同时能渲染到`Android`和`IOS`端，一人干俩人活，也是刷`KPI`的神器。非常建议有此想法的同学，如果在开始关头被卡住很难受，不妨再坚持坚持，守得云开见月明！

如果你想尝试跨端框架，那一定要尝试`Flutter`，他在安卓兼容上真的无可比拟

[PassionFruitAXE/qq-flutter: 基于 Flutter 的仿 QQ APP (github.com)](https://github.com/PassionFruitAXE/qq-flutter)
