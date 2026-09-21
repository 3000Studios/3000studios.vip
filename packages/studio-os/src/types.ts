export type CostClass = 0 | 1 | 2 | 3;

export type TaskStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'blocked_approval'
  | 'waiting_human';

export type ReleaseStage =
  | 'songwriting'
  | 'human_song_approval'
  | 'ingest_master'
  | 'audio_qc'
  | 'metadata'
  | 'artwork'
  | 'video'
  | 'shorts'
  | 'reels'
  | 'canvas'
  | 'captions'
  | 'thumbnails'
  | 'website'
  | 'distribution'
  | 'promotion'
  | 'quality_control'
  | 'approval_gate'
  | 'publish'
  | 'analytics';

export type AgentId =
  | 'MASTER_ORCHESTRATOR'
  | 'RECORD_ARCHITECT'
  | 'RELEASE_DIRECTOR'
  | 'VISUAL_DIRECTOR'
  | 'VIDEO_FACTORY'
  | 'PROMOTION_DIRECTOR'
  | 'WEBMASTER'
  | 'ANALYTICS_AGENT'
  | 'BUSINESS_AGENT'
  | 'QUALITY_CONTROL'
  | 'LOCAL_WORKER'
  | 'FALLBACK_AGENT';

export type WorkerId =
  | 'deterministic'
  | 'ffmpeg'
  | 'ffprobe'
  | 'whisper-local'
  | 'image-processing'
  | 'ollama'
  | 'playwright'
  | 'lighthouse'
  | 'filesystem'
  | 'suno-adapter'
  | 'premium-ai';
