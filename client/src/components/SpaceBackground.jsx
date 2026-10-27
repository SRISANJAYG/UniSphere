import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import './SpaceBackground.css';

export default function SpaceBackground({ sparse = false }) {
  const canvasRef = useRef(null);
  const [paused, setPaused] = useState(() => {
    try { return localStorage.getItem('unisphere_motion') === 'paused'; }
    catch { return false; }
  });
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const still = paused || reducedMotion;

  useEffect(() => {
    document.documentElement.dataset.spaceMotion = still ? 'paused' : 'playing';
    return () => { delete document.documentElement.dataset.spaceMotion; };
  }, [still]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    let width = 0, height = 0, stars = [], meteors = [];
    let frame = 0, lastTime = 0, elapsed = 0, nextMeteor = 4;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, active: false };
    let ripples = [];
    const movePointer = event => {
      if (still || event.pointerType === 'touch') return;
      pointer.targetX = event.clientX; pointer.targetY = event.clientY;
      if (!pointer.active) { pointer.x = event.clientX; pointer.y = event.clientY; }
      pointer.active = true;
    };
    const leavePointer = () => { pointer.active = false; };
    const ripple = event => {
      if (still || event.button !== 0 || event.target.closest('a,button,input,textarea,select,label,[role="dialog"]')) return;
      ripples.push({x:event.clientX,y:event.clientY,age:0});
      ripples = ripples.slice(-4);
    };
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = sparse ? Math.min(140, Math.max(60, Math.round(width * height / 8500))) : Math.min(95, Math.max(35, Math.round(width * height / 12000)));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        radius: .35 + Math.random() ** 3 * 1.55,
        phase: Math.random() * Math.PI * 2,
        speed: .25 + Math.random() * .65,
        depth: .25 + Math.random() * .75,
        blue: Math.random() > .7,
      }));
      meteors = [];
      draw(0);
    };
    const draw = (delta) => {
      context.clearRect(0, 0, width, height);
      const follow = 1 - Math.exp(-delta * 5);
      pointer.x += (pointer.targetX-pointer.x) * follow;
      pointer.y += (pointer.targetY-pointer.y) * follow;
      pointer.strength += ((pointer.active && !still ? 1 : 0)-pointer.strength) * follow;
      const nearby = [];
      const range = Math.min(220, width * .38);
      if (pointer.strength > .01) {
        const glow=context.createRadialGradient(pointer.x,pointer.y,0,pointer.x,pointer.y,range);
        glow.addColorStop(0,'rgba(105,160,255,'+(.10*pointer.strength)+')');
        glow.addColorStop(.45,'rgba(114,100,240,'+(.035*pointer.strength)+')');
        glow.addColorStop(1,'rgba(70,110,200,0)');
        context.fillStyle=glow;context.fillRect(pointer.x-range,pointer.y-range,range*2,range*2);
      }
      for (const star of stars) {
        if (!still) {
          star.y = (star.y + delta * star.depth * 3) % height;
          star.x = (star.x + delta * star.depth * 1.4) % width;
        }
        const offsetX = (pointer.x-width/2) / width * 34 * star.depth * pointer.strength;
        const offsetY = (pointer.y-height/2) / height * 34 * star.depth * pointer.strength;
        let x=star.x+offsetX,y=star.y+offsetY;
        const distance=Math.hypot(x-pointer.x,y-pointer.y);
        const attraction=Math.max(0,1-distance/range)*pointer.strength;
        x+=(pointer.x-x)*attraction*.055; y+=(pointer.y-y)*attraction*.055;
        if(attraction>.05) nearby.push({x,y,distance,attraction});
        const brightness = Math.min(1,.30 + .55 * (.5 + .5 * Math.sin(elapsed * star.speed + star.phase)) + attraction*.45);
        context.fillStyle = star.blue ? `rgba(139,190,255,${brightness})` : `rgba(228,238,255,${brightness})`;
        context.beginPath();
        context.arc(x, y, star.radius + attraction*.5, 0, Math.PI * 2);
        context.fill();
        if (star.radius > 1.45) {
          context.fillStyle = `rgba(154,202,255,${brightness * .09})`;
          context.beginPath();context.arc(x, y, star.radius * 4, 0, Math.PI * 2);context.fill();
        }
      }
      // Only connect a small, nearby group: predictable work even on large screens.
      nearby.sort((a,b)=>a.distance-b.distance);
      const constellation=nearby.slice(0,14);
      for(let i=0;i<constellation.length;i++){
        const a=constellation[i];
        for(let j=i+1;j<constellation.length;j++){
          const b=constellation[j],length=Math.hypot(a.x-b.x,a.y-b.y);
          if(length>100)continue;
          context.strokeStyle='rgba(155,194,255,'+((1-length/100)*Math.min(a.attraction,b.attraction)*.55)+')';
          context.lineWidth=.7;context.beginPath();context.moveTo(a.x,a.y);context.lineTo(b.x,b.y);context.stroke();
        }
      }
      for(const wave of ripples){
        wave.age+=delta;const radius=wave.age*155;
        context.strokeStyle='rgba(155,204,255,'+(Math.max(0,1-wave.age/1.5)*.32)+')';
        context.lineWidth=1;context.beginPath();context.arc(wave.x,wave.y,radius,0,Math.PI*2);context.stroke();
      }
      ripples=ripples.filter(wave=>wave.age<1.5);
      if (!still && elapsed > nextMeteor) {
        meteors.push({ x: width * (.25 + Math.random() * .8), y: Math.random() * height * .3, age: 0 });
        nextMeteor = elapsed + 6 + Math.random() * 8;
      }
      for (const meteor of meteors) {
        meteor.age += delta;
        meteor.x -= delta * 420;meteor.y += delta * 230;
        const fade = Math.max(0, Math.sin(Math.min(1, meteor.age / 1.3) * Math.PI));
        const trail = context.createLinearGradient(meteor.x, meteor.y, meteor.x + 100, meteor.y - 55);
        trail.addColorStop(0, `rgba(215,237,255,${fade * .8})`);trail.addColorStop(1, 'rgba(140,185,255,0)');
        context.strokeStyle = trail;context.lineWidth = 1.2;context.beginPath();context.moveTo(meteor.x, meteor.y);context.lineTo(meteor.x + 100, meteor.y - 55);context.stroke();
      }
      meteors = meteors.filter(meteor => meteor.age < 1.3);
    };
    const animate = time => {
      const delta = lastTime ? Math.min((time - lastTime) / 1000, .05) : 0;
      lastTime = time;elapsed += delta;draw(delta);
      frame = requestAnimationFrame(animate);
    };
    const start = () => {
      cancelAnimationFrame(frame);lastTime = 0;
      if (!still && !document.hidden) frame = requestAnimationFrame(animate);
      else draw(0);
    };
    resize();start();
    window.addEventListener('pointermove',movePointer,{passive:true});
    document.documentElement.addEventListener('pointerleave',leavePointer);
    window.addEventListener('blur',leavePointer);
    window.addEventListener('pointerdown',ripple,{passive:true});
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', start);
    return () => {
      window.removeEventListener('pointermove',movePointer);
      document.documentElement.removeEventListener('pointerleave',leavePointer);
      window.removeEventListener('blur',leavePointer);
      window.removeEventListener('pointerdown',ripple);
      cancelAnimationFrame(frame);window.removeEventListener('resize', resize);document.removeEventListener('visibilitychange', start);};
  }, [still, sparse]);

  const toggleMotion = () => {
    setPaused(value => {
      try { localStorage.setItem('unisphere_motion', value ? 'playing' : 'paused'); } catch { /* Preferences are optional. */ }
      return !value;
    });
  };
  return <>
    <div className="space-background" data-still={still} data-landing={sparse} aria-hidden="true">
      <div className="space-nebula nebula-blue"/><div className="space-nebula nebula-violet"/>
      <canvas ref={canvasRef}/><div className="space-vignette"/>
    </div>
    <button type="button" className="space-motion-toggle" onClick={toggleMotion} disabled={reducedMotion} aria-pressed={paused} aria-label={reducedMotion ? 'Animation disabled by reduced motion preference' : paused ? 'Resume space animation' : 'Pause space animation'} title={reducedMotion ? 'Reduced motion enabled' : paused ? 'Resume space animation' : 'Pause space animation'}>
      {still ? <Play size={12}/> : <Pause size={12}/>}<span>{reducedMotion ? 'Reduced motion' : paused ? 'Motion paused' : 'Space is alive'}</span><i/>
    </button>
  </>;
}
