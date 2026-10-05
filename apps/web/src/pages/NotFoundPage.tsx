import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/usePageMeta';
import { PublicLayoutV2 } from '../v2/PublicLayoutV2';

export function NotFoundPage() {
  usePageMeta({
    title: 'Page not found',
    description: 'The page you are looking for does not exist. Head back to the 3000 Studios stage.',
  });
  return (
    <PublicLayoutV2>
      <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
        background: '#05060a',
        color: '#f5f1e8',
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-0.02em' }}>404</div>
      <h1 style={{ fontSize: 24, margin: 0 }}>This track skipped.</h1>
      <p style={{ opacity: 0.7, maxWidth: 420, margin: 0 }}>
        The page you wanted is not on this stage. The music is still playing — head back home.
      </p>
      <Link
        to="/"
        style={{
          marginTop: 8,
          padding: '12px 28px',
          borderRadius: 999,
          background: '#ffd700',
          color: '#0a0a0a',
          fontWeight: 800,
          textDecoration: 'none',
        }}
      >
        Back to the stage
      </Link>
      </main>
    </PublicLayoutV2>
  );
}
