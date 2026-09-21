# Cost routing

Always pick the lowest `costClass` among **available** workers.

- 0 Deterministic (FFmpeg, Node, hashes)
- 1 Ollama / local models
- 2 Connected free/low-cost APIs when configured
- 3 Premium AI — disabled by default

Never spend premium tokens on resize, transcode, checksum, JSON, or sitemap checks.
