import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MeshGradient } from '@paper-design/shaders-react'

// Fecha objetivo: 31 de octubre de 2026 a las 00:00:00
const TARGET_DATE = new Date('2026-10-31T00:00:00').getTime()

function App() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
  const [isExpired, setIsExpired] = useState(false)

  function calculateTimeLeft() {
    const now = new Date().getTime()
    const difference = TARGET_DATE - now
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0 }
    }
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)
      
      if (newTimeLeft.days <= 0 && newTimeLeft.hours <= 0 && newTimeLeft.minutes <= 0) {
        setIsExpired(true)
        clearInterval(timer)
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* MeshGradient Background - Morado/Misterioso */}
      <div className="absolute inset-0">
        <MeshGradient
          colors={[
            '#1a0a2e',  // Dark purple
            '#2d1b4e',  // Purple dark
            '#4c1d95',  // Violet dark
            '#6b21a8',  // Purple medium
            '#0a0a0a',  // Black
          ]}
          speed={0.4}
          distortion={0.6}
          swirl={0.2}
          className="w-full h-full"
        />
      </div>
      
      {/* Overlay para oscurecer el shader */}
      <div className="absolute inset-0 bg-[#0a0a0a]/50" />
      
      {/* 365 grande de fondo - bien atras y profesional */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.04 }}
          transition={{ duration: 2 }}
          className="text-[35vw] md:text-[45vw] font-black leading-none tracking-tight"
          style={{ 
            fontFamily: '"Bebas Neue", "Inter", "Helvetica Neue", sans-serif',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            color: '#8b5cf6',
          }}
        >
          365
        </motion.span>
      </div>
      
      {/* Contenido principal */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <AnimatePresence mode="wait">
          {isExpired ? (
            <motion.div
              key="expired"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h2 className="text-5xl md:text-7xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text">
                Espera
              </h2>
              <p className="text-2xl md:text-3xl text-purple-300 mt-4">
                Las puertas se abrirán pronto
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="countdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-8 md:gap-16"
            >
              <TimeUnit value={timeLeft.days} label="días" />
              <TimeUnit value={timeLeft.hours} label="horas" />
              <TimeUnit value={timeLeft.minutes} label="min" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function TimeUnit({ value, label }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center"
    >
      <div className="relative">
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 30px rgba(139, 92, 246, 0.15)',
              '0 0 60px rgba(139, 92, 246, 0.25)',
              '0 0 30px rgba(139, 92, 246, 0.15)'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-28 md:w-36 h-32 md:h-40 rounded-3xl bg-purple-900/15 border border-purple-500/15 backdrop-blur-md flex items-center justify-center"
        >
          <span className="text-6xl md:text-8xl font-light text-white tracking-tight">
            {String(value).padStart(2, '0')}
          </span>
        </motion.div>
      </div>
      <span className="text-purple-400/60 text-xs md:text-sm mt-4 uppercase tracking-[0.3em]">{label}</span>
    </motion.div>
  )
}

export default App