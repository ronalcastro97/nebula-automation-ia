import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  speed: number;
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animId: number;
    let mouseX = width / 2;
    let mouseY = height / 2;

    canvas.width = width;
    canvas.height = height;

    // Create stars
    const STAR_COUNT = Math.floor((width * height) / 8000);
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random(),
      size: Math.random() * 1.8 + 0.3,
      opacity: Math.random() * 0.7 + 0.15,
      speed: Math.random() * 0.15 + 0.03,
    }));

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const offsetX = (mouseX / width - 0.5) * 20;
      const offsetY = (mouseY / height - 0.5) * 20;

      stars.forEach((star) => {
        const parallax = star.z;
        const x = star.x + offsetX * parallax * 0.5;
        const y = star.y + offsetY * parallax * 0.5;

        ctx.beginPath();
        ctx.arc(x, y, star.size * (0.5 + star.z * 0.5), 0, Math.PI * 2);

        // Color variation: some cyan, some violet, mostly white
        const rand = star.z;
        let color: string;
        if (rand < 0.15) {
          color = `oklch(0.72 0.16 200 / ${star.opacity})`;
        } else if (rand < 0.28) {
          color = `oklch(0.68 0.18 295 / ${star.opacity})`;
        } else {
          color = `oklch(0.93 0.01 264 / ${star.opacity})`;
        }

        ctx.fillStyle = color;
        ctx.fill();

        // Drift
        star.y -= star.speed;
        if (star.y < -2) star.y = height + 2;
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}
