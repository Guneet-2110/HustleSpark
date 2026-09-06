"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Rocket,
  Lightbulb,
  DollarSign,
  KeyRound,
  UserCheck,
  Trophy,
} from "lucide-react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ----------------------------------------------------------------------
// 1. THREE.JS HERO GLOBE CANVAS COMPONENT
// ----------------------------------------------------------------------
function HeroGlobeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Particle Sphere Geometry
    const particleCount = 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const initialPositions = new Float32Array(particleCount * 3);

    const radius = 6;
    const amberColor = new THREE.Color("#f59e0b"); // amber-500
    const purpleColor = new THREE.Color("#8b5cf6"); // purple-500
    const pinkColor = new THREE.Color("#ec4899"); // pink-500

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = radius + (Math.random() - 0.5) * 0.8;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      initialPositions[i * 3] = x;
      initialPositions[i * 3 + 1] = y;
      initialPositions[i * 3 + 2] = z;

      const mixedColor = Math.random() > 0.5 ? amberColor : Math.random() > 0.5 ? purpleColor : pinkColor;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const material = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Animation Loop
    let reqId: number;
    let scrollProgress = 0;

    const onScroll = () => {
      const scrollY = window.scrollY;
      scrollProgress = Math.min(scrollY / 800, 1);
    };

    window.addEventListener("scroll", onScroll);

    const animate = () => {
      reqId = requestAnimationFrame(animate);

      particleSystem.rotation.y += 0.004;
      particleSystem.rotation.x += 0.002;

      // Disperse particles as user scrolls
      const posArr = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const initX = initialPositions[idx];
        const initY = initialPositions[idx + 1];
        const initZ = initialPositions[idx + 2];

        const factor = 1 + scrollProgress * 2.5;
        posArr[idx] = initX * factor;
        posArr[idx + 1] = initY * factor;
        posArr[idx + 2] = initZ * factor + scrollProgress * 5;
      }
      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full min-h-[400px] sm:min-h-[500px]" />;
}

// ----------------------------------------------------------------------
// 2. BACKGROUND 200+ MOUSE-REACTIVE PARTICLES CANVAS
// ----------------------------------------------------------------------
function BackgroundParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Create 200 Particles
    const particleCount = 200;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 2.5 + 1,
      color: Math.random() > 0.5 ? "rgba(245, 158, 11, 0.4)" : "rgba(139, 92, 246, 0.4)",
    }));

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Mouse repulsion
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const angle = Math.atan2(dy, dx);
          const force = (120 - dist) / 120;
          p.x += Math.cos(angle) * force * 3;
          p.y += Math.sin(angle) * force * 3;
        }

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 opacity-70" />;
}

