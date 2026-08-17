'use client';

import { useEffect, useState } from 'react';

const ALLOWED_REFERRER_FRAGMENT = 'synccrm.ca';

export default function FrameGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'blocked'>('checking');

  useEffect(() => {
    const isEmbedded = window.self !== window.top;
    const referrer = document.referrer || '';
    const referrerLooksRight =
      referrer.length === 0 || referrer.includes(ALLOWED_REFERRER_FRAGMENT);

    if (isEmbedded && referrerLooksRight) {
      setStatus('allowed');
    } else {
      setStatus('blocked');
    }
  }, []);

  if (status === 'checking') {
    return null;
  }

  if (status === 'blocked') {
    return (
      <div className="frame-guard-blocked">
        <p>Ce widget est disponible uniquement à l&apos;intérieur du tableau de bord GoHighLevel.</p>
      </div>
    );
  }

  return <>{children}</>;
}
