/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
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
  safelist: [
    // 動的に生成される色クラスを明示的に保護
    'bg-orange-100', 'bg-orange-200', 'bg-orange-300', 'bg-orange-400',
    'border-orange-300', 'border-orange-400', 'text-orange-800',
    'bg-purple-100', 'border-purple-300', 'text-purple-800', 'text-purple-700',
    'bg-blue-100', 'border-blue-300', 'text-blue-800', 'text-blue-900', 'text-blue-700',
    'bg-gray-100', 'border-gray-300', 'text-gray-800', 'text-gray-600',
    'bg-yellow-100', 'bg-yellow-500', 'text-yellow-600', 'text-yellow-800',
    'bg-green-100', 'bg-green-50', 'border-green-200', 'text-green-800', 'text-green-700',
    'bg-red-50', 'border-red-200', 'text-red-600', 'text-red-700',
    'bg-red-100', 'bg-red-500', 'text-red-500', 'hover:bg-red-500', 'hover:text-white',
    'bg-blue-500', 'hover:bg-blue-600', 'bg-green-600', 'hover:bg-green-700',
    'bg-gray-200', 'text-gray-700', 'hover:bg-gray-300',
    'bg-white', 'border-gray-200', 'hover:bg-gray-50',
    'from-purple-500', 'to-pink-500',
    // その他のパターン
    {
      pattern: /^(bg|text|border)-(purple|green|orange|blue|red|gray|yellow)-(50|100|200|300|400|500|600|700|800|900)$/,
    },
    {
      pattern: /^hover:(bg|text)-(purple|green|orange|blue|red|gray|yellow)-(50|100|200|300|400|500|600|700|800|900)$/,
    },
  ],
};