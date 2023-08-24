# render阶段

`Reconciler` 工作阶段称为 `render` 阶段，本身是一个"DFS递归“的过程

主要分为两个部分

- `beginWork `

  `beginWork`过程又称为`render`阶段的"递"过程

  主要任务是：

  - 挂载`fiberNode`到`wip.child`上，在某些情况下也会为`fiberNode`标记`flag`

- `completeWork`

  `completeWork`过程又称为`render`阶段的"归"过程

  主要任务是：

  - 创建或标记元素更新

  - `flags`冒泡



## beginWork

`beginWork`阶段会针对不同的wip.tag进入不同组件的处理逻辑，比较重要的一点是如果此时是Update行为，会进行是否可以复用的优化判断，如果没有命中优化策略，则会进入`reconcileChildren`函数调用

`reconcileChildren`函数首先会判断本次操作时`Mount`行为还是`Update`行为（非常容易！你只需要判断`current === null`），针对不同的行为，我们可以进行一些优化

> 首先介绍一个工厂函数: 
>
> createChildFibers( shouldTrackSideEffects: boolean ): ( ...props ) => Fiber
>
> shouldTrackSideEffects含义为 是否追踪副作用/是否标记flags
>
> mountChildFiber = createChildFibers(false)
>
> reconcileChildFiber = createChildFibers(true)

- **Mount行为**

  **wip.child = mountChildFibers()**

- **Update行为**

  **wip.child = reconcileChildFibers()**



`Mount`时不追踪副作用是一个优化策略，这一点在`completeWork`之后解释

> Question-1：
>
> Mount是不追踪副作用的理由是什么？优化策略如何体现？

`reconcileChildFibers`方法标记了`fiberNode`的"插入、删除、移动"行为（flags）

至此，`beginWork`阶段创建了`wip`的子`fiberNode`并将他们连接成`fiberTree`



## completeWork

我们先解释一下`flags`冒泡，在`reconcile`阶段我们可能通过`reconcileChildFibers`方法为`fiberNode`进行了一些`flag`标记，这些`flags`行为会在`Renderer`的工作阶段——`commit`阶段进行兑现

我们希望的是`Renderer`能够快速的、准确的获取到需要跟踪`flags`的`fiberNode`，这一点可以通过`flags`冒泡来实现

```ts
let subtreeFlags = NoFlags
subtreeFlags |= child.subtreeFlags;
subtreeFlags |= child.flags;
completedWork.subtreFlags |= subtreeFlags;
```

![20230824-142831](/images/1.5.png)

- Mount行为

  - `createInstance`方法创建`fiberNode`对应的DOM元素

  - `appendAllChildren`将下一层DOM元素插入"`createInstance`"方法创建的DOM元素中

    具体逻辑为：

    1. 从当前`fiberNode`向下遍历，将遍历到的第一层DOM元素（HostComponent、HostText）类型通过`appendChild`方法插入parent末尾
    2. 对兄弟`fiberNode`执行步骤1
    3. 如果没有兄弟`fiberNode`，则对父`fiberNode`执行步骤1
    4. 遍历流程回到最初执行步骤1所在层或者`parent`所在层时终止

  - `finalizeIntailChildren`设置DOM元素属性

过程不难理解，但我们还是走一遍全流程

> fiberNode.stateNode属性指向其对应的真实DOM元素

```html
<!-- dom结构大概是这样 -->
<App>
  <div>
    "Hello"
    <span></span>
  </div>
</App>
```

![1.1](/images/1.1.png)

mount 阶段执行流程如下：

1. HostRootFiber beginWork

   创建` App fiberNode`

2. App fiberNode beginWork

   创建 `div fiberNode`

3. div fiberNode beginWork

   创建`"Hello" fiberNode、span fiberNode`

4. "Hello" fiberNode beginWork

   叶子元素

5. "Hello" fiberNode completeWork

   向下遍历无`fiberNode`

   ```tsx
   fiberNode.stateNode = instance = "Hello"
   ```

6. span fiberNode beginWork

   叶子元素

7. span fiberNode completeWork

   ```tsx
   fiberNode.stateNode = instance = <span></span>
   ```

8. div fiberNode completeWork

   向下遍历到`span fiberNode`和`"Hello" fiberNode`，调用`appendInitialChild(instance, wip)`方法插入`div fiberNode`通过`createInstance`创建的`instance`上

   ```tsx
   appendInitialChild(instance, workInProgress.child.stateNode, ...props);
   /**
   实际上就是instance.appendChild(workInProgress.child.stateNode)
   */
   fiberNode.stateNode = instance = <div>"Hello"<span></span></div>
   ```

9. App fiberNode completeWork

   与8同理，但由于App组件并无其他内容

   ```tsx
   fiberNode.stateNode = instance = <div>"Hello"<span></span></div>
   ```

10. HostRootFiber completeWork

> Answer-1：
>
> 观察appendAllChildren行为，你会发现在completeWork阶段每一个fiberNode上都存在了一个stateNode属性，他是包含了children fiberNode节点stateNode的一个真实DOM元素（也就是一个离屏DOM）
>
> 事实上在mount时构建wip fiberTree时并非所有fiberNode都没有alternate属性，比如HostRootFiber就存在alternate属性的（HostRootFiber.current !== null）
>
> 也就是说对于HostRootFiber而言他将会执行的时reconcileChildFiber()，它本身是被标记了flags的
>
> HostRootFiber在经过completeWork阶段后，获得了一颗完整的离屏DOM Tree（HostRootFiber.stateNode），最终一次插入DOM中，更节省性能。如果为每一个mount的fiberNode都标记flags，那么就会进行多次appendChild或insertBefore操作，性能开销更大

- Update行为

  Update行为的逻辑主要在函数`diffProperties()`中，他包含两次遍历

  - 第一次遍历，标记删除更**新前有，更新后无**的属性
  - 第二次遍历，标记更新**Update流程前后发生改变**的属性

  `diffProperties`方法返回一个被标记的变化属性数组，相邻两项作为属性的(key, value)

  所有的变化都会保存到`fiberNode.updateQueue`中，并且`fiberNode`会被标记Update flag

> Question-2：
>
> 采用相邻两项作为属性的(key, value)对比更符合语义化的Array<{key:string, value:any}>有什么优势？

> Answer-2：（我也没看出啥名堂，听gpt怎么说）
>
> - 性能：开辟对象空间占用更高，这种方法对内存占用更少
> - 高效：遍历以及对内容处理更高效
> - 顺序保障：保障数据顺序的一致性
>
> 没太理解2，3点

