import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import App from './App.tsx'
import './styles/globals.css'
import './styles/dusk-aviary.css'

// framer-motion animates in JavaScript, so the reduced-motion rules in
// dusk-aviary.css do not reach it. Without this, a user who has asked their OS
// for reduced motion still got sliding page transitions and an infinitely
// repeating float on the launch ceremony.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </React.StrictMode>,
)
