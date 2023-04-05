# Promise类

```ts
enum Status {
  PENDING = "pending",
  REJECTED = "rejected",
  RESOLVED = "resolved",
}

class MyPromise {
  protected promiseResult: any = null;
  protected promiseStatus: Status = Status.PENDING;
  protected onFulFilledCallback: Array<any> = [];
  protected onRejectedCallback: Array<any> = [];

  static all(promises: Array<any>) {
    const result: any[] = [];
    return new MyPromise((resolve, reject) => {
      const addData = (value: any) => {
        result.push(value);
        if (result.length === promises.length) {
          resolve(result);
        }
      };
      promises.forEach((promise) => {
        if (promise instanceof MyPromise) {
          promise.then(
            (value) => {
              addData(value);
            },
            (reason) => {
              reject(reason);
            }
          );
        } else {
          addData(promise);
        }
      });
    });
  }

  static race(promises: Array<any>) {
    return new MyPromise((resolve, reject) => {
      promises.forEach((promise) => {
        if (promise instanceof MyPromise) {
          promise.then(
            (value) => {
              resolve(value);
            },
            (reason) => {
              reject(reason);
            }
          );
        } else {
          resolve(promise);
        }
      });
    });
  }

  static any(promises: Array<any>) {
    let count = 0;
    return new MyPromise((resolve, reject) => {
      promises.forEach((promise) => {
        if (promise instanceof MyPromise) {
          promise.then(
            (value) => {
              resolve(value);
            },
            () => {
              count++;
              if (count === promises.length) {
                reject(new Error("All promises were rejected"));
              }
            }
          );
        } else {
          resolve(promise);
        }
      });
    });
  }

  constructor(
    executor: (
      resolve: (value: any) => void,
      reject: (reason: any) => void
    ) => void
  ) {
    try {
      this.resolve = this.resolve.bind(this);
      this.reject = this.reject.bind(this);
      executor(this.resolve, this.reject);
    } catch (error) {
      this.reject(error);
    }
  }

  resolve(value: any) {
    if (this.promiseStatus !== Status.PENDING) {
      return;
    }
    this.promiseResult = value;
    this.promiseStatus = Status.RESOLVED;
    while (this.onFulFilledCallback.length) {
      this.onFulFilledCallback.shift()(this.promiseResult);
    }
  }

  reject(reason: any) {
    if (this.promiseStatus !== Status.PENDING) {
      return;
    }
    this.promiseResult = reason;
    this.promiseStatus = Status.REJECTED;
    while (this.onFulFilledCallback.length) {
      this.onRejectedCallback.shift()(this.promiseResult);
    }
  }

  then(onFulFilled?: (value: any) => any, onRejected?: (reason: any) => any) {
    onFulFilled =
      typeof onFulFilled === "function" ? onFulFilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw new Error(`${reason}`);
          };
    const thenPromise = new MyPromise((resolve, reject) => {
      const resolvePromise = (callback: any) => {
        queueMicrotask(() => {
          try {
            const temp = callback(this.promiseResult);
            if (temp === thenPromise && temp != undefined) {
              throw new Error(`不能返回自身`);
            } else if (temp instanceof MyPromise) {
              temp.then(resolve, reject);
            } else {
              resolve(this.promiseResult);
            }
          } catch (error) {
            reject(error);
            throw new Error(`${error}`);
          }
        });
      };
      if (this.promiseStatus === Status.RESOLVED) {
        resolvePromise(onFulFilled);
      } else if (this.promiseStatus === Status.REJECTED) {
        resolvePromise(onRejected);
      } else if (this.promiseStatus === Status.PENDING) {
        this.onFulFilledCallback.push(resolvePromise.bind(this, onFulFilled));
        this.onRejectedCallback.push(resolvePromise.bind(this, onRejected));
      }
    });
    return thenPromise;
  }
}
```

