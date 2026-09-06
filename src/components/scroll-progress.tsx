'use client';
import { useEffect, useState } from 'react';

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? (scrolled / height) * 100 : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9998] h-[2px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-primary to-accent transition-[width] duration-100 ease-out"
        style={{ width: progress + '%' }}
      />
    </div>
  );
}
