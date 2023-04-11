# Axios请求拦截器

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

  public useResponseInterceptor<T>(value: Promise<T>): Promise<any> {
    try {
      return this.interceptor.response.responseInterceptor.reduce(
        async (prevValue, curCallback) => curCallback(await prevValue),
        value
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
```

