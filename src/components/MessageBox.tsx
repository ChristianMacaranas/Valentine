import React, { useState, useEffect } from 'react';

interface MessageBoxProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'love' | 'success' | 'info';
  autoClose?: boolean;
  duration?: number;
}

const MessageBox: React.FC<MessageBoxProps> = ({
  isOpen,
  onClose,
  title = "A Message for You 💕",
  message,
  type = 'love',
  autoClose = false,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen, autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  const getGradientColors = () => {
    switch (type) {
      case 'love':
        return 'from-pink-500 via-purple-500 to-indigo-500';
      case 'success':
        return 'from-green-500 via-emerald-500 to-teal-500';
      case 'info':
        return 'from-blue-500 via-cyan-500 to-indigo-500';
      default:
        return 'from-pink-500 via-purple-500 to-indigo-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'love':
        return '💕';
      case 'success':
        return '🎉';
      case 'info':
        return '💝';
      default:
        return '💕';
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Message Box */}
      <div 
        className={`relative max-w-md w-full glass-card p-8 transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Decorative Elements */}
        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r ${getGradientColors()} opacity-60 blur-xl animate-pulse`}></div>
        <div className={`absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-r ${getGradientColors()} opacity-40 blur-xl animate-pulse`}></div>
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${getGradientColors()} mb-4 animate-bounce`}>
            <span className="text-2xl">{getIcon()}</span>
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-2">
            {title}
          </h3>
        </div>
        
        {/* Message Content */}
        <div className="text-center mb-6">
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>
        
        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={handleClose}
            className={`px-8 py-3 bg-gradient-to-r ${getGradientColors()} text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200`}
          >
            Click mo ya babyy💕
          </button>
        </div>
        
        {/* Auto-close indicator */}
        {autoClose && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></div>
              <span>Closes automatically in {duration / 1000}s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBox;
