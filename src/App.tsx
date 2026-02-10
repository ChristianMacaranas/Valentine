import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';

function App() {
  const [yesScale, setYesScale] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [noPos, setNoPos] = useState({ left: '62%', top: '50%' });
  const [noTransform, setNoTransform] = useState('translateY(-50%)');
  
  const zoneRef = useRef<HTMLDivElement>(null);
  const noBtnRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiInstance = useRef<confetti.CreateTypes | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvasRef.current.width = Math.floor(window.innerWidth * dpr);
      canvasRef.current.height = Math.floor(window.innerHeight * dpr);
      
      confettiInstance.current = confetti.create(canvasRef.current, {
        resize: false,
        useWorker: true
      });
    }

    const handleResize = () => {
      if (canvasRef.current) {
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        canvasRef.current.width = Math.floor(window.innerWidth * dpr);
        canvasRef.current.height = Math.floor(window.innerHeight * dpr);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fullScreenConfetti = () => {
    if (!confettiInstance.current) return;
    
    const end = Date.now() + 1600;

    const frame = () => {
      confettiInstance.current!({
        particleCount: 12,
        spread: 90,
        startVelocity: 45,
        ticks: 180,
        origin: { x: Math.random(), y: Math.random() * 0.3 }
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    setTimeout(() => {
      confettiInstance.current!({
        particleCount: 300,
        spread: 140,
        startVelocity: 60,
        ticks: 220,
        origin: { x: 0.5, y: 0.55 }
      });
    }, 300);
  };

  const growYes = () => {
    setYesScale(prev => Math.min(2.2, prev + 0.1));
  };

  const clamp = (n: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, n));
  };

  const moveNo = (px: number, py: number) => {
    if (!zoneRef.current || !noBtnRef.current) return;
    
    const z = zoneRef.current.getBoundingClientRect();
    const b = noBtnRef.current.getBoundingClientRect();

    let dx = (b.left + b.width / 2) - px;
    let dy = (b.top + b.height / 2) - py;
    let mag = Math.hypot(dx, dy) || 1;
    dx /= mag;
    dy /= mag;

    let newLeft = (b.left - z.left) + dx * 150;
    let newTop  = (b.top - z.top) + dy * 150;

    newLeft = clamp(newLeft, 0, z.width - b.width);
    newTop  = clamp(newTop, 0, z.height - b.height);

    setNoPos({ left: `${newLeft}px`, top: `${newTop}px` });
    setNoTransform('none');
    growYes();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!noBtnRef.current || showResult) return;
    
    const b = noBtnRef.current.getBoundingClientRect();
    const d = Math.hypot(
      (b.left + b.width / 2) - e.clientX,
      (b.top + b.height / 2) - e.clientY
    );
    if (d < 140) moveNo(e.clientX, e.clientY);
  };

  const handleYesClick = () => {
    setShowResult(true);
    setTimeout(() => {
      fullScreenConfetti();
    }, 50);
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[9999]"
      />
      <main className="w-[min(720px,92vw)] p-[48px_32px] bg-[var(--card)] backdrop-blur-[10px] rounded-[32px] text-center shadow-[0_20px_70px_rgba(0,0,0,0.12)]">
        <img 
          className="w-[min(240px,70vw)] mx-auto mb-[24px] block drop-shadow-[0_10px_14px_rgba(0,0,0,0.1)]" 
          src="https://public.youware.com/image/26b7c704-8047-4e29-999b-464909d29923/ez6o4dyfs3.gif" 
          alt="Valentine Art" 
        />

        <h1 
          style={{ fontFamily: 'system-ui, sans-serif' }}
          className="text-[clamp(26px,4vw,44px)] mb-[48px] mt-[8px] font-black tracking-tight text-[#111827] whitespace-nowrap"
        >
          angela will you be my valentine?
        </h1>

        {!showResult ? (
          <>
            <section 
              ref={zoneRef}
              className="relative w-[min(520px,92%)] h-[120px] mx-auto touch-none"
              onPointerMove={handlePointerMove}
            >
              <button 
                id="yesBtn"
                onClick={handleYesClick}
                style={{ 
                  transform: `translateY(-50%) scale(${yesScale})`,
                  left: '20%'
                }}
                className="absolute top-1/2 p-[14px_32px] text-[20px] font-bold rounded-full border-none cursor-pointer shadow-[0_8px_20px_rgba(255,59,122,0.3)] select-none transition-[transform,background] duration-150 bg-[var(--yes)] text-white hover:bg-[var(--yesHover)]"
              >
                Yes
              </button>
              <button 
                ref={noBtnRef}
                id="noBtn"
                style={{ 
                  left: noPos.left,
                  top: noPos.top,
                  transform: noTransform
                }}
                className="absolute p-[14px_32px] text-[20px] font-bold rounded-full border-none cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.05)] select-none transition-[transform,background] duration-150 bg-[#f3f4f6] text-[#4b5563]"
                onClick={(e) => e.preventDefault()}
              >
                No
              </button>
            </section>

            <div className="mt-[40px] text-[14px] font-medium text-[#6b7280] opacity-80">
              "Pleaseee"
            </div>
          </>
        ) : (
          <section className="mt-[-24px] animate-[pop_0.35s_ease]">
            <h2 
              style={{ fontFamily: 'system-ui, sans-serif' }}
              className="text-[clamp(28px,4.5vw,42px)] mb-[24px] font-black text-[#111827]"
            >
              Thanyouusomuchh babyyy!!!!
            </h2>
            <img
              className="w-[min(320px,80vw)] mx-auto block rounded-lg shadow-lg"
              src="src/Screenshot 2026-02-10 184824.png"
              alt="Celebration"
            />
          </section>
        )}
      </main>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pop {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}} />
    </div>
  );
}

export default App;
