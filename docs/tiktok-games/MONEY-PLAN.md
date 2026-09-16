# TikTok Games — Money Plan (3000 Studios)

Live hub: https://3000studios.vip/tiktok-games/ — Batch 1 (6 games) shipped 2026-09-16.

## The loop (why this makes money)
1. **Free play → ad views.** Each game page carries AdSense banner slots (marked `ADSENSE` in HTML). Paste ad code when approved. Traffic = TikTok bio link + clips.
2. **Clips → Creator Rewards + followers.** Every game ends with a copy-paste caption + `@3000studios.vip` tag. Post 1 clip per game per week = 6 posts/week minimum. Rage/fail clips outperform win clips — post fails.
3. **Wheel + Beat → Shop + music.** `lucky-spin` prizes redeem via Shop order notes / TikTok comments (no cash payouts, keeps it legal). `beat-drop` links to `/music`. Track with `?src=tiktok-games` on links.
4. **LIVE → gifts.** Play these on TikTok LIVE; viewers gift to choose your next move (e.g. "gift a rose = I spin", "gift = you pick my stack side"). No automation needed.
5. **Compilations → YouTube Shorts + Reels.** Same 30s recordings repost to Shorts/Reels for double-dip.

## Guardrails (standing orders, never break)
- NEVER auto-post/upload/DM from any agent. All TikTok publishes are manual by MrJws (app `3000 Studios Promo` is Production In review; Direct Post pending).
- No cash prizes, no gambling, no "win money" claims. Prizes are shoutouts/discounts Dare/fun only.
- Secrets: names only (`TIKTOK_CLIENT_KEY` etc.). No values in chat/git.
- Deploy: commit → push `main` → Cloudflare Pages auto-deploy. No manual deploys, no extra branches.

## Weekly cadence (never stops)
- Mon: post Stack Rage clip. Tue: Dodge fail. Wed: Reaction score screenshot. Thu: Beat Drop. Fri: Lucky Spin (tag friend = +entries). Sat: Memory. Sun: LIVE 20 min playing chat's pick.
- Factory rule: ship ≥1 new game per week from BACKLOG.md using scripts/new-tiktok-game.mjs. Update hub grid + sitemap each time.

## Metrics (check weekly)
- TikTok: views, completion, comments/score replies, profile taps, LIVE gifts.
- Site: /tiktok-games/* pageviews, AdSense RPM, Shop orders with `tiktok-games` src, music streams lift.
- Kill rule: any game <100 plays in 2 weeks gets a hook rework (title + first-3-seconds), not deletion.
