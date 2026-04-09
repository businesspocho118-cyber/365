import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MeshGradient } from '@paper-design/shaders-react'

// Fecha objetivo: 31 de octubre de 2026 a las 00:00:00
const TARGET_DATE = new Date('2026-10-31T00:00:00').getTime()

// Playing Card Effect - Shader simple basado en el componente
function CardEffect({ reveal = true }) {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    if (!reveal || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    let animationId
    let time = 0
    
    const resize = () => {
      canvas.width = canvas.offsetWidth * 2
      canvas.height = canvas.offsetHeight * 2
    }
    
    const draw = () => {
      time += 0.02
      const w = canvas.width
      const h = canvas.height
      
      ctx.clearRect(0, 0, w, h)
      
      // Dots grid effect estilo playing card
      const dotSize = 3
      const gap = 8
      const opacity = (Math.sin(time * 0.5) + 1) * 0.15 + 0.1
      
      ctx.fillStyle = `rgba(139, 92, 246, ${opacity})`
      
      for (let x = 0; x < w; x += gap) {
        for (let y = 0; y < h; y += gap) {
          const offset = Math.sin(x * 0.01 + time) * Math.cos(y * 0.01 + time * 0.5) * 10
          ctx.beginPath()
          ctx.arc(x + offset, y + offset * 0.5, dotSize, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      
      animationId = requestAnimationFrame(draw)
    }
    
    resize()
    window.addEventListener('resize', resize)
    draw()
    
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [reveal])
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}

// Playing Card Component
function PlayingCard({ textArray = ['3', '6', '5'], onClick }) {
  const [isHovered, setIsHovered] = useState(false)
  const [showReveal, setShowReveal] = useState(false)
  
  const handleClick = () => {
    setShowReveal(!showReveal)
    onClick?.()
  }
  
  return (
    <motion.div
      className="relative cursor-pointer"
      style={{ maxWidth: '280px', width: '100%' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Outer border */}
      <motion.div
        className="absolute inset-0 rounded-3xl"
        style={{
          padding: '2px',
          background: isHovered 
            ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' 
            : 'linear-gradient(135deg, #4c1d95 0%, #2e1065 100%)',
          transition: 'all 0.3s ease'
        }}
      />
      
      {/* Inner card */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: showReveal ? '#0a0a0a' : '#18192b',
          aspectRatio: '9/16',
          transition: 'all 0.5s ease'
        }}
      >
        {/* Reveal canvas effect */}
        {showReveal && <CardEffect reveal={showReveal} />}
        
        {/* Top text (normal) */}
        <div
          className="absolute top-4 left-4 flex flex-col z-10"
          style={{
            color: isHovered ? '#f12b30' : '#00a9fe',
            fontSize: '32px',
            fontWeight: 'bold',
            letterSpacing: '4px',
            transition: 'color 0.3s ease'
          }}
        >
          {textArray.map((letter, i) => (
            <div key={i}>{letter}</div>
          ))}
        </div>
        
        {/* Bottom text (mirrored) */}
        <div
          className="absolute bottom-4 right-4 flex flex-col z-10"
          style={{
            color: isHovered ? '#f12b30' : '#00a9fe',
            fontSize: '32px',
            fontWeight: 'bold',
            letterSpacing: '4px',
            transform: 'scale(-1)',
            transition: 'color 0.3s ease'
          }}
        >
          {textArray.map((letter, i) => (
            <div key={i}>{letter}</div>
          ))}
        </div>
        
        {/* Center decoration */}
        <div className="absolute inset-0 flex items-center justify-center z-5">
          <motion.div
            className="w-24 h-32 rounded-lg border-2 border-purple-500/30 flex items-center justify-center"
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              borderColor: 'rgba(139, 92, 246, 0.3)'
            }}
            animate={{
              borderColor: isHovered 
                ? 'rgba(139, 92, 246, 0.8)' 
                : 'rgba(139, 92, 246, 0.3)'
            }}
          >
            <span className="text-4xl font-bold text-purple-400">
              {textArray[0]}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

function App() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
  const [isExpired, setIsExpired] = useState(false)
  const [cardFlipped, setCardFlipped] = useState(false)

  function calculateTimeLeft() {
    const now = new Date().getTime()
    const difference = TARGET_DATE - now
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0 }
    }
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
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
      {/* MeshGradient Background */}
      <div className="absolute inset-0">
        <MeshGradient
          colors={[
            '#1a0a2e',
            '#2d1b4e', 
            '#4c1d95',
            '#6b21a8',
            '#0a0a0a'
          ]}
          speed={0.4}
          distortion={0.6}
          swirl={0.2}
          className="w-full h-full"
        />
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#0a0a0a]/50" />
      
      {/* 365 large background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.04 }}
          transition={{ duration: 2 }}
          className="text-[40vw] md:text-[50vw] font-black leading-none tracking-tight"
          style={{ 
            fontFamily: '"Bebas Neue", "Inter", sans-serif',
            letterSpacing: '-0.02em',
            color: '#8b5cf6',
          }}
        >
          365
        </motion.span>
      </div>
      
      {/* Main content */}
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
          ) : cardFlipped ? (
            <PlayingCard 
              textArray={['3', '6', '5']} 
              onClick={() => setCardFlipped(false)}
            />
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
        
        {/* Click to show card hint */}
        {!isExpired && !cardFlipped && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={() => setCardFlipped(true)}
            className="mt-12 text-purple-500/50 text-sm hover:text-purple-400 transition-colors"
          >
            Click para revelar carta
          </motion.button>
        )}
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