# chatting-tree

[![verify](https://github.com/hehejun15800-source/dsh-chatting-tree/actions/workflows/verify.yml/badge.svg)](https://github.com/hehejun15800-source/dsh-chatting-tree/actions/workflows/verify.yml)

A **DeepSeek Harness (DSH) Web client plugin** that turns a conversation into a decision
tree you can walk back into.

While you chat, the assistant keeps offering choices — `ask_user_question` options, plain
questions, whole turns. chatting-tree folds the session's event log into a **decision
timeline** in the right-hand column: every point where the conversation could have gone
another way, every option that was on the table, and **the one you actually picked**. Click
any node and the plugin forks the session from that completed turn into a **new session**
that inherits the prefix, then switches you to it — so you can take the other road without
the original history being touched.

> Status: working prototype against DSH `0.1.5-rc.2`. See [Compatibility](#compatibility)
> for the host surfaces it depends on. 中文说明见 [README.zh.md](README.zh.md)。

## What you get

A right-side column — or a self-drawn drawer when the window is too narrow for one —
containing:

- a **decision timeline**, one node per decision point;
- the offered **options**, with the taken branch checked `✓` and the rest left open `○`;
- a **session lineage tree** at the top, so forks nest under the conversation they came from;
- a **「回到此节点」** ("Back to this node") action on every node whose turn has completed.

## Features

| | |
|---|---|
| **Decision nodes** | `ask_user_question` calls (`tool/call` + `tool/result`) become nodes carrying the question, its header, and every offered option with its description. |
| **Taken branch** | The recorded answer is joined back to the node by tool-call identity, and the chosen option is marked. |
| **Human turns** | Each human `user/message` (source kind `user`) also becomes a node; agent-injected context is ignored. |
| **Lineage tree** | Forks are first-class: sessions nest by `parentSessionId`, and any branch can be opened directly. |
| **Fork back** | Uses the host's `session.fork` at a completed-turn boundary — copy-on-write; the source log is never rewritten. |
| **Two surfaces** | The right column's tab, plus a drawer that appears when the frame cannot give the column a width. |
| **Never blank, never silent** | A render failure is caught by an error boundary and printed; an unopenable column says why on the button. |

## Install

chatting-tree is a **client plugin**: DSH's loader discovers it through the package's
`dsh.client` declaration and serves its browser half from the profile's `/plugins` route.
Nothing is compiled or fetched at runtime — `lib/` is the shipped artifact.

1. **Get the files** somewhere the profile can resolve. A checkout plus a `$DSH_HOME`
   symlink is the least invasive:

   ```sh
   git clone https://github.com/hehejun15800-source/dsh-chatting-tree.git ~/.dsh/plugins/chatting-tree
   mkdir -p ~/.dsh/profiles/node_modules/@dsh-plugins
   ln -sfn ~/.dsh/plugins/chatting-tree \
           ~/.dsh/profiles/node_modules/@dsh-plugins/chatting-tree
   ```

   The name matters: the Settings → Plugins card shows the module specifier with its scope
   stripped, so this layout is what makes the plugin appear as **chatting-tree**.

2. **Mount the row** in your profile's patch layer —
   `$DSH_HOME/profiles/web/cordis.patch.yml`:

   ```yaml
   - insert:
       - id: ui-chatting-tree
         name: '@dsh-plugins/chatting-tree'
   ```

3. **Restart** `dsh web` and hard-refresh the page. The conversation header gains a
   **「⤳ 选择图」** control, and Settings → Plugins lists the row as `chatting-tree`.

   Prefer pnpm? `dsh plugin --profile web add <spec>` installs into the profile, and the
   manifest reconciliation keeps `dsh.profile.bundles` honest.

## Use

1. Click **「⤳ 选择图」** in the session header — or open the right column and pick the
   **「选择事件图」** tab / guide entry.
2. Read the timeline: `✓` marks the option you took, `○` the ones you passed on. A node in a
   turn that has not finished yet reports itself as *not yet forkable* instead of failing.
3. Click **「回到此节点」** on a node to fork from that point. A child session appears in the
   lineage tree, the app switches to it, and you continue the conversation there.
4. `Esc`, the backdrop, or **关闭** closes the drawer; the column keeps its own tab controls.

## How it works

```
lib/index.js    host half    — an empty apply(); it exists so the loader mounts the row and
                               discovers the dsh.client declaration
lib/client.js   browser half — a lazy-CJS bundle loaded through /plugins:
                               parseChoiceGraph(entries) → decision nodes
                               revealPanel / openGraph  → the column, else the drawer
                               ChoiceGraphPanel / ChoiceNode / LineageTree → the surface
```

The two interesting boundaries:

- **Reading choices.** The host exposes a session's contiguous event window through
  `ctx.sessions.binding(id).eventSource`. Nodes fold out of `assistant/message` tool calls —
  the call identity is `id` on a durable message and `callId` on a live event — joined with
  the paired `tool/result`, whose rendered answer text is
  `{"answers":[{"id","selected","custom"}]}`. `turn/end` sequence numbers decide which nodes
  can still be forked.
- **Forking back.** `ctx.sessions.fork({ sessionId, atSeq })` cuts at the first completed
  `turn/end` at or after `atSeq` and seeds a child session with that prefix. That is the
  whole rewind mechanism: no history rewriting, and every branch stays addressable.

Two more things the surface had to learn the hard way, both worth knowing if you build a DSH
client plugin:

- A plugin row's `inject` array publishes services on `ctx`; it does **not** put them in a
  slot body's props. Services reach a body only through its own slot `inject` face.
- The right column's seat exists only while the conversation is the active main panel, and
  the frame grants the column a track only while `viewport - sidebar - 400 >= 300`. Hence
  `ctx.layout.selectPanel(null)` on retry, and the drawer as the guarantee.

## Develop

There is no build step — `lib/` is hand-written JavaScript and the shipped bundle is the
source of truth. Verify it without a browser or a DSH host:

```sh
node verify.mjs      # or: npm run verify
```

It loads the real bundle in Node with a small shim and checks the registrations, the graph
fold (option joining, hostile event windows), and the reveal plan (expand → open → retry →
report). CI runs the same script on every push and pull request against Node 20, 22, and 24
([`.github/workflows/verify.yml`](.github/workflows/verify.yml)).

## Compatibility

Built and tested against DSH `0.1.5-rc.2` on the `web` profile. It reads these host surfaces,
which are internal to DSH and may change:

- `ctx.sessions` — `binding(id).eventSource`, `open(id)`, `fork({ sessionId, atSeq, increaseTitle })`
- `ctx.sidebarRight` / `ctx.sidebarRightTabs` / `ctx.slots` — a page type and its body
- `ctx.layout` — `selectPanel(null)`, to bring the conversation forward so the column can mount
- the frame's column solver — `viewport - sidebar - 400 >= 300` grants the column a track

When one of these changes, the plugin fails loudly rather than silently: a render error
prints inside the panel, and an unopenable column prints its reason on the button.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| No **⤳ 选择图** button | The bundle did not load — restart `dsh web`, hard-refresh, check the console for `choice-graph: plugin applied`. |
| Button says it failed | Hover it: the host's own error text is the title. |
| Column will not open | The window is narrower than ~1250px, so the frame gives the column no track. The drawer should appear instead; widen the window to use the column. |
| Timeline looks incomplete | The event window is partial; the header shows *"仅显示最近事件"*. |
| A node cannot be forked | Its turn has not completed yet — the host only forks at completed-turn boundaries. |

## Limitations

- Only `ask_user_question` calls and human messages become nodes; approval prompts
  (`approval/asked|decided`) are not folded yet.
- The timeline covers the loaded event window only.
- No i18n yet: the UI copy is Simplified Chinese.

## License

[MIT](LICENSE)
