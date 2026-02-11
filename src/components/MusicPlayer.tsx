import React, { useState, useRef, useEffect } from 'react';

interface MusicPlayerProps {
  src: string;
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  src, 
  autoPlay = false, 
  loop = true, 
  volume = 0.3 
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
    audio.loop = loop;

    // Enhanced error handling and logging
    audio.addEventListener('error', (e) => {
      console.error('Audio loading error:', e);
      console.log('Audio src:', src);
    });

    audio.addEventListener('loadstart', () => {
      console.log('🎵 Audio loading started:', src);
    });

    audio.addEventListener('canplay', () => {
      console.log('✅ Audio ready to play:', src);
      if (autoPlay && !isPlaying) {
        attemptAutoplay();
      }
    });

    audio.addEventListener('loadeddata', () => {
      console.log('📊 Audio data loaded:', src);
      if (autoPlay && !isPlaying) {
        attemptAutoplay();
      }
    });

    // Advanced autoplay strategies
    const attemptAutoplay = async () => {
      if (!autoPlay || isPlaying) return;
      
      const strategies = [
        // Strategy 1: Direct play attempt
        () => audio.play(),
        
        // Strategy 2: Muted play then unmute
        async () => {
          audio.muted = true;
          await audio.play();
          await new Promise(resolve => setTimeout(resolve, 100));
          audio.muted = false;
        },
        
        // Strategy 3: Low volume play
        async () => {
          const originalVolume = audio.volume;
          audio.volume = 0.01;
          await audio.play();
          await new Promise(resolve => setTimeout(resolve, 200));
          audio.volume = originalVolume;
        },
        
        // Strategy 4: Create user gesture simulation
        async () => {
          const clickEvent = new MouseEvent('click', { bubbles: true });
          document.dispatchEvent(clickEvent);
          await new Promise(resolve => setTimeout(resolve, 100));
          return audio.play();
        }
      ];

      for (let i = 0; i < strategies.length; i++) {
        try {
          console.log(`🎯 Attempting autoplay strategy ${i + 1}`);
          await strategies[i]();
          console.log('🎉 Autoplay successful with strategy', i + 1);
          setIsPlaying(true);
          return;
        } catch (error) {
          console.log(`❌ Strategy ${i + 1} failed:`, error instanceof Error ? error.message : String(error));
          if (i === strategies.length - 1) {
            console.log('🔄 All autoplay strategies failed, setting up user interaction listeners');
            setupUserInteractionListeners();
          }
        }
      }
    };

    const setupUserInteractionListeners = () => {
      const interactions = ['click', 'touchstart', 'keydown', 'mousedown', 'pointerdown'];
      
      const handleInteraction = async () => {
        if (!isPlaying && audio.paused) {
          try {
            await audio.play();
            console.log('🎵 Music started via user interaction');
            setIsPlaying(true);
            // Remove listeners after successful play
            interactions.forEach(event => {
              document.removeEventListener(event, handleInteraction);
            });
          } catch (error) {
            console.log('❌ Failed to play on interaction:', error instanceof Error ? error.message : String(error));
          }
        }
      };

      interactions.forEach(event => {
        document.addEventListener(event, handleInteraction, { once: false });
      });
    };

    // Multiple timing attempts
    const scheduleAutoplayAttempts = () => {
      const delays = [0, 100, 500, 1000, 2000, 3000];
      delays.forEach(delay => {
        setTimeout(() => {
          if (autoPlay && !isPlaying) {
            attemptAutoplay();
          }
        }, delay);
      });
    };

    if (autoPlay) {
      scheduleAutoplayAttempts();
    }

    // Visibility change handling
    const handleVisibilityChange = () => {
      if (!document.hidden && autoPlay && !isPlaying) {
        setTimeout(() => attemptAutoplay(), 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoPlay, loop, volume, isMuted, src, isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => {
        console.log('Play failed:', error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <>
      <audio ref={audioRef} src={src} preload="auto" />
      
      {/* Music Control Button */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-200 group"
          title={isPlaying ? "Pause Music" : "Play Music"}
        >
          {isPlaying ? (
            <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
        
        <button
          onClick={toggleMute}
          className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all duration-200"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.91-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          )}
        </button>
      </div>
    </>
  );
};

export default MusicPlayer;
