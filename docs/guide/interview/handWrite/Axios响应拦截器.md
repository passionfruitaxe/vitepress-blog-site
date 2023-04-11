# Axios响应拦截器

简单实现一下axios类响应拦截器



## 审题：

axios中请求方法返回一个Promise类型的响应值，因为网络请求通常是异步的

响应拦截器期望请求的响应值按顺序被拦截器函数调用，并将函数调用返回值作为新的响应值传入下一个拦截器

我们应该声明的有：

1. 响应拦截器数组——responseInterceptor 

2. 注册相应拦截器函数——use()

3. 调用所有响应拦截器——useResponseInterceptor()



1和2的实现无需多讲，调用所有响应拦截器，需要考虑有以下几点：

1. 按照注册顺序对拦截器函数进行调用

2. 调用拦截器函数后的返回值作为新的响应值被下一个拦截器函数处理，并且我们认为每一个拦截器返回的值类型都应该和初始value相同(Promise)

3. 错误异常捕获



结合1，2我们考虑采用Array.prototype.reduce进行处理，具体使用reduce还是reduceRight取决于你的use方法注册拦截器时的方法

我们的响应值初始是个Promise类型，很明显的方法是可以利用Promise特性，在then方法中返回nextCallback(value)，调用then方法会返沪回一个新的Promise，它的状态由nextCallback(value)决定，并且返回这个Promise

```ts
function callback(
  curResponse: Promise<any>,
  nextCallback: (value: Promise<any>) => Promise<any>
): Promise<any> {
  return curResponse.then((value) => nextCallback(value));
}
```

结合到reduce当中就是

```ts
interceptor.response.responseInterceptor.reduce((curResponse, curCallback) => {
  return curResponse.then(curCallback);
}, response);
// 这样写似乎并不够直观，我们采用async/await写法
interceptor.response.responseInterceptor.reduce(
  async (curResponse, curCallback) => {
    const curValue = await curResponse;
    return curCallback(curValue);
  },
  response
);
```

最后一步，错误处理，拦截器中如果出现错误，应该停止后续拦截器的调用，并且返回reject的Promise

then写法中我们可以在catch中捕获错误，并在每一次调用拦截器函数前对curResponse进行状态判断，状态为reject时退出循环

在reduce中如果我们需要退出循环，需要使用try catch语句，在catch中返回Promise.reject(error)

async/await写法会更加直观

```ts
try {
  interceptor.response.responseInterceptor.reduce(
    async (curResponse, curCallback) => {
      const curValue = await curResponse;
      return curCallback(curValue);
    },
    response
  );
} catch (error) {
  return Promise.reject(error);
}
```



## 代码实现：

```ts
type Interceptor = {
  response: {
    responseInterceptor: Function[];
    use: (callback: Function) => void;
  };
};

class Axios {
  public interceptor: Interceptor = {
    response: {
      responseInterceptor: [],
      use(callback) {
        this.responseInterceptor.push(callback);
      },
    },
  };

  public useResponseInterceptor<T>(response: Promise<T>): Promise<any> {
    try {
      return this.interceptor.response.responseInterceptor.reduce(
        async (curResponse, curCallback) => curCallback(await curResponse),
        response
      );
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public test<T>(task: Promise<T>): Promise<any> {
    return this.useResponseInterceptor<T>(task);
  }
}

const axios = new Axios();

axios.interceptor.response.use((value: any) => {
  console.log(`执行拦截器1, 当前value=${value}`);
  return value + 1;
});
axios.interceptor.response.use((value: any) => {
  console.log(`执行拦截器2, 当前value=${value}`);
  return value + 1;
});
axios.interceptor.response.use((value: any) => {
  console.log(`执行拦截器3, 当前value=${value}`);
  return value + 1;
});
axios.interceptor.response.use((value: any) => {
  console.log(`执行拦截器4, 当前value=${value}`);
  return value + 1;
});
axios.interceptor.response.use((value: any) => {
  console.log(`执行拦截器5, 当前value=${value}`);
  return value + 1;
});

const task = new Promise((resolve) => {
  setTimeout(() => {
    resolve(1);
  }, 1000);
});

axios.test(task).then((value) => {
  console.log(`最终返回value=${value}`);
});
/*
执行拦截器1, 当前value=1
执行拦截器2, 当前value=2
执行拦截器3, 当前value=3
执行拦截器4, 当前value=4
执行拦截器5, 当前value=5
最终返回value=6
*/
```

