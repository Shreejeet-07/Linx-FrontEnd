import { useEffect, useRef, useCallback } from 'react';
import './SpaceCursor.css';

/*  ═══════════════════════════════════════════════════════════════
    SPACE CURSOR — Asteroid / Star Trail following the pointer
    Uses a full-viewport <canvas> for high-perf rendering.
    Each "particle" is a tiny asteroid/star with:
      • random size, rotation & angular velocity
      • glowing colour from a space palette
      • trail line that fades behind it
      • gravitational pull toward the cursor
    ═══════════════════════════════════════════════════════════════ */

const SPACE_COLORS = [
  '#7B5CF6',   // violet (accent)
  '#A78BFA',   // light violet
  '#F97316',   // orange (meteor)
  '#FB923C',   // warm orange
  '#FBBF24',   // gold
  '#F472B6',   // pink
  '#38BDF8',   // ice blue
  '#22D3EE',   // cyan
  '#FFFFFF',   // white starlight
];

const TRAIL_LENGTH     = 18;     // how many past positions each particle remembers
const PARTICLE_COUNT   = 28;     // total active particles
const SPAWN_RATE       = 3;      // new particles per mouse-move event
const GRAVITY_STRENGTH = 0.12;   // pull toward cursor
const FRICTION         = 0.96;   // velocity decay
const MIN_SIZE         = 1.5;
const MAX_SIZE         = 5;

function randomBetween(a, b) { return a + Math.random() * (b - a); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function createParticle(x, y) {
  const angle = Math.random() * Math.PI * 2;
  const speed = randomBetween(0.8, 3);
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: randomBetween(MIN_SIZE, MAX_SIZE),
    color: pick(SPACE_COLORS),
    opacity: 1,
    rotation: Math.random() * Math.PI * 2,
    angularVel: randomBetween(-0.08, 0.08),
    life: 1,                        // 1 → 0
    decay: randomBetween(0.008, 0.018),
    trail: [],                      // [{x,y}, …]
    shape: Math.random() > 0.4 ? 'asteroid' : 'star',
  };
}

function drawStar(ctx, cx, cy, size, rotation) {
  const spikes = 4;
  const outerR = size;
  const innerR = size * 0.4;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = rotation + (i * Math.PI) / spikes;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawAsteroid(ctx, cx, cy, size, rotation) {
  const points = 6;
  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const a = rotation + (i * Math.PI * 2) / points;
    const jitter = size * randomBetween(0.6, 1);
    const px = cx + Math.cos(a) * jitter;
    const py = cy + Math.sin(a) * jitter;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export default function SpaceCursor() {
  const canvasRef   = useRef(null);
  const particles   = useRef([]);
  const mouse       = useRef({ x: -100, y: -100 });
  const animId      = useRef(null);
  const isTouch     = useRef(false);

  /* ---------- spawn particles on pointer move ---------- */
  const handleMove = useCallback((e) => {
    let clientX, clientY;
    if (e.touches) {
      isTouch.current = true;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      if (isTouch.current) return;       // ignore fake mouse events after touch
      clientX = e.clientX;
      clientY = e.clientY;
    }
    mouse.current = { x: clientX, y: clientY };

    for (let i = 0; i < SPAWN_RATE; i++) {
      if (particles.current.length >= PARTICLE_COUNT) {
        // recycle oldest
        particles.current.shift();
      }
      particles.current.push(
        createParticle(
          clientX + randomBetween(-6, 6),
          clientY + randomBetween(-6, 6),
        ),
      );
    }
  }, []);

  /* ---------- animation loop ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: true });

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouse.current.x;
      const my = mouse.current.y;

      particles.current = particles.current.filter((p) => p.life > 0);

      for (const p of particles.current) {
        /* physics */
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        p.vx += (dx / dist) * GRAVITY_STRENGTH;
        p.vy += (dy / dist) * GRAVITY_STRENGTH;
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.angularVel;
        p.life -= p.decay;
        p.opacity = Math.max(0, p.life);

        /* trail history */
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > TRAIL_LENGTH) p.trail.shift();

        /* ── draw trail ── */
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) {
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
          }
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.35 * p.opacity;
          ctx.globalAlpha = p.opacity * 0.35;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.size * 3;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        /* ── draw particle body ── */
        ctx.globalAlpha = p.opacity;

        if (p.shape === 'star') {
          drawStar(ctx, p.x, p.y, p.size, p.rotation);
        } else {
          drawAsteroid(ctx, p.x, p.y, p.size, p.rotation);
        }

        /* glow layer */
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 4;
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        /* bright core */
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = p.opacity * 0.8;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animId.current = requestAnimationFrame(tick);
    }

    animId.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
    };
  }, [handleMove]);

  return <canvas ref={canvasRef} className="space-cursor-canvas" />;
}
