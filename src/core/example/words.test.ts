import { describe, expect, test } from "bun:test"
import { callDescription } from "../describe"
import { translator } from "../words"
import { exampleNoteCreate } from "./create"
import { exampleNoteRead } from "./read"
import { EXAMPLE_TRANSLATIONS } from "./words"

const ja = translator(EXAMPLE_TRANSLATIONS, "ja")

/** The words the example tools write in English: titles, the intent, the headline template and the text label (the `Size` label is a shared fact's). */
async function exampleWords(): Promise<string[]> {
  const description = await callDescription(exampleNoteCreate, { name: "todo", text: "# Todo" }, { cwd: "/work" })
  return [
    exampleNoteCreate.title,
    exampleNoteCreate.intent!,
    exampleNoteRead.title,
    description!.headline!.text,
    description!.text!.label,
  ]
}

describe("EXAMPLE_TRANSLATIONS", () => {
  test("has a Japanese word for every word the example tools write", async () => {
    expect(Object.keys(EXAMPLE_TRANSLATIONS.ja!).sort()).toEqual((await exampleWords()).sort())
  })

  test("translates the titles, the intent and the text label", () => {
    expect(ja.word(exampleNoteCreate.title)).not.toBe(exampleNoteCreate.title)
    expect(ja.word(exampleNoteCreate.intent!)).not.toBe(exampleNoteCreate.intent)
    expect(ja.word(exampleNoteRead.title)).not.toBe(exampleNoteRead.title)
    expect(ja.word("Note text", 40)).toBe(EXAMPLE_TRANSLATIONS.ja!["Note text"]!)
  })

  test("keeps the placeholders of the headline template, so the translator gives the Japanese", async () => {
    const description = await callDescription(exampleNoteCreate, { name: "todo", text: "x" }, { cwd: "/work" })
    const template = description!.headline!.text
    expect(ja.template(template)).toBe(EXAMPLE_TRANSLATIONS.ja![template]!)
    expect(ja.template(template)).toContain("{file}")
  })
})
