'use client';
import { useEffect, useState } from 'react';

export default function DynamicLogo({ className }: { className?: string }) {
  const [logoUrl, setLogoUrl] = useState('/logo.png');

  useEffect(() => {
    fetch('/api/settings/logo-get')
      .then(res => res.json())
      .then(data => setLogoUrl(data.logoUrl));
  }, []);

  return <img src={logoUrl} alt="Logo" className={className} />;
}