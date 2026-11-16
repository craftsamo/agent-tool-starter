/**
 * The marketplace names Claude Code reserves; it refuses to add a marketplace under one.
 * See "Reserved names" in https://code.claude.com/docs/en/plugins/marketplace-reference.md
 */
export const CLAUDE_RESERVED = Object.freeze([
  "claude-code-marketplace",
  "claude-code-plugins",
  "claude-plugins-official",
  "anthropic-marketplace",
  "anthropic-plugins",
  "agent-skills",
  "anthropic-agent-skills",
  "life-sciences",
  "knowledge-work-plugins",
  "claude-for-legal",
  "claude-for-financial-services",
  "financial-services-plugins",
  "first-party-plugins",
  "claude-tag-plugins",
  "claude-community",
  "claude-plugins-community",
  "healthcare",
  "anthropic-plugin-directory",
  "claude-plugin-directory",
  "inline",
  "builtin",
  "skills-dir",
  "synced",
  "claude-plugin-test",
  "constructor",
  "hasOwnProperty",
  "isPrototypeOf",
  "propertyIsEnumerable",
  "toLocaleString",
  "toString",
  "valueOf",
])

/** The prefix Claude Code reserves for marketplaces hosted on claude.ai. */
const CLAUDE_RESERVED_PREFIX = "claudeai-"

/**
 * The marketplace names Codex reserves. They come from Codex's source
 * (`codex-rs/core-plugins` in openai/codex), not from its documentation.
 */
export const CODEX_RESERVED = Object.freeze([
  "openai-curated",
  "openai-api-curated",
  "openai-bundled",
  "openai-bundled-alpha",
  "openai-primary-runtime",
  "openai-curated-remote",
  "created-by-me-remote",
  "workspace-directory",
  "workspace-shared-with-me",
  "workspace-shared-with-me-private",
  "workspace-shared-with-me-unlisted",
])

const CLAUDE_NAMES = new Set(CLAUDE_RESERVED.map((name) => name.toLowerCase()))
const CODEX_NAMES = new Set(CODEX_RESERVED.map((name) => name.toLowerCase()))

/** The harness that reserves the marketplace `name` (`"Claude Code"` or `"Codex"`), or `null`; the comparison ignores case. */
export function reservedBy(name) {
  const lower = name.toLowerCase()
  if (CLAUDE_NAMES.has(lower) || lower.startsWith(CLAUDE_RESERVED_PREFIX)) return "Claude Code"
  if (CODEX_NAMES.has(lower)) return "Codex"
  return null
}
