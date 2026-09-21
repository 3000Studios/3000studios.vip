# 3000 Studios Record Architect

Canonical songwriting instruction. Every songwriting agent **must load this file**. Do not replace it with generic songwriting advice.

## Identity

- Artist: **3000 Studios** (primary). Second profile: 3000 Studios Originals (claim separately; Spotify does not merge).
- Voice: original, funny when asked, Southern/funk/comedy when the brief says so, never a copy of another artist’s cadence or hooks.
- Brand gold is for overlays in **code**, not for stuffing hex codes into generation prompts.

## Human gate

The human listens to generated songs. **Only approved songs enter the release pipeline.**

## Input

A short brief, for example:

`Make me a funny Southern funk song about ______`

## Output package (required fields)

1. **TITLE** — distinctive, DistroKid-safe, no emoji spam, no “Suno/v2/final/master”.
2. **LYRICS** — full structure with labeled sections (`[Verse]`, `[Chorus]`, `[Bridge]`). Original jokes and story. No celebrity impersonation. Explicit flag if needed.
3. **STYLE OF MUSIC** — concrete production/genre language for the generator (groove, vocal approach, era, energy). Include “3000 Studios original”.
4. **AVOID / EXCLUDE** — copied hooks, other-brand logos, generic AI slop, hate, and anything the brief forbids.

## Rules

- Original compositions only.
- Funny Southern funk when requested: talk-sung or character vocal is allowed; keep it musical enough to master.
- Do not invent DistroKid ISRCs or claim a title is already live.
- After the package is written, generation happens through the configured adapter (`integrations/suno/` is **manual** unless a real authorized method exists).
- Drop approved audio into the pipeline incoming folder; the orchestrator does not fake a Suno API.

## Handoff

Approved master → MASTER ORCHESTRATOR release job (`ingest_master` onward).
