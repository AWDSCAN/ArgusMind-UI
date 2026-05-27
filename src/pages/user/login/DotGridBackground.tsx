import { theme } from 'antd';
import React, { useEffect, useRef } from 'react';

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;
  const int = Number.parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

type DotGridBackgroundProps = {
  className?: string;
};

const DotGridBackground: React.FC<DotGridBackgroundProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const frameRef = useRef(0);
  const { token } = theme.useToken();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const spacing = 28;
    const baseRadius = 1.2;
    const primary = token.colorPrimary;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let time = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(width / spacing) + 2;
      rows = Math.ceil(height / spacing) + 2;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const offsetX = (width % spacing) / 2;
      const offsetY = (height % spacing) / 2;
      const { x: mx, y: my } = mouseRef.current;
      const influenceRadius = 140;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = offsetX + col * spacing;
          const y = offsetY + row * spacing;

          const wave =
            Math.sin(col * 0.35 + time * 0.9) *
            Math.cos(row * 0.35 + time * 0.7);
          const pulse = prefersReducedMotion ? 0 : wave * 0.35;

          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const proximity = Math.max(0, 1 - dist / influenceRadius);
          const proximityBoost = proximity * proximity * 1.8;

          const radius = baseRadius + pulse + proximityBoost;
          const alpha = 0.22 + pulse * 0.15 + proximity * 0.55;

          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.6, radius), 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(
            primary,
            proximity > 0.15 ? Math.min(0.85, alpha + 0.2) : alpha,
          );
          ctx.fill();
        }
      }

      if (!prefersReducedMotion) {
        time += 0.016;
      }
      frameRef.current = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    resize();
    frameRef.current = requestAnimationFrame(draw);

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [token.colorPrimary]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
      }}
    />
  );
};

export default DotGridBackground;
