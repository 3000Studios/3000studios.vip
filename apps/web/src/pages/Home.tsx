import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { featureSong, rolloutSongs, type SongPalette } from '../data/music';
import { getDailyBlogPosts } from '../data/blog';
import { LiveWallpaper } from '../components/LiveWallpaper';
import { MouseFX } from '../components/MouseFX';
import { ZombieFX } from '../components/ZombieFX';
import { ScrollFX } from '../components/ScrollFX';
import { CloudflareStreamPlayer } from '../components/CloudflareStreamPlayer';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';
