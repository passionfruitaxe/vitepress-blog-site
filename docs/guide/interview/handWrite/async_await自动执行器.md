# async_await 自动执行器

代码如下，将`async&await`语法改为生成器函数和一个自动执行器函数

```ts
async function asyncFunc(value) {
  return value;
}

async function printNum() {
  console.log(1);
  console.log(await asyncFunc(2));
  console.log(3);
}

// 目标代码
function asyncFunc(value) {
  return value;
}

function* () {
    console.log(1);
    console.log(yield asyncFunc(2));
    console.log(3);
}
```

## 审题：

从题目中可知，`console.log(3)`会被放到微任务队列中执行我们考虑使用`promise.then`方法

已知`async`函数会被改为生成器函数，所以我们需要一个函数的执行器`_executor()`，这里采用了一个惰性函数，减少函数重复调用

```ts
function asyncGeneratorStep() {}
// _asyncToGenerator方法会将生成器函数转化成一个自动执行的函数
function _asyncToGenerator() {}

function asyncFunc(value) {
  return value;
}

function _executor(...args) {
  _executor = _asyncToGenerator(function* () {
    console.log(1);
    console.log(yield asyncFunc(2));
    console.log(3);
  });
  return _executor.apply(this, args);
}

// 同样也修改printNum的调用
function printNum(...args) {
  return _executor.apply(this, args);
}
```

<br/>接下来是重点的自动执行器

- 由于我们采用了惰性函数，`_asyncToGenerator`函数的返回值会作为新的`_executor`函数，所以`_asyncToGenerator`函数也会返回一个函数
- `async`函数的返回值是一个`promise`，所以这个返回的新函数也返回一个`promise`

理论成立，实践开始，自信且大胆的定义函数和返回值

```ts
function _asyncToGenerator(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {});
  };
}
```

<br/>接下来创建`generator`对象，由于我们并非在和`async`函数相同的上下文中执行生成器，这里需要采用全局上下文

```ts
function _asyncToGenerator(fn) {
  const self = this;
  return function (...args) {
    return new Promise((resolve, reject) => {
      const generator = fn.apply(self, args);
    });
  };
}
```

<br/>前面提过，`await`后面的语句会被放进微任务队列中执行，并且我们会采用`promise.then`方法来完成

这里还有一个逻辑，当生成器执行结束时会`resolve`这个`promise`，出现错误则会`reject`这个`promise`

为了代码整洁，我们把`promise`的兑现方法交给一个新的函数

```ts
/**
 *
 * @param {*} generator 生成器对象
 * @param {*} resolve
 * @param {*} reject
 * @param {*} arg
 * @returns
 */
function asyncGeneratorStep(generator, resolve, reject, arg) {
  let info = null;
  try {
    info = generator.next(arg);
  } catch (error) {
    reject(error);
    return;
  }
  if (info?.done) {
    resolve(info?.value);
  } else {
    Promise.resolve(info?.value).then(/*微任务中执行下一次next()*/);
  }
}

function _asyncToGenerator(fn) {
  const self = this;
  return function (...args) {
    return new Promise((resolve, reject) => {
      const generator = fn.apply(self, args);
      asyncGeneratorStep(generator, resolve, reject, void 0);
    });
  };
}
```

<br/>在微任务中执行下一次`next()`方法，我们可以考虑递归的调用，这里的递归和同步递归不太相同，他将在微任务队列中加入下一次函数调用

```ts
/**
 *
 * @param {*} generator 生成器对象
 * @param {*} resolve
 * @param {*} reject
 * @param {*} _next next方法
 * @param {*} _throw 抛错方法
 * @param {*} arg
 * @returns
 */
function asyncGeneratorStep(generator, resolve, reject, _next, _throw, arg) {
  let info = null;
  try {
    info = generator.next(arg);
  } catch (error) {
    reject(error);
    return;
  }
  if (info?.done) {
    resolve(info?.value);
  } else {
    Promise.resolve(info?.value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  const self = this;
  return function (...args) {
    return new Promise((resolve, reject) => {
      const generator = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(generator, resolve, reject, _next, _throw, value);
      }
      function _throw(error) {
        asyncGeneratorStep(generator, resolve, reject, _next, _throw, error);
      }
      _next(void 0);
    });
  };
}
```

<br/>

## 代码实现：

```ts
function asyncGeneratorStep(generator, resolve, reject, _next, _throw, arg) {
  let info = null;
  try {
    info = generator.next(arg);
  } catch (error) {
    reject(error);
    return;
  }
  if (info?.done) {
    resolve(info?.value);
  } else {
    Promise.resolve(info?.value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  const self = this;
  return function (...args) {
    return new Promise((resolve, reject) => {
      const generator = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(generator, resolve, reject, _next, _throw, value);
      }
      function _throw(error) {
        asyncGeneratorStep(generator, resolve, reject, _next, _throw, error);
      }
      _next(void 0);
    });
  };
}

function asyncFunc(value) {
  return value;
}

function printNum(...args) {
  return _executor.apply(this, args);
}

function _executor(...args) {
  _executor = _asyncToGenerator(function* () {
    console.log(1);
    console.log(yield asyncFunc(2));
    console.log(3);
  });
  return _executor.apply(this, args);
}

printNum();
console.log(4);
/**
 * 1 4 2 3
 */
```
