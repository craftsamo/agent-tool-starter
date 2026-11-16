import { SetupError } from "./errors.mjs"
import { escapeRegExp } from "./identity.mjs"

/**
 * `"name": "craftsamo", "url": "https://github.com/craftsamo"` inside an `author` object, as the
 * plugin manifests write it.
 */
const AUTHOR_OBJECT = /("author": \{\s*"name": )"craftsamo"(,\s*"url": )"https:\/\/github\.com\/craftsamo"/g

/**
 * `"name": "craftsamo", "url": "https://github.com/craftsamo"` inside an `owner` object, as the
 * marketplace manifest writes it.
 */
const OWNER_OBJECT = /("owner": \{\s*"name": )"craftsamo"(,\s*"url": )"https:\/\/github\.com\/craftsamo"/g

const json = JSON.stringify

/** Replaces the author object of a manifest with the author and their URL. */
const authorPerson = [AUTHOR_OBJECT, (o, name, url) => `${name}${json(o.author)}${url}${json(o.authorUrl)}`]

/** Replaces the owner object of the marketplace with the publisher and the owner's URL. */
const marketplaceOwner = [
  OWNER_OBJECT,
  (o, name, url) => `${name}${json(o.publisher)}${url}${json(`https://github.com/${o.owner}`)}`,
]

/**
 * The marketplace's own top-level `"name"`. The starter's marketplace is named after the package, so the identity
 * table has already turned it into the package name (`options.name`); this turns that into `--marketplace`. The
 * 2-space anchor leaves the plugin entries (deeper indentation) alone.
 */
const marketplaceName = [
  (o) => new RegExp(`^(  "name": )${escapeRegExp(json(o.name))}`, "gm"),
  (o, key) => `${key}${json(o.marketplace)}`,
]

/**
 * The places where the starter's own marketplace name, author or owner stands, by file: each `[pattern, build]`
 * must match, and `build(options, ...groups)` gives its replacement. A pattern is a RegExp, or a function of the
 * options that gives one. The marketplace name is the package name already (see `marketplaceName`); the rest is still
 * the starter's `craftsamo`. These are edited exactly where they are, never by replacing `craftsamo` everywhere: that
 * is also the `@craftsamo/repo-kit` dependency and the `craftsamo/repo-kit` workflows, which stay.
 */
const SPOTS = {
  ".codex-plugin/plugin.json": [authorPerson],
  ".claude-plugin/plugin.json": [authorPerson],
  ".antigravity-plugin/plugin.json": [authorPerson],
  ".claude-plugin/marketplace.json": [
    marketplaceOwner,
    marketplaceName,
    [/"Plugins by craftsamo\."/g, (o) => json(`Plugins by ${o.publisher}.`)],
  ],
  ".agents/plugins/marketplace.json": [
    marketplaceName,
    [/^(    "displayName": )"craftsamo"/gm, (o, key) => `${key}${json(o.publisher)}`],
  ],
  "package.json": [[/^(  "author": )"craftsamo"/gm, (o, key) => `${key}${json(o.author)}`]],
  LICENSE: [[/(Copyright \(c\) \d{4} )CraftSamo/g, (o, key) => `${key}${o.author}`]],
}

/** The files `editSpots` edits; the starter has all of them. */
export const SPOT_FILES = Object.keys(SPOTS)

/** Applies the author, owner and marketplace edits of `path`, if it has any. Returns `{ text, count }`. */
export function editSpots(path, text, options) {
  let count = 0
  for (const [pattern, build] of SPOTS[path] ?? []) {
    const resolved = typeof pattern === "function" ? pattern(options) : pattern
    let found = 0
    text = text.replace(resolved, (_, ...groups) => {
      found++
      return build(options, ...groups)
    })
    if (found === 0) throw new SetupError(`${path} has no ${resolved}; the setup has probably run already.`)
    count += found
  }
  return { text, count }
}
