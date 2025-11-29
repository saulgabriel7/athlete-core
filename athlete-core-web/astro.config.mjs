// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import clerk from '@clerk/astro';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel({
    runtime: 'nodejs20.x'
  }),
  integrations: [
    clerk({
      afterSignInUrl: '/dashboard',
      afterSignUpUrl: '/dashboard',
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
    })
  ],
  vite: {
    define: {
      'process.env.MCP_API_URL': JSON.stringify(process.env.MCP_API_URL || 'http://localhost:3000')
    }
  }
});
