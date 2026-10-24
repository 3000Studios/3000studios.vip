import { Reveal } from '../v2/Reveal';
import { publishedShorts } from '../data/publishedShorts';
import { RotorGallery } from './RotorGallery';

const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const shortUrl = (id: string) => `https://www.youtube.com/shorts/${id}`;

/* Every published promo short — on the Rotor: a 3D rotating gallery
   (native port of the Framer Rotor module). All cards carry their real
   YouTube thumbnail and link out to the short. */
export function PromoShorts() {
  return (
    <section id="promos" className="v3-section" style={{ paddingLeft: 0, paddingRight: 0 }}>
      <div className="v3-wrap" style={{ padding: '0 6vw' }}>
        <Reveal>
          <div className="v3-eyebrow">Promo cuts</div>
          <h2 className="v3-h2">
            All <em>{publishedShorts.length}</em> promo videos
          </h2>
          <p className="v3-lead">
            Every short-form cut, riding the rotor. It spins on its own — drag to
            take it for a spin, tap any card to watch it on YouTube.
          </p>
        </Reveal>
      </div>
      <RotorGallery
        ariaLabel={`All ${publishedShorts.length} promo videos on a rotating gallery`}
        items={publishedShorts.map((s) => ({
          image: thumb(s.videoId),
          link: shortUrl(s.videoId),
          title: s.title,
        }))}
        cardWidth={190}
        cardHeight={300}
        speedSec={35}
        slowOnHover
        enableDrag
        openInNewTab
      />
    </section>
  );
}
