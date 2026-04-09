import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MeshGradient } from '@paper-design/shaders-react'

// Fecha objetivo: 31 de octubre de 2026 a las 00:00:00
const TARGET_DATE = new Date('2026-10-31T00:00:00').getTime()

// Robot pequeño abajo
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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        x: position.x * 0.3,
        y: position.y * 0.3,
        opacity: 1,
        scale: 0.55
      }}
      transition={{ type: 'spring', stiffness: 80, damping: 15 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
      whileHover={{ scale: 0.65 }}
    >
      <div className="relative w-20 h-20 flex items-center justify-center">
        <motion.svg viewBox="0 0 100 100" className="w-full h-full" animate={isHovering ? { rotate: [0, 10, -10, 0] } : { rotate: [0, 4, -4, 0] }} transition={{ repeat: Infinity, duration: isHovering ? 0.3 : 1.5 }}>
          <rect x="20" y="20" width="60" height="50" rx="10" fill="#4c1d95" />
          <motion.circle cx="38" cy="42" r="9" fill="#a855f7" animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: isHovering ? 0.4 : 1.5 }} />
          <motion.circle cx="62" cy="42" r="9" fill="#a855f7" animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: isHovering ? 0.4 : 1.5 }} />
          <circle cx="38" cy="42" r="4" fill="#fff" opacity="0.9" />
          <circle cx="62" cy="42" r="4" fill="#fff" opacity="0.9" />
          <rect x="38" y="56" width="24" height="5" rx="2" fill={isHovering ? '#f12b30' : '#8b5cf6'} />
          <line x1="50" y1="20" x2="50" y2="8" stroke="#8b5cf6" strokeWidth="4" />
          <circle cx="50" cy="8" r="4" fill="#a855f7"><animate attributeName="opacity" values="0.5;1;0.5" dur="0.5s" repeatCount="indefinite" /></circle>
          <rect x="25" y="73" width="50" height="14" rx="6" fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.4" />
        </motion.svg>
        <motion.div className="absolute inset-0 rounded-full bg-purple-500/30 blur-xl -z-10" animate={{ opacity: isHovering ? [0.4, 0.7, 0.4] : 0.15 }} transition={{ repeat: Infinity, duration: 1 }} />
      </div>
    </motion.div>
  )
}

