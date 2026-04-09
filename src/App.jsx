import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MeshGradient } from '@paper-design/shaders-react'

// Fecha objetivo: 31 de octubre de 2026 a las 00:00:00
const TARGET_DATE = new Date('2026-10-31T00:00:00').getTime()

// Robot más grande y centrado
function InteractiveRobot({ onClick }) {
  const robotRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX - window.innerWidth / 2) / 20
      const y = (e.clientY - window.innerHeight / 2) / 20
      setPosition({ x, y })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  return (
    <motion.div
      ref={robotRef}
      className="fixed cursor-pointer z-20"
      style={{ left: '50%', top: '50%', marginLeft: '-80px', marginTop: '-80px' }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        x: position.x,
        y: position.y,
        opacity: 1,
        scale: 1
      }}
      transition={{ type: 'spring', stiffness: 60, damping: 12 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
    >
      <div className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center">
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          animate={isHovering ? { rotate: [0, 10, -10, 0] } : { rotate: [0, 4, -4, 0] }}
          transition={{ repeat: Infinity, duration: isHovering ? 0.2 : 2 }}
        >
          {/* Robot head/body principal */}
          <rect x="15" y="20" width="70" height="55" rx="12" fill="#4c1d95" />
          
          {/* Ojos grandes */}
          <motion.circle cx="35" cy="45" r="12" fill="#a855f7" animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: isHovering ? 0.3 : 1.5 }} />
          <motion.circle cx="65" cy="45" r="12" fill="#a855f7" animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: isHovering ? 0.3 : 1.5 }} />
          {/* Brillo ojos */}
          <circle cx="35" cy="45" r="6" fill="#fff" opacity="0.95" />
          <circle cx="65" cy="45" r="6" fill="#fff" opacity="0.95" />
          
          {/* Boca */}
          <motion.rect x="35" y="60" width="30" height="8" rx="4" fill={isHovering ? '#f12b30' : '#8b5cf6'} animate={isHovering ? { width: [30, 40, 30] } : {}} transition={{ repeat: Infinity, duration: 0.3 }} />
          
          {/* Antenna */}
          <line x1="50" y1="20" x2="50" y2="5" stroke="#8b5cf6" strokeWidth="5" />
          <motion.circle cx="50" cy="5" r="6" fill="#c084fc">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="0.3s" repeatCount="indefinite" />
          </motion.circle>
          
          {/* Brazos */}
          <motion.rect x="5" y="55" width="12" height="15" rx="5" fill="#4c1d95" animate={isHovering ? { rotation: [-15, 15, -15] } : {}} transition={{ repeat: Infinity, duration: 0.3 }} />
          <motion.rect x="83" y="55" width="12" height="15" rx="5" fill="#4c1d95" animate={isHovering ? { rotation: [15, -15, 15] } : {}} transition={{ repeat: Infinity, duration: 0.3 }} />
          
          {/* Cuerpo */}
          <rect x="20" y="78" width="60" height="15" rx="6" fill="none" stroke="#8b5cf6" strokeWidth="2.5" opacity="0.5" />
        </motion.svg>
        
        {/* Glow effect */}
        <motion.div className="absolute inset-0 rounded-full bg-pink-500/30 blur-3xl -z-10" animate={{ opacity: isHovering ? [0.5, 0.8, 0.5] : 0.15 }} transition={{ repeat: Infinity, duration: 0.8 }} />
      </div>
    </motion.div>
  )
}

