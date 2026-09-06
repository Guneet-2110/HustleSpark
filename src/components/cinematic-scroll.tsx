'use client';
import { useEffect } from 'react';

export function CinematicScroll() {
  useEffect(() => {
    // Scroll-driven parallax
    const handleScroll = () => {
      const sy = window.scrollY;

      // Nebula parallax
      const nebula = document.querySelector('.nebula-layer') as HTMLElement;
      if (nebula) {
        nebula.style.transform = `scale(1.2) translateY(${sy * 0.18}px)`;
      }

      // Coin parallax + depth
      const coin = document.querySelector('.coin-layer') as HTMLElement;
      if (coin) {
        coin.style.marginTop = `${-sy * 0.08}px`;
      }

      // Sphere parallax
      const sphere = document.querySelector('.sphere-layer') as HTMLElement;
      if (sphere) {
        sphere.style.transform = `scale(${1 + sy * 0.0002}) translateY(${-sy * 0.12}px)`;
      }

      // City parallax
      const city = document.querySelector('.city-bg-layer') as HTMLElement;
      if (city) {
        const citySection = document.querySelector('.city-section-cinematic') as HTMLElement;
        if (citySection) {
          const rel = sy - citySection.offsetTop;
          city.style.transform = `scale(1.1) translateY(${rel * 0.14}px)`;
        }
      }

      // Scroll reveal
      document.querySelectorAll('.cin-reveal').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.88) {
          el.classList.add('visible');
        }
      });
    };

    // Mouse parallax on hero
    const handleMouse = (e: MouseEvent) => {
      const mx = (e.clientX / window.innerWidth - 0.5) * 2;
      const my = (e.clientY / window.innerHeight - 0.5) * 2;

      const nebula = document.querySelector('.nebula-layer') as HTMLElement;
      if (nebula) {
        nebula.style.marginLeft = `${mx * 15}px`;
        nebula.style.marginTop = `${my * 10}px`;
      }

      const coin = document.querySelector('.coin-layer') as HTMLElement;
      if (coin) {
        const baseTransform = coin.style.transform || '';
        coin.style.marginLeft = `${mx * 12}px`;
      }

      const sphere = document.querySelector('.sphere-layer') as HTMLElement;
      if (sphere) {
        sphere.style.marginLeft = `${mx * -8}px`;
        sphere.style.marginTop = `${my * -6}px`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouse, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return null;
}
