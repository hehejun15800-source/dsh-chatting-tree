# chatting-tree（中文说明）

一个 **DeepSeek Harness（DSH）Web 客户端插件**：把一次对话变成一棵可以走回去的决策树。

聊天过程中助手不断给你选项 —— `ask_user_question` 的候选项、直白的提问、一整个轮次。
chatting-tree 把会话事件流折叠成右侧栏里的**决策时间轴**：每一个本可以走别的路的节点、
当时摆在桌面上的全部选项、以及**你实际选中的那一条**。点任意节点，插件从该轮次处
**分叉出一个新会话**（继承此前历史）并切过去，让你重走另一条路，而原会话历史一字不动。

> 状态：针对 DSH `0.1.5-rc.2` 的可运行原型。依赖的宿主接口见下文「兼容性」。
> English: [README.md](README.md)。

## 你会看到

右侧栏（窗口太窄时自动改为自绘浮层）里有：

- **决策时间轴**：一个决策点一个节点；
- **候选选项**：选中的打勾 `✓`，未选的留空 `○`；
- **会话血缘树**：分叉出来的会话缩进嵌在它的来源会话下面；
- **「回到此节点」**：每个轮次已结束的节点上都有。

## 功能

| | |
|---|---|
| **决策节点** | `ask_user_question` 调用（`tool/call` + `tool/result`）折叠为节点，带问题、标题与全部候选选项（含描述）。 |
| **已选分支** | 记录的答案按 tool-call 身份回接，选中的选项被标记。 |
| **人类轮次** | 每条人类 `user/message`（`source.kind === "user"`）也是节点；agent 注入的合成文本忽略。 |
| **血缘树** | 分叉是一等公民：按 `parentSessionId` 嵌套，任意分支可直接打开。 |
| **分叉回退** | 调宿主 `session.fork`，只在已完成的轮次边界切分 —— 写时复制，源日志不改写。 |
| **两种承载** | 右侧栏页签 + 帧布局给不出宽度时自动出现的浮层抽屉。 |
| **不空白、不静默** | 渲染异常被错误边界接住并打印；打不开的侧栏会在按钮上写明原因。 |

## 安装

chatting-tree 是**客户端插件**：DSH 加载器通过包里的 `dsh.client` 声明发现它，并从 profile
的 `/plugins` 路由投递它的浏览器半边。运行期不编译、不联网 —— `lib/` 就是交付物。

1. **让 profile 能解析到它**（检出 + `$DSH_HOME` 软链是最省事的做法）：

   ```sh
   git clone https://github.com/OWNER/chatting-tree.git ~/.dsh/plugins/chatting-tree
   mkdir -p ~/.dsh/profiles/node_modules/@dsh-plugins
   ln -sfn ~/.dsh/plugins/chatting-tree \
           ~/.dsh/profiles/node_modules/@dsh-plugins/chatting-tree
   ```

   目录名有讲究：设置 → 插件 的卡片标题是模块名去掉作用域后的短名，所以正是这个布局让
   插件显示为 **chatting-tree**。

2. **挂上插件行** —— `$DSH_HOME/profiles/web/cordis.patch.yml`：

   ```yaml
   - insert:
       - id: ui-chatting-tree
         name: '@dsh-plugins/chatting-tree'
   ```

3. **重启** `dsh web` 并硬刷新页面。会话头部出现 **「⤳ 选择图」**，设置 → 插件 里出现
   名为 `chatting-tree` 的卡片。

   想用 pnpm：`dsh plugin --profile web add <spec>` 会装进 profile，并自动对齐
   `dsh.profile.bundles`。

## 使用

1. 点会话头部的 **「⤳ 选择图」**，或打开右侧栏选 **「选择事件图」** 页签 / 引导页入口。
2. 读时间轴：`✓` 是你选的，`○` 是你没选的。轮次尚未结束的节点会写明「暂不可回退」，而不是
   点了才报错。
3. 点节点上的 **「回到此节点」** 即可从该处回退：新会话出现在血缘树里，界面自动切过去，
   你在那里继续对话。
