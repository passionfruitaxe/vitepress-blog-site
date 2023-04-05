# Promise请求重试

```ts
function retryRequestCreator(times: number) {
  let count = times;
  return () =>
    new Promise((resolve, reject) => {
      if (!count) resolve("success");
      else {
        reject("error");
        count--;
      }
    });
}

function retryRequest(
  request: () => Promise<unknown>,
  retryTimes: number
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    (function retry() {
      if (!retryTimes) {
        return request().then(resolve, reject);
      }
      request()
        .then(resolve)
        .catch((err) => {
          console.log(err, `Remaining ${retryTimes} times`);
          retryTimes--;
          retry();
        });
    })();
  });
}

retryRequest(retryRequestCreator(2), 2).then(console.log).catch(console.log);
/*
error Remaining 2 times
error Remaining 1 times
success
*/
```

