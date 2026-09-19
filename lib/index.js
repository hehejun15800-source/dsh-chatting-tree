/**
 * Web choice-graph plugin, node half.
 *
 * Pure UI plugin: the whole surface lives in the browser export. This empty
 * `apply` exists so the plugin appears in the host cordis.yml / Loader, which is
 * how the client module system discovers the `dsh.client` declaration and serves
 * the `./client` bundle.
 */
/** Host plugin body — no host-side behavior for this surface plugin. */
export function apply() {}
