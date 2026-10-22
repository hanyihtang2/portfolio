import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://hanyihtang2.github.io',
  base: '/portfolio',
  vite: {
    plugins: [tailwindcss()],
  },
});

});