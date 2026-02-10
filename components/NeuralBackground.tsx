
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
    let dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap DPR for performance
    
    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      if (width === 0 || height === 0) return;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    setCanvasSize();

    const nodes: any[] = [];
    // Adjust density based on screen size
    const nodeCount = Math.floor((width * height) / 8000); 
    const connectionDist = 160;
    const mouse = { x: -1000, y: -1000 };

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 1.2 + 0.4,
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
      if (!ctx || width === 0 || height === 0) return;
      ctx.clearRect(0, 0, width, height);
      
      const nodeLength = nodes.length;
      for (let i = 0; i < nodeLength; i++) {
        const node = nodes[i];
        
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.02;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Optimized mouse influence
        const mdx = mouse.x - node.x;
        const mdy = mouse.y - node.y;
        const mdistSq = mdx * mdx + mdy * mdy;
        if (mdistSq < 62500) { // 250 * 250
          const mdist = Math.sqrt(mdistSq);
          const force = (250 - mdist) / 250;
          node.x += mdx * force * 0.01;
          node.y += mdy * force * 0.01;
        }

        const glow = (Math.sin(node.pulse) + 1) / 2;
        ctx.fillStyle = `rgba(129, 140, 248, ${0.15 + glow * 0.3})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size + (glow * 1.2), 0, Math.PI * 2);
        ctx.fill();

        // Optimized synaptic connections
        for (let j = i + 1; j < nodeLength; j++) {
          const target = nodes[j];
          const dx = node.x - target.x;
          const dy = node.y - target.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 25600) { // 160 * 160
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / connectionDist) * 0.18;
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();

            if (glow > 0.94 && dist < 80) {
               ctx.strokeStyle = `rgba(168, 85, 247, ${alpha * 1.5})`;
               ctx.lineWidth = 0.8;
               ctx.stroke();
            }
          }
        }
      }

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
