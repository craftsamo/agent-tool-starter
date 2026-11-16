import { describe, expect, test } from "bun:test"
import { CLAUDE_RESERVED, CODEX_RESERVED, reservedBy } from "./marketplace-names.mjs"

describe("reservedBy", () => {
  test("names the harness for an exact name", () => {
    expect(reservedBy("agent-skills")).toBe("Claude Code")
    expect(reservedBy("openai-curated")).toBe("Codex")
  })

  test("ignores case", () => {
    expect(reservedBy("Agent-Skills")).toBe("Claude Code")
    expect(reservedBy("TOSTRING")).toBe("Claude Code")
    expect(reservedBy("OpenAI-Curated")).toBe("Codex")
  })

  test("reserves the claudeai- prefix for Claude Code", () => {
    expect(reservedBy("claudeai-tools")).toBe("Claude Code")
    expect(reservedBy("ClaudeAI-x")).toBe("Claude Code")
  })

  test("accepts other names", () => {
    expect(reservedBy("widget-tools")).toBeNull()
    expect(reservedBy("my-healthcare-tools")).toBeNull()
  })
})

describe("the reserved lists", () => {
  test.each([
    ["Claude Code", CLAUDE_RESERVED],
    ["Codex", CODEX_RESERVED],
  ])("%s has no duplicates once lowercased", (_harness, names) => {
    const lower = names.map((name) => name.toLowerCase())
    expect(new Set(lower).size).toBe(lower.length)
  })

  test("do not overlap", () => {
    const claude = new Set(CLAUDE_RESERVED.map((name) => name.toLowerCase()))
    expect(CODEX_RESERVED.filter((name) => claude.has(name.toLowerCase()))).toEqual([])
  })
})
