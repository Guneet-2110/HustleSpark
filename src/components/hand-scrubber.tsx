'use client';
import { useEffect, useRef, useState } from 'react';

const TOTAL_FRAMES = 144;

function getFrameUrl(index: number) {
  const filename = 'Hand_forming_energy_sphere_202609032223-' + index + '.jpg';
  return 'https://firebasestorage.googleapis.com/v0/b/hustlespark-177in.firebasestorage.app/o/hand-frames%2F' + encodeURIComponent(filename) + '?alt=media';
}

export function HandScrubber() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const [loaded, setLoaded] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    function drawFrame(index: number) {
      const img = imagesRef.current[index];
      if (!img || !img.complete || !img.naturalWidth) return;
      const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const x = (canvas.width - img.naturalWidth * scale) / 2;
      const y = (canvas.height - img.naturalHeight * scale) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#030308';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);
    }

    // Smooth interpolation loop
    function loop() {
      const current = frameRef.current;
      const target = targetFrameRef.current;
      if (current !== target) {
        // Move toward target by 1 frame at a time smoothly
        const next = current + Math.sign(target - current);
        frameRef.current = next;
        drawFrame(next);
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    // Load all frames — prioritize first 20 and last 20
    let loadCount = 0;
    const loadFrame = (i: number) => {
      if (imagesRef.current[i]) return;
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        loadCount++;
        setLoaded(loadCount);
        if (i === 0) drawFrame(0);
      };
      imagesRef.current[i] = img;
    };

    // Load first 10 frames immediately
    for (let i = 0; i < 10; i++) loadFrame(i);
    // Then load rest with small delays to avoid network congestion
    for (let i = 10; i < TOTAL_FRAMES; i++) {
      setTimeout(() => loadFrame(i), i * 15);
    }

    function handleScroll() {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const scrolled = -rect.top;
      const total = section.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / total));
      const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));
      targetFrameRef.current = frameIndex;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const loadPercent = Math.round((loaded / TOTAL_FRAMES) * 100);

  return (
    <div ref={sectionRef} style={{ height: '350vh' }} className="relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#030308]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        {loaded < TOTAL_FRAMES && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
            <div className="w-48 h-0.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300" style={{ width: loadPercent + '%' }} />
            </div>
            <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{loadPercent}% loaded</div>
          </div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 z-10 pointer-events-none">
          <div className="text-center px-6 max-w-2xl">
            <div className="text-xs font-black uppercase tracking-widest text-primary mb-3">Your AI Business Mind</div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
              HustleSpark thinks<br/>
              <span className="text-gradient-animated">so you can act.</span>
            </h2>
            <p className="text-white/40 text-base">Our AI generates your perfect hustle, builds your brand, and maps your path to your first paycheck.</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030308] to-transparent z-10" />
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#030308] to-transparent z-10" />
      </div>
    </div>
  );
}
