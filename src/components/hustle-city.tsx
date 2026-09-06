'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BUILDINGS = [
  { id: 'design', x: 120, y: 180, emoji: '🎨', name: 'Design Studio', desc: 'Create logos and brand kits for businesses', color: '#9b59f5', height: 80 },
  { id: 'tutor', x: 280, y: 220, emoji: '📚', name: 'Tutoring Center', desc: 'Help students with math, science, or reading', color: '#f53d8c', height: 100 },
  { id: 'content', x: 440, y: 160, emoji: '��', name: 'Content Studio', desc: 'Make TikToks and YouTube videos for brands', color: '#22d3ee', height: 90 },
  { id: 'code', x: 600, y: 200, emoji: '💻', name: 'Dev Workshop', desc: 'Build websites for small businesses', color: '#f5a83d', height: 110 },
  { id: 'photo', x: 200, y: 320, emoji: '📸', name: 'Photo Booth', desc: 'Photography for events and portraits', color: '#3d9bf5', height: 75 },
  { id: 'music', x: 380, y: 300, emoji: '🎵', name: 'Music Lab', desc: 'Teach instruments and produce beats', color: '#f53d3d', height: 85 },
  { id: 'social', x: 540, y: 280, emoji: '📱', name: 'Social Agency', desc: 'Manage social media for local businesses', color: '#a855f7', height: 95 },
];

export function HustleCity() {
  const [active, setActive] = useState<typeof BUILDINGS[0] | null>(null);
  return (
    <div className="relative w-full">
      <div className="text-center mb-8">
        <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Hustle City</p>
        <h2 className="text-3xl font-black">Click a building to explore</h2>
        <p className="text-muted-foreground text-sm mt-2">Every building is a real business idea you can start today</p>
      </div>
      <div className="relative pb-32">
        <svg viewBox="0 0 750 420" className="w-full max-w-3xl mx-auto">
          <ellipse cx="375" cy="380" rx="340" ry="30" fill="hsl(271 67% 61% / 0.05)" stroke="hsl(271 67% 61% / 0.1)" strokeWidth="1" />
          {BUILDINGS.map((b) => {
            const w = 70; const h = b.height; const d = 20;
            const isActive = active?.id === b.id;
            return (
              <motion.g key={b.id} onClick={() => setActive(isActive ? null : b)} style={{ cursor: 'pointer' }} whileHover={{ scale: 1.08 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                <polygon points={`${b.x},${b.y} ${b.x+w},${b.y} ${b.x+w},${b.y-h} ${b.x},${b.y-h}`} fill={isActive ? b.color : b.color+'99'} stroke={b.color} strokeWidth="1.5" />
                <polygon points={`${b.x},${b.y-h} ${b.x+w},${b.y-h} ${b.x+w-d},${b.y-h-d} ${b.x-d},${b.y-h-d}`} fill={b.color+'cc'} stroke={b.color} strokeWidth="1.5" />
                <polygon points={`${b.x+w},${b.y} ${b.x+w-d},${b.y-d} ${b.x+w-d},${b.y-h-d} ${b.x+w},${b.y-h}`} fill={b.color+'55'} stroke={b.color} strokeWidth="1.5" />
                <text x={b.x+w/2} y={b.y-h/2} textAnchor="middle" dominantBaseline="middle" fontSize="22">{b.emoji}</text>
              </motion.g>
            );
          })}
        </svg>
        <AnimatePresence>
          {active && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
              <div className="glass-dark rounded-3xl p-6 border" style={{ borderColor: active.color+'40' }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{active.emoji}</span>
                  <div>
                    <p className="font-black text-xl">{active.name}</p>
                    <p className="text-xs text-muted-foreground">{active.desc}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href="/login?tab=signup" className="flex-1 text-center text-sm font-black py-3 rounded-2xl text-white" style={{ background: active.color }}>Build This Hustle</a>
                  <button onClick={() => setActive(null)} className="px-4 py-3 rounded-2xl border text-sm font-bold">X</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
