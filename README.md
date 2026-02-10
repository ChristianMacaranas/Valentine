# Valentine's Day Interactive Page 💕

A romantic and interactive "Will you be my Valentine?" page built with React, TypeScript, and Tailwind CSS.

## Features

- **Interactive Buttons**: The "No" button playfully runs away when you try to hover over it, while the "Yes" button grows larger with each escape
- **Confetti Celebration**: Full-screen confetti animation with heart-shaped particles when "Yes" is clicked
- **Floating Hearts**: Animated floating heart emojis in the background for a romantic atmosphere
- **Glassmorphism Design**: Modern frosted glass effect with beautiful gradient backgrounds
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Smooth Animations**: Heartbeat effects, floating animations, and smooth transitions

## Technical Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom CSS animations
- **Build Tool**: Vite
- **Animations**: CSS Keyframes + canvas-confetti library
- **State Management**: React hooks (useState, useEffect, useRef)

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`

### Production Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## How It Works

1. **No Button Behavior**: Uses mouse position tracking and random positioning to make the "No" button escape
2. **Yes Button Growth**: Each time the "No" button escapes, the "Yes" button grows by 20% (up to 3x original size)
3. **Confetti Animation**: Uses the canvas-confetti library to create heart-shaped confetti from multiple directions
4. **Floating Hearts**: Generates random floating heart emojis with varying sizes and animation durations
5. **Glassmorphism**: Achieved using backdrop-filter and semi-transparent backgrounds

## Customization

- **Colors**: Modify the gradient colors in `src/index.css` under the `:root` selector
- **Animations**: Adjust animation durations and keyframes in the CSS files
- **Text**: Edit the Valentine's message in `src/App.tsx`
- **Confetti**: Customize confetti colors and patterns in the `handleYesClick` function

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Android Chrome)

## License

This project is open source and available under the MIT License.

---

Made with ❤️ for Valentine's Day
