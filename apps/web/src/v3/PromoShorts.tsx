import { Play } from '@phosphor-icons/react';
import { Reveal } from '../v2/Reveal';
import { publishedShorts } from '../data/publishedShorts';

const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const shortUrl = (id: string) => `https://www.youtube.com/shorts/${id}`;

/* Every published promo short — native horizontal snap strip */
export function PromoShorts() {
  return (
    <section className="v3-section" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <div className="v3-wrap" style={{ padding: '0 6vw' }}>
        <Reveal>
          <div className="v3-eyebrow">Promo cuts</div>
          <h2 className="v3-h2">
            All <em>{publishedShorts.length}</em> promo videos
          </h2>
          <p className="v3-lead">
            Every short-form cut, in one filmstrip. Swipe sideways — tap any of them to
            watch it on YouTube.
          </p>
        </Reveal>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 18,
          overflowX: 'auto',
          padding: '40px 6vw 10px',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
        }}
      >
        {publishedShorts.map((s) => (
          <a
            key={s.videoId}
            href={shortUrl(s.videoId)}
            target="_blank"
            rel="noreferrer"
            style={{
              flex: '0 0 auto',
              width: 190,
              scrollSnapAlign: 'start',
              textDecoration: 'none',
              color: 'inherit',
            }}
            aria-label={`Watch ${s.title}`}
          >
            <span
              style={{
                display: 'block',
                position: 'relative',
                aspectRatio: '9 / 16',
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,.12)',
                background: '#0b0d14',
              }}
            >
              <img
                src={thumb(s.videoId)}
                alt=""
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(5,6,10,.35)',
                }}
              >
                <span
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    background: 'rgba(241,183,78,.92)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0a0800',
                  }}
                >
                  <Play size={20} weight="fill" />
                </span>
              </span>
            </span>
            <span
              style={{
                display: 'block',
                marginTop: 10,
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.4,
                color: '#f4f1ea',
              }}
            >
              {s.title}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
