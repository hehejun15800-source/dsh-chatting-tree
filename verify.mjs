/**
 * Host-free verification for chatting-tree.
 *
 * Runs the shipped browser bundle in Node with a Web-free shim, then exercises
 * the two pure functions it exports plus the plugin registrations. No browser,
 * no DSH host, no dependencies.
 *
 *   node verify.mjs
 *
 * Exit code 0 means every check passed.
 */
import { readFileSync } from "node:fs";

const BUNDLE = new URL("./lib/client.js", import.meta.url);
const HOST = new URL("./lib/index.js", import.meta.url);
const ID = "@dsh-plugins/chatting-tree";
const KIND = "choice-graph";

const results = [];
const check = (label, ok, detail) => results.push({ label, ok: Boolean(ok), detail });

// ── the bundle is loadable and registers exactly one factory ────────────────
const registry = new Map();
globalThis.window = { __ModuleLoader__: { load: ({ id, factory }) => registry.set(id, factory) } };
globalThis.document = {
	querySelector: () => null,
	createElement: () => ({ dataset: {}, style: {}, set textContent(value) { this._text = value; } }),
	head: { appendChild() {} }
};

const reactStub = {
	createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat() }),
	useState: (initial) => [typeof initial === "function" ? initial() : initial, () => {}],
	useMemo: (factory) => factory(),
	useCallback: (fn) => fn,
	useEffect: () => {},
	Component: class { constructor(props) { this.props = props; this.state = {}; } setState(next) { this.state = { ...this.state, ...next }; } },
	Fragment: "Fragment"
};
const requireStub = (name) => {
	if (name === "react") return reactStub;
	throw new Error("unexpected require: " + name);
};

new Function("window", "document", "console", "require", readFileSync(BUNDLE, "utf8"))(
	globalThis.window, globalThis.document, console, requireStub
);
const factory = registry.get(ID);
check("bundle registers its factory under the package id", factory !== undefined);

const exported = factory === undefined ? {} : factory(requireStub);
check("bundle exports apply and inject", typeof exported.apply === "function" && Array.isArray(exported.inject));
check("bundle exports the pure graph fold", typeof exported.parseChoiceGraph === "function");

// ── the host half declares the empty apply the Loader needs ─────────────────
const hostSource = readFileSync(HOST, "utf8");
check("host half exports apply", /export\s+function\s+apply/.test(hostSource));

// ── registration: one tab type, a pane body, and a header action ────────────
const tabTypes = [];
const registrations = new Map();
const sessions = { binding: () => ({ eventSource: { getSnapshot: () => ({ entries: [], hasMore: false, revision: 0 }), subscribe: () => () => {} } }) };
const sidebarRight = { isExpanded: () => true, toggleExpanded: () => {}, openTab: () => {} };
if (typeof exported.apply === "function") {
	try {
		exported.apply({
			effect: (fn) => { fn(); return () => {}; },
			sessions,
			sidebarRight,
			layout: {},
			sidebarRightTabs: { register: (definition) => { tabTypes.push(definition); return () => {}; } },
			slots: {
				inject: (_slot, register) => { register(); return () => {}; },
				register: (catalog, component) => {
					registrations.set(catalog.name + "#" + (catalog.key ?? catalog.id), {
						catalog,
						component,
						face: catalog.inject === undefined ? undefined : catalog.inject("session-1", {})
					});
					return () => {};
				}
			}
		});
		check("apply registers one tab type", true);
	} catch (error) {
		check("apply registers one tab type", false, error instanceof Error ? error.message : String(error));
	}
}
check("tab type kind is choice-graph", tabTypes[0]?.kind === KIND);
check("tab type offers a guide entry", (tabTypes[0]?.guide ?? []).length === 1);
const body = registrations.get("sidebar.right.pane.tab#" + ID);
const action = registrations.get("conversation.session.header.actions#choice-graph-open");
check("pane body is registered under the package id", body !== undefined);
check("header action is registered", action !== undefined);
check("pane body inject face carries sessions", body?.face?.sessions === sessions);
check("pane body inject face carries the column controller", body?.face?.sidebarRight === sidebarRight);

