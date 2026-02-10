
import React, { useEffect, useRef } from 'react';

const NeuralBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    // Cap DPR to 2 for mobile performance, prevent huge canvas contexts
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    setCanvasSize();

    const isMobile = width < 768;
    const nodes: any[] = [];
    // Significantly reduce count on mobile to prevent crashes
    const nodeCount = isMobile ? 40 : Math.floor((width * height) / 9000);
    const connectionDist = isMobile ? 120 : 180;
    const mouse = { x: -1000, y: -1000 };

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.2 + 0.5,
        pulse: Math.random() * Math.PI,
        energy: Math.random()
      });
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const onResize = () => {
      setCanvasSize();
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.02;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        const mdx = mouse.x - node.x;
        const mdy = mouse.y - node.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 200) {
          const force = (200 - mdist) / 200;
          node.x += mdx * force * 0.01;
          node.y += mdy * force * 0.01;
        }

        const glow = (Math.sin(node.pulse) + 1) / 2;
        ctx.fillStyle = `rgba(129, 140, 248, ${0.1 + glow * 0.3})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size + (glow * 1), 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const target = nodes[j];
          const dx = node.x - target.x;
          const dy = node.y - target.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.15;
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" style={{ width: '100vw', height: '100vh', background: 'transparent' }} />;
};

export default NeuralBackground;
