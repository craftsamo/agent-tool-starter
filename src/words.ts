import { mergeTranslations, type Translations } from "./core"
import { FACT_TRANSLATIONS } from "./core/facts"
import { EXAMPLE_TRANSLATIONS } from "./core/example/words"

/** The translations of every tool's words, per language, which the native plugins use in their approval prompts. */
export const ALL_TRANSLATIONS: Translations = mergeTranslations(EXAMPLE_TRANSLATIONS, FACT_TRANSLATIONS)