// Book estilo real con páginas
function Book({ characterImage }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div className="group" style={{ perspective: '1200px' }}>
      <motion.div
        className="relative w-60 md:w-80 h-80 md:h-96 cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isOpen ? -30 : 0, scale: isOpen ? 1.15 : 1 }}
        transition={{ duration: 0.7, type: 'spring', stiffness: 50 }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Contraportada */}
        <div className="absolute inset-0 rounded-r-md bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 shadow-2xl" style={{ transform: 'translateZ(-3px)' }}>
          {/* Líneas de páginas */}
          <div className="absolute left-2 top-2 bottom-2 w-full bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#fff3_2px,#fff3_4px)] opacity-20" />
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <p className="text-purple-300 font-medium tracking-widest">365</p>
            <p className="text-purple-500/50 text-xs">Capítulo 1</p>
            <p className="text-purple-600/40 text-xs mt-4">Coming Soon</p>
            <p className="text-purple-700/30 text-xs mt-8 text-center px-4">31 de Octubre<br/>2026</p>
          </div>
        </div>
        
        {/* Páginas del medio */}
        <div className="absolute right-1 top-2 w-3 h-[calc(100%-1rem)] bg-gradient-to-l from-white via-gray-100 to-gray-200 rounded-sm" style={{ transform: 'rotateY(90deg)', transformOrigin: 'left', boxShadow: '-2px 0 4px rgba(0,0,0,0.1)' }}>
          {/* Líneas de texto simuladas */}
          <div className="mt-3 ml-1 space-y-1">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="h-0.5 w-16 bg-gray-300 rounded" style={{ opacity: 0.3 + Math.random() * 0.4 }} />
            ))}
          </div>
        </div>
        
        {/* Portada principal */}
        <div className="absolute inset-0 rounded-r-md overflow-hidden shadow-2xl" style={{ backfaceVisibility: 'hidden' }}>
          <img src={characterImage} alt="Portada" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
          
          {/* Título */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-5xl md:text-6xl font-bold text-white tracking-widest" style={{ fontFamily: '"Bebas Neue", sans-serif', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>365</h2>
            <p className="text-purple-300 text-xs mt-2 uppercase tracking-[0.3em]">Una historia por revelar</p>
          </div>
          
          {/* Lomo / Spine */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
          
          {/* Glow borde */}
          <motion.div className="absolute inset-0 rounded-r-md border-2" animate={{ borderColor: isHovered ? 'rgba(168, 85, 247, 0.9)' : 'rgba(168, 85, 247, 0.3)', boxShadow: isHovered ? '0 0 30px rgba(168, 85, 247, 0.4)' : 'none' }} transition={{ duration: 0.3 }} />
        </div>
        
        {/* Título 3D en el lomo */}
        <div className="absolute -left-8 top-1/2 -translate-y-1/2" style={{ transform: 'translateZ(2px)' }}>
          <p className="text-purple-400/40 text-2xl font-bold tracking-widest" style={{ writingMode: 'vertical-rl', fontFamily: '"Bebas Neue", sans-serif' }}>365</p>
        </div>
      </motion.div>
      
      {/* Hint */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: isHovered ? 1 : 0 }} className="absolute -bottom-10 left-0 right-0 text-center text-purple-400 text-xs">
        {isOpen ? '← Volver' : 'Toca el robot para abrir'}
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
      
      {/* Robot grande y centrado */}
      <InteractiveRobot onClick={() => setShowBook(!showBook)} />
      
      {/* Main content - debajo del robot */}
      <main className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-4 z-10">
        <AnimatePresence mode="wait">
          {isExpired ? (
            <motion.div key="expired" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-32">
              <h2 className="text-5xl md:text-7xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text">Espera</h2>
              <p className="text-2xl md:text-3xl text-purple-300 mt-4">Las puertas se abrirán pronto</p>
            </motion.div>
          ) : showBook ? (
            <Book key="book" characterImage={characterImage} />
          ) : (
            <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-6 md:gap-12 mb-32">
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
      <motion.span animate={{ textShadow: ['0 0 20px rgba(139, 92, 246, 0.3)', '0 0 40px rgba(139, 92, 246, 0.5)', '0 0 20px rgba(139, 92, 246, 0.3)'] }} transition={{ duration: 3, repeat: Infinity }} className="text-5xl md:text-7xl font-light text-white tracking-tight">
        {String(value).padStart(2, '0')}
      </motion.span>
      <span className="text-purple-400/50 text-xs md:text-sm mt-1 uppercase tracking-[0.3em]">{label}</span>
    </motion.div>
  )
}

export default App