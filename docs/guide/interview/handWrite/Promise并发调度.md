# Promise并发调度

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

