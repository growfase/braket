# Braket

Web3 project on Solana (Anchor), scaffolded with the AIOX agent framework — same
tooling stack as MascotsWars, clean starting point.

## Stack

- **Chain:** Solana / Anchor `0.30.1`
- **Program:** `programs/braket` (Rust)
- **Client / tests:** TypeScript (ts-mocha)
- **Package manager:** Yarn Classic (`1.22.22`)
- **Backend (optional):** Supabase (see `.mcp.json`)
- **AI agents:** AIOX squad (Claude Code, Codex, Gemini, Cursor, Antigravity, Kimi)

## Getting started

```bash
# 1. Install JS deps
yarn install

# 2. Copy env and fill in your keys
cp .env.example .env

# 3. Build the Anchor program
anchor build

# 4. Sync the on-chain program id into Anchor.toml + lib.rs
anchor keys sync

# 5. Run tests
anchor test
```

## Layout

```
programs/braket/      Solana program (Rust) — replace the stub
tests/                Anchor / ts-mocha tests
scripts/              Deploy & maintenance scripts
Anchor.toml           Anchor workspace config
Cargo.toml            Rust workspace
```

## AI agents (AIOX)

The agent framework lives in local (git-ignored) directories so each IDE/CLI
picks up the same squad:

| Tool         | Path            |
|--------------|-----------------|
| Claude Code  | `.claude/`      |
| Codex        | `.codex/`       |
| Gemini       | `.gemini/`      |
| Cursor       | `.cursor/`      |
| Antigravity  | `.antigravity/` |
| Kimi         | `.kimi/`        |
| GitHub       | `.github/agents/` |
| AIOX core    | `.aiox-core/`   |

These are intentionally kept out of git (see `.gitignore`) — they are local
tooling, not part of the deployed app.
