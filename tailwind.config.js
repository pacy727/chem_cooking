/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',     // ← app/ のみ
    './lib/**/*.{js,ts,jsx,tsx,mdx}',     // ← lib/ も含める
    './components/**/*.{js,ts,jsx,tsx,mdx}', // ← 念のため
  ],
  theme: {
    extend: {
      fontFamily: {
        lobster: ['Lobster', 'cursive'],
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
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
    {
      pattern: /^(bg|text|border)-(purple|green|orange|blue|red|gray|yellow)-(50|100|200|300|400|500|600|700|800|900)$/,
    },
  ],
}