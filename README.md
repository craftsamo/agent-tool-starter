# agent-tool-starter

A starter for tool packages that coding agents call: one implementation delivered to every harness.

<!-- starter -->

## Using this starter

This repository is a GitHub template. A project made from it implements its
tools once in `src/core/`, and the skeleton delivers them to each harness
below. Everything that names the package (its npm name, plugin and server
names, tool prefix, setting variables, Hermes package and manifests) is
renamed in one step.

1. On GitHub, choose **Use this template** and create the repository, then
   clone it.
2. Install, then run the setup once, from the clone:

   ```sh
   corepack enable
   pnpm install
   pnpm run setup -- --prefix <prefix> --description "<one line>" --dry-run
   pnpm run setup -- --prefix <prefix> --description "<one line>"
   ```

   The name and owner default to those of the clone's `origin`. The setup
   shows every change and asks before writing; `--dry-run` writes nothing.

3. Rebuild and check, then commit the result:

   ```sh
   pnpm install
   pnpm run build && pnpm run manifests
   pnpm run typecheck && pnpm test && pnpm run smoke
   ```

| Option           | Default                         | Meaning                                                     |
| ---------------- | ------------------------------- | ----------------------------------------------------------- |
| `--prefix`       | (required)                      | the tool ID prefix, one lowercase word: `git` gives `git_*` |
| `--description`  | (required)                      | the one-line description of the package and its plugins     |
| `--name`         | the `origin` repository's name  | the package, plugin, server and program name, in kebab-case |
| `--owner`        | the `origin` repository's owner | the GitHub owner the URLs and the registry name use         |
| `--scope`        | `@<owner>`                      | the npm scope                                               |
| `--marketplace`  | `<owner>`                       | the plugin marketplace name of Claude Code and Codex        |
| `--author`       | `<owner>`                       | the author in the manifests and the license holder          |
| `--author-url`   | `https://github.com/<owner>`    | the author URL in the plugin manifests                      |
| `--publisher`    | `<author>`                      | the marketplace publisher in the plugin catalogs            |
| `--keep-example` |                                 | keep the example notes tools, renamed to the prefix         |
| `--dry-run`      |                                 | show the changes without writing                            |
| `--yes`          |                                 | write without asking                                        |

The setup removes the example notes tools unless `--keep-example` is given,
drops `"private": true` so the package can be published, starts its version
at `0.0.0` whatever the starter's release was, and deletes itself
and this section. It also writes `opencode.jsonc`, whose `starter`
reference lets an agent in OpenCode read this repository beside the
project; add the project's own references there. It refuses to run on a
working tree with uncommitted changes. To take later improvements of the
starter, add it as a remote and merge its default branch.

<!-- /starter -->

| Harness        | Delivery                                       | Pinned by                      |
| -------------- | ---------------------------------------------- | ------------------------------ |
| OpenCode V2    | native plugin (npm package, with skills)       | the version in the package     |
| OpenCode V1    | native plugin (npm package, no skills)         | the version in the package     |
| Claude Code    | plugin: MCP server and skills                  | the release tag, as the ref    |
| Codex          | plugin: MCP server and skills                  | the release tag, as the ref    |
| Grok Build     | plugin: MCP server and skills                  | the release tag, as `@ref`     |
| Antigravity    | plugin: MCP server and skills                  | the release tag's tree URL     |
| Hermes Agent   | native plugin (Python, calls the command line) | the release commit, as the SHA |
| other MCP host | MCP server from npm                            | the version in the package     |

