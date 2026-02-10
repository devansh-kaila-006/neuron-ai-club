
import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

interface DecryptedTextProps {
  text: string;
  className?: string;
  speed?: number; // Speed of the reveal (lower is faster)
  scrambleSpeed?: number; // Speed of glyph flickering
  once?: boolean;
}

const glyphs = '01X/_<>[]{}—=+*^?#';

const DecryptedText: React.FC<DecryptedTextProps> = ({ 
  text, 
  className, 
  speed = 1.5, 
  scrambleSpeed = 30,
  once = true 
}) => {
  const [displayText, setDisplayText] = useState<string>(text);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, margin: "-5%" });
  // Fix: Providing explicit initial value 'undefined' to satisfy TypeScript requirements in environments that do not support zero-argument useRef calls.
  const requestRef = useRef<number | undefined>(undefined);
  // Fix: Providing explicit initial value 'undefined' to satisfy TypeScript requirements in environments that do not support zero-argument useRef calls.
  const startTimeRef = useRef<number | undefined>(undefined);

  // Handle the "Wave" Reveal
  useEffect(() => {
    if (isInView && !isFinished) {
      const duration = text.length * speed * 50; // Total duration based on length
      
      const animate = (time: number) => {
        if (!startTimeRef.current) startTimeRef.current = time;
        const progress = Math.min((time - (startTimeRef.current as number)) / duration, 1);
        
        // Use a power function for a smoother "ease-in" reveal wave
        const easedProgress = Math.pow(progress, 1.2);
        const currentReveal = Math.floor(easedProgress * text.length);
        
        setRevealedCount(currentReveal);

        if (progress < 1) {
          requestRef.current = requestAnimationFrame(animate);
        } else {
          setIsFinished(true);
        }
      };

      requestRef.current = requestAnimationFrame(animate);
      return () => {
        if (requestRef.current !== undefined) {
          cancelAnimationFrame(requestRef.current);
        }
      };
    }
  }, [isInView, text, speed, isFinished]);

  // Handle the Glyph Flickering
  useEffect(() => {
    if (isInView && !isFinished) {
      const interval = setInterval(() => {
        setDisplayText(
          text
            .split('')
            .map((char, i) => {
              if (i < revealedCount) return text[i];
              if (char === ' ') return ' ';
              return glyphs[Math.floor(Math.random() * glyphs.length)];
            })
            .join('')
        );
      }, scrambleSpeed);

      return () => clearInterval(interval);
    } else if (isFinished) {
      setDisplayText(text);
    }
  }, [isInView, isFinished, revealedCount, text, scrambleSpeed]);

  return (
    <span 
      ref={ref} 
      className={`${className} inline whitespace-pre-wrap font-mono transition-colors duration-500`}
    >
      {displayText.split('').map((char, i) => {
        const isResolved = isFinished || i < revealedCount;
        const isGlitching = !isResolved && i < revealedCount + 3;

        return (
          <span 
            key={i} 
            className={`
              transition-all duration-200
              ${isResolved ? '' : 'text-indigo-500/40 opacity-70'}
              ${isGlitching ? 'text-indigo-400 opacity-100 blur-[0.3px]' : ''}
            `}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
};

export default DecryptedText;
