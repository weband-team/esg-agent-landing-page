'use client';

import { createGlobalStyle } from 'styled-components';

export const theme = {
  colors: {
    green900: '#052e16',
    green800: '#14532d',
    green700: '#15803d',
    green600: '#16a34a',
    green500: '#22c55e',
    green400: '#4ade80',
    green300: '#86efac',
    green100: '#dcfce7',
    emerald500: '#10b981',
    emerald400: '#34d399',
    teal500: '#14b8a6',
    slate950: '#020617',
    slate900: '#0f172a',
    slate800: '#1e293b',
    slate700: '#334155',
    slate600: '#475569',
    slate400: '#94a3b8',
    slate300: '#cbd5e1',
    slate200: '#e2e8f0',
    white: '#ffffff',
    gold: '#f59e0b',
    goldLight: '#fcd34d',
  },
  gradients: {
    bgGradient: 'radial-gradient(circle at top, #0f2d1e 0%, #020617 100%)',
    primaryBtn: 'linear-gradient(135deg, #16a34a, #10b981)',
    textGradient: 'linear-gradient(135deg, #4ade80, #34d399, #14b8a6)',
    cardGradient: 'linear-gradient(135deg, rgba(15,23,42,0.6), rgba(30,41,59,0.3))',
    goldCardGradient: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))',
    pilotBannerGradient: 'linear-gradient(135deg, rgba(22,163,74,0.15), rgba(20,184,166,0.1))',
    finalCtaGradient: 'linear-gradient(180deg, rgba(5,46,22,0.6) 0%, #020617 100%)',
  },
  breakpoints: {
    tablet: '768px',
    mobile: '600px',
  }
};

export const GlobalStyle = createGlobalStyle`
  /* ─── RESET & BASE ─── */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html {
    scroll-behavior: smooth;
  }
  
  body {
    font-family: var(--font-inter), 'Inter', sans-serif;
    background: ${theme.colors.slate950};
    background-image: ${theme.gradients.bgGradient};
    background-attachment: fixed;
    color: ${theme.colors.slate200};
    line-height: 1.6;
    overflow-x: hidden;
  }
  
  a {
    color: inherit;
    text-decoration: none;
  }
  
  img {
    max-width: 100%;
  }

  /* Language visibility toggles */
  [data-lang="en"] {
    display: none;
  }
  body.en [data-lang="pl"] {
    display: none;
  }
  body.en [data-lang="en"] {
    display: revert;
  }
  
  /* Shared standard pulse animation */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;
