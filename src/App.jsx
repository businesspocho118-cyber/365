import { useState, useEffect, useRef, Suspense, lazy } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MeshGradient } from '@paper-design/shaders-react'

const Spline = lazy(() => import('@splinetool/react-spline'))

// Fecha objetivo: 31 de octubre de 2026 a las 00:00:00
const TARGET_DATE = new Date('2026-10-31T00:00:00').getTime()

// Robot 3D visual (placeholder emoji cuando no hay Spline)
function InteractiveRobot({ sceneUrl }) {
  // Si hay URL de Spline, usarla
  if (sceneUrl) {
    return (
      <div className="w-32 h-32 md:w-48 md:h-48">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <Spline scene={sceneUrl} className="w-full h-full" />
        </Suspense>
      </div>
    )
  }
  
  // Robot visual CSS como alternativa
  return (
    <motion.div
      className="w-24 h-24 md:w-32 md:h-32 relative"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Cuerpo del robot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-6xl md:text-8xl">🤖</span>
      </div>
      {/* Efecto de brillo */}
      <motion.div
        className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  )
}

// Card Effect con canvas
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
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />
  )
}

// Playing Card CON IMAGEN
function PlayingCard({ textArray, characterImage }) {
  const [isHovered, setIsHovered] = useState(false)
  const [showReveal, setShowReveal] = useState(false)
  
  return (
    <motion.div
      className="relative cursor-pointer"
      style={{ maxWidth: '300px', width: '100%' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setShowReveal(!showReveal)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Border exterior */}
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
      
      {/* Tarjeta interior */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: showReveal ? '#0a0a0a' : '#18192b',
          aspectRatio: '3/4',
          transition: 'all 0.5s ease'
        }}
      >
        {showReveal && <CardEffect reveal={showReveal} />}
        
        {/* Imagen del personaje / contenido central */}
        <div className="absolute inset-0 flex items-center justify-center z-5">
          {characterImage ? (
            <img 
              src={characterImage} 
              alt="Character" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-8">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-purple-600/20 flex items-center justify-center">
                <span className="text-4xl">👤</span>
              </div>
              <p className="text-purple-400/60 text-sm">
                Agrega una imagen aquí
              </p>
            </div>
          )}
        </div>
        
        {/* Texto arriba */}
        <div
          className="absolute top-4 left-4 flex flex-col z-10"
          style={{
            color: isHovered ? '#f12b30' : '#00a9fe',
            fontSize: '28px',
            fontWeight: 'bold',
            letterSpacing: '4px'
          }}
        >
          {textArray?.map((letter, i) => <div key={i}>{letter}</div>)}
        </div>
        
        {/* Texto abajo (espejado) */}
        <div
          className="absolute bottom-4 right-4 flex flex-col z-10"
          style={{
            color: isHovered ? '#f12b30' : '#00a9fe',
            fontSize: '28px',
            fontWeight: 'bold',
            letterSpacing: '4px',
            transform: 'scale(-1)'
          }}
        >
          {textArray?.map((letter, i) => <div key={i}>{letter}</div>)}
        </div>
      </div>
    </motion.div>
  )
}

function App() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
  const [isExpired, setIsExpired] = useState(false)
  const [showCard, setShowCard] = useState(false)
  
  // URL del robot 3D de Spline (obtenela desde splinetool.com)
  // const robotSceneUrl = 'https://prod.spline.design/YOUR_SCENE_URL/scene.splinecode'
  const robotSceneUrl = ''
  
  // URL de la imagen del personaje (imagen local en public/)
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
      {/* MeshGradient Background */}
      <div className="absolute inset-0">
        <MeshGradient
          colors={['#1a0a2e', '#2d1b4e', '#4c1d95', '#6b21a8', '#0a0a0a']}
          speed={0.4}
          distortion={0.6}
          swirl={0.2}
          className="w-full h-full"
        />
      </div>
      
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
      
      {/* Botón de revelar en esquina superior izquierda */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => setShowCard(!showCard)}
        className="absolute top-6 left-6 z-20 text-purple-500/50 text-xs hover:text-purple-400 transition-colors"
      >
        {showCard ? '← Volver' : 'Click para revelar'}
      </motion.button>
      
      {/* Robot visual - siempre visible en esquina inferior derecha */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 right-6 z-20"
      >
        <InteractiveRobot sceneUrl={robotSceneUrl} />
      </motion.div>
      
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
          ) : showCard ? (
            <PlayingCard 
              textArray={['3', '6', '5']}
              characterImage={characterImage}
            />
          ) : (
            <motion.div
              key="countdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-8 md:gap-16"
            >
              {/* SIN CAJAS - solo números grandes flotando */}
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

// TimeUnit MINIMAL - sin cajas
function MinimalTimeUnit({ value, label }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center"
    >
      {/* Solo el número, muy grande, con glow sutil */}
      <motion.span
        animate={{ 
          textShadow: [
            '0 0 20px rgba(139, 92, 246, 0.3)',
            '0 0 40px rgba(139, 92, 246, 0.5)',
            '0 0 20px rgba(139, 92, 246, 0.3)'
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-7xl md:text-9xl font-light text-white tracking-tight"
      >
        {String(value).padStart(2, '0')}
      </motion.span>
      
      {/* Label pequeño abajo */}
      <span className="text-purple-400/50 text-xs md:text-sm mt-2 uppercase tracking-[0.3em]">
        {label}
      </span>
    </motion.div>
  )
}

export default App