// ----------------------------------------------------------------------
// 3. MAGNETIC BUTTON WRAPPER COMPONENT
// ----------------------------------------------------------------------
function MagneticButton({
  children,
  href,
  className = "",
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  const btnRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btnRef.current.style.transform = `translate3d(${x * 0.25}px, ${y * 0.25}px, 0px) scale(1.03)`;
  };

  const handleMouseLeave = () => {
    if (!btnRef.current) return;
    btnRef.current.style.transform = `translate3d(0px, 0px, 0px) scale(1)`;
  };

  return (
    <Link
      ref={btnRef}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-200 ease-out transform-gpu active:scale-95 shadow-xl ${className}`}
    >
      {children}
    </Link>
  );
}

// ----------------------------------------------------------------------
// 4. ANIMATED 3D FLIP BENEFIT CARD COMPONENT
// ----------------------------------------------------------------------
function FlipBenefitCard({
  icon,
  title,
  description,
  badgeBg,
}: {
  icon: string;
  title: string;
  description: string;
  badgeBg: string;
}) {
  return (
    <div className="group perspective-1000">
      <div className="relative rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl transition-all duration-700 transform-gpu group-hover:[transform:rotateY(180deg)] [transform-style:preserve-3d] min-h-[220px] flex flex-col justify-center text-left border-indigo-950 hover:border-amber-400">
        
        {/* Front Face */}
        <div className="[backface-visibility:hidden] space-y-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold ${badgeBg} shadow-md`}>
            {icon}
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">{title}</h3>
          <p className="text-xs text-indigo-200 leading-relaxed">{description}</p>
        </div>

        {/* Back Face (3D Flipped) */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-950 to-slate-900 p-8 text-white [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-center text-center space-y-3 border-2 border-amber-400">
          <span className="text-4xl animate-bounce">{icon}</span>
          <h4 className="text-base font-black text-amber-300">{title}</h4>
          <p className="text-xs text-indigo-100 font-medium">{description}</p>
        </div>

      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// MAIN LANDING PAGE COMPONENT
// ----------------------------------------------------------------------
export default function LandingPage() {
  const storyContainerRef = useRef<HTMLDivElement>(null);

  // Real-Time Typing Simulation for Section 2
  const [typedText, setTypedText] = useState("");
  const fullText = "Math Tutoring & Homework Helper 📐";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setTypedText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) index = 0;
    }, 120);
    return () => clearInterval(timer);
  }, []);

  // GSAP SCROLLTRIGGER PINNED CINEMATIC STORY
  useEffect(() => {
    if (typeof window === "undefined" || !storyContainerRef.current) return;

    const sections = gsap.utils.toArray<HTMLElement>(".scroll-story-step");
    if (sections.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: storyContainerRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (sections.length - 1),
          end: () => "+=" + storyContainerRef.current?.offsetWidth,
        },
      });
    }, storyContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative overflow-hidden selection:bg-amber-400 selection:text-slate-950 bg-slate-950 text-white">
      
      {/* 200+ MOUSE-REACTIVE BACKGROUND PARTICLES */}
      <BackgroundParticlesCanvas />

      {/* ---------------------------------------------------------------- */}
      {/* HERO SECTION - 3D FLOATING WORLD                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950 pt-16 pb-20 z-10 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-4 py-1.5 text-xs font-black text-amber-300 border border-amber-400/30 backdrop-blur-md shadow-lg shadow-amber-500/10">
                <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                <span>Classroom Entrepreneurship for Ages 9–13</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
                Learn How to Run a Real Business —{" "}
                <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
                  Right in Your Classroom!
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-indigo-200 max-w-2xl mx-auto lg:mx-0 font-medium">
                Students brainstorm service ideas with our Smart AI Assistant, build marketplace listings, and trade using classroom coins. Your teacher is in charge of everything.
              </p>

              {/* CTA BUTTONS WITH MAGNETIC & LIQUID 3D EFFECTS */}
              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-2">
                <MagneticButton
                  href="/join"
                  className="rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 px-8 py-4 text-lg font-black text-slate-950 shadow-orange-500/30 flex items-center justify-center gap-3"
                >
                  <KeyRound className="h-6 w-6" />
                  <span>Student Join Class 🚀</span>
                </MagneticButton>

                <MagneticButton
                  href="/teacher/signup"
                  className="rounded-2xl border-2 border-indigo-400/40 bg-indigo-900/60 backdrop-blur-md px-7 py-4 text-base font-bold text-white hover:bg-indigo-800/80 flex items-center justify-center gap-3"
                >
                  <Rocket className="h-5 w-5 text-amber-400" />
                  <span>Start a Free Classroom</span>
                </MagneticButton>
              </div>

              {/* Badges */}
              <div className="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-indigo-300 font-medium border-t border-indigo-900/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <span>Safe for Schools (No Emails Needed)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  <span>Smart AI Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-sky-400" />
                  <span>Teacher In Charge</span>
                </div>
              </div>
            </div>

            {/* Right: Three.js 3D Floating Particle Sphere Scene */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <HeroGlobeCanvas />
            </div>

          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* SCROLL STORY - PINNED CINEMATIC 3-SECTION HORIZONTAL SCROLL      */}
      {/* ---------------------------------------------------------------- */}
      <section ref={storyContainerRef} className="relative bg-slate-950 text-white overflow-hidden z-10">
        <div className="flex w-[300vw] h-screen">
          
          {/* SECTION 1 (PINNED): 3D CLASSROOM & SPARKCOIN RAIN */}
          <div className="scroll-story-step w-screen h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 border-r border-indigo-900/40 text-center relative overflow-hidden">
            <div className="max-w-3xl space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-800/50 px-4 py-1.5 text-xs font-black text-indigo-300 border border-indigo-600">
                <span>Phase 01: Setup</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-black text-amber-300">
                Your Classroom. Your Economy. 🏛️
              </h2>
              <p className="text-base sm:text-lg text-indigo-200 max-w-xl mx-auto">
                Desks materialize as teacher initializes the class code. SparkCoins rain down from above into student wallets in 60 seconds!
              </p>
              
              {/* Simulated 3D Raining SparkCoins Box */}
              <div className="rounded-3xl bg-slate-900/90 border-2 border-indigo-500 p-8 shadow-2xl space-y-4 max-w-md mx-auto relative overflow-hidden backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-300 uppercase">Classroom Initialized</span>
                  <span className="text-xs font-black text-emerald-400">⚡ 100 SparkCoins Distributed</span>
                </div>
                <div className="text-5xl animate-bounce">🪙 🪙 🪙</div>
                <span className="block text-xs font-bold text-amber-400">Join Code: SPARK7</span>
              </div>
            </div>
          </div>

          {/* SECTION 2 (PINNED): 3D AI HUSTLE GENERATOR MOCKUP */}
          <div className="scroll-story-step w-screen h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950 border-r border-indigo-900/40 text-center relative overflow-hidden">
            <div className="max-w-3xl space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-800/50 px-4 py-1.5 text-xs font-black text-purple-300 border border-purple-600">
                <span>Phase 02: AI Brainstorming</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-black text-pink-400">
                AI Generates the Perfect Hustle Idea ⚡
              </h2>
              <p className="text-base sm:text-lg text-purple-200 max-w-xl mx-auto">
                Students input their favorite hobbies, and Sparky AI instantly crafts service descriptions, pricing, and sales pitch slogans!
              </p>

              {/* 3D Phone Screen Mockup with Real-Time Typing */}
              <div className="rounded-3xl bg-slate-900 border-4 border-purple-500 p-6 shadow-2xl max-w-sm mx-auto space-y-3 transform-gpu hover:rotate-2 transition-transform">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">
                  <span>Sparky AI Assistant 🤖</span>
                  <span className="text-emerald-400">Live Typing</span>
                </div>
                <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-800 text-left space-y-1">
                  <span className="text-[10px] font-black uppercase text-purple-300">Generated Hustle:</span>
                  <p className="text-sm font-black text-amber-300 font-mono min-h-[40px]">
                    {typedText}
                    <span className="animate-pulse">|</span>
                  </p>
                </div>
                <div className="flex justify-between items-center text-xs font-black pt-1">
                  <span className="text-slate-300">Price: ⚡ 15 SparkCoins</span>
                  <span className="text-emerald-400">Shop Fee: ⚡ 5</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3 (PINNED): 3D LEADERBOARD & COIN EXPLOSION */}
          <div className="scroll-story-step w-screen h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-slate-950 via-indigo-950 to-amber-950 text-center relative overflow-hidden">
            <div className="max-w-3xl space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-800/50 px-4 py-1.5 text-xs font-black text-amber-300 border border-amber-500">
                <span>Phase 03: Marketplace & Trading</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-black text-amber-400">
                Earn, Compete & Win Together 🏆
              </h2>
              <p className="text-base sm:text-lg text-amber-100 max-w-xl mx-auto">
                Students trade services in the marketplace, climb 15 award category leaderboards, and learn real-world business skills!
              </p>

              {/* 3D Leaderboard Card Mockup */}
              <div className="rounded-3xl bg-slate-900 border-2 border-amber-400 p-6 shadow-2xl max-w-md mx-auto space-y-3 transform-gpu hover:scale-105 transition-transform">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-black text-xs text-amber-300 flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    Hall of Fame Leaderboard
                  </span>
                  <span className="text-xs font-bold text-emerald-400">🥇 Top Entrepreneur</span>
                </div>
                <div className="space-y-2 text-xs font-extrabold text-left">
                  <div className="flex justify-between p-2.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-200">
                    <span>🥇 Alex (Comic Designer)</span>
                    <span className="font-mono text-emerald-400">⚡ 450 SparkCoins</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-800 text-slate-300">
                    <span>🥈 Maya (Math Tutor)</span>
                    <span className="font-mono text-emerald-400">⚡ 380 SparkCoins</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* NEW BENEFIT-FOCUSED STATS SECTION WITH 3D FLIP CARDS            */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-24 bg-slate-950 relative z-10 border-t border-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              The Future of Business Education is Here
            </h2>
            <p className="text-lg text-indigo-300 font-semibold">
              Real skills. Real decisions. Real results.
            </p>
          </div>

          {/* 4 Animated Benefit Cards with 3D Flip Effects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <FlipBenefitCard
              icon="👑"
              title="Every Student is a CEO"
              description="Students design services, calculate shop opening fees, set prices, and run their own mini businesses."
              badgeBg="bg-amber-950 text-amber-300 border border-amber-800"
            />

            <FlipBenefitCard
              icon="🛡️"
              title="Zero Risk, Maximum Learning"
              description="Risk-free simulated economy where kids learn financial choices using classroom SparkCoins."
              badgeBg="bg-emerald-950 text-emerald-300 border border-emerald-800"
            />

            <FlipBenefitCard
              icon="⚡"
              title="AI-Powered Ideas in Seconds"
              description="Sparky AI helps students turn their personal hobbies into real zero-material service listings instantly."
              badgeBg="bg-purple-950 text-purple-300 border border-purple-800"
            />

            <FlipBenefitCard
              icon="🎓"
              title="Teacher Controls Everything"
              description="100% teacher control over listing approvals, market events, loan limits, and classroom economic settings."
              badgeBg="bg-indigo-950 text-indigo-300 border border-indigo-800"
            />

          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FEATURE CARDS SECTION                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-24 bg-slate-900/60 relative z-10 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
              Why Educators & Students Love HustleSpark
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-white">
              Hands-On Financial Literacy & AI Skills
            </p>
            <p className="text-slate-400">
              Built for classrooms ages 9-13. Safe and fun for every student.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl hover:border-amber-400 transition-colors">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-950 text-amber-300 font-bold mb-6 border border-amber-800">
                <Lightbulb className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Smart AI Assistant</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Smart AI Assistant helps students brainstorm age-appropriate service ideas, catchy sales slogans, and fun logos.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl hover:border-indigo-400 transition-colors">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-950 text-indigo-300 font-bold mb-6 border border-indigo-800">
                <DollarSign className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Play Money That Feels Real</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Students earn and spend SparkCoins just like real money in a safe classroom simulation.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl hover:border-emerald-400 transition-colors">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-950 text-emerald-300 font-bold mb-6 border border-emerald-800">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Safe for Schools</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                No passwords or email addresses required. Kids join using a class code, nickname, and secret 4-digit PIN.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 py-8 text-center text-xs text-slate-400 border-t border-slate-900 relative z-10">
        <p>© 2026 HustleSpark Education. All Rights Reserved. Built for classrooms ages 9-13. Safe and fun for every student.</p>
      </footer>

    </div>
  );
}
