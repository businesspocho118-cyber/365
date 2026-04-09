import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MeshGradient } from '@paper-design/shaders-react'

// Fecha objetivo: 31 de octubre de 2026 a las 00:00:00
const TARGET_DATE = new Date('2026-10-31T00:00:00').getTime()

// Robot interactivo con más movimiento
function InteractiveRobot({ onClick }) {
  const robotRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX - window.innerWidth / 2) / 15
      const y = (e.clientY - window.innerHeight / 2) / 15
      setPosition({ x, y })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  return (
    <motion.div
      ref={robotRef}
      className="fixed bottom-6 right-6 z-20 cursor-pointer"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        x: position.x,
        y: position.y,
        opacity: 1,
        scale: 1
      }}
      transition={{ type: 'spring', stiffness: 80, damping: 15 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          animate={isHovering ? { rotate: [0, 8, -8, 0] } : { rotate: [0, 3, -3, 0] }}
          transition={{ repeat: Infinity, duration: isHovering ? 0.3 : 1.5 }}
        >
          <rect x="20" y="15" width="60" height="50" rx="10" fill="#4c1d95" />
          <motion.circle cx="38" cy="40" r="10" fill="#a855f7" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: isHovering ? 0.5 : 1.5 }} />
          <motion.circle cx="62" cy="40" r="10" fill="#a855f7" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: isHovering ? 0.5 : 1.5 }} />
          <circle cx="38" cy="40" r="5" fill="#fff" opacity="0.9" />
          <circle cx="62" cy="40" r="5" fill="#fff" opacity="0.9" />
          <motion.rect x="35" y="55" width="30" height="6" rx="3" fill={isHovering ? '#f12b30' : '#8b5cf6'} animate={isHovering ? { width: [30, 35, 30] } : {}} transition={{ repeat: Infinity, duration: 0.5 }} />
          <line x1="50" y1="15" x2="50" y2="3" stroke="#8b5cf6" strokeWidth="4" />
          <motion.circle cx="50" cy="3" r="5" fill="#a855f7">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="0.5s" repeatCount="indefinite" />
          </motion.circle>
          <rect x="20" y="70" width="60" height="22" rx="8" fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.4" />
          <motion.rect x="8" y="75" width="12" height="12" rx="4" fill="#4c1d95" animate={isHovering ? { rotation: [-10, 10, -10] } : {}} transition={{ repeat: Infinity, duration: 0.5 }} />
          <motion.rect x="80" y="75" width="12" height="12" rx="4" fill="#4c1d95" animate={isHovering ? { rotation: [10, -10, 10] } : {}} transition={{ repeat: Infinity, duration: 0.5 }} />
        </motion.svg>
        <motion.div className="absolute inset-0 rounded-full bg-purple-500/40 blur-2xl -z-10" animate={{ opacity: isHovering ? [0.4, 0.7, 0.4] : 0.2 }} transition={{ repeat: Infinity, duration: 1 }} />
      </div>
    </motion.div>
  )
}

// Book estilo 21st.dev
function Book({ characterImage }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div className="group" style={{ perspective: '900px' }}>
      <motion.div
        className="relative w-56 md:w-72 h-72 md:h-96 cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isOpen ? -25 : 0, scale: isOpen ? 1.1 : 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Portada del libro */}
        <div className="absolute inset-0 rounded-r-md overflow-hidden shadow-2xl" style={{ backfaceVisibility: 'hidden' }}>
          <img src={characterImage} alt="Portada" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Título */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>365</h2>
            <p className="text-purple-300 text-xs mt-1 uppercase tracking-widest">Una historia por revelar</p>
          </div>
          
          {/* Spine efecto */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 to-transparent" />
          
          {/* Glow borde */}
          <motion.div className="absolute inset-0 rounded-r-md border-2" animate={{ borderColor: isHovered ? 'rgba(139, 92, 246, 0.9)' : 'rgba(139, 92, 246, 0.3)' }} />
        </div>
        
        {/* Páginas (cuando se abre) */}
        <div className="absolute right-0 top-3 bottom-3 w-2 bg-gradient-to-l from-purple-900 via-white to-purple-100" style={{ transform: 'rotateY(90deg)', transformOrigin: 'left' }} />
        
        {/* Contraportada */}
        <div className="absolute inset-0 rounded-r-md bg-purple-900 flex items-center justify-center shadow-inner" style={{ transform: 'translateZ(-4px)' }}>
          <div className="relative">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,#fff,#fff_1px,#efefef_1px,#fff_3px)] opacity-30" />
            <div className="text-center p-6 relative z-10">
              <p className="text-purple-300 text-lg font-medium">Capítulo 1</p>
              <p className="text-purple-400/60 text-sm mt-2">Coming Soon</p>
              <p className="text-purple-500/40 text-xs mt-4">31 de Octubre, 2026</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Hint */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: isHovered && !isOpen ? 1 : 0 }} className="absolute -bottom-8 left-0 right-0 text-center text-purple-400/60 text-xs">
        {isOpen ? '← Click' : 'Click para abrir'}
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
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.04 }} transition={{ duration: 2 }} className="text-[40vw] md:text-[50vw] font-black leading-none tracking-tight" style={{ fontFamily: '"Bebas Neue", sans-serif', color: '#8b5cf6' }}>
          365
        </motion.span>
      </div>
      
      {/* Robot */}
      <InteractiveRobot onClick={() => setShowBook(!showBook)} />
      
      {/* Botón */}
      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} onClick={() => setShowBook(!showBook)} className="absolute top-6 right-6 z-20 text-purple-500/50 text-xs hover:text-purple-400 transition-colors">
        {showBook ? '← Volver' : 'Click para revelar'}
      </motion.button>
      
      {/* Main content */}
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
            <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-8 md:gap-16">
              <MinimalTimeUnit value={timeLeft.days} label="días" />
              <MinimalTimeUnit value={timeLeft.hours} label="horas" />
              <MinimalTimeUnit value={timeLeft.minutes} label="min" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function MinimalTimeUnit({ value, label }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
      <motion.span animate={{ textShadow: ['0 0 20px rgba(139, 92, 246, 0.3)', '0 0 40px rgba(139, 92, 246, 0.5)', '0 0 20px rgba(139, 92, 246, 0.3)'] }} transition={{ duration: 3, repeat: Infinity }} className="text-7xl md:text-9xl font-light text-white tracking-tight">
        {String(value).padStart(2, '0')}
      </motion.span>
      <span className="text-purple-400/50 text-xs md:text-sm mt-2 uppercase tracking-[0.3em]">{label}</span>
    </motion.div>
  )
}

export default App