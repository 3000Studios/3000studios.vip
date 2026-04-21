import { useDeferredValue, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';

const stills = [
  'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/8728560/pexels-photo-8728560.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/5473956/pexels-photo-5473956.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

const reel = [
  'private owner vault',
  'brand launches',
  'ai products',
  'content engines',
  'revenue operations',
  'studio command',
];

export function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, ownerEmail } = useAuth();
  const [email, setEmail] = useState(ownerEmail);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const deferredPasscode = useDeferredValue(passcode);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = login(email, passcode);
    if (!ok) {
      setError('Access denied. Use the owner email and passcode.');
      return;
    }

    const next = (location.state as { next?: string } | null)?.next ?? '/vault';
    navigate(next);
  };

  return (
    <div className="landing">
      <section className="cinemaHero">
        <video
          className="cinemaVideo"
          autoPlay
          loop
          muted
          playsInline
          poster={stills[0]}
          src="https://cdn.coverr.co/videos/coverr-coding-on-a-laptop-in-a-dark-room-1567976518916?download=1080p"
        />
        <div className="cinemaShade" />
        <div className="cinemaGrid" />
        <div className="landingInner">
          <motion.div
            className="landingCopy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="eyebrow">3000studios.vip</div>
            <h1>The owner-only studio citadel for launches, brands, media, and control.</h1>
            <p className="lead">
              Built as a flashy command lobby with cinematic motion, responsive layers, branded
              media, and a private vault for the studio operator.
            </p>
            <div className="ctaRow">
              <a href="#login" className="btn primary">
                Enter the Vault
              </a>
              <a href="#showcase" className="btn ghost">
                See the Experience
              </a>
              {isAuthenticated ? (
                <Link to="/vault" className="btn">
                  Open Owner Console
                </Link>
              ) : null}
            </div>
          </motion.div>

          <motion.form
            id="login"
            className="loginCard"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            onSubmit={handleSubmit}
          >
            <div className="loginBadge">Owner Login</div>
            <h2>Private access for Mr. J. Swain</h2>
            <p className="mutedText">
              This unlocks the private control surface. Real hardening should still be enforced at
              the edge with Cloudflare Access.
            </p>
            <label className="field">
              <span>Email</span>
              <input
                className="input"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="field">
              <span>Passcode</span>
              <input
                className="input"
                autoComplete="current-password"
                type="password"
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
              />
            </label>
            <button className="btn primary wide" type="submit">
              Unlock Studio
            </button>
            <div className="passcodePulse">Passcode length: {deferredPasscode.length}</div>
            {error ? <div className="errorBox inline">{error}</div> : null}
          </motion.form>
        </div>
      </section>

      <section className="ticker">
        <div className="tickerTrack">
          {[...reel, ...reel].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </section>

      <section id="showcase" className="showcase">
        <div className="sectionHead">
          <div className="eyebrow">Studio Look</div>
          <h2>Responsive media walls, glowing cards, ambient motion, and a login-first owner flow.</h2>
        </div>

        <div className="mosaic">
          <article className="mediaPanel large">
            <img alt="Studio command screens" src={stills[0]} />
            <div className="panelCopy">
              <h3>Cinematic hero system</h3>
              <p>
                Full-width video, atmospheric overlays, and a layered grid that holds up on mobile
                and desktop.
              </p>
            </div>
          </article>
          <article className="mediaPanel">
            <img alt="Creative neon room" src={stills[1]} />
            <div className="panelCopy">
              <h3>High-contrast visual identity</h3>
              <p>Gold, cyan, and ember lighting tuned for a more premium 3000 Studios presence.</p>
            </div>
          </article>
          <article className="mediaPanel">
            <img alt="Production workflow boards" src={stills[2]} />
            <div className="panelCopy">
              <h3>Private operator workflow</h3>
              <p>Login gate up front, then direct access into the studio vault and monitoring tools.</p>
            </div>
          </article>
        </div>

        <div className="featureGrid">
          <div className="featureCard">
            <div className="featureIndex">01</div>
            <h3>Owner-first login</h3>
            <p>Email/passcode access is now the first interaction before the protected vault routes.</p>
          </div>
          <div className="featureCard">
            <div className="featureIndex">02</div>
            <h3>Vault console</h3>
            <p>Once authenticated, the original site-monitoring surfaces remain available in a tighter shell.</p>
          </div>
          <div className="featureCard">
            <div className="featureIndex">03</div>
            <h3>Wild motion without breaking mobile</h3>
            <p>Hero video, marquee tape, glow depth, and responsive stacking for smaller screens.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
