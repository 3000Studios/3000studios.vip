# Release pipeline

Human song approval is the creative gate. DistroKid submit and public publish are approval gates.

```
brief → Record Architect (SONGWRITING.md)
     → Suno adapter (manual)
     → human approves master
     → ingest → audio QC → metadata → artwork → video/shorts/reels/canvas
     → captions → thumbs → website prep → DistroKid prep → promotion
     → QC → approval_gate → publish/schedule → analytics
```

CLI:

```
npm run os:job -- write "Make me a funny Southern funk song about a wifi fridge"
npm run os:job -- ingest "Wifi Fridge" path\to\master.wav
npm run os:job -- approve <job_id> "Wifi Fridge"
```