// Libro estilo 21st.dev - mejorado
function Book({ characterImage }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div className="group" style={{ perspective: '1000px' }}>
      <motion.div
        className="relative w-[240px] h-[340px] md:w-[300px] md:h-[420px] cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isOpen ? -35 : 0 }}
        transition={{ duration: 0.9, type: 'spring', stiffness: 35 }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Contratapaca */}
        <div className="absolute inset-0 rounded-r-md shadow-xl" style={{ transform: 'translateZ(-12px)', background: 'linear-gradient(145deg, #2e1065 0%, #4c1d95 50%, #1a1a2e 100%)' }}>
          <div className="absolute left-1.5 top-3 bottom-3 w-1 bg-gradient-to-b from-white/10 via-transparent to-transparent" />
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <p className="text-purple-300 font-medium tracking-widest text-xl">365</p>
            <div className="w-8 h-px bg-purple-500/40" />
            <p className="text-purple-400/60 text-xs">Capítulo I</p>
            <p className="text-purple-500/30 text-xs mt-6">Coming Soon</p>
            <p className="text-purple-600/25 text-[9px] mt-8">31.X.2026</p>
          </div>
        </div>
        
        {/* Página */}
        <div className="absolute right-0.5 top-2 w-1 h-[calc(100%-1rem)] rounded-sm" style={{ transform: 'rotateY(90deg)', transformOrigin: 'left', background: 'linear-gradient(90deg, #d4d4d8, #fff 20%, #e4e4e8 50%, #fafafa 80%, #d4d4d8)' }}>
          <div className="mt-5 ml-1 space-y-1.5">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="h-0.5 w-14 bg-gray-400/30 rounded" style={{ opacity: 0.2 + Math.random() * 0.25 }} />
            ))}
          </div>
        </div>
        
        {/* Portada */}
        <div className="absolute inset-0 rounded-r-md overflow-hidden shadow-2xl" style={{ backfaceVisibility: 'hidden' }}>
          <img src={characterImage} alt="Portada" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
          
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-5xl md:text-6xl font-bold text-white tracking-wider" style={{ fontFamily: '"Bebas Neue", sans-serif', textShadow: '0 3px 20px rgba(0,0,0,0.7)' }}>365</h2>
            <p className="text-purple-300/90 text-[10px] mt-1 uppercase tracking-[0.3em]">The Beginning</p>
          </div>
          
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/50 via-black/25 to-transparent" />
          
          <motion.div 
            className="absolute inset-0 rounded-r-md border-2" 
            animate={{ borderColor: isHovered ? 'rgba(168, 85, 247, 0.95)' : 'rgba(168, 85, 247, 0.2)', boxShadow: isHovered ? '0 0 35px rgba(168, 85, 247, 0.5)' : 'none' }} 
            transition={{ duration: 0.3 }} 
          />
        </div>
        
        {/* Spine título */}
        <div className="absolute -left-5 top-1/2 -translate-y-1/2" style={{ transform: 'translateZ(4px)' }}>
          <p className="text-purple-400/35 text-2xl font-bold tracking-widest" style={{ writingMode: 'vertical-rl', fontFamily: '"Bebas Neue", sans-serif' }}>365</p>
        </div>
      </motion.div>
      
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: isHovered ? 1 : 0 }} className="absolute -bottom-7 left-0 right-0 text-center text-purple-400/80 text-[9px] tracking-widest">
        {isOpen ? '← CRONÓMETRO' : 'TOCA EL ROBOT'}
      </motion.p>
    </div>
  )
}

function App() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
  const [isExpired, setIsExpired] = useState(false)
  const [showBook, setShowBook] = useState(false)
  
  // Imagen correcta
  const characterImage = '/Imagen carta/365 THE BEGINNING.png'

  function calculateTimeLeft() {
    const now = new Date().getTime()
    const difference = TARGET_DATE - now
    
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0 }
    
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
      <div className="absolute inset-0">
        <MeshGradient colors={['#1a0a2e', '#2d1b4e', '#4c1d95', '#6b21a8', '#0a0a0a']} speed={0.4} distortion={0.6} swirl={0.2} className="w-full h-full" />
      </div>
      <div className="absolute inset-0 bg-[#0a0a0a]/50" />
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.035 }} transition={{ duration: 2 }} className="text-[50vw] md:text-[60vw] font-black leading-none tracking-tight" style={{ fontFamily: '"Bebas Neue", sans-serif', color: '#8b5cf6' }}>
          365
        </motion.span>
      </div>
      
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
            <motion.div key="countdown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-10 md:gap-16">
              <FloatingTime value={timeLeft.days} label="días" />
              <FloatingTime value={timeLeft.hours} label="horas" />
              <FloatingTime value={timeLeft.minutes} label="min" />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <InteractiveRobot onClick={() => setShowBook(!showBook)} />
    </div>
  )
}

// Cronómetro SIN cajas - SOLO números flotando
function FloatingTime({ value, label }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="flex flex-col items-center"
    >
      <motion.span
        animate={{ 
          textShadow: [
            '0 0 20px rgba(139, 92, 246, 0.25)',
            '0 0 45px rgba(139, 92, 246, 0.45)',
            '0 0 20px rgba(139, 92, 246, 0.25)'
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-6xl md:text-8xl font-extralight text-white tracking-tight"
      >
        {String(value).padStart(2, '0')}
      </motion.span>
      <span className="text-purple-400/45 text-[10px] md:text-xs mt-1 uppercase tracking-[0.2em]">{label}</span>
    </motion.div>
  )
}

export default App