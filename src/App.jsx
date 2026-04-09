import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MeshGradient } from '@paper-design/shaders-react'

// Fecha objetivo: 31 de octubre de 2026 a las 00:00:00
const TARGET_DATE = new Date('2026-10-31T00:00:00').getTime()

// Robot pequeño - debajo del cronómetro
function InteractiveRobot({ onClick }) {
  const robotRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX - window.innerWidth / 2) / 25
      const y = (e.clientY - window.innerHeight / 2) / 25
      setPosition({ x, y })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  return (
    <motion.div
      ref={robotRef}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ 
        x: position.x * 0.3,
        y: position.y * 0.3,
        opacity: 1,
        scale: 0.6
      }}
      transition={{ type: 'spring', stiffness: 80, damping: 15 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
      whileHover={{ scale: 0.7 }}
    >
      <div className="relative w-20 h-20 flex items-center justify-center">
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          animate={isHovering ? { rotate: [0, 8, -8, 0] } : { rotate: [0, 3, -3, 0] }}
          transition={{ repeat: Infinity, duration: isHovering ? 0.3 : 1.5 }}
        >
          <rect x="20" y="20" width="60" height="50" rx="10" fill="#4c1d95" />
          <motion.circle cx="38" cy="42" r="8" fill="#a855f7" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: isHovering ? 0.4 : 1.5 }} />
          <motion.circle cx="62" cy="42" r="8" fill="#a855f7" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: isHovering ? 0.4 : 1.5 }} />
          <circle cx="38" cy="42" r="4" fill="#fff" opacity="0.9" />
          <circle cx="62" cy="42" r="4" fill="#fff" opacity="0.9" />
          <rect x="38" y="55" width="24" height="5" rx="2" fill={isHovering ? '#f12b30' : '#8b5cf6'} />
          <line x1="50" y1="20" x2="50" y2="8" stroke="#8b5cf6" strokeWidth="4" />
          <circle cx="50" cy="8" r="4" fill="#a855f7">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="0.5s" repeatCount="indefinite" />
          </circle>
          <rect x="25" y="72" width="50" height="15" rx="5" fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.4" />
        </motion.svg>
        
        <motion.div className="absolute inset-0 rounded-full bg-purple-500/30 blur-xl -z-10" animate={{ opacity: isHovering ? [0.4, 0.6, 0.4] : 0.15 }} transition={{ repeat: Infinity, duration: 1 }} />
      </div>
    </motion.div>
  )
}

// Book con efecto páginas realista
function Book({ characterImage }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div className="group" style={{ perspective: '1200px' }}>
      <motion.div
        className="relative w-56 md:w-72 h-72 md:h-96 cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isOpen ? -35 : 0, scale: isOpen ? 1.1 : 1 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 40 }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Contratapaca */}
        <div className="absolute inset-0 rounded-r-md bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 shadow-xl" style={{ transform: 'translateZ(-3px)' }}>
          <div className="absolute left-1 top-2 bottom-2 w-2 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#fff3_2px,#fff3_3px)] opacity-15" />
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p className="text-purple-300 font-medium tracking-widest text-lg">365</p>
            <p className="text-purple-500/50 text-xs">Capítulo 1</p>
            <p className="text-purple-600/40 text-xs mt-6">Coming Soon</p>
            <p className="text-purple-700/30 text-[10px] mt-10 text-center leading-relaxed px-4">31 de Octubre<br/>del 2026</p>
          </div>
        </div>
        
        {/* Página simulada */}
        <div className="absolute right-1 top-3 w-2 h-[calc(100%-1.5rem)] bg-gradient-to-l from-white via-gray-100 to-gray-200 rounded-sm" style={{ transform: 'rotateY(90deg)', transformOrigin: 'left' }}>
          <div className="mt-4 ml-1 space-y-1.5">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-0.5 w-14 bg-gray-300 rounded" style={{ opacity: 0.2 + Math.random() * 0.3 }} />
            ))}
          </div>
        </div>
        
        {/* Portada */}
        <div className="absolute inset-0 rounded-r-md overflow-hidden shadow-2xl" style={{ backfaceVisibility: 'hidden' }}>
          <img src={characterImage} alt="Portada" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
          
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-wider" style={{ fontFamily: '"Bebas Neue", sans-serif', textShadow: '0 2px 15px rgba(0,0,0,0.6)' }}>365</h2>
            <p className="text-purple-300/80 text-[10px] mt-1.5 uppercase tracking-[0.25em]">Una historia por revelar</p>
          </div>
          
          {/* Lomo Spine */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
          
          <motion.div className="absolute inset-0 rounded-r-md border-2" animate={{ borderColor: isHovered ? 'rgba(168, 85, 247, 0.9)' : 'rgba(168, 85, 247, 0.25)', boxShadow: isHovered ? '0 0 25px rgba(168, 85, 247, 0.3)' : 'none' }} />
        </div>
        
        {/* Título en lomo */}
        <div className="absolute -left-6 top-1/2 -translate-y-1/2" style={{ transform: 'translateZ(2px)' }}>
          <p className="text-purple-400/30 text-xl font-bold tracking-widest" style={{ writingMode: 'vertical-rl', fontFamily: '"Bebas Neue", sans-serif' }}>365</p>
        </div>
      </motion.div>
      
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: isHovered ? 1 : 0 }} className="absolute -bottom-8 left-0 right-0 text-center text-purple-400/70 text-[10px]">
        {isOpen ? '← Volver' : 'Toca el robot para descubrir'}
      </motion.p>
    </div>
  )
}

