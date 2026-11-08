import { describe, expect, test } from "bun:test"
import { EXAMPLE_TRANSLATIONS } from "./core/example/words"
import { FACT_TRANSLATIONS } from "./core/facts"
import { ALL_TRANSLATIONS } from "./words"

describe("ALL_TRANSLATIONS", () => {
  test("holds the shared fact words and the example tools' words in Japanese", () => {
    expect(ALL_TRANSLATIONS.ja).toEqual({ ...EXAMPLE_TRANSLATIONS.ja, ...FACT_TRANSLATIONS.ja })
    expect(ALL_TRANSLATIONS.ja!.Size).toBe("サイズ")
  })
})