4. `Esc`、点遮罩或点 **关闭** 关掉浮层；右侧栏页签用它自己的页签控件管理。

## 原理

```
lib/index.js    宿主半边   —— 空的 apply()，只为让加载器挂载该行并发现 dsh.client 声明
lib/client.js   浏览器半边 —— 经 /plugins 投递的懒 CJS bundle：
                              parseChoiceGraph(entries) → 决策节点
                              revealPanel / openGraph  → 先右侧栏，不行则浮层
                              ChoiceGraphPanel / ChoiceNode / LineageTree → 界面
```

两个关键边界：

- **读取选择**：宿主通过 `ctx.sessions.binding(id).eventSource` 暴露会话事件窗口。节点由
  `assistant/message` 里的 tool call 折叠而来（持久化消息里标识字段是 `id`，实时事件里是
  `callId`），再与配对的 `tool/result` 连接；答案文本形如
  `{"answers":[{"id","selected","custom"}]}`。`turn/end` 的序号决定哪些节点还能分叉。
- **分叉回退**：`ctx.sessions.fork({ sessionId, atSeq })` 在 `atSeq` 之后第一个已完成的
  `turn/end` 处切分，并用该前缀播种一个子会话。整个「回退」就这一条：不改写历史，且每个
  分支始终可寻址。

另外两条踩过的坑，做 DSH 客户端插件时值得知道：

- 插件行的 `inject` 数组只把服务挂到 `ctx` 上，**不会**进入 slot 组件的 props；服务必须通过
  该 slot 自己的 `inject` 面下发。
- 右侧栏的座位只在对话是当前主面板时存在；帧布局只在
  `viewport - sidebar - 400 >= 300` 时才给列留轨道。所以才需要重试时
  `ctx.layout.selectPanel(null)`，以及浮层兜底。

## 开发

没有构建步骤 —— `lib/` 是手写 JavaScript，交付的 bundle 就是唯一事实来源。无需浏览器、
无需 DSH 宿主即可自检：

```sh
node verify.mjs      # 或 npm run verify
```

它用一层小 shim 在 Node 里加载真实 bundle，检查注册项、事件折叠（选项回接、畸形事件窗口）
与打开策略（展开 → 打开 → 重试 → 上报）。

## 兼容性

基于 DSH `0.1.5-rc.2` 的 `web` profile 开发与验证。它读取以下 DSH 内部接口，未来可能变化：

- `ctx.sessions` —— `binding(id).eventSource`、`open(id)`、`fork({ sessionId, atSeq, increaseTitle })`
- `ctx.sidebarRight` / `ctx.sidebarRightTabs` / `ctx.slots` —— 注册页面类型与其主体
- `ctx.layout` —— `selectPanel(null)`，把对话切回前台以便右侧栏座位挂载
- 帧布局的列宽算式 —— `viewport - sidebar - 400 >= 300` 才给右侧栏轨道

这些变化时插件会**响亮地失败**而不是静默：渲染异常打印在面板里，打不开的侧栏把原因写在
按钮上。

## 排错

| 现象 | 多半原因 |
|---|---|
| 看不到 **⤳ 选择图** 按钮 | bundle 没加载 —— 重启 `dsh web`、硬刷新，控制台里找 `choice-graph: plugin applied`。 |
| 按钮显示打开失败 | 悬停它：标题就是宿主原始错误。 |
| 右侧栏拉不出来 | 窗口窄于约 1250px，帧布局不给右侧栏轨道。此时应自动出现浮层；要看右侧栏请拉宽窗口。 |
| 时间轴不完整 | 事件窗口只加载了最近部分，面板顶部会写「仅显示最近事件」。 |
| 某节点不能回退 | 它所在轮次还没结束 —— 宿主只允许在已完成的轮次边界切分。 |

## 已知限制

- 只把 `ask_user_question` 调用与人类消息作为节点；审批（`approval/asked|decided`）尚未折叠。
- 时间轴只覆盖已加载的事件窗口。
- 尚未国际化：界面文案为简体中文。

## 许可证

[MIT](LICENSE)
