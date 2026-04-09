import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Fecha objetivo: 31 de octubre de 2026 a las 00:00:00
const TARGET_DATE = new Date('2026-10-31T00:00:00').getTime()

function App() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
  const [isExpired, setIsExpired] = useState(false)

  function calculateTimeLeft() {
    const now = new Date().getTime()
    const difference = TARGET_DATE - now
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)
      
      if (newTimeLeft.days <= 0 && newTimeLeft.hours <= 0 && 
          newTimeLeft.minutes <= 0 && newTimeLeft.seconds <= 0) {
        setIsExpired(true)
        clearInterval(timer)
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Fondo animado */}
      <BackgroundAnimation />
      
      {/* Contenido principal */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4 text-center"
        >
          <span className="bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800 bg-clip-text text-transparent">
            La espera está por terminar
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-purple-300 text-lg md:text-xl mb-12 text-center"
        >
          Algo increíble está por llegar...
        </motion.p>

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
              className="flex gap-3 md:gap-6"
            >
              <TimeUnit value={timeLeft.days} label="Días" />
              <TimeUnit value={timeLeft.hours} label="Horas" />
              <TimeUnit value={timeLeft.minutes} label="Min" />
              <TimeUnit value={timeLeft.seconds} label="Seg" />
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-8 text-purple-500/60 text-sm"
        >
          31 de Octubre, 2026
        </motion.footer>
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
              "0 0 20px rgba(139, 92, 246, 0.3)",
              "0 0 40px rgba(139, 92, 246, 0.6)",
              "0 0 20px rgba(139, 92, 246, 0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 md:w-28 h-24 md:h-32 rounded-2xl bg-purple-900/30 border border-purple-500/30 backdrop-blur-sm flex items-center justify-center"
        >
          <span className="text-4xl md:text-6xl font-bold text-white">
            {String(value).padStart(2, '0')}
          </span>
        </motion.div>
        {/* Brillo */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-purple-500/20 to-transparent pointer-events-none" />
      </div>
      <span className="text-purple-400 text-xs md:text-sm mt-2 uppercase tracking-wider">{label}</span>
    </motion.div>
  )
}

function BackgroundAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Burbuja 1 */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-96 h-96 rounded-full bg-purple-600/20 blur-3xl -top-20 -left-20"
      />
      
      {/* Burbuja 2 */}
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1, 1.5, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute w-80 h-80 rounded-full bg-purple-800/20 blur-3xl top-1/3 right-0"
      />
      
      {/* Burbuja 3 */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute w-64 h-64 rounded-full bg-purple-500/10 blur-3xl bottom-0 left-1/3"
      />
      
      {/* Partículas flotantes */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -Math.random() * 100 - 50],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
          className="absolute w-1 h-1 rounded-full bg-purple-400/60"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `${Math.random() * 30}%`,
          }}
        />
      ))}
    </div>
  )
}

export default App