// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        lobster: ['Lobster', 'cursive'],
      },
      animation: {
        'pot-bubble': 'pot-bubble 1s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },
      keyframes: {
        'pot-bubble': {
          '0%, 100%': { 
            transform: 'translateY(0) scale(1)', 
            opacity: '0.8' 
          },
          '50%': { 
            transform: 'translateY(-15px) scale(1.1)', 
            opacity: '1' 
          },
        },
        'fade-in': {
          'from': { 
            opacity: '0', 
            transform: 'translateY(10px)' 
          },
          'to': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    // 動的クラス名のためのsafelist
    'text-purple-700',
    'text-green-700',
    'text-orange-700',
    'text-blue-700',
    'bg-purple-50',
    'bg-green-50',
    'bg-orange-50',
    'bg-blue-50',
    'text-purple-800',
    'text-green-800',
    'text-orange-800',
    'text-blue-800',
    'text-purple-600',
    'text-green-600',
    'text-orange-600',
    'text-blue-600',
    'text-purple-500',
    'text-green-500',
    'text-orange-500',
    'text-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-blue-500',
  ],
}
