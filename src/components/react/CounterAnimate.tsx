import { useEffect, useRef, useState } from 'react';

interface StatItem {
  value: number | string;
  suffix?: string;
  label: string;
  isText?: boolean;
}

interface Props {
  stats: StatItem[];
}

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [active, target, duration]);

  return count;
}

function StatCard({ stat, active }: { stat: StatItem; active: boolean }) {
  const numValue = typeof stat.value === 'number' ? stat.value : 0;
  const count = useCountUp(numValue, 1800, active && !stat.isText);

  const displayValue = stat.isText
    ? stat.value
    : `${count}${stat.suffix ?? ''}`;

  return (
    <div style={{ textAlign: 'center', padding: '1.5rem 2rem' }}>
      <div
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 900,
          background: 'linear-gradient(135deg, oklch(0.55 0.28 295), oklch(0.65 0.22 345))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1.1,
          marginBottom: '0.4rem',
        }}
      >
        {displayValue}
      </div>
      <p
        style={{
          fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
          color: 'oklch(0.72 0.015 264)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontWeight: 500,
        }}
      >
        {stat.label}
      </p>
    </div>
  );
}

export default function CounterAnimate({ stats }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0',
        background: 'oklch(0.12 0.03 275 / 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid oklch(0.55 0.28 295 / 0.15)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={i}
          style={{
            flex: '1 1 160px',
            borderRight:
              i < stats.length - 1
                ? '1px solid oklch(0.55 0.28 295 / 0.12)'
                : 'none',
          }}
        >
          <StatCard stat={stat} active={active} />
        </div>
      ))}
    </div>
  );
}
