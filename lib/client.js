window.__ModuleLoader__.load({
	id: "@dsh-plugins/chatting-tree",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const react = require("react");

		//#region constants
		/** The tab kind this package owns; opened through `ctx.sidebarRight.openTab`. */
		const KIND = "choice-graph";
		/** This implementation's identity in the tab system, and the key its body registers under. */
		const ID = "@dsh-plugins/chatting-tree";
		/** Build identity, shown in the panel and in the header control's tooltip. */
		const VERSION = "v1.4";
		/** Locale namespace for this plugin's dictionaries. */
		const NS = "choiceGraph";
		/** The only tool call this plugin reads as an offered decision. */
		const ASK_TOOL = "ask_user_question";
		/** The empty session list a host without the list feed reads as. */
		const EMPTY_LINEAGE = { ids: [], byId: {}, current: undefined };
		//#endregion

		//#region css
		const CSS = `
.cgraph{display:flex;flex-direction:column;min-height:0;height:100%;width:100%;max-width:100%;min-width:0;overflow:hidden;font-size:13px;color:var(--dsw-alias-label-primary)}
.cgraph *{box-sizing:border-box}
.cgraph__head{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none;min-width:0}
.cgraph__title{font-weight:600;font-size:13px;white-space:nowrap}
.cgraph__count{color:var(--dsw-alias-label-tertiary);font-size:11px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cgraph__spacer{flex:1;min-width:0}
.cgraph__btn{background:0 0;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);border-radius:6px;font-size:12px;line-height:20px;padding:2px 8px;cursor:pointer;font-family:inherit}
.cgraph__btn:hover:not(:disabled){color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-tertiary)}
.cgraph__btn:disabled{opacity:.5;cursor:default}
.cgraph__body{flex:1;min-height:0;overflow:auto;padding:10px 12px 24px}
.cgraph__section{color:var(--dsw-alias-label-tertiary);font-size:11px;letter-spacing:.04em;margin:2px 0 8px}
.cgraph__empty{color:var(--dsw-alias-label-tertiary);font-size:12px;padding:14px 2px;line-height:1.6}
.cgraph__tree{display:flex;flex-direction:column;gap:2px;margin-bottom:16px}
.cgraph__treeRow{display:flex;align-items:center;gap:6px;background:0 0;border:0;border-radius:6px;padding:3px 6px;cursor:pointer;color:var(--dsw-alias-label-secondary);font-size:12px;font-family:inherit;text-align:left}
.cgraph__treeRow:hover{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-primary)}
.cgraph__treeRow[data-current=true]{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-fill-l2)}
.cgraph__dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-label-tertiary);flex:none}
.cgraph__dot[data-current=true]{background:var(--dsw-alias-label-primary)}
.cgraph__treeLabel{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:26ch}
.cgraph__timeline{position:relative;display:flex;flex-direction:column;gap:12px;min-width:0}
.cgraph__node{position:relative;padding-left:22px;min-width:0}
.cgraph__node:before{content:"";position:absolute;left:5px;top:14px;bottom:-12px;width:1px;background:var(--dsw-alias-border-l1)}
.cgraph__node:last-child:before{display:none}
.cgraph__bullet{position:absolute;left:0;top:6px;width:11px;height:11px;border-radius:50%;border:1.5px solid var(--dsw-alias-border-l1);background:var(--dsw-specific-menu,var(--dsw-alias-fill-l1))}
.cgraph__node[data-kind=question] .cgraph__bullet{border-color:var(--dsw-alias-label-tertiary)}
.cgraph__node[data-answered=true] .cgraph__bullet{background:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary)}
.cgraph__card{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:8px 10px;background:var(--dsw-alias-fill-l1);min-width:0;overflow:hidden}
.cgraph__meta{display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap;min-width:0}
.cgraph__index{color:var(--dsw-alias-label-tertiary);font-size:11px;font-variant-numeric:tabular-nums;flex:none}
.cgraph__header{background:var(--dsw-alias-fill-l2);color:var(--dsw-alias-label-secondary);border-radius:5px;padding:0 6px;font-size:11px;line-height:18px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cgraph__q{margin:0 0 6px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word}
.cgraph__opts{display:flex;flex-direction:column;gap:4px;min-width:0}
.cgraph__opt{display:flex;align-items:flex-start;gap:6px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:4px 8px;line-height:1.45;min-width:0}
.cgraph__optMark{flex:none;width:14px;color:var(--dsw-alias-label-tertiary)}
.cgraph__optLabel{overflow-wrap:anywhere;word-break:break-word}
.cgraph__optDesc{color:var(--dsw-alias-label-tertiary);font-size:11px;margin-top:1px;overflow-wrap:anywhere}
.cgraph__opt[data-selected=true]{border-color:var(--dsw-alias-label-primary);background:var(--dsw-alias-fill-l2)}
.cgraph__opt[data-selected=true] .cgraph__optMark{color:var(--dsw-alias-label-primary)}
.cgraph__opt[data-branched=true]{border-style:dashed}
.cgraph__opt[data-branched=true] .cgraph__optMark{color:var(--dsw-alias-label-secondary)}
.cgraph__msg{line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;color:var(--dsw-alias-label-secondary)}
.cgraph__answer{display:flex;gap:6px;align-items:flex-start;margin-top:6px;color:var(--dsw-alias-label-primary);font-size:12px;line-height:1.5;min-width:0}
.cgraph__answerTag{color:var(--dsw-alias-label-tertiary);flex:none}
.cgraph__actions{display:flex;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap;min-width:0}
.cgraph__fork{background:0 0;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);border-radius:6px;font-size:11px;line-height:20px;padding:1px 8px;cursor:pointer;font-family:inherit;flex:none}
.cgraph__fork:hover:not(:disabled){color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary)}
.cgraph__fork:disabled{opacity:.45;cursor:default}
.cgraph__hint{color:var(--dsw-alias-label-tertiary);font-size:11px;min-width:0;overflow-wrap:anywhere}
.cgraph__error{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-fill-l2);border-radius:6px;padding:6px 8px;font-size:12px;line-height:1.5;margin-bottom:8px;overflow-wrap:anywhere}
.cgraph__ver{color:var(--dsw-alias-label-tertiary);font-size:10px;flex:none}
.cgraph__scrim{position:fixed;inset:0;z-index:80;background:rgba(15,17,21,.24);display:flex;justify-content:flex-end}
.cgraph__drawer{box-sizing:border-box;height:100%;width:min(460px,92vw);max-width:100%;background:var(--dsw-alias-bg-base,var(--dsw-specific-menu,#fff));border-left:1px solid var(--dsw-alias-border-l1);box-shadow:-8px 0 24px rgba(0,0,0,.18);display:flex;flex-direction:column;min-height:0;overflow:hidden;color:var(--dsw-alias-label-primary);font-size:13px}
.cgraph__drawerHead{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);flex:none;min-width:0}
.cgraph__drawerBody{flex:1;min-height:0;display:flex;overflow:hidden}
.cgraph__drawerBody>.cgraph{height:100%}
`;

		/** Inject this plugin's stylesheet once, idempotently. */
		function ensureCss() {
			if (typeof document === "undefined") return;
			const tagId = ID + "/choice-graph.css";
			if (document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = ID;
			tag.dataset.pluginCss = tagId;
			tag.textContent = CSS;
			document.head.appendChild(tag);
		}
		//#endregion

		//#region parsing
		/**
		 * Flatten one content-block array to its text parts.
		 *
		 * A durable tool result nests one level deeper than a plain message: the
		 * outer block is a `tool-result` whose own `content` holds the text blocks
		 * the tool rendered, so the walk descends into it.
		 */
		function textOf(blocks) {
			if (typeof blocks === "string") return blocks;
			if (!Array.isArray(blocks)) return "";
			const parts = [];
			const walk = (list) => {
				for (const block of list) {
					if (block === null || typeof block !== "object") continue;
					if (typeof block.text === "string") parts.push(block.text);
					if (Array.isArray(block.content)) walk(block.content);
				}
			};
			walk(blocks);
			return parts.join("\n");
		}

		/** Parse one tool call's raw arguments, or undefined when they are not JSON. */
		function parseArgs(raw) {
			if (typeof raw !== "string") return undefined;
			try {
				const value = JSON.parse(raw);
				return value !== null && typeof value === "object" ? value : undefined;
			} catch {
				return undefined;
			}
		}

		/**
		 * Read the tool-call identity off one durable tool-result message.
		 *
		 * The message's own `source.callId` is authoritative; the nested
		 * `tool-result` block's `toolCallId` is the fallback for a shape that
		 * carries only the block identity.
		 * @param message - the tool-result message.
		 * @returns the paired call identity, or undefined.
		 */
		function resultCallId(message) {
			const fromSource = message?.source?.callId;
			if (typeof fromSource === "string") return fromSource;
			const blocks = message?.content;
			if (!Array.isArray(blocks)) return undefined;
			for (const block of blocks) {
				if (typeof block?.toolCallId === "string") return block.toolCallId;
			}
			return undefined;
		}

		/** Normalize the tool's `questions` argument into render-shaped questions. */
		function questionsOf(args) {
			const list = Array.isArray(args?.questions) ? args.questions : [];
			const questions = [];
			for (const item of list) {
				if (item === null || typeof item !== "object") continue;
				const options = [];
				for (const option of Array.isArray(item.options) ? item.options : []) {
					if (option === null || typeof option !== "object") continue;
					if (typeof option.label !== "string") continue;
					options.push({
						label: option.label,
						...typeof option.description === "string" ? { description: option.description } : {}
					});
				}
				questions.push({
					id: typeof item.id === "string" ? item.id : String(questions.length),
					question: typeof item.question === "string" ? item.question : "",
					...typeof item.header === "string" ? { header: item.header } : {},
					options,
					multiSelect: item.multi_select === true || item.multiSelect === true
				});
			}
			return questions;
		}

		/** Extract `{ id, selected, custom }` answers from a settled tool-result payload. */
		function answersOf(blocks) {
			const text = textOf(blocks).trim();
			if (text === "") return [];
			const start = text.indexOf("{");
			const end = text.lastIndexOf("}");
			if (start < 0 || end <= start) return [];
			let value;
			try {
				value = JSON.parse(text.slice(start, end + 1));
			} catch {
				return [];
			}
			const list = Array.isArray(value?.answers) ? value.answers : [];
			const answers = [];
			for (const item of list) {
				if (item === null || typeof item !== "object") continue;
				answers.push({
					id: typeof item.id === "string" ? item.id : "",
					selected: Array.isArray(item.selected) ? item.selected.filter((entry) => typeof entry === "string") : [],
					...typeof item.custom === "string" ? { custom: item.custom } : {}
				});
			}
			return answers;
		}

		/**
		 * Fold one session's event window into the decision timeline.
		 *
		 * A node is one moment the conversation offered a branch: an
		 * `ask_user_question` call with its recorded answer, or a human message that
		 * opened a turn. `turn/end` seqs decide which nodes a fork may cut at, so a
		 * node inside an open turn reports itself unbranchable rather than failing.
		 *
		 * @param entries - the session event window.
		 * @returns nodes in event order.
		 */
		function parseChoiceGraph(entries) {
			if (!Array.isArray(entries)) return [];
			const turnEnds = [];
			for (const entry of entries) {
				const event = entry?.event;
				if (event !== undefined && entry?.type === "event" && event.type === "turn/end") turnEnds.push(event.seq);
			}
			/** Whether a fork anchored at `seq` can resolve to a completed turn. */
			const branchable = (seq) => turnEnds.some((end) => end >= seq);

			const nodes = [];
			const results = new Map();
			for (const entry of entries) {
				if (entry?.type !== "event") continue;
				// A window is data from outside this plugin: an entry typed as an event
				// still may carry none (a torn page, a foreign producer). Reading it
				// must skip the entry, never throw inside render.
				const event = entry.event;
				if (event === undefined) continue;
				const data = event.data ?? {};
				if (event.type === "tool/call") continue;
				if (event.type === "tool/result") {
					results.set(resultCallId(data.message), event);
					continue;
				}
				if (event.type !== "assistant/message") continue;
				const blocks = data.message?.content;
				if (!Array.isArray(blocks)) continue;
				for (const block of blocks) {
					if (block?.type !== "tool-call" || block.name !== ASK_TOOL) continue;
					const questions = questionsOf(parseArgs(block.arguments));
					if (questions.length === 0) continue;
					// The durable assistant message names a tool call `id`; a live
					// `tool/call` event names the same call `callId`.
					const callId = typeof block.id === "string" ? block.id : block.callId;
					nodes.push({
						kind: "question",
						seq: event.seq,
						turn: data.turn,
						step: data.step,
						callId,
						questions
					});
				}
			}

			// Recorded answers, joined by call identity.
			for (const node of nodes) {
				const settled = results.get(node.callId);
				if (settled !== undefined) {
					node.answered = true;
					node.answers = answersOf(settled.data?.message?.content);
				}
			}

			// Human messages that opened a turn and carried no question with them.
			const questionsByTurn = new Set(nodes.map((node) => node.turn));
			for (const entry of entries) {
				if (entry?.type !== "event") continue;
				const event = entry.event;
				if (event === undefined) continue;
				if (event.type !== "user/message") continue;
				const data = event.data ?? {};
				if (data.source?.kind !== "user") continue;
				if (questionsByTurn.has(data.turn)) continue;
				const text = textOf(data.content).trim();
				if (text === "") continue;
				nodes.push({
					kind: "message",
					seq: event.seq,
					turn: data.turn,
					step: 0,
					text
				});
			}

			nodes.sort((left, right) => left.seq - right.seq);
			for (const node of nodes) node.canFork = branchable(node.seq);

			// Which offered option did the human take? Answer labels are the labels the
			// tool offered, so a string compare is the whole join.
			for (const node of nodes) {
				if (node.kind !== "question") continue;
				const selected = new Set();
				const customs = [];
				for (const answer of node.answers ?? []) {
					for (const label of answer?.selected ?? []) selected.add(label);
					if (typeof answer?.custom === "string" && answer.custom !== "") customs.push(answer.custom);
				}
				node.selected = selected;
				node.customs = customs;
			}
			return nodes;
		}

		/** Shorten one human message into a node title. */
		function shortText(text, limit) {
			const line = text.replace(/\s+/g, " ").trim();
			return line.length > limit ? line.slice(0, limit - 1) + "…" : line;
		}
		//#endregion

		//#region session lineage
		/** Flat session rows into a depth-ordered tree keyed by parent identity. */
		function lineageRows(list) {
			const ids = list.ids;
			const byId = list.byId;
			const children = new Map();
			const roots = [];
			for (const id of ids) {
				const parent = byId[id]?.parentId;
				if (parent !== undefined && byId[parent] !== undefined) {
					const bucket = children.get(parent);
					if (bucket === undefined) children.set(parent, [id]);
					else bucket.push(id);
				} else {
					roots.push(id);
				}
			}
			const rows = [];
			const walk = (id, depth) => {
				rows.push({ id, depth });
				for (const child of children.get(id) ?? []) walk(child, depth + 1);
			};
			for (const root of roots) walk(root, 0);
			return rows;
		}
		//#endregion

		//#region data hooks
		/**
		 * The root services this plugin reads, taken from the plugin context.
		 *
		 * A plugin row's `inject` array publishes services on `ctx`; it does NOT put
		 * them in a slot body's props. A body receives the framework's standard props
		 * plus whatever its own slot `inject` face declares, so these services are
		 * passed down explicitly through that face (see `apply`).
		 * @param ctx - client plugin context.
		 * @returns the services every body in this plugin reads.
		 */
		function serviceFace(ctx) {
			return { sessions: ctx.sessions, sidebarRight: ctx.sidebarRight, layout: ctx.layout };
		}

		/**
		 * Read one session's folded choice graph, kept in sync with the session's
		 * event window and re-read when the window widens.
		 * @param sessions - the injected sessions service.
		 * @param sessionId - the session to read.
		 * @param revision - outer invalidation counter (fork/open events).
		 * @returns the parsed nodes, whether older history remains, and the window source.
		 */
		function useChoiceGraph(sessions, sessionId, revision) {
			const binding = react.useMemo(() => {
				try {
					return typeof sessions?.binding === "function" ? sessions.binding(sessionId) : undefined;
				} catch {
					return undefined;
				}
			}, [sessions, sessionId, revision]);
			const source = binding?.eventSource;
			const read = react.useCallback(() => {
				try {
					return source?.getSnapshot();
				} catch {
					// A window that cannot be read yet is an empty graph, not a crash.
					return undefined;
				}
			}, [source]);
			const [window, setWindow] = react.useState(read);
			react.useEffect(() => {
				if (source === undefined || typeof source.subscribe !== "function") {
					setWindow(undefined);
					return undefined;
				}
				setWindow(read());
				return source.subscribe(() => setWindow(read()));
			}, [source, read]);
			const nodes = react.useMemo(() => parseChoiceGraph(Array.isArray(window?.entries) ? window.entries : []), [window]);
			return { nodes, hasMore: window?.hasMore === true, binding };
		}

		/** Subscribe to the session list, re-reading on every commit. */
		function useLineage(useSessions) {
			// The hook arrives from the slot framework; a host that did not bind it,
			// or whose scope refuses the read, leaves the lineage empty rather than
			// throwing inside render.
			if (typeof useSessions !== "function") return EMPTY_LINEAGE;
			try {
				return useSessions((state) => state) ?? EMPTY_LINEAGE;
			} catch {
				return EMPTY_LINEAGE;
			}
		}
		//#endregion

		//#region reveal
		/**
		 * Show the graph page in the right column.
		 *
		 * Three facts shape this.
		 *
		 * The controller's methods all go through the mounted seat, so they throw
		 * with no seat, and `openTab` plans the expansion only after that require
		 * step — asking for the expansion first is what mounts the column.
		 *
		 * The seat exists only while the conversation is the active main panel
		 * (`RightbarRoot` renders nothing otherwise), so the one other case — a
		 * settings or workspace panel in front — is handled by bringing the
		 * conversation back and retrying, which is the same thing the user does by
		 * clicking the panel's own control.
		 *
		 * And this runs from a click handler, where no error boundary can catch a
		 * throw, so every failure is reported through `onError` instead.
		 * @param sidebarRight - the right-column controller, absent on an unbound tree.
		 * @param onError - receives the last failure message, or undefined on success.
		 * @param layout - the frame's panel selector, when the tree provides it.
		 */
		function revealPanel(sidebarRight, onError, layout) {
			if (sidebarRight === undefined || sidebarRight === null) {
				onError("右侧栏控制器不可用（sidebarRight 未绑定）");
				return;
			}
			let expanded = false;
			try {
				expanded = sidebarRight.isExpanded() === true;
			} catch {
				expanded = false;
			}
			if (!expanded) {
				try {
					sidebarRight.toggleExpanded();
				} catch {
					/* no seat yet; the retry below reports the real failure */
				}
			}
			const attempt = (deferred) => {
				try {
					sidebarRight.openTab(KIND);
					onError(undefined);
					return;
				} catch (cause) {
					const message = cause instanceof Error ? cause.message : String(cause);
					if (!deferred) {
						// The seat mounts on the next commit: give the expansion and the
						// panel switch their commits before trying again.
						if (typeof layout?.selectPanel === "function") {
							try {
								layout.selectPanel(null);
							} catch {
								/* an unregistered conversation panel is not a failure here */
							}
						}
						setTimeout(() => attempt(true), 80);
						return;
					}
					onError(message);
				}
			};
			attempt(false);
		}

		/**
		 * Whether the column is actually showing its panel.
		 *
		 * `openTab` can resolve while the frame keeps its track at zero width — the
		 * frame plans no track whenever `viewport - sidebar - 400 < 300` — and that
		 * narrow-window case is exactly what the drawer exists for. Reading the state
		 * after the open has settled keeps a slow but real opening from being misread
		 * as a failure.
		 * @param sidebarRight - the right-column controller.
		 * @returns whether the panel is expanded.
		 */
		function panelVisible(sidebarRight) {
			try {
				return sidebarRight.isExpanded() === true;
			} catch {
				return false;
			}
		}

		/**
		 * Open the graph, verified: the column first, then a settle check, and the
		 * drawer whenever the column cannot actually show anything.
		 * @param sidebarRight - the right-column controller.
		 * @param layout - the frame's panel selector, for the panel-switch retry.
		 * @param onUnavailable - receives a reason when the column cannot show the graph.
		 */
		function openGraph(sidebarRight, layout, onUnavailable) {
			// The settle check runs in both outcomes: a resolved open still lands on a
			// zero-width track in a narrow frame, which is the drawer's second reason to
			// exist. An explicit failure skips straight to the drawer instead.
			const timer = setTimeout(() => {
				if (!panelVisible(sidebarRight)) onUnavailable("右侧栏宽度为 0（视口过窄），已改用浮层");
			}, 700);
			revealPanel(sidebarRight, (message) => {
				if (message === undefined) return;
				clearTimeout(timer);
				onUnavailable(message);
			}, layout);
		}
		//#endregion

		//#region components
		/** One offered option row: chosen, still available, or already branched away. */
		function OptionRow({ option, state }) {
			const selected = state === "selected";
			const branched = state === "branched";
			return react.createElement(
				"div",
				{
					className: "cgraph__opt",
					"data-selected": selected ? "true" : "false",
					"data-branched": branched ? "true" : "false"
				},
				react.createElement("span", { className: "cgraph__optMark" }, selected ? "✓" : branched ? "⤳" : "○"),
				react.createElement(
					"span",
					null,
					react.createElement("span", { className: "cgraph__optLabel" }, option.label),
					option.description !== undefined
						? react.createElement("div", { className: "cgraph__optDesc" }, option.description)
						: null
				)
			);
		}

		/** One decision node: the question, its options, the taken branch, and the fork action. */
		function ChoiceNode({ node, index, busy, onFork }) {
			const heading = node.kind === "question" ? undefined : "你的输入";
			const question = node.kind === "question"
				? (node.questions.length === 1 ? node.questions[0].question : node.questions.map((item) => item.question).join("\n"))
				: node.text;
			const selected = node.selected ?? new Set();
			const children = [];
			if (node.kind === "question") {
				for (const item of node.questions) {
					if (node.questions.length > 1) children.push(react.createElement("div", { key: "h:" + item.id, className: "cgraph__section" }, item.header ?? item.question));
					for (const option of item.options) {
						children.push(react.createElement(OptionRow, {
							key: item.id + ":" + option.label,
							option,
							state: selected.has(option.label) ? "selected" : "available"
						}));
					}
					for (const custom of (item.id === node.questions[0]?.id ? node.customs ?? [] : [])) {
						if (selected.has(custom)) continue;
						children.push(react.createElement(OptionRow, {
							key: item.id + ":custom:" + custom,
							option: { label: custom },
							state: "selected"
						}));
					}
				}
			}
			return react.createElement(
				"div",
				{ className: "cgraph__node", "data-kind": node.kind, "data-answered": node.answered === true ? "true" : "false" },
				react.createElement("span", { className: "cgraph__bullet" }),
				react.createElement(
					"div",
					{ className: "cgraph__card" },
					react.createElement(
						"div",
						{ className: "cgraph__meta" },
						react.createElement("span", { className: "cgraph__index" }, "#" + String(index + 1)),
						react.createElement("span", { className: "cgraph__index" }, "turn " + String(node.turn)),
						node.questions?.[0]?.header !== undefined
							? react.createElement("span", { className: "cgraph__header" }, node.questions[0].header)
							: null,
						node.kind === "question" && node.answered !== true
							? react.createElement("span", { className: "cgraph__hint" }, "等待你的选择…")
							: null
					),
					node.kind === "question"
						? react.createElement("p", { className: "cgraph__q" }, question)
						: react.createElement("div", { className: "cgraph__msg" }, shortText(question, 240)),
					children.length > 0 ? react.createElement("div", { className: "cgraph__opts" }, children) : null,
					node.kind === "question" && (node.customs ?? []).length > 0 && node.questions.every((item) => item.options.length === 0)
						? react.createElement("div", { className: "cgraph__answer" },
							react.createElement("span", { className: "cgraph__answerTag" }, "选择"),
							react.createElement("span", null, (node.customs ?? []).join("、")))
						: null,
					node.canFork === true
						? react.createElement(
							"div",
							{ className: "cgraph__actions" },
							react.createElement(
								"button",
								{
									type: "button",
									className: "cgraph__fork",
									disabled: busy,
									title: "从此刻分叉出一个新会话，回到这里重新选择",
									onClick: () => onFork(node)
								},
								"⤺ 回到此节点"
							),
							react.createElement("span", { className: "cgraph__hint" }, "分叉新会话，原历史保留")
						)
						: react.createElement("div", { className: "cgraph__actions" },
							react.createElement("span", { className: "cgraph__hint" }, "该轮次尚未完成，暂不可回退"))
				)
			);
		}

		/** The session lineage strip: every root, fork, and current position. */
		function LineageTree({ rows, byId, current, onOpen }) {
			if (rows.length <= 1) return null;
			return react.createElement(
				"div",
				{ className: "cgraph__tree" },
				rows.map((row) => react.createElement(
					"button",
					{
						key: row.id,
						type: "button",
						className: "cgraph__treeRow",
						"data-current": row.id === current ? "true" : "false",
						style: { paddingLeft: String(6 + row.depth * 14) + "px" },
						onClick: () => onOpen(row.id)
					},
					react.createElement("span", { className: "cgraph__dot", "data-current": row.id === current ? "true" : "false" }),
					react.createElement("span", { className: "cgraph__treeLabel" }, byId[row.id]?.displayTitle ?? row.id)
				))
			);
		}

		/**
		 * The graph surface itself: the decision timeline of the session, plus the
		 * lineage of every session forked out of it. Two seats render it — the right
		 * column's tab, and the drawer that stands in when the column cannot open.
		 *
		 * `sessionId` is absent in the drawer, which belongs to no session: the graph
		 * is then session-independent (the lineage) and the session-scoped nodes are
		 * simply empty rather than wrong.
		 * @param props - the session identity (optional), services, and the lineage
		 *   list; `embedded` says the drawer already draws its own header.
		 */
		function ChoiceGraphPanel(props) {
			const { sessionId, sessions, sidebarRight, layout, list, embedded } = props;
			// The drawer belongs to no session, so it takes the list's current one: the
			// graph then describes the conversation on screen exactly as the column does.
			const scopeId = sessionId ?? list.current;
			const [revision, setRevision] = react.useState(0);
			const [busySeq, setBusySeq] = react.useState(undefined);
			const [error, setError] = react.useState(undefined);
			const { nodes, hasMore } = useChoiceGraph(sessions, scopeId, revision);
			const rows = react.useMemo(() => lineageRows(list), [list]);
			const answered = react.useMemo(() => nodes.filter((node) => node.canFork).length, [nodes]);

			const open = react.useCallback((id) => {
				if (id === scopeId) return;
				if (typeof sessions?.open !== "function") {
					setError("会话服务不可用（sessions 未绑定）");
					return;
				}
				sessions.open(id);
				setRevision((value) => value + 1);
				revealPanel(sidebarRight, setError, layout);
			}, [sessions, sidebarRight, layout, scopeId]);

			const fork = react.useCallback(async (node) => {
				if (busySeq !== undefined) return;
				if (typeof sessions?.fork !== "function") {
					setError("会话服务不可用（sessions 未绑定）");
					return;
				}
				if (scopeId === undefined) {
					setError("还没有可回退的会话");
					return;
				}
				setBusySeq(node.seq);
				setError(undefined);
				try {
					const childId = await sessions.fork({ sessionId: scopeId, atSeq: node.seq, increaseTitle: true });
					sessions.open(childId);
					setRevision((value) => value + 1);
					revealPanel(sidebarRight, setError, layout);
				} catch (cause) {
					setError(cause instanceof Error ? cause.message : String(cause));
				} finally {
					setBusySeq(undefined);
				}
			}, [busySeq, sessions, sidebarRight, layout, scopeId]);

			return react.createElement(
				"div",
				{ className: "cgraph" },
				// The drawer draws its own header, so the embedded seat skips this one.
				embedded === true
					? null
					: react.createElement(
						"div",
						{ className: "cgraph__head" },
						react.createElement("span", { className: "cgraph__title" }, "选择事件图"),
						react.createElement("span", { className: "cgraph__ver" }, VERSION),
						react.createElement("span", { className: "cgraph__count" }, String(nodes.length) + " 个决策点 · " + String(answered) + " 个可回退"),
						react.createElement("span", { className: "cgraph__spacer" }),
						hasMore
							? react.createElement("span", { className: "cgraph__hint" }, "仅显示最近事件")
							: null
					),
				react.createElement(
					"div",
					{ className: "cgraph__body" },
					error !== undefined ? react.createElement("div", { className: "cgraph__error" }, "回退失败：" + error) : null,
					react.createElement(LineageTree, { rows, byId: list.byId, current: list.current, onOpen: open }),
					nodes.length === 0
						? react.createElement(
							"div",
							{ className: "cgraph__empty" },
							"还没有可选分支。当我用 ask_user_question 给你选项、或你发出下一条消息时，这里会出现第一个节点；点击节点上的「回到此节点」即可分叉回退。"
						)
						: react.createElement(
							"div",
							{ className: "cgraph__timeline" },
							nodes.map((node, index) => react.createElement(ChoiceNode, {
								key: node.callId ?? "m:" + String(node.seq),
								node,
								index,
								busy: busySeq !== undefined,
								onFork: fork
							}))
						)
				)
			);
		}

		/** The right column's tab body: the panel over the session's own lineage list. */
		function ChoiceGraphBody(props) {
			const list = useLineage(props.useSessions);
			return react.createElement(ChoiceGraphPanel, { ...props, list });
		}

		/**
		 * The right column shows its panel only while the frame has room for a track
		 * (`available = viewport - sidebar - 400 >= 300`), so below roughly 1250px of
		 * viewport the column stays collapsed no matter what is opened into it. The
		 * drawer is the guarantee that the graph is reachable anyway: it owns its own
		 * fixed width and needs nothing from the frame.
		 */
		function GraphDrawer(props) {
			const { onClose, children } = props;
			react.useEffect(() => {
				const onKeyDown = (event) => {
					if (event.key === "Escape") onClose();
				};
				globalThis.document?.addEventListener?.("keydown", onKeyDown);
				return () => globalThis.document?.removeEventListener?.("keydown", onKeyDown);
			}, [onClose]);
			return react.createElement(
				"div",
				{ className: "cgraph__scrim", onClick: onClose },
				react.createElement(
					"div",
					{
						className: "cgraph__drawer",
						role: "dialog",
						"aria-label": "选择事件图",
						onClick: (event) => event.stopPropagation()
					},
					react.createElement(
						"div",
						{ className: "cgraph__drawerHead" },
						react.createElement("span", { className: "cgraph__title" }, "选择事件图"),
						react.createElement("span", { className: "cgraph__ver" }, VERSION),
						react.createElement("span", { className: "cgraph__spacer" }),
						react.createElement(
							"button",
							{ type: "button", className: "cgraph__btn", onClick: onClose, title: "关闭（Esc）" },
							"关闭"
						)
					),
					react.createElement("div", { className: "cgraph__drawerBody" }, children)
				)
			);
		}

		/** The small header control that reveals the graph, in the column or in the drawer. */
		function ChoiceGraphAction(props) {
			const { sidebarRight, layout, sessions, useSessions } = props;
			const [failure, setFailure] = react.useState(undefined);
			const [drawer, setDrawer] = react.useState(false);
			const list = useLineage(useSessions);
			const close = react.useCallback(() => setDrawer(false), []);
			const open = react.useCallback(() => {
				if (drawer) {
					setDrawer(false);
					return;
				}
				// The column first; the drawer is the fallback that cannot be squeezed out.
				setFailure(undefined);
				openGraph(sidebarRight, layout, (message) => {
					if (message === undefined) return;
					setFailure(message);
					setDrawer(true);
				});
			}, [drawer, sidebarRight, layout]);
			const button = failure !== undefined && !drawer
				? react.createElement(
					"button",
					{ type: "button", className: "cgraph__btn", title: failure + " · 已改用浮层显示", onClick: open },
					"⤳ 选择图"
				)
				: react.createElement(
					"button",
					{
						type: "button",
						className: "cgraph__btn",
						title: "打开选择事件图 · " + VERSION,
						"aria-label": "选择事件图",
						onClick: open
					},
					"⤳ 选择图"
				);
			if (!drawer) return button;
			return react.createElement(
				react.Fragment,
				null,
				button,
				react.createElement(
					GraphDrawer,
					{ onClose: close },
					react.createElement(ChoiceGraphPanel, { sessions, layout, list, embedded: true })
				)
			);
		}
		//#endregion

		//#region plugin
		/** The type's guide glyph: a small branch, drawn with the guide's own icon size. */
		function ChoiceGraphGlyph({ size, className }) {
			return react.createElement(
				"svg",
				{
					width: size ?? 16,
					height: size ?? 16,
					viewBox: "0 0 16 16",
					fill: "none",
					className,
					"aria-hidden": "true"
				},
				react.createElement("path", {
					d: "M4 2v5.5a2 2 0 0 0 2 2h6",
					stroke: "currentColor",
					"stroke-width": "1.2",
					"stroke-linecap": "round"
				}),
				react.createElement("path", {
					d: "M4 8.5V14",
					stroke: "currentColor",
					"stroke-width": "1.2",
					"stroke-linecap": "round"
				}),
				react.createElement("circle", { cx: "4", cy: "2.6", r: "1.4", fill: "currentColor" })
			);
		}

		/** The tab type's registry definition: a page, opened by kind. */
		function choiceGraphDefinition() {
			return {
				id: ID,
				kind: KIND,
				priority: "extension",
				title: () => "选择事件图",
				// The guide page is the second way in, for when the header control is
				// cramped or the column is already open on another page.
				guide: [{
					order: 40,
					title: () => "选择事件图",
					description: () => "决策点、已选分支与回退",
					icon: ChoiceGraphGlyph
				}]
			};
		}

		/**
		 * Keep one body's failure inside the body.
		 *
		 * A presentation plugin renders inside the product's own panes, so a throw
		 * here must not take the column down with it: the failure is drawn with its
		 * message, which is also the only way a user can report it.
		 */
		class PanelBoundary extends react.Component {
			constructor(props) {
				super(props);
				this.state = { failure: undefined };
			}

			static getDerivedStateFromError(cause) {
				return { failure: cause };
			}

			componentDidCatch(cause) {
				console.error("choice-graph: panel failed", cause);
			}

			render() {
				if (this.state.failure !== undefined) {
					const message = this.state.failure instanceof Error ? this.state.failure.message : String(this.state.failure);
					return react.createElement(
						"div",
						{ className: "cgraph" },
						react.createElement(
							"div",
							{ className: "cgraph__body" },
							react.createElement("div", { className: "cgraph__error" }, "选择事件图渲染失败：" + message)
						)
					);
				}
				return this.props.children;
			}
		}

		/** Bind a component into the boundary, preserving the slot's own identity. */
		function Guarded(Body) {
			return function ChoiceGraphGuarded(props) {
				return react.createElement(PanelBoundary, null, react.createElement(Body, props));
			};
		}

		/** Required services: the session domain, the right column, the slots, and the dictionaries. */
		const inject = ["sessions", "slots", "sidebarRight", "sidebarRightTabs", "layout"];

		/**
		 * Client plugin body: register the tab type, its body, and the header action.
		 * @param ctx - client root context.
		 */
		function apply(ctx) {
			ensureCss();
			const services = serviceFace(ctx);
			ctx.effect(() => ctx.sidebarRightTabs.register(choiceGraphDefinition()), "choice-graph: tab type");
			ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
				name: "sidebar.right.pane.tab",
				key: ID,
				inject: () => services
			}, Guarded(ChoiceGraphBody))), "choice-graph: tab body");
			ctx.effect(() => ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
				name: "conversation.session.header.actions",
				id: "choice-graph-open",
				order: 30,
				inject: () => services
			}, Guarded(ChoiceGraphAction))), "choice-graph: header action");
			console.info("choice-graph: plugin applied " + VERSION);
		}
		//#endregion

		// The two pure functions are exported so a host-free checker can exercise them
		// without a browser (`node verify.mjs`): the graph fold and the reveal plan.
		exports.parseChoiceGraph = parseChoiceGraph;
		exports.planReveal = revealPanel;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

