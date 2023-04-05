# 字节 data 部门前端实习生一面

## 题目

1. http 常见请求头响应头

聊了 referer host content-type/跨域头 expires cache-control Etag Last-modified keep-alive

2. 说一下强缓存和协商缓存

八股文

2. http2.0 与 1.0 优势

八股文，二进制协议、多路复用、数据流、头信息压缩、服务器推送，忘了数据流和头信息压缩

3. 谈谈对 React 的理解

答得不好，声明式 UI，组件化开发，由传统的面向过程转变为面向对象，虚拟 DOM 和 DIFF 算法

4. 谈谈 React HOC 的理解

讲了一个自己写的[keep alive 组件](https://github.com/PassionFruitAXE/react-component-keepalive)

5. 谈谈 React Ref 的理解

获取真实 DOM 引用，缓存值

5. 讲讲 JS 的继承方式，比如原型链继承，寄生组合继承

让口撕了一下原型链继承

6. 讲一下 new 的过程

创建新对象 绑定 this 到新对象 执行构造函数 返回新对象

7. 场景题：对字节员工(数据量很大)进行年龄排序，选择什么排序算法

中间提示过数据量很大根据时间和空间综合选择，我以为要分类讨论，结果是问稳定的排序算法（稳定的排序算法指的是相同元素相对位置排序后不改变），答案是归并

8. 对版本号进行排序["1.45.0","1.5","6"]=>["1.5","1.45","6"]

easy 题，字符串分割后逐个元素比较即可

9. 实现一个 promise schedule，参数为并发数量

这里时间不够了，他说不用写了，讲讲思路，我感觉不写的话讲了点思路也没啥用

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
/**
 * 1s request1
 * 4s request3
 * 6s request2
 * 8s request4
 */
```

## 反问：

我感觉 HOC 答得一般，您对我的答案满意吗？——你可能不熟悉某些名词，但有自己的一些理解

能聊聊业务吗？——三面才可以，或者你可以找 HR 了解

感觉他不太想继续聊了，我就收场了

## 评价：

面试官人还是不错的，气场有点强有种被老师盯着的感觉，排序那个提示我数据大，提示我考虑空间和时间，我还是没理解他想要稳定的排序算法

第二天收到了感谢信

## 总结：

当着面试官面写题非常紧张，需要多练习

多说多错少说少错，别瞎拓展万一没说对就很尴尬

菜就多练
