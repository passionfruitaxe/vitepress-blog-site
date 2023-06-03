# 字节 data 部门前端实习生一面

## 面试

1. http 常见请求头响应头

 聊了 referer host content-type/跨域头 expires cache-control Etag Last-modified keep-alive

2. 说一下强缓存和协商缓存

 八股文

3. http2.0 与 1.0 优势

   八股文，忘了数据流和头信息压缩

   ```
   二进制协议、多路复用、数据流、头信息压缩、服务器推送
   ```

4. 谈谈对 React 的理解

   答得不好，说了些组件化，提效和易维护，虚拟 DOM 之类的

   ```
   React 是一个流行的 JavaScript 库，用于构建 Web 应用程序的用户界面。它提供了一种声明性、高效和灵活的方式来构建应用程序，使得开发者可以更加专注于业务逻辑而不是 DOM 操作。

   React 的主要特点是组件化开发，将页面拆分成多个可复用的组件，每个组件负责一个特定的功能或 UI 元素。组件具有自己的状态和生命周期，可以相互组合和嵌套，形成一个完整的应用程序。

   React 的另一个重要特点是虚拟 DOM，它通过在内存中创建一个虚拟的 DOM 树来管理 DOM 操作，使得页面渲染和更新更加高效。React 通过比较虚拟 DOM 的变化来确定需要更新的部分，并仅更新必要的部分，从而提高了性能和用户体验。

   React 还支持服务器端渲染和跨平台开发，可以轻松地构建出高性能、可维护和可扩展的 Web 应用程序。

   总的来说，React 是一种强大的、灵活的、高效的 Web 开发工具，它通过组件化开发和虚拟 DOM 技术，使得开发者可以更加专注于业务逻辑和用户体验的实现，从而提高了开发效率和应用程序质量。
   ```

5. 谈谈 React HOC 的理解

   讲了一个自己写的[keep alive 组件](https://github.com/PassionFruitAXE/react-component-keepalive)

6. 谈谈 React Ref 的理解

   获取并且可以修改实例或真实 dom，ref 的修改不会引起组件更新，forwardRef 还可以传递 ref；在函数式组件中的 useRef 除了上述功能外，还可以用来存储值和变量，并且由于不会引起组件更新，是一个很好解决闭包陷阱的方法

7. 讲讲 JS 的继承方式，比如原型链继承，寄生组合继承

   让口撕了一下原型链继承

   ```
   1. 原型链继承
   2. 借用构造函数继承
   3. 原型式继承
   4. 寄生式继承
   5. 组合式继承
   6. 寄生组合式继承
   7. 混入式继承
   8. class继承
   ```

8. 讲一下 new 的过程

   创建新对象 绑定 this 到新对象 执行构造函数 返回新对象

9. 场景题：对字节员工(数据量很大)进行年龄排序，选择什么排序算法

   中间提示过数据量很大根据时间和空间综合选择，我以为要分类讨论，结果是问稳定的排序算法和外存排序，答案是归并

10. 对版本号进行排序["1.45.0","1.5","6"]=>["1.5","1.45.0","6"]

    easy 题，字符串分割后逐个元素比较即可，还问了复杂度，我说假设最多 n 个版本号，每个版本号最多 m 段，复杂度 mnlogn

11. 实现一个 promise schedule，参数为并发数量

    这里时间不够了，他说不用写了，讲讲思路，我感觉不写的话讲了点思路也没啥用，事实证明我也写不出来

```ts
type Task = {
  promiseCreator: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};

function schedule(limit: number) {
  const tasks: Task[] = [];
  let alive = 0;
  function requestTask() {
    if (!tasks.length) return;
    while (alive < limit && tasks.length) {
      const { promiseCreator, resolve, reject } = tasks.shift() || {};
      promiseCreator &&
        promiseCreator()
          .then((value) => {
            resolve && resolve(value);
            alive--;
            requestTask();
          })
          .catch((reason) => {
            reject && reject(reason);
          });
      alive++;
    }
  }
  return (promiseCreator: () => Promise<unknown>): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      tasks.push({ promiseCreator, resolve, reject });
      requestTask();
    });
  };
}

const request1 = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve("request1");
    }, 1000);
  });
const request2 = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve("request2");
    }, 6000);
  });
const request3 = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve("request3");
    }, 3000);
  });
const request4 = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve("request4");
    }, 4000);
  });

const time = +new Date();
const addTask = schedule(2);

addTask(request1).then((res) => {
  console.log(+new Date() - time, res);
});
addTask(request2).then((res) => {
  console.log(+new Date() - time, res);
});
addTask(request3).then((res) => {
  console.log(+new Date() - time, res);
});
addTask(request4).then((res) => {
  console.log(+new Date() - time, res);
});
/**
 * 1s request1
 * 4s request3
 * 6s request2
 * 8s request4
 */
```

## 反问：

我感觉 HOC 答得很烂，您有什么评价？——你可能不熟悉某些名词，但有自己的一些理解

能聊聊业务吗？——三面才可以，或者你可以找 HR 了解

感觉他不太想继续聊了，我就收场了

## 评价：

面试官人还是不错的，气场有点强有种被老师盯着的感觉，面试经历太少了很紧张，排序那个提示我数据大，提示我考虑空间和时间，我还是没理解他想要稳定的排序算法和外存排序

第一次面字节确实被拷打了，考察方式大不相同

第二天收到了感谢信

## 总结：

当着面试官面写题非常紧张，需要多练习

菜就多练
