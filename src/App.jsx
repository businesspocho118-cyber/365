import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Fecha objetivo: 31 de octubre de 2026 a las 00:00:00
const TARGET_DATE = new Date('2026-10-31T00:00:00').getTime()

// Shader Background estilo líquido/molecular
function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl')

    if (!gl) {
      console.error('WebGL not supported')
      return
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()

    // Vertex shader
    const vertexShaderSource = `
      attribute vec4 aVertexPosition;
      void main() {
        gl_Position = aVertexPosition;
      }
    `

    // Fragment shader - Estilo líquido morado/misterioso
    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;

      void main() {
        vec2 p = (2.0 * gl_FragCoord.xy - iResolution.xy) / min(iResolution.x, iResolution.y);
        p *= 1.5;
        
        for(int i = 0; i < 6; i++) {
          vec2 newp = vec2(
            p.y + cos(p.x + iTime * 0.5) - sin(p.y * cos(iTime * 0.2)),
            p.x - sin(p.y - iTime * 0.5) - cos(p.x * sin(iTime * 0.3))
          );
          p = newp;
        }
        
        // Colores morados/misteriosos
        float r = 0.4 + 0.3 * sin(p.y * 2.0 + iTime * 0.3);
        float g = 0.2 + 0.1 * sin(p.x * 3.0 + iTime * 0.4);
        float b = 0.6 + 0.3 * cos(p.y * 1.5 + iTime * 0.2);
        
        // Mantener los colores en tonos morados/negróticos
        vec3 color = vec3(
          clamp(r * 0.4, 0.05, 0.25),
          clamp(g * 0.15, 0.02, 0.12),
          clamp(b * 0.6, 0.15, 0.45)
        );
        
        gl_FragColor = vec4(color, 1.0);
      }
    `

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fragmentShader, fragmentShaderSource)
    gl.compileShader(fragmentShader)

    const shaderProgram = gl.createProgram()!
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)
    gl.useProgram(shaderProgram)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    )

    const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition')
    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

    const timeUniformLocation = gl.getUniformLocation(shaderProgram, 'iTime')
    const resolutionUniformLocation = gl.getUniformLocation(shaderProgram, 'iResolution')

    let startTime = Date.now()
    const render = () => {
      const currentTime = (Date.now() - startTime) / 1000
      gl.uniform1f(timeUniformLocation, currentTime)
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
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
      {/* Shader de fondo estilo líquido */}
      <ShaderBackground />
      
      {/* Overlay para oscurecer slightly el shader */}
      <div className="absolute inset-0 bg-[#0a0a0a]/70" />
      
      {/* 365 grande de fondo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 1.5 }}
          className="text-[20vw] md:text-[25vw] font-bold text-purple-500 leading-none tracking-tighter"
          style={{ 
            fontFamily: '"Inter", "Helvetica Neue", sans-serif',
            fontWeight: 900
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
              className="flex gap-6 md:gap-12"
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
              '0 0 20px rgba(139, 92, 246, 0.2)',
              '0 0 40px rgba(139, 92, 246, 0.4)',
              '0 0 20px rgba(139, 92, 246, 0.2)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 md:w-32 h-28 md:h-36 rounded-2xl bg-purple-900/20 border border-purple-500/20 backdrop-blur-sm flex items-center justify-center"
        >
          <span className="text-5xl md:text-7xl font-bold text-white tracking-tight">
            {String(value).padStart(2, '0')}
          </span>
        </motion.div>
      </div>
      <span className="text-purple-400/70 text-sm md:text-base mt-3 uppercase tracking-widest">{label}</span>
    </motion.div>
  )
}

export default App