function App() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
  const [isExpired, setIsExpired] = useState(false)
  const [showBook, setShowBook] = useState(false)
  
  const characterImage = '/personaje.png'

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
      {/* MeshGradient */}
      <div className="absolute inset-0">
        <MeshGradient colors={['#1a0a2e', '#2d1b4e', '#4c1d95', '#6b21a8', '#0a0a0a']} speed={0.4} distortion={0.6} swirl={0.2} className="w-full h-full" />
      </div>
      <div className="absolute inset-0 bg-[#0a0a0a]/50" />
      
      {/* 365 background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.04 }} transition={{ duration: 2 }} className="text-[45vw] md:text-[55vw] font-black leading-none tracking-tight" style={{ fontFamily: '"Bebas Neue", sans-serif', color: '#8b5cf6' }}>
          365
        </motion.span>
      </div>
      
      {/* Main - Cronómetro PRINCIPAL centrado */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <AnimatePresence mode="wait">
          {isExpired ? (
            <motion.div key="expired" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <h2 className="text-5xl md:text-7xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text">Espera</h2>
              <p className="text-2xl md:text-3xl text-purple-300 mt-4">Las puertas se abrirán pronto</p>
            </motion.div>
          ) : showBook ? (
            <Book key="book" characterImage={characterImage} />
          ) : (
            <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-8 md:gap-14">
              <TimeUnit value={timeLeft.days} label="días" />
              <TimeUnit value={timeLeft.hours} label="horas" />
              <TimeUnit value={timeLeft.minutes} label="min" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Robot pequeño abajo */}
      <InteractiveRobot onClick={() => setShowBook(!showBook)} />
    </div>
  )
}

// TimeUnit principal
function TimeUnit({ value, label }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
      <motion.div
        animate={{ 
          boxShadow: [
            '0 0 25px rgba(139, 92, 246, 0.2)',
            '0 0 50px rgba(139, 92, 246, 0.35)',
            '0 0 25px rgba(139, 92, 246, 0.2)'
          ]
        }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="w-24 md:w-32 h-28 md:h-36 rounded-2xl bg-purple-900/20 border border-purple-500/25 backdrop-blur-sm flex items-center justify-center"
      >
        <span className="text-5xl md:text-7xl font-light text-white tracking-tight">
          {String(value).padStart(2, '0')}
        </span>
      </motion.div>
      <span className="text-purple-400/60 text-xs md:text-sm mt-3 uppercase tracking-[0.25em]">{label}</span>
    </motion.div>
  )
}

export default App