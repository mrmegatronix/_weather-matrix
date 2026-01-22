import React, { useEffect, useRef } from 'react';

interface WeatherBackgroundProps {
  weatherCode: number;
  isDay: boolean;
  sunrise?: string;
  sunset?: string;
  precipitation?: number;
}

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ weatherCode, isDay, sunrise, sunset, precipitation = 0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    let stars: any[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('resize', resize);
    resize();

    // Determine type of effect
    const isRainCode = (weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82);
    // Force rain if precipitation is recorded, even if code is Cloudy
    const isRain = isRainCode || (precipitation > 0 && weatherCode < 70); 
    
    const isSnow = (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86);
    const isCloudy = weatherCode === 2 || weatherCode === 3 || weatherCode === 45;
    
    // Init Weather Particles
    const initParticles = () => {
      particles = [];
      const particleCount = isRain ? 1200 : isSnow ? 400 : 0;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: Math.random() * 5 + 2, // Base speed
          length: Math.random() * 30 + 15, // Longer trails for rain
          opacity: Math.random() * 0.5 + 0.1,
          size: Math.random() * 3,
        });
      }
    };

    // Init Stars (only for night)
    const initStars = () => {
        stars = [];
        if (!isDay && !isRain && !isSnow && !isCloudy) { 
            for(let i = 0; i < 200; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height * 0.85, // Stars stay above horizon roughly 
                    size: Math.random() * 1.2 + 0.1, 
                    opacity: Math.random() * 0.5 + 0.1,
                    twinkleSpeed: Math.random() * 0.02 + 0.005
                });
            }
        }
    };

    initParticles();
    initStars();

    const drawCelestialBody = () => {
       if (!sunrise || !sunset) return;

       const now = new Date().getTime();
       const sunriseTime = new Date(sunrise).getTime();
       const sunsetTime = new Date(sunset).getTime();
       
       let percent = 0; 
       
       if (isDay) {
         percent = (now - sunriseTime) / (sunsetTime - sunriseTime);
       } else {
         const msInDay = 86400000;
         if (now > sunsetTime) {
             const progressIntoNight = now - sunsetTime;
             percent = progressIntoNight / (msInDay / 2); 
         } else {
             const timeUntilSunrise = sunriseTime - now;
             percent = 1 - (timeUntilSunrise / (msInDay / 2));
         }
       }

       const safePercent = Math.max(0, Math.min(1, percent));
       
       // TRAJECTORY LOGIC:
       // Rise on RIGHT (width), Set on LEFT (0)
       const x = width * (1 - safePercent); 

       // Horizon Logic:
       // Horizon is top of footer. Footer is approx 15% of screen height at bottom.
       // So Horizon Y is approx 0.85 * height.
       const horizonY = height * 0.85;
       const zenithY = height * 0.15; // Peak height in sky
       
       // Parabolic arc
       const y = horizonY - Math.sin(safePercent * Math.PI) * (horizonY - zenithY);

       ctx.save();
       
       if (isDay) {
          const sunRadius = 70;
          const glow = ctx.createRadialGradient(x, y, sunRadius, x, y, sunRadius * 6);
          glow.addColorStop(0, 'rgba(255, 200, 50, 0.4)');
          glow.addColorStop(0.5, 'rgba(255, 150, 50, 0.1)');
          glow.addColorStop(1, 'rgba(255, 150, 50, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, sunRadius * 6, 0, Math.PI * 2);
          ctx.fill();

          const core = ctx.createRadialGradient(x, y, 0, x, y, sunRadius);
          core.addColorStop(0, '#FFFFFF');
          core.addColorStop(0.3, '#FFFACD');
          core.addColorStop(1, '#FFD700');
          ctx.fillStyle = core;
          ctx.shadowColor = '#FFA500';
          ctx.shadowBlur = 50;
          ctx.beginPath();
          ctx.arc(x, y, sunRadius, 0, Math.PI * 2);
          ctx.fill();
       } else {
          const moonRadius = 50;
          const glow = ctx.createRadialGradient(x, y, moonRadius, x, y, moonRadius * 4);
          glow.addColorStop(0, 'rgba(200, 220, 255, 0.2)');
          glow.addColorStop(1, 'rgba(200, 220, 255, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, moonRadius * 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#F0F4F8';
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(x, y, moonRadius, 0, Math.PI * 2);
          ctx.fill();
       }
       ctx.restore();
    };

    const drawBackground = () => {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        
        if (isDay) {
            if (isCloudy || isRain) {
                gradient.addColorStop(0, '#3a4b5c');
                gradient.addColorStop(1, '#6a7b8c');
            } else {
                gradient.addColorStop(0, '#1565C0'); 
                gradient.addColorStop(0.5, '#42A5F5'); 
                gradient.addColorStop(1, '#90CAF9'); 
            }
        } else {
            gradient.addColorStop(0, '#0D1117'); 
            gradient.addColorStop(0.4, '#1A237E'); 
            gradient.addColorStop(1, '#311B92'); 
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    };

    const drawStars = () => {
        if (isDay) return;
        
        stars.forEach(star => {
            ctx.globalAlpha = Math.abs(Math.sin(Date.now() * star.twinkleSpeed + star.x));
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    };

    const drawParticles = () => {
         particles.forEach((p) => {
            ctx.beginPath();
            if (isRain) {
                ctx.strokeStyle = `rgba(174, 194, 224, ${p.opacity})`;
                ctx.lineWidth = 1.5;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x, p.y + p.length);
                ctx.stroke();
                
                // RESTORED TO REALISTIC SPEED (approx 1.5x - 2x base speed)
                p.y += p.speed * 2; 
                if (p.y > height) p.y = -p.length;
            } else if (isSnow) {
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                
                p.y += p.speed / 2;
                p.x += Math.sin(p.y / 50) * 0.5;
                if (p.y > height) p.y = -5;
            }
        });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      drawBackground();
      drawStars(); 
      drawCelestialBody();
      drawParticles(); 

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [weatherCode, isDay, sunrise, sunset, precipitation]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full"
    />
  );
};

export default WeatherBackground;