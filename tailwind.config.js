/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        lobster: ['Lobster', 'cursive'],
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
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
  // safelistを削除または簡素化
  safelist: [
    // 基本的な色のパターンのみ保持
    'bg-orange-100', 'bg-orange-200', 'bg-orange-300', 'bg-orange-400',
    'bg-purple-100', 'bg-blue-100', 'bg-gray-100', 'bg-yellow-100', 
    'bg-green-100', 'bg-red-100',
    'text-orange-800', 'text-purple-800', 'text-blue-800', 'text-gray-800',
    'text-yellow-800', 'text-green-800', 'text-red-800',
    'border-orange-300', 'border-purple-300', 'border-blue-300', 
    'border-gray-300', 'border-yellow-300', 'border-green-300', 'border-red-300',
  ],
}