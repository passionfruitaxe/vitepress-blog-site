# 字节 data 部门前端实习生一面

## 面试

1. http 常见请求头响应头

2. 说一下强缓存和协商缓存

3. http2.0 与 1.0 优势

4. 谈谈对 React 的理解

5. 谈谈 React HOC 的理解

6. 谈谈 React Ref 的理解

7. 讲讲 JS 的继承方式，比如原型链继承，寄生组合继承

8. 讲一下 new 的过程

9. 场景题：对字节员工(数据量很大)进行年龄排序，选择什么排序算法

10. 对版本号进行排序["1.45.0","1.5","6"]=>["1.5","1.45.0","6"]

11. 实现一个 promise schedule并发控制，参数为并发数量


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

能聊聊业务吗？——三面才可以，或者你可以找 HR 了解

## 评价：

面试官气场很强，有种被老师盯着的感觉，面试经历太少了很紧张，排序那个提示我数据大，提示我考虑空间和时间，我还是没理解他想要稳定的排序算法和外存排序

第一次面字节确实被拷打了，考察方式大不相同

第二天收到了感谢信

## 总结：

当着面试官面写题非常紧张，需要多加练习
