
import React, { useEffect, useRef } from 'react';

const NeuralBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;
    
    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      
      // Safety check for mobile orientation/resize reflows
      if (width === 0 || height === 0) return;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    setCanvasSize();

    const nodes: any[] = [];
    const nodeCount = Math.floor((width * height) / 7000); 
    const connectionDist = 180;
    const mouse = { x: -1000, y: -1000 };

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.5 + 0.5,
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

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    const animate = () => {
      if (!ctx || width === 0 || height === 0) return;
      ctx.clearRect(0, 0, width, height);
      
      nodes.forEach((node, i) => {
        // Kinetic Drift
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.025;

        // Reactive Borders
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Mouse Influence (Vortex Attraction)
        const mdx = mouse.x - node.x;
        const mdy = mouse.y - node.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 250) {
          const force = (250 - mdist) / 250;
          node.x += mdx * force * 0.015;
          node.y += mdy * force * 0.015;
        }

        const glow = (Math.sin(node.pulse) + 1) / 2;
        ctx.fillStyle = `rgba(129, 140, 248, ${0.2 + glow * 0.4})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size + (glow * 1.5), 0, Math.PI * 2);
        ctx.fill();

        // Synaptic Connections
        for (let j = i + 1; j < nodes.length; j++) {
          const target = nodes[j];
          const dx = node.x - target.x;
          const dy = node.y - target.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.22;
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();

            // Interactive Pulse Beam
            if (glow > 0.92 && dist < 100) {
               ctx.strokeStyle = `rgba(168, 85, 247, ${alpha * 2})`;
               ctx.lineWidth = 1;
               ctx.stroke();
            }
          }
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" style={{ width: '100vw', height: '100vh', background: 'transparent' }} />;
};

export default NeuralBackground;