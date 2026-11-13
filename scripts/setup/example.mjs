import { SetupError } from "./errors.mjs"
import { STARTER } from "./identity.mjs"

/** The folder of the example notes skill; it is renamed to the prefix when the example is kept. */
export const EXAMPLE_SKILL_DIR = `skills/${STARTER.prefix}-notes`

/** The folders of the example notes tools and of their skill. */
export const EXAMPLE_DIRS = ["src/core/example", EXAMPLE_SKILL_DIR]

const TOOLS_FILE = "src/tools.ts"
const WORDS_FILE = "src/words.ts"
const PLUGIN_YAML = "plugin.yaml"
const PROJECT_FILE = "src/project.ts"
const HERMES_PROJECT_FILE = /^src\/hermes\/[^/]+\/project\.py$/

const EMPTY_TOOLS_FILE = `import type { ToolSpec } from "./core"

/** Every tool spec of the package; entry points register their tools from this list. */
export const ALL_TOOLS: ToolSpec[] = []
`

const FACT_WORDS_FILE = `import { mergeTranslations, type Translations } from "./core"
import { FACT_TRANSLATIONS } from "./core/facts"

/** The translations of every tool's words, per language, which the native plugins use in their approval prompts. */
export const ALL_TRANSLATIONS: Translations = mergeTranslations(FACT_TRANSLATIONS)
`

/** The files that import from the example, each with its text once the example is gone and what it imports. */
const REWRITTEN_FILES = new Map([
  [TOOLS_FILE, { text: EMPTY_TOOLS_FILE, imports: "the example tools" }],
  [WORDS_FILE, { text: FACT_WORDS_FILE, imports: "the example tools' words" }],
])

const TOOL_PREFIX_LINE = new RegExp(`(\\btoolPrefix: )"${STARTER.prefix}"`)
const SKILL_PREFIX_LINE = new RegExp(`(\\bSKILL_PREFIX = )"${STARTER.prefix}-"`)
const TOOLSETS_LINES = /(\b(?:toolsets|defaultToolsets): )\[[^\]]*\]( as readonly string\[\])/g
const PROVIDES_TOOLS_BLOCK = /^provides_tools:.*(?:\n[ \t]+-.*)*$/m
const GRANT_TOOL_LINE = /^  - [a-z]+_grant_(?:create|read|revoke)$/

/** Replaces `pattern` in `text` through `replacement`; it must match `expected` times, so a changed file is refused. */
function replaceExactly(path, text, pattern, replacement, expected = 1) {
  let count = 0
  const replaced = text.replace(pattern, (...args) => {
    count++
    return replacement(...args)
  })
  if (count !== expected) {
    throw new SetupError(`${path} has ${count} of ${pattern}, not ${expected}; the setup has probably run already.`)
  }
  return { text: replaced, count }
}

/** Takes the example tools out of the files that list them. */
function removeExample(path, text) {
  const rewritten = REWRITTEN_FILES.get(path)
  if (rewritten) {
    if (!text.includes("./core/example/")) {
      throw new SetupError(`${path} does not import ${rewritten.imports}; it was changed after the starter.`)
    }
    return { text: rewritten.text, count: 1 }
  }
  if (path === PROJECT_FILE) {
    return replaceExactly(path, text, TOOLSETS_LINES, (_, key, type) => `${key}[]${type}`, 2)
  }
  if (path === PLUGIN_YAML) {
    return replaceExactly(path, text, PROVIDES_TOOLS_BLOCK, (block) => {
      const grants = block.split("\n").filter((line) => GRANT_TOOL_LINE.test(line))
      return grants.length > 0 ? `provides_tools:\n${grants.join("\n")}` : "provides_tools: []"
    })
  }
  return { text, count: 0 }
}

/**
 * Edits the places where the tool prefix is set (`toolPrefix` of src/project.ts, `SKILL_PREFIX` of the Hermes
 * plugin) and, unless `keepExample`, takes the example out of the files that list it. Returns `{ text, count }`.
 */
export function editForExample(path, text, { prefix, keepExample }) {
  let result = { text, count: 0 }
  if (path === PROJECT_FILE) {
    result = replaceExactly(path, text, TOOL_PREFIX_LINE, (_, key) => `${key}"${prefix}"`)
  } else if (HERMES_PROJECT_FILE.test(path)) {
    result = replaceExactly(path, text, SKILL_PREFIX_LINE, (_, key) => `${key}"${prefix}-"`)
  }
  if (keepExample) return result
  const removed = removeExample(path, result.text)
  return { text: removed.text, count: result.count + removed.count }
}
