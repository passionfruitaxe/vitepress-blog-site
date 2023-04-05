# Promise并发调度

```ts
type Task = {
  promiseCreator: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};

function schedule(limit: number) {
 /*code here*/
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



## 审题:

1. 每个`addTask`函数返回的都是一个`Promise`

自信直接先`return new Promise()`<后面我们讲这个`Promise`称为——`returnPromise`>再说

2. 每个`Promise`不是传入后立刻进行执行的

很明显我们需要来让每一个`addTask`的`returnPromise`状态被传入的`task Promise`<后面我们统称——`promiseCreator`>控制，用闭包创建一个`tasks`数组来存储`tasks: {promiseCreator, resolve, reject}[]`，分别是：需要被兑现的`Promise`，对应`returnPromise`的`resolve/reject`

3. 每个`Promise`是否能够执行需要满足条件：按传入顺序排列兑现，同时并发的数量小于限制数量

并发调度按照传入的先后顺序来，我们先全部推入`tasks`数组中，每次从头读取`limit`个`task`进行执行，判断`promiseCreator()`状态改变时，让其对应`returnPromise`调用对应的`resolve/reject`方法，从而改变`returnPromise`状态完成`returnPromise`的兑现

我们声明一个`alive`变量和一个`requestTask`函数，前者用来记录当前有几个`task`正在并发执行，后者用于从`tasks`数组中读取`limit-alive`个`task`执行

`requestTask`执行后，如果当前执行的`Promise`有被兑现了的，在`then`方法的第一个回调函数中令`alive--`，然后重新调用`requestTask`函数读取新的`task`即可

## 代码实现:

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

