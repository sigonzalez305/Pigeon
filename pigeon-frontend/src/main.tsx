import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import axios from 'axios'
import App from './App.tsx'
import { DEMO_MODE } from './config'
import { demoAdapter } from './demo/demoBackend'
import './styles/globals.css'
import './styles/dusk-aviary.css'

// Demo mode answers every API call in the browser. Installed before the first
// render so no request can reach a server that is not there.
if (DEMO_MODE) axios.defaults.adapter = demoAdapter

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
