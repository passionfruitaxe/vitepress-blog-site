# Promise类

## 完整代码

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
    } catch (e) {
      this.reject(e);
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
            const x = callback(this.promiseResult);
            if (x === thenPromise && x != undefined) {
              throw new Error(`不能返回自身`);
            } else if (x instanceof MyPromise) {
              x.then(resolve, reject);
            } else {
              resolve(x);
            }
          } catch (e) {
            reject(e);
            throw new Error(`${e}`);
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



建议先阅读[《Promise A+》](https://promisesaplus.com/#notes)文档，本文中也会列出部分在文档中的出处

## Callback数组的作用

为什么会存在成功和失败的两个回调数组？

直接在`.then`方法中判断状态返回`this.promiseResult`好像也是可行的？

```ts
class MyPromise {
    protected onFulFilledCallback: Array<any> = [];
	protected onRejectedCallback: Array<any> = [];
}
```

我们先思考一下，`promise`状态改变和`.then`方法执行的先后关系，有以下两种：

- 先改变状态，再执行`.then`方法
- 先执行`.then`方法，再改变状态

第一种是最普遍的，也许你对第二种场景比较陌生，这里我们构造一个调用场景

```ts
const p = new MyPromise((resolve, reject) => {
	setTimeout(resolve, 1000, 1);
});
p.then(console.log, console.error);
```

根据`Event loop`和浏览器处理任务的顺序

`setTimeout`（宏任务）会在下一个Tick被执行

也就是说这个`promise`先执行了`.then`方法，再执行状态改变函数`resolve(1)`

当你执行`.then`方法时，`promise`状态还未被改变，此时的状态为`PENDING`

所以我们可以得出一个结论：

**`.then`方法的回调函数应该在`promise`状态被改变时调用也就是在`resolve/reject`函数中。**

这就是我们设计`Callback`数组的作用，将`.then`方法中传入的`onFulfilledCallback`和`onRejectedCallback`保存起来，在状态改变时依次执行对应状态的回调数组

至于为什么是数组？

```ts
const p = new Promise(resolve=>{
	setTimeout(resolve, 1000, 1);
})
p.then(console.log);
p.then(console.error);
```

`promise`本来就可以多次执行`.then`方法

其实这一点在Promise A+规范中早就给出了



> 《Promise A+规范》
>
> **2.2.2. 如果`onFulfilled`是一个函数**
>
> - 2.2.2.1. 它必须在`promise`被**解决**后调用，`promise`的值作为它的第一个参数。
> - 2.2.2.2. 它一定不能在`promise`被**解决**前调用。
> - 2.2.2.3. 它一定不能被调用多次。
>
> **2.2.3. 如果`onRejected`是一个函数**
>
> - 2.2.3.1. 它必须在`promise`被**拒绝**之后调用，用`promise`的原因作为它的第一个参数。
> - 2.2.3.2. 它一定不能在`promise`被**拒绝**之前调用。
> - 2.2.3.3. 它一定不能被调用多次。
>
> 
>
> **2.2.6. 同一个`promise`上的`then`可能被调用多次**
>
> - 2.2.6.1. 如果`promise`被**解决**，所有相应的`onFulfilled`回调必须按照他们原始调用`then`的顺序执行
> - 2.2.6.2. 如果`promise`被**拒绝**，所有相应的`onRejected`回调必须按照他们原始调用`then`的顺序执行





## `.then`方法的链式调用

在整个`Promise`类中最为核心的莫过于`.then`方法了，`.then`方法会返回一个`promise`

![promiseThen](/then.png)

> 《Promise A+规范》
>
> **2.2.7. `then`必须返回一个`promise` [3.3]**
>
> ```js
> promise2 = promise1.then(onFulfilled,onRejected)
> ```
>
> - 2.2.7.1. 如果`onFulfilled`或`onRjected`返回一个值`x`，运行`promise`解决程序`[[Resolve]](promise2,x)`
> - 2.2.7.2. 如果`onFulfilled`或`onRejected`抛出一个异常`e`，`promise2`必须用`e`作为原因被**拒绝**
> - 2.2.7.3. 如果`onFulfilled`不是一个函数并且`promise1`被**解决**，`promise2`必须用与`promise1`相同的值被**解决**
> - 2.2.7.4. 如果`onRejected`不是一个函数并且`promise1`被**拒绝**，`promise2`必须用与`promise1`相同的原因被**拒绝**



第一步直接自信返回一个`promise`

>  这里我们约定初始的promise为**originPromise**，then返回的promise为**thenPromise**

```ts
then(onFulFilled?: (value: any) => any, onRejected?: (reason: any) => any) {
    const thenPromise = new MyPromise((resolve, reject) => {
        ……
        if (this.promiseStatus === Status.RESOLVED) {
            // 状态为resolved逻辑
        } else if (this.promiseStatus === Status.REJECTED) {
            // 状态为rejected逻辑
        } else if (this.promiseStatus === Status.PENDING) {
            // 状态为pending逻辑
        }
        ……
    });
    return thenPromise;
}
```

对于三种情况的逻辑如下：

- 如果此时状态已经改变（成功或失败），直接执行对应的回调函数
- 如果状态为`PENDING`，将`onFulFilled`和`onRejected`放入对应回调数组

状态改变时对应的`callback`的执行是必然的，我们需要着重考虑链式调用时`.then`方法返回一个新的`promise`，这个`promise`将决定`thenPromise`的状态

> 《Promise A+规范》
>
> **2.3. `Promise`解决程序**
>
> `promise`解决程序是一个抽象操作，它以一个`promise`和一个值作为输入，我们将其表示为`[[Resolve]](promise, x)`。如果`x`是一个`thenable`，它尝试让`promise`采用`x`的状态，并假设`x`的行为至少在某种程度上类似于`promise`。否则，它将会用值`x`**解决** `promise`。
>
> 这种`thenable`的特性使得`Promise`的实现更具有通用性：只要其暴露一个遵循`Promise/A+`协议的`then`方法即可。这同时也使遵循`Promise/A+`规范的实现可以与那些不太规范但可用的实现能良好共存。
>
> 要运行`[[Resolve]](promise, x)`，需要执行如下步骤：
>
> - 2.3.1. 如果`promise`和`x`引用同一个对象，用一个`TypeError`作为原因来拒绝`promise`
>
> - 2.3.2. 如果`x`是一个`promise`，采用它的状态：
>
> - - 2.3.2.1. 如果`x`是**等待**态，`promise`必须保持等待状态，直到`x`被**解决**或**拒绝**
>   - 2.3.2.2. 如果`x`是**解决**态，用相同的值**解决**`promise`
>   - 2.3.2.3. 如果`x`是**拒绝**态，用相同的原因**拒绝**`promise`
>
> - 2.3.3. 否则，如果`x`是一个对象或函数
>
> - - 2.3.3.1. 让`then`成为`x.then`
>   - 2.3.3.2. 如果检索属性`x.then`导致抛出了一个异常`e`，用`e`作为原因拒绝`promise`
>
> - 2.3.4. 如果`x`不是一个对象或函数，用`x`解决`promise`
>
> 如果`promise`用一个循环的`thenable`链**解决**，由于`[[Resolve]](promise, thenalbe)`的递归特性，最终将导致`[[Resolve]](promise, thenable)`被再次调用，遵循上面的算法将会导致无限递归。规范中并没有强制要求处理这种情况，但也鼓励实现者检测这样的递归是否存在，并且用一个信息丰富的`TypeError`作为原因**拒绝**`promise`。



```ts
// 变量名与上面Promise A+规范对应（不是我不想写的语义化）
try {
    const x = callback(this.promiseResult);
    if (x === thenPromise && x != undefined) {
        throw new Error(`不能返回自身`);
    } else if (x instanceof MyPromise) {
        /*
        这里对于刚接触前端的同学来讲可能不够清晰，展开如下。它表明thenPromise的状态由x决定
        x.then(value=>{
        	resolve(value)
        }, reason=>{
        	reject(reason)
        });
        */
        x.then(resolve, reject);
    } else {
        resolve(x);
    }
} catch (e) {
    // 这里既reject(e)又throw Error的原因先按下不表，在后面我们会做出解释
    reject(e);
    throw new Error(`${e}`);
}
```

这里讲一个插曲，有一个实验室学弟理解then方法中是一个递归调用，我也纳闷哪来的递归呢？后来仔细想的话还真有递归。

总所周知递归需要有一个结束条件，否则就是无线递归。这里如果返回的`promise`是自身的话，就会是无限递归

简单把这段代码写成一个函数

```ts
const resolvePromise = (callback: any) => {
    // 微任务队列
    queueMicrotask(() => {
        try {
            const x = callback(this.promiseResult);
            if (x === thenPromise && x != undefined) {
                throw new Error(`不能返回自身`);
            } else if (x instanceof MyPromise) {
                x.then(resolve, reject);
            } else {
                resolve(x);
            }
        } catch (error) {
            reject(error);
            throw new Error(`${error}`);
        }
    });
};
```

在上述`.then`方法的状态判断逻辑中，就应该是

```ts
if (this.promiseStatus === Status.RESOLVED) {
    resolvePromise(onFulFilled);
} else if (this.promiseStatus === Status.REJECTED) {
    resolvePromise(onRejected);
} else if (this.promiseStatus === Status.PENDING) {
    this.onFulFilledCallback.push(resolvePromise.bind(this, onFulFilled));
    this.onRejectedCallback.push(resolvePromise.bind(this, onRejected));
}
```

这样一个简单的`promise`链式调用就完成了



## 错误穿透/异常穿透

接下来我们来看看一些与链式调用无关的代码

```ts
then(onFulFilled?: (value: any) => any, onRejected?: (reason: any) => any) {
    onFulFilled =
      typeof onFulFilled === "function" ? onFulFilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (reason) => {
            throw new Error(`${reason}`);
          };
    ……
  }
```

这一段代码有什么作用？没有他们又会怎样？



> 《Promise A+规范》
>
> **2.2.1 `onFulfilled`和`onRejected`都是可选的参数**
>
> - 2.2.1.1. 如果`onFulfilled`不是一个函数，它必须被忽略
> - 2.2.1.2. 如果`onRejected`不是一个函数，它必须被忽略



但传入的非函数时，会将其赋值为一个默认的函数。

`onFulfilled`较好理解，`promise`如果没有抛错或者返回一个被拒绝的`promise`时会返回一个成功的`promise`，并且`promiseResult`值为`value`

**`onRejected`为什么要抛错呢？**

我们仔细观察一下这个`onRejected`的抛错会在哪里被捕获

```ts
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
        } catch (e) {
            this.reject(e);
        }
    }
```

```ts
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
```

```ts
const resolvePromise = (callback: any) => {
    // 微任务队列
    queueMicrotask(() => {
        try {
            const x = callback(this.promiseResult);
            if (x === thenPromise && x != undefined) {
                throw new Error(`不能返回自身`);
            } else if (x instanceof MyPromise) {
                x.then(resolve, reject);
            } else {
                resolve(x);
            }
        } catch (e) {
            reject(e);
            throw new Error(`${e}`);
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
```

从这段代码中看到：

1. `onRejected`函数会在`resolvePromise`中被捕获

2. 对`thenPromise`执行`reject(e)`，再抛出错误

3. 被`originPromise`的`constructor`捕获，对`originPromise`执行`reject(e)`

所以当前Promise的拒绝理由会被传给`thenPromise`作为`thenPromise`的拒绝理由，这也与《Promise A+》规范相符

这样做有什么好处呢？我们可以构建一个场景

```ts
new MyPromise((resolve, reject)=>{
	resolve(1);
}).then(value=>{
    console.log(value);
    return value+1;
}).then(value=>{
    console.log(value);
    throw new Error('error');
}).then(value=>{
    console.log(value);
    return value+1;
}).then(value=>{
    console.log(value);
    return value+1;
}).catch(reason=>{
    console.log(reason);
})
```

`.catch`为`.then`方法第二个回调函数的语法糖，在上面这种情况下我们通常不会在每一个`.then`中传递错误处理方法，这就太笨了，就像你对`async/await`进行错误捕获一样

```ts
// 写法1
try{
	const a = await request1();
}catch(e){
	console.error(e);
}
try{
	const b = await request2();
}catch(e){
	console.error(e);
}
try{
	const c = await request3();
}catch(e){
	console.error(e);
}

// 写法2
try{
	const a = await request1();
    try{
        const b = await request2();
        try{
            const c = await request3();
        }catch(e){
            console.error(e);
        }
    }catch(e){
        console.error(e);
    }
}catch(e){
	console.error(e);
}

//写法3
try{
	const a = await request1();
    const b = await request2();
    const c = await request3();
}catch(e){
	console.error(e);
}
```

很显然写法3是最好的实现调用方式

这里的`promise`错误捕获同理，我们希望可以用一个`.catch`捕获链式调用中第一个拒绝理由，这就是`promise`的错误穿透或者叫异常穿透

最后，希望本章解析能够增强你对promise的理解！