// ── the graph fold: offered options, the taken branch, and fork eligibility ──
const toolCall = (seq, callId) => ({
	type: "event",
	event: {
		type: "assistant/message",
		seq,
		data: {
			turn: 1,
			message: {
				content: [{
					type: "tool-call",
					id: callId,
					name: "ask_user_question",
					arguments: JSON.stringify({
						questions: [{ id: "q1", header: "Choose Mode", question: "Which way?", options: [{ label: "A", description: "first" }, { label: "B" }] }]
					})
				}]
			}
		}
	}
});
const toolResult = (seq, callId, answers) => ({
	type: "event",
	event: {
		type: "tool/result",
		seq,
		data: {
			turn: 1,
			message: {
				role: "user",
				source: { kind: "tool", callId },
				content: [{ type: "tool-result", toolCallId: callId, isError: false, content: [{ type: "text", text: JSON.stringify({ answers }) }] }]
			}
		}
	}
});
const userMessage = (seq, turn) => ({ type: "event", event: { type: "user/message", seq, data: { turn, source: { kind: "user" }, content: [{ type: "text", text: "plain human turn" }] } } });
const turnEnd = (seq, turn) => ({ type: "event", event: { type: "turn/end", seq, data: { turn, reason: "completed" } } });

const nodes = typeof exported.parseChoiceGraph === "function"
	? exported.parseChoiceGraph([
		toolCall(10, "c1"),
		toolResult(11, "c1", [{ id: "q1", selected: ["A", "custom"] }]),
		turnEnd(12, 1),
		userMessage(20, 2),
		turnEnd(21, 2)
	])
	: [];
check("folds the question and the human turn", nodes.length === 2);
check("question node carries the offered options", nodes[0]?.questions?.[0]?.options?.length === 2);
check("question node records the taken branch", nodes[0]?.selected?.has("A") === true && nodes[0]?.selected?.has("B") === false);
check("human message becomes a node", nodes[1]?.kind === "message");
check("closed turns are forkable", nodes.every((node) => node.canFork === true));

// Hostile window content must never throw inside render.
const hostile = typeof exported.parseChoiceGraph === "function"
	? exported.parseChoiceGraph([undefined, { type: "event", event: undefined }, { type: "event", event: { type: "tool/call", seq: 1 } }])
	: undefined;
check("hostile window degrades to an empty graph", Array.isArray(hostile) && hostile.length === 0);

// ── the reveal plan: expand, open, retry, and report ────────────────────────
const planReveal = exported.planReveal;
if (typeof planReveal === "function") {
	const unbound = [];
	planReveal(undefined, (message) => unbound.push(message));
	check("unbound controller is reported, not thrown", unbound.some((message) => typeof message === "string" && message.includes("sidebarRight")));

	const calls = [];
	let mounted = false;
	const flaky = {
		isExpanded: () => false,
		toggleExpanded: () => { calls.push("expand"); setTimeout(() => { mounted = true; }, 5); },
		openTab: (kind) => { calls.push("open:" + kind); if (!mounted) throw new Error("no seat"); }
	};
	let failed;
	planReveal(flaky, (message) => { failed = message; });
	await new Promise((resolve) => setTimeout(resolve, 150));
	check("collapsed column is expanded before opening", calls[0] === "expand" && calls[1] === "open:" + KIND);
	check("the open is retried until the seat mounts", calls.filter((entry) => entry === "open:" + KIND).length === 2);
	check("no failure is reported once open", failed === undefined);

	const broken = { isExpanded: () => { throw new Error("no session surface is mounted"); }, toggleExpanded: () => { throw new Error("no session surface is mounted"); }, openTab: () => { throw new Error("no session surface is mounted"); } };
	let reason;
	planReveal(broken, (message) => { reason = message; });
	await new Promise((resolve) => setTimeout(resolve, 200));
	check("a real failure reaches the caller", typeof reason === "string" && reason.includes("no session surface is mounted"));
} else {
	check("bundle exports the reveal plan", false, "planReveal missing");
}

// ── report ──────────────────────────────────────────────────────────────────
for (const entry of results) console.log((entry.ok ? "  ok   " : "  FAIL ") + entry.label + (entry.detail === undefined ? "" : " — " + entry.detail));
const failed = results.filter((entry) => !entry.ok);
console.log("\n" + String(results.length - failed.length) + "/" + String(results.length) + " checks passed");
if (failed.length > 0) process.exit(1);
