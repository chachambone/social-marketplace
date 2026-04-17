import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./src/views/**/*.ejs",
    "./public/js/**/*.ts",
    "./public/**/*.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config