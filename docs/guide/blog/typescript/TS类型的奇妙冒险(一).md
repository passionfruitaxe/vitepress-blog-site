# TypeScript 的类型的奇妙冒险（一）

## 提出问题：

最近在写TypeScript时遇到一些比较有趣的问题

我们假设有一个场景需求：

有一个数据库查询函数，参数传入需要返回的字段数组，返回对应字段的映射对象

而`TypeScript`**只在编译期执行静态类型检查**，传入的查询字段是运行时传入的，对`TypeScript`而言参数类型为`string[]`

```ts
type TObj = {
    first: number;
    second: number;
    third: number;
};

const obj: TObj = {
    first: 1,
    second: 2,
    third: 3,
};

function getValues(arr: KeysArr) {
   
}

const ans = getValues(["first", "second"]);
// const ans: {
//     first: number;
//     second: number;
// }
```



## 解决过程：

我希望TypeScript能够正确的返回类型，要达到这一点可以进行以下分析

- 传入的参数数组一定是映射对象中的key字段构成的数组，那他也就是一个联合类型数组

- `type KeyArr = Array<keyof TObj>` `keyof TObj = 'first'|'second'|'third'`

<br/>

通常情况下`TypeScript`认为传入的参数数组的是一个`string[]`

我们可以利用类型推断和条件表达式进行模式匹配让他被约束为一个联合类型数组

```ts
type TObj = {
    first: number;
    second: number;
    third: number;
};

const obj: TObj = {
    first: 1,
    second: 2,
    third: 3,
};

function getValues<KeysArr extends Array<keyof TObj>>(
	arr: KeysArr
)：{ [Key in KeysArr[number]]: TObj[Key] } {
    // KeysArr[number]表示数组中的元素类型
    const ans = {};
    for (let i = 0; i < arr.length; i++) {
        ans[arr[i]] = obj[arr[i]];
    }
    return ans as { [Key in KeysArr[number]]: TObj[Key] };
}

getValues(["first", "second"]);
```

这里补充讲一下联合类型的一些特点：

```ts
type UnionType = "first" | "second";
type UnionType2 = "first" | "second" | "third";
type ans = UnionType extends UnionType2 ? true : false;
// type ans = true
```

<br/>

综上所述，我们可以通过这样的推断来限制`arr`数组的类型

这里有一个坑是我们不能这样去传参：

```ts
const arr = ["first", "second"]
getValues(arr);
```

这样调用时传入的`arr`被也会被认为是一个`string[]`

<br/>

接下里我们利用`TypeScript`内置的高阶类型让他变得更容易理解一些

```ts
function getValues<Keys extends keyof TObj>(arr: Keys[]): Pick<TObj, Keys> {
  const ans = {};
  for (let i = 0; i < arr.length; i++) {
    ans[arr[i] as string] = obj[arr[i]];
  }
  return ans as Pick<TObj, Keys>;
}

getValues(["first", "second"]);
```



## 完整代码：

```ts
type TObj = {
  first: number;
  second: number;
  third: number;
};

const obj: TObj = {
  first: 1,
  second: 2,
  third: 3,
};

function getValues<Keys extends keyof TObj>(arr: Keys[]): Pick<TObj, Keys> {
  const ans = {};
  for (let i = 0; i < arr.length; i++) {
    ans[arr[i] as string] = obj[arr[i]];
  }
  return ans as Pick<TObj, Keys>;
}

getValues(["first", "second"]);

const ans = getValues(["first", "second"]);
// const ans: {
//     first: number;
//     second: number;
// }
console.log(ans);
// {
//   first: 1,
//   second: 2,
// }
```