The tools need [Node.js](https://nodejs.org/) 24 or later.
[`docs/conventions.md`](docs/conventions.md) describes how the tools are named
and how they behave.

## Install

Install from a release, never from the default branch: a release is a tag whose
commit carries the built `dist/`, and the default branch does not. In the
commands below, `<version>` is a release's version (`1.2.3`) and `<sha>` is the
commit its tag names:

```sh
gh api repos/craftsamo/agent-tool-starter/commits/v<version> --jq .sha
```

### OpenCode

OpenCode V2 takes the package and its options in `opencode.json`:

```json
{
  "plugins": [{ "package": "@craftsamo/agent-tool-starter@<version>", "options": { "read_only": false } }],
  "permissions": [{ "action": "example_*", "resource": "*", "effect": "ask" }]
}
```

OpenCode V1 takes the package as a string, or as a pair with its options:

```json
{
  "plugin": [["@craftsamo/agent-tool-starter@<version>", { "read_only": false }]],
  "permission": { "example_*": "ask" }
}
```

OpenCode allows any action no rule names, so the plugin's request is granted
silently unless a rule says `ask`. Read tools never ask, so the `example_*` glob
is safe.

V1 registers no skills. Unpack the package and copy its `skills/*` folders into
`~/.config/opencode/skills/`:

```sh
npm pack @craftsamo/agent-tool-starter@<version>
tar -xzf craftsamo-agent-tool-starter-<version>.tgz
mkdir -p ~/.config/opencode/skills
cp -r package/skills/* ~/.config/opencode/skills/
rm -rf package craftsamo-agent-tool-starter-<version>.tgz
```

### Claude Code

```sh
claude plugin marketplace add craftsamo/agent-tool-starter#v<version>
claude plugin install agent-tool-starter@craftsamo
```

### Codex

```sh
codex plugin marketplace add craftsamo/agent-tool-starter --ref v<version>
codex plugin add agent-tool-starter@craftsamo
```

Codex turns `-` into `_` in server names, so it shows the tools as
`mcp__agent_tool_starter__example_*`. It starts the MCP server in the plugin's
install directory and passes no roots, so the server takes each call's directory
from what Codex sends with the call: its sandbox state, which the server asks
for, else the one workspace it names.

The plugin declares `default_tools_approval_mode = "writes"`: Codex asks before
every tool not marked read-only. A user's
`[plugins."<plugin>".mcp_servers.<server>]` setting can only tighten it. Setting
`auto` there yields `prompt` (reads asked too), since Codex treats `auto` and
`writes` as incomparable.

### Grok Build

```sh
grok plugin install craftsamo/agent-tool-starter@v<version> --trust
```

Grok starts the MCP server in the session's working directory.

### Antigravity

Install from the tree of the release tag, never from the default branch, which
has no built `dist/`; Antigravity clones the tag into
`~/.gemini/config/plugins/agent-tool-starter`.

```sh
agy plugin install https://github.com/craftsamo/agent-tool-starter/tree/v<version>
```

### Hermes Agent

Hermes installs a commit, not a tag, and the plugin installs disabled:

```sh
hermes plugins install craftsamo/agent-tool-starter --ref <sha>
hermes plugins enable agent-tool-starter
```

If a Hermes gateway is already running, restart it (`hermes gateway restart`) to
load the plugin.

The plugin runs the Node it found when Hermes started. If a version manager
removes that version while Hermes runs, a call looks for Node again; when it
finds none, restart Hermes from a shell where `node` runs.

### Any other MCP host

Add the server to the host's MCP configuration. Flags go in `args`:

```json
{
  "mcpServers": {
    "agent-tool-starter": {
      "command": "npx",
      "args": ["-y", "@craftsamo/agent-tool-starter@<version>", "--read-only"]
    }
  }
}
```

## Tools and skills

Each toolset comes with a skill that tells an agent how to use its tools. A
skill names its toolset under `metadata` in its frontmatter
(`metadata: { toolset: notes }`, written as a block). OpenCode V2 and Hermes
register it only when the settings register at least one of that toolset's
tools, so a profile with the toolset off, or with all its tools removed, does
not see it; a skill without a toolset is always registered. Claude Code,
Codex, Grok Build and Antigravity install the skill folder whole and pass the
settings only to the MCP server, so they list every skill whatever the
settings select. OpenCode V1 registers no skills, and its copied skills are
all listed too.

<!-- example -->

### Notes (`notes`)

An example toolset: Markdown notes in the working tree's `notes/` folder,
shown to make every part of the tool contract visible with no outside program.

| Tool                  | What it does                                                | Class |
| --------------------- | ----------------------------------------------------------- | ----- |
| `example_note_read`   | `view` one note, or `list` the notes with their sizes       | read  |
| `example_note_create` | create `notes/<name>.md`; never overwrites an existing note | add   |

The skill is [`example-notes`](skills/example-notes/SKILL.md), shown as
`agent-tool-starter:example-notes` in Claude Code and
`agent-tool-starter:notes` in Hermes. A write names the note's absolute path
as its target, so an "always" answer covers that note only.

<!-- /example -->

### Grants (`grants`)

Off by default. Delegates bounded writes for jobs where no person can answer.

| Tool                   | What it does                                             | Class          |
| ---------------------- | -------------------------------------------------------- | -------------- |
| `example_grant_create` | ask a person to delegate one tool's writes within limits | administrative |
| `example_grant_read`   | list grants and their use, or read the usage log         | read           |
| `example_grant_revoke` | remove a grant so no more calls run under it             | overwrite      |

Every write tool can be granted for its targets, calls per hour and expiry.
A tool adds what a grant can also limit by declaring `bounds` and giving
`measure(args, context)` in its spec; see the
[conventions](docs/conventions.md#writes-no-one-is-there-to-approve).
The example `example_note_create` bounds `text_length`.

## Adding a tool

1. Write the spec in `src/core/<domain>/<verb>.ts` with `defineTool`: an ID
   `<prefix>_<domain>_<verb>`, a title and description, the Zod argument and
   output schemas, its toolset and write class, and `execute(args, context)`.
   A write tool also gives `targets(args, context)`: what the call writes to,
   as a permission rule should name it. A tool whose settings can put some
   calls out of reach whatever the person answers gives
   `gate(args, context)`, which throws for such a call; it is refused before
   anyone is asked, and before `execute`.
2. Test it beside the spec (`<verb>.test.ts`), calling it through `invoke` as
   the entry points do. A tool that runs a program is tested against a fake of
   that program on `PATH`; no test reaches a real service.
3. List it in `src/tools.ts`. A new toolset goes into `toolsets` in
   `src/project.ts` (and `defaultToolsets` when it is on by default), a
   setting of the package's own into `options` (and `OPTIONS` in `project.py`
   with `config_schema` in `plugin.yaml`), and a variable the tool reads
   besides the settings into `toolVariables`.
4. Add or update the toolset's skill, `skills/<prefix>-<toolset>/SKILL.md`,
   whose frontmatter names the toolset under `metadata`.
5. Run `pnpm run build && pnpm run manifests` to list the tool in
   `plugin.yaml` and its variables in Codex's manifest, then describe it under
   "Tools and skills".

[`docs/conventions.md`](docs/conventions.md) has the rules each step follows.

A package declares each option as `text`, `boolean`, `number`, `list`, `path`
or `paths`, or as an object with `type` and optional bounds. For example, in
`src/project.ts`:

```ts
options: {
  notes_dir: "path",
  note_limit: { type: "number", integer: true, min: 1, max: 50 },
}
```

`integer: true` requires a whole number; `min` and `max` bound a number or
count a `list` or `paths` value's items. An object with only `type` means the
same as the type alone. Hermes's `OPTIONS` mirrors the declarations on one
line, with double quotes and Python's `True` for `integer`:

```python
OPTIONS: dict[str, str | dict[str, object]] = {"notes_dir": "path", "note_limit": {"type": "number", "integer": True, "min": 1, "max": 50}}
```

<!-- example -->

`src/core/example/` is a worked example of all of them.

<!-- /example -->

## Reads and writes

Every read tool is named `<prefix>_<domain>_read`. Reads can run unasked;
writes are confirmed by the harness.

| Harness     | Reads without asking                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| OpenCode    | always; the plugin asks only before a write                                                                              |
| Claude Code | the rule `mcp__plugin_agent-tool-starter_agent-tool-starter__*_read` in `permissions.allow` of `~/.claude/settings.json` |
| Codex       | always; Codex runs tools that declare `readOnlyHint` unasked, as the read tools do                                       |
| Grok Build  | `grok --allow 'MCPTool(agent-tool-starter__*_read)' --allow 'MCPTool(example_*_read)'` (both rules; see below)           |
| Antigravity | the rule `mcp(agent-tool-starter_agent-tool-starter/<tool id>)` in `permissions.allow`, one for each read tool           |
| Hermes      | always; the plugin asks only before a write                                                                              |

Where a write is asked about, and where it is not:

- **OpenCode** grants any action no rule names, so a write runs unasked unless
  a rule asks for it: add the `example_*` rule shown under [OpenCode](#opencode).
- **Codex** asks before every write because of the plugin's approval mode.
  Under `codex exec` it refuses with "MCP tool call requires approval, but
  approval policy is never". For bounded jobs, see
  [Writes no one is there to approve](#writes-no-one-is-there-to-approve).
- **Grok Build** under `grok -p` refuses a write it cannot ask about, unless it
  is allowed beforehand.
- **Grok Build** calls the plugin's tools through its `use_tool` tool, and the
  agent often names a tool without its server first. Grok checks the rules
  against the name as given, so the server-qualified rule alone does not match
  that first call. The second rule matches the short name; a write still
  matches neither.
- **Antigravity** asks before any MCP tool no rule allows, reads included, and
  names the plugin's server `agent-tool-starter_agent-tool-starter` (plugin,
  then server). `agy -p` refuses a tool it cannot ask about.
- **Hermes** `hermes chat -q` refuses a write it cannot ask about; `hermes -z`
  and `--yolo` skip approval, so writes then run unasked. For bounded jobs, see
  [Writes no one is there to approve](#writes-no-one-is-there-to-approve).

A call a tool's `gate` refuses never runs, whatever the answer. OpenCode and
Hermes refuse it before they ask, so no prompt shows it; Hermes blocks it with
the tool's error. Claude Code, Codex, Grok Build and Antigravity draw their
own prompt before the MCP server sees the call, so they may still ask about
it; the server then refuses it.

## Writes no one is there to approve

A grant limits a job's writes to one tool, for at most 90 days. The person
decides the rest: the targets (named ones, or `*` for any), the bounds the
tool declares (one left out is no limit) and the calls per hour (left out,
any number). Every call made under a grant is logged. A grant never
overrides the host's permissions. The
[conventions](docs/conventions.md#writes-no-one-is-there-to-approve) give the
contract.

1. In a session where a person answers, supply the key described under
   [Settings](#settings), turn on the `grants` toolset alongside the job's
   toolset, and ask the agent to delegate. It calls `example_grant_create`;
   the prompt shows the tool, targets, rate, days, every bound the tool
   declares (`no limit` for one left out) and the reason.
   Approve once.
2. Set the same key and `unattended` for the job only, for example
   `AGENT_TOOL_STARTER_UNATTENDED=true`. Otherwise grants are not checked.
3. Let the host allow the write tool in that run, as below. The grant still
   bounds each call.
4. Revoke with `example_grant_revoke`, or list grants and their use with
   `example_grant_read`.

What lets a write reach the package when no one can answer:

- **OpenCode** `opencode run` rejects every question unless an allow rule
  names the tool (`"permission": { "example_note_create": "allow" }`) or the
  run starts with `--auto`.
- **Claude Code** `claude -p` needs the tool in `--allowedTools`, as
  `mcp__plugin_agent-tool-starter_agent-tool-starter__example_note_create`.
- **Codex** `codex exec` needs `approval_mode = "approve"` for that tool under
  the plugin's MCP server in `config.toml`
  (`[mcp_servers.<server>.tools.<tool>]`), since the plugin's default asks
  before every write.
- **Grok Build** `grok -p` needs both allow rules:
  `--allow 'MCPTool(agent-tool-starter__example_note_create)'` and
  `--allow 'MCPTool(example_note_create)'`, for the qualified and short names
  described under [Reads and writes](#reads-and-writes).
- **Antigravity** `agy -p` needs
  `mcp(agent-tool-starter_agent-tool-starter/example_note_create)` in
  `permissions.allow`.
- **Hermes** `hermes chat -q` denies by `approvals.single_query_mode` unless
  allowed. `-z` and `--yolo` skip approvals and run the write; the grant is
  then the only bound.

### Limits

- A run with every approval skipped (Hermes `-z` or `--yolo`, an
  always-approve mode, an explicit `allow` for `example_grant_create`, or a
  global OpenCode V1 `allow`) shows no prompt. A grant created there is not a
  person's answer, and it can be as wide as any target, no bound and no rate
  for 90 days: create grants only where the harness asks.
- An earlier copy of the grants directory put back whole is not detected.
  Expiry, at most 90 days, bounds what it can restore.
- Anyone who can read the key can sign grants. Keep it where the agent's
  tools cannot read it.
- The OpenCode V2 plugin forces a question for `example_grant_create`
  through a hook; only hosts that offer that hook run it.

The OpenCode V2 service and Hermes gateway keep the environment they started
with; see [Settings](#settings) before changing the job's variables.

## Settings

Every entry point takes the same settings. A flag wins over its environment
variable, and an option or setting wins over the variable too.

| Setting         | Flag              | Variable                           | Meaning                                                                                                                                   |
| --------------- | ----------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `toolsets`      | `--toolsets`      | `AGENT_TOOL_STARTER_TOOLSETS`      | the toolsets that are on, or `all`; default those `src/project.ts` names                                                                  |
| `read_only`     | `--read-only`     | `AGENT_TOOL_STARTER_READ_ONLY`     | registers no tool that writes; wins over every other setting                                                                              |
| `unattended`    | `--unattended`    | `AGENT_TOOL_STARTER_UNATTENDED`    | no person can answer: a write runs only under a grant that covers it; off by default                                                      |
| `grants_dir`    | `--grants-dir`    | `AGENT_TOOL_STARTER_GRANTS_DIR`    | where grants and their use are kept; default `$XDG_STATE_HOME/agent-tool-starter/grants`, else `~/.local/state/agent-tool-starter/grants` |
| `tools`         | `--tools`         | `AGENT_TOOL_STARTER_TOOLS`         | single tools to add by ID, whatever their toolset                                                                                         |
| `exclude_tools` | `--exclude-tools` | `AGENT_TOOL_STARTER_EXCLUDE_TOOLS` | single tools to remove by ID; wins over `tools` and `toolsets`                                                                            |
| `confirm`       | `--confirm`       | `AGENT_TOOL_STARTER_CONFIRM`       | MCP server only: `harness` (default) or `elicitation`, as the conventions say                                                             |
| `language`      | `--language`      | `AGENT_TOOL_STARTER_LANGUAGE`      | native plugins only: the approval prompt's language, such as `ja`                                                                         |
| `emoji`         | —                 | —                                  | Hermes only: the emoji shown beside each toolset, by toolset name (`""` for none)                                                         |

`AGENT_TOOL_STARTER_GRANT_KEY` is a variable only, never a flag or a plugin
option. Use at least 32 characters, for example from `openssl rand -hex 32`,
stored where the host keeps secrets. Without it no write runs while
unattended and no grant can be created. Codex forwards it alongside the
settings' variables, as described below.

Lists are comma-separated in a flag or a variable. A package's own settings,
listed in `options` in `src/project.ts`, take a row each here and are read the
same way. A `path` is trimmed; `~` and `~/…` (also with the platform separator)
stand for the home directory (`HOME` when it is absolute, else the account's).
It must then be absolute and reaches the tool normalized,
without a filesystem check. `paths` is a list of such paths, comma-separated
in a flag or variable and an array of strings in a plugin option. Blank paths
and lists with no items after trimming and dropping blanks count as unset.
Bounds check only a given value, not an unset option. Refused values are
`invalid_argument`, naming the flag, variable or option and what it must be.
Hermes passes paths and lists to the command line, which checks the paths and
bounds. Where each harness reads them:

- **OpenCode** takes the plugin `options` shown above, with lists as arrays and
  `read_only` as a boolean, and falls back to the variables. V2 runs plugins in
  its background service, which keeps the environment it started with: a
  variable set where `opencode run` starts has no effect until the service is
  restarted in that environment (`opencode service restart`). V1 runs plugins
  in its own process.
- **Hermes** takes `plugins.entries.agent-tool-starter.settings` in
  `config.yaml`:

  ```yaml
  plugins:
    entries:
      agent-tool-starter:
        settings:
          read_only: false
          exclude_tools: []
  ```

  Without a `language` setting, the approval card follows Hermes's own
  `display.language` (or `HERMES_LANGUAGE`), the language of its approval
  buttons, and else stays in English. The plugin passes its own environment
  to the command line it runs, so the variables work too. A running gateway keeps the environment it started with;
  restart it (`hermes gateway restart`) after changing one.

- **Claude Code, Grok Build and Antigravity** start the plugin's server without
  flags and pass it the client's environment, so set the variables in the
  environment the harness runs in.
- **Codex** passes a plugin's MCP server only a few basic variables (such as
  `PATH` and `HOME`) and those the plugin's manifest names, which are the
  variables above: set them in the environment Codex runs in. A variable the
  tools read besides the settings belongs in `toolVariables` in
  `src/project.ts`; `pnpm run manifests` adds it to the manifest after the
  settings' variables. To pass flags, or to give the server a variable the
  package does not name, add the server under `[mcp_servers]` in Codex's
  `config.toml` instead of using the plugin: flags go in `args`, `env_vars`
  names the variables to forward from Codex's environment, and `env` sets
  fixed values.

  ```toml
  [mcp_servers.agent-tool-starter]
  command = "npx"
  args = ["-y", "@craftsamo/agent-tool-starter@<version>", "--read-only"]
  env_vars = ["AGENT_TOOL_STARTER_TOOLSETS"]
  ```

## Layout

- `src/project.ts` — the package's name, tool ID prefix, setting prefix,
  toolsets, tool options and the other variables its tools read.
- `src/core/` — the tool contract and the tools, free of any harness and of
  the project's names.
- `src/tools.ts` — the list of every tool, which each entry point registers.
- `src/words.ts` — the translations of the tools' words, per language, which
  the native plugins use in their approval prompts.
- `src/mcp/` — the MCP server, built to `dist/mcp.js` and run by
  `agent-tool-starter`.
- `src/opencode/` — the OpenCode plugin, built to `dist/opencode.js`.
- `src/cli/` — the command line the Hermes plugin calls, built to `dist/cli.js`
  and run by `agent-tool-starter-cli`.
- `src/hermes/`, `plugin.yaml` and `__init__.py` — the Hermes plugin.
- `skills/` — one skill per toolset, `skills/<name>/SKILL.md`, which every
  harness that takes skills loads from the package or plugin root; the native
  plugins load only those of the toolsets that are on.
- `.claude-plugin/`, `.codex-plugin/`, `.agents/plugins/`, `.mcp.json`,
  `.antigravity-plugin/` and `mcp_config.json` — the plugin manifests of the
  other harnesses. Codex reads `.codex-plugin/plugin.json`; a root
  `plugin.json` would make it load the plugin as an Agent Plugin, whose tool
  budget hides tools past a fixed size. The root `.mcp.json` is the
  configuration Grok Build reads (with `${CLAUDE_PLUGIN_ROOT}`, the variable
  both Grok Build and Claude Code expand); when working on this repository in
  Claude Code, decline the project MCP server it offers from that file.

How a release is made is in [`RELEASING.md`](RELEASING.md).

## License

[AGPL-3.0 with Commons Clause](LICENSE)
