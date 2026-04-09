import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MeshGradient } from '@paper-design/shaders-react'
import * as THREE from 'three'

// Fecha objetivo: 31 de octubre de 2026 a las 00:00:00
const TARGET_DATE = new Date('2026-10-31T00:00:00').getTime()

// Woven Light Canvas Component ( Three.js )
function WovenCanvas() {
  const mountRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)

    const mouse = new THREE.Vector2(0, 0)
    const clock = new THREE.Clock()

    // Woven Silk - Torus Knot particles
    const particleCount = 30000
    const positions = new Float32Array(particleCount * 3)
    const originalPositions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    const geometry = new THREE.BufferGeometry()
    const torusKnot = new THREE.TorusKnotGeometry(1.5, 0.5, 150, 24)

    for (let i = 0; i < particleCount; i++) {
      const vertexIndex = i % torusKnot.attributes.position.count
      const x = torusKnot.attributes.position.getX(vertexIndex)
      const y = torusKnot.attributes.position.getY(vertexIndex)
      const z = torusKnot.attributes.position.getZ(vertexIndex)
      
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      originalPositions[i * 3] = x
      originalPositions[i * 3 + 1] = y
      originalPositions[i * 3 + 2] = z

      // Morado/violeta para el estilo misterioso
      const color = new THREE.Color()
      const hue = 0.75 + Math.random() * 0.1 // Morado (0.75)
      color.setHSL(hue, 0.7, 0.4 + Math.random() * 0.2)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
      
      velocities[i * 3] = 0
      velocities[i * 3 + 1] = 0
      velocities[i * 3 + 2] = 0
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.015,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    const handleMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)

    const animate = () => {
      requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()
      
      const mouseWorld = new THREE.Vector3(mouse.x * 3, mouse.y * 3, 0)

      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3
        const iy = i * 3 + 1
        const iz = i * 3 + 2

        const currentPos = new THREE.Vector3(positions[ix], positions[iy], positions[iz])
        const originalPos = new THREE.Vector3(originalPositions[ix], originalPositions[iy], originalPositions[iz])
        const velocity = new THREE.Vector3(velocities[ix], velocities[iy], velocities[iz])

        const dist = currentPos.distanceTo(mouseWorld)
        if (dist < 1.5) {
          const force = (1.5 - dist) * 0.01
          const direction = new THREE.Vector3().subVectors(currentPos, mouseWorld).normalize()
          velocity.add(direction.multiplyScalar(force))
        }

        const returnForce = new THREE.Vector3().subVectors(originalPos, currentPos).multiplyScalar(0.001)
        velocity.add(returnForce)
        
        velocity.multiplyScalar(0.95)

        positions[ix] += velocity.x
        positions[iy] += velocity.y
        positions[iz] += velocity.z
        
        velocities[ix] = velocity.x
        velocities[iy] = velocity.y
        velocities[iz] = velocity.z
      }
      geometry.attributes.position.needsUpdate = true

      points.rotation.y = elapsedTime * 0.05
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} className="absolute inset-0 z-0" />
}

// Theme Switcher Component
function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(true)

  return (
    <motion.button
      onClick={() => setIsDark(!isDark)}
      className="relative z-20 p-6 fixed top-0 right-0"
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative flex h-12 w-20 items-center rounded-full p-1 transition-all duration-300"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at top left, #1e1b4b 0%, #0f0a1f 40%, #05050a 100%)'
            : 'radial-gradient(ellipse at top left, #fefefe 0%, #e2e8f0 40%, #cbd5e1 100%)',
          boxShadow: isDark
            ? 'inset 0 0 15px rgba(0, 0, 0, 0.5)'
            : 'inset 0 0 15px rgba(148, 163, 184, 0.2)',
          border: '2px solid rgba(139, 92, 246, 0.3)',
        }}
      >
        <motion.div
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{
            background: isDark
              ? 'linear-gradient(145deg, #6b21a8 0%, #4c1d95 50%, #2e1065 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #fefefe 50%, #f8fafc 100%)',
            boxShadow: isDark
              ? 'inset 0 1px 2px rgba(255, 255, 255, 0.15), 0 2px 8px rgba(0, 0, 0, 0.6)'
              : 'inset 0 1px 2px rgba(255, 255, 255, 1), 0 2px 8px rgba(0, 0, 0, 0.18)',
          }}
          animate={{ x: isDark ? 44 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <span className="text-sm">{isDark ? '🌙' : '☀️'}</span>
        </motion.div>
      </div>
    </motion.button>
  )
}

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
      {/* Woven Light Canvas */}
      <WovenCanvas />
      
      {/* MeshGradient overlay sutil */}
      <div className="absolute inset-0 opacity-30">
        <MeshGradient
          colors={['#1a0a2e', '#2d1b4e', '#4c1d95', '#6b21a8', '#0a0a0a']}
          speed={0.3}
          distortion={0.4}
          swirl={0.1}
          className="w-full h-full"
        />
      </div>
      
      {/* Overlay para oscurecer */}
      <div className="absolute inset-0 bg-[#0a0a0a]/60" />
      
      {/* 365 grande de fondo - bien atras */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          transition={{ duration: 2 }}
          className="text-[40vw] md:text-[50vw] font-black leading-none tracking-tight"
          style={{ 
            fontFamily: '"Bebas Neue", "Inter", "Helvetica Neue", sans-serif',
            letterSpacing: '-0.02em',
            color: '#8b5cf6',
          }}
        >
          365
        </motion.span>
      </div>
      
      {/* Theme Switcher */}
      <ThemeSwitcher />
      
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