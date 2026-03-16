import * as React from 'react';

export default function DecorativeEffects() {
  return (
    <>
      <StarfieldBackground />
      <GlobalMouseGlow />
    </>
  );
}

function GlobalMouseGlow() {
  const glowRef = React.useRef(null);

  React.useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReducedMotion || isCoarsePointer) return;

    const glow = glowRef.current;
    if (!glow) return;

    let rafId = null;
    let nextX = window.innerWidth * 0.5;
    let nextY = window.innerHeight * 0.35;

    const setGlowPosition = (x, y) => {
      glow.style.transform = `translate3d(${x - 250}px, ${y - 250}px, 0)`;
    };

    const updateGlow = () => {
      rafId = null;
      setGlowPosition(nextX, nextY);
    };

    const handleMouseMove = (event) => {
      nextX = event.clientX;
      nextY = event.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(updateGlow);
      }
    };

    setGlowPosition(window.innerWidth * 0.5, window.innerHeight * 0.35);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <div ref={glowRef} className="global-mouse-glow" aria-hidden="true" />;
}

function StarfieldBackground() {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReducedMotion || isCoarsePointer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = [];
    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 90 : 160;

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    let animationFrame;
    let isVisible = document.visibilityState === 'visible';

    function animate() {
      if (!isVisible) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.opacity += star.twinkleSpeed;
        if (star.opacity > 1 || star.opacity < 0.3) {
          star.twinkleSpeed *= -1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    }

    animate();

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
      if (isVisible) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationFrame);
      }
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
