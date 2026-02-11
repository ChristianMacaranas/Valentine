import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import MusicPlayer from './components/MusicPlayer';
import MessageBox from './components/MessageBox';

function App() {
  const [yesScale, setYesScale] = useState(1);
  const [showResult, setShowResult] = useState(false);
  const [noPos, setNoPos] = useState({ left: '65%', top: '50%' });
  const [noTransform, setNoTransform] = useState('translateY(-50%)');
  const [hearts, setHearts] = useState<Array<{ id: number; left: number; delay: number; size: number }>>([]);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageContent, setMessageContent] = useState({ title: '', message: '', type: 'love' as const });
  
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

    // Preload music for faster autoplay
    const preloadMusic = () => {
      const audio = new Audio();
      audio.src = '/music/iris.mp3';
      audio.preload = 'auto';
      audio.load();
    };
    
    preloadMusic();

    // Generate floating hearts
    const generateHearts = () => {
      const newHearts = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        left: Math.random() * 100,
        delay: Math.random() * 6,
        size: 16 + Math.random() * 16
      }));
      setHearts(prev => [...prev.slice(-20), ...newHearts]);
    };

    generateHearts();
    const heartInterval = setInterval(generateHearts, 3000);

    const handleResize = () => {
      if (canvasRef.current) {
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        canvasRef.current.width = Math.floor(window.innerWidth * dpr);
        canvasRef.current.height = Math.floor(window.innerHeight * dpr);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(heartInterval);
    };
  }, []);

  // Continuous NO button movement to make it impossible to catch
  useEffect(() => {
    if (showResult) return; // Stop moving when game is won
    
    const moveNoRandomly = () => {
      if (!zoneRef.current || !noBtnRef.current || showResult) return;
      
      const z = zoneRef.current.getBoundingClientRect();
      const b = noBtnRef.current.getBoundingClientRect();
      
      // Random position within bounds
      const padding = 15;
      const newLeft = padding + Math.random() * (z.width - b.width - padding * 2);
      const newTop = padding + Math.random() * (z.height - b.height - padding * 2);
      
      setNoPos({ left: `${newLeft}px`, top: `${newTop}px` });
      setNoTransform('none');
    };

    // Move the NO button randomly every 2-3 seconds
    const interval = setInterval(moveNoRandomly, 2000 + Math.random() * 1000);
    
    return () => clearInterval(interval);
  }, [showResult]);

  const fullScreenConfetti = () => {
    if (!confettiInstance.current) return;
    
    const colors = ['#ff6b9d', '#feca57', '#ff9ff3', '#667eea', '#764ba2'];
    const end = Date.now() + 2000;

    const frame = () => {
      confettiInstance.current!({
        particleCount: 15,
        spread: 90,
        startVelocity: 45,
        ticks: 180,
        origin: { x: Math.random(), y: Math.random() * 0.3 },
        colors: colors
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    setTimeout(() => {
      confettiInstance.current!({
        particleCount: 400,
        spread: 140,
        startVelocity: 60,
        ticks: 220,
        origin: { x: 0.5, y: 0.55 },
        colors: colors
      });
    }, 300);

    setTimeout(() => {
      confettiInstance.current!({
        particleCount: 200,
        spread: 100,
        startVelocity: 40,
        origin: { x: 0.2, y: 0.4 },
        colors: colors
      });
    }, 600);

    setTimeout(() => {
      confettiInstance.current!({
        particleCount: 200,
        spread: 100,
        startVelocity: 40,
        origin: { x: 0.8, y: 0.4 },
        colors: colors
      });
    }, 900);
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

    // More aggressive escape with increased distance
    const escapeDistance = 180 + Math.random() * 50; // Random between 180-230px
    let newLeft = (b.left - z.left) + dx * escapeDistance;
    let newTop  = (b.top - z.top) + dy * escapeDistance;

    // Add some randomness to make it harder to predict
    newLeft += (Math.random() - 0.5) * 30;
    newTop += (Math.random() - 0.5) * 30;

    // Ensure button stays within zone boundaries with padding
    const padding = 15;
    newLeft = clamp(newLeft, padding, z.width - b.width - padding);
    newTop  = clamp(newTop, padding, z.height - b.height - padding);

    setNoPos({ left: `${newLeft}px`, top: `${newTop}px` });
    setNoTransform('none');
    growYes();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!noBtnRef.current || showResult) return;
    
    // Trigger music on first user interaction
    const audio = document.querySelector('audio');
    if (audio && audio.paused) {
      audio.play().catch(console.log);
    }
    
    const b = noBtnRef.current.getBoundingClientRect();
    const d = Math.hypot(
      (b.left + b.width / 2) - e.clientX,
      (b.top + b.height / 2) - e.clientY
    );
    
    // Increased detection range and more aggressive escape
    if (d < 200) {
      moveNo(e.clientX, e.clientY);
    }
  };

  const handleYesClick = () => {
    setShowResult(true);
    setTimeout(() => {
      fullScreenConfetti();
    }, 50);
    
    // Show love message
    setMessageContent({
      title: "To my favorite person! 💕",
      message: "Hi babyy, Happy Valentine's Day po! First time ko ya maghimo love letter kaya ayaw man ako pagtinawE ah, HAHAHAHA. gusto ko lang sabihon na sobrang thanful ako na nakilala ko ikaw. dati inaadmire ko lang ikaw sa harayo, di ko maisip na maabot kita sa irog sadi. Salamatunon baby sa intiro na sakripisyo nan sa wara sawa na pagiintindi mo sa ugali na mayOn ako, aram ko na minsan kapagal ko intindihon na tawo dahil sa pagiging avoidant ko, pero maski irog sadto diri mo ako insukuan kaya salamatunon sa intiro babyy, promise mabawi ako saimo. Iloveyousomuchh my favorite person❤️ 🌹",
      type: 'love'
    });
    setShowMessageBox(true);
    
    // Trigger music on first user interaction
    const audio = document.querySelector('audio');
    if (audio && audio.paused) {
      audio.play().catch(console.log);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4 relative overflow-hidden" onClick={() => {
      // Global click handler to trigger music
      const audio = document.querySelector('audio');
      if (audio && audio.paused) {
        audio.play().catch(console.log);
      }
    }}>
      {/* Floating hearts background */}
      <div className="floating-hearts">
        {hearts.map(heart => (
          <div
            key={heart.id}
            className="heart-particle"
            style={{
              left: `${heart.left}%`,
              animationDelay: `${heart.delay}s`,
              fontSize: `${heart.size}px`
            }}
          >
            💕
          </div>
        ))}
      </div>

      <canvas 
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[9999]"
      />
      
      <main className="glass-card w-[min(720px,92vw)] p-12 text-center relative z-10 bounce-in">
        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 opacity-60 blur-xl"></div>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 opacity-60 blur-xl"></div>
        <div className="absolute -bottom-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 opacity-60 blur-xl"></div>
        
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
          <img 
            className="relative w-[min(200px,60vw)] mx-auto mb-6 block rounded-2xl shadow-2xl border-2 border-white/20" 
            src="https://public.youware.com/image/26b7c704-8047-4e29-999b-464909d29923/ez6o4dyfs3.gif" 
            alt="Valentine Art" 
          />
        </div>

        {!showResult ? (
          <>
            <h1 className="shimmer-text text-[clamp(28px,5vw,48px)] mb-12 font-black tracking-tight leading-tight">
              Hi baby, will you be my valentine?
            </h1>
            <section 
              ref={zoneRef}
              className="relative w-full max-w-[500px] h-[180px] mx-auto touch-none"
              onPointerMove={handlePointerMove}
            >
              <button 
                id="yesBtn"
                onClick={handleYesClick}
                style={{ 
                  transform: `translateY(-50%) scale(${yesScale})`,
                  left: '15%',
                  background: 'linear-gradient(135deg, #ff6b9d, #feca57, #ff9ff3)'
                }}
                className="premium-button absolute top-1/2 px-8 py-4 text-xl font-black rounded-full border-none cursor-pointer text-white shadow-2xl select-none transition-all duration-300 hover:scale-110 hover:shadow-3xl animate-pulse border-4 border-white/30"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="drop-shadow-lg">YES</span>
                  {yesScale > 1.2 && <span className="animate-bounce text-2xl">💕</span>}
                  {yesScale > 1.5 && <span className="animate-bounce text-2xl" style={{ animationDelay: '0.3s' }}>💖</span>}
                </span>
              </button>
              <button 
                ref={noBtnRef}
                id="noBtn"
                style={{ 
                  left: noPos.left,
                  top: noPos.top,
                  transform: noTransform,
                  background: 'linear-gradient(135deg, #e0e0e0, #f5f5f5, #ffffff)'
                }}
                className="premium-button absolute top-1/2 px-8 py-4 text-xl font-black rounded-full border-none cursor-pointer shadow-xl select-none transition-all duration-300 hover:scale-105 hover:shadow-2xl border-4 border-gray-300/50"
                onClick={(e) => e.preventDefault()}
              >
                <span className="relative z-10 text-gray-700 drop-shadow-md">NO</span>
              </button>
            </section>

            <div className="mt-12 text-sm font-medium text-gray-500 italic opacity-80 animate-pulse">
              "Pleaseee" 😊
            </div>
          </>
        ) : (
          <section className="mt-[-24px] animate-[bounce-in_0.8s_cubic-bezier(0.68,-0.55,0.265,1.55)]">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl blur-3xl opacity-50 animate-pulse"></div>
              <h2 className="relative shimmer-text text-[clamp(32px,5vw,52px)] mb-8 font-black leading-tight">
                ILOVEYOUSOOMUCHHHH!!!!
              </h2>
            </div>
            
            <div className="relative max-w-sm mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
              <img
                className="relative w-full rounded-2xl shadow-2xl border-2 border-white/20"
                src="src/Screenshot 2026-02-10 184824.png"
                alt="Celebration"
              />
            </div>
            
            <div className="mt-8 flex justify-center gap-4">
              <span className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>💕</span>
              <span className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>💖</span>
              <span className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>💕</span>
              <span className="text-4xl animate-bounce" style={{ animationDelay: '0.6s' }}>💖</span>
              <span className="text-4xl animate-bounce" style={{ animationDelay: '0.8s' }}>💕</span>
            </div>
          </section>
        )}
      </main>
      <MessageBox
        isOpen={showMessageBox}
        onClose={() => setShowMessageBox(false)}
        title={messageContent.title}
        message={messageContent.message}
        type={messageContent.type}
        autoClose={false}
      />
      <MusicPlayer 
        src="/music/iris.mp3" 
        autoPlay={true} 
        loop={true} 
        volume={0.2} 
      />
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
