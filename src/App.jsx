import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'

const TARGET_DATE = new Date('2026-10-19T00:00:00').getTime()

// --- Flip Unit ---
const FlipUnit = ({ digit }) => {
  const [currentDigit, setCurrentDigit] = useState(digit)
  const [isFlipping, setIsFlipping] = useState(false)

  useEffect(() => {
    if (digit !== currentDigit) {
      setIsFlipping(true)
      // Delay change para que se vea el flip
      setTimeout(() => {
        setCurrentDigit(digit)
      }, 150)
    }
  }, [digit, currentDigit])

  const handleAnimationEnd = () => {
    setIsFlipping(false)
  }

  return (
    <motion.span
      className="inline-block text-white"
      style={{
        fontSize: 'clamp(3rem, 10vw, 7rem)',
        fontWeight: 900,
        fontFamily: '"Orbitron", monospace',
        textShadow: '0 0 40px rgba(139, 92, 246, 0.8), 0 0 80px rgba(139, 92, 246, 0.4)',
        minWidth: '0.6em',
        textAlign: 'center',
      }}
      initial={{ rotateX: 0, opacity: 0 }}
      animate={{ 
        rotateX: isFlipping ? [0, -90, 0] : 0,
        opacity: 1 
      }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      onAnimationComplete={handleAnimationEnd}
    >
      {currentDigit}
    </motion.span>
  )
}

// --- Flip Countdown Principal ---
const FlipCountdown = ({ targetDate, onTimeUpdate }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date().getTime()
    const difference = targetDate - now
    
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000)
    }
  })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const difference = targetDate - now
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        clearInterval(timer)
        return
      }
      
      const newTime = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      }
      setTimeLeft(newTime)
      onTimeUpdate?.(newTime)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [targetDate, onTimeUpdate])

  // Pad digits - days can be 3 digits, hours/minutes/seconds are 2 digits
  const paddedDays = String(timeLeft.days).padStart(3, '0')
  const paddedHours = String(timeLeft.hours).padStart(2, '0')
  const paddedMinutes = String(timeLeft.minutes).padStart(2, '0')
  const paddedSeconds = String(timeLeft.seconds || 0).padStart(2, '0')

  return (
    <div className="flip-countdown-wrapper flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
      {/* DAYS */}
      <div className="flex flex-col items-center">
        <div className="flex items-baseline">
          {paddedDays.split('').map((digit, index) => (
            <FlipUnit key={`days-${index}`} digit={digit} />
          ))}
        </div>
        <span className="text-purple-400/70 text-lg md:text-2xl mt-3 uppercase tracking-[0.5em] font-semibold">DAYS</span>
      </div>
      
      <span className="text-purple-400/50 text-5xl md:text-7xl font-light -mt-10">:</span>
      
      {/* HOURS */}
      <div className="flex flex-col items-center">
        <div className="flex items-baseline">
          {paddedHours.split('').map((digit, index) => (
            <FlipUnit key={`hours-${index}`} digit={digit} />
          ))}
        </div>
        <span className="text-purple-400/70 text-lg md:text-2xl mt-3 uppercase tracking-[0.5em] font-semibold">HOURS</span>
      </div>
      
      <span className="text-purple-400/50 text-5xl md:text-7xl font-light -mt-10">:</span>
      
      {/* MINUTES */}
      <div className="flex flex-col items-center">
        <div className="flex items-baseline">
          {paddedMinutes.split('').map((digit, index) => (
            <FlipUnit key={`minutes-${index}`} digit={digit} />
          ))}
        </div>
        <span className="text-purple-400/70 text-lg md:text-2xl mt-3 uppercase tracking-[0.5em] font-semibold">MINUTES</span>
      </div>
      
      <span className="text-purple-400/50 text-5xl md:text-7xl font-light -mt-10">:</span>
      
      {/* SECONDS */}
      <div className="flex flex-col items-center">
        <div className="flex items-baseline">
          {paddedSeconds.split('').map((digit, index) => (
            <FlipUnit key={`seconds-${index}`} digit={digit} />
          ))}
        </div>
        <span className="text-purple-400/70 text-lg md:text-2xl mt-3 uppercase tracking-[0.5em] font-semibold">SECONDS</span>
      </div>
    </div>
  )
}

// --- Shader Background (Grid + Plasma) ---
const ShaderBackground = () => {
  const canvasRef = useRef(null);

  // Vertex shader source code
  const vsSource = `
    attribute vec4 aVertexPosition;
    void main() {
      gl_Position = aVertexPosition;
    }
  `;

  // Fragment shader source code
  const fsSource = `
    precision highp float;
    uniform vec2 iResolution;
    uniform float iTime;

    const float overallSpeed = 0.2;
    const float gridSmoothWidth = 0.015;
    const float axisWidth = 0.05;
    const float majorLineWidth = 0.025;
    const float minorLineWidth = 0.0125;
    const float majorLineFrequency = 5.0;
    const float minorLineFrequency = 1.0;
    const vec4 gridColor = vec4(0.5);
    const float scale = 5.0;
    const vec4 lineColor = vec4(0.4, 0.2, 0.8, 1.0);
    const float minLineWidth = 0.01;
    const float maxLineWidth = 0.2;
    const float lineSpeed = 1.0 * overallSpeed;
    const float lineAmplitude = 1.0;
    const float lineFrequency = 0.2;
    const float warpSpeed = 0.2 * overallSpeed;
    const float warpFrequency = 0.5;
    const float warpAmplitude = 1.0;
    const float offsetFrequency = 0.5;
    const float offsetSpeed = 1.33 * overallSpeed;
    const float minOffsetSpread = 0.6;
    const float maxOffsetSpread = 2.0;
    const int linesPerGroup = 16;

    #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
    #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
    #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))
    #define drawPeriodicLine(freq, width, t) drawCrispLine(freq / 2.0, width, abs(mod(t, freq) - (freq) / 2.0))

    float drawGridLines(float axis) {
      return drawCrispLine(0.0, axisWidth, axis)
            + drawPeriodicLine(majorLineFrequency, majorLineWidth, axis)
            + drawPeriodicLine(minorLineFrequency, minorLineWidth, axis);
    }

    float drawGrid(vec2 space) {
      return min(1.0, drawGridLines(space.x) + drawGridLines(space.y));
    }

    float random(float t) {
      return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
    }

    float getPlasmaY(float x, float horizontalFade, float offset) {
      return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * lineAmplitude + offset;
    }

    void main() {
      vec2 fragCoord = gl_FragCoord.xy;
      vec4 fragColor;
      vec2 uv = fragCoord.xy / iResolution.xy;
      vec2 space = (fragCoord - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;

      float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
      float verticalFade = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);

      space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + horizontalFade);
      space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * horizontalFade;

      vec4 lines = vec4(0.0);
      vec4 bgColor1 = vec4(0.1, 0.1, 0.3, 1.0);
      vec4 bgColor2 = vec4(0.3, 0.1, 0.5, 1.0);

      for(int l = 0; l < linesPerGroup; l++) {
        float normalizedLineIndex = float(l) / float(linesPerGroup);
        float offsetTime = iTime * offsetSpeed;
        float offsetPosition = float(l) + space.x * offsetFrequency;
        float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;
        float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 2.0;
        float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);
        float linePosition = getPlasmaY(space.x, horizontalFade, offset);
        float line = drawSmoothLine(linePosition, halfWidth, space.y) / 2.0 + drawCrispLine(linePosition, halfWidth * 0.15, space.y);

        float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
        vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));
        float circle = drawCircle(circlePosition, 0.01, space) * 4.0;

        line = line + circle;
        lines += line * lineColor * rand;
      }

      fragColor = mix(bgColor1, bgColor2, uv.x);
      fragColor *= verticalFade;
      fragColor.a = 1.0;
      fragColor += lines;

      gl_FragColor = fragColor;
    }
  `;

  const loadShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error: ', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  const initShaderProgram = (gl, vsSource, fsSource) => {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error('Shader program link error: ', gl.getShaderInfoLog(shaderProgram));
      return null;
    }

    return shaderProgram;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.warn('WebGL not supported.');
      return;
    }

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      },
      uniformLocations: {
        resolution: gl.getUniformLocation(shaderProgram, 'iResolution'),
        time: gl.getUniformLocation(shaderProgram, 'iTime'),
      },
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let startTime = Date.now();
    const render = () => {
      const currentTime = (Date.now() - startTime) / 1000;

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(programInfo.program);

      gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);
      gl.uniform1f(programInfo.uniformLocations.time, currentTime);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
      }} 
    />
  );
}

// --- Ojos Reactivos (EyeBall & Pupil) ---
const Pupil = ({ size = 12, maxDistance = 5, pupilColor = '#2D2D2D', forceLookX, forceLookY }) => {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const pupilRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX)
      setMouseY(e.clientY)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const calculatePupilPosition = () => {
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY }
    }
    if (!pupilRef.current) return { x: 0, y: 0 }

    const pupil = pupilRef.current.getBoundingClientRect()
    const pupilCenterX = pupil.left + pupil.width / 2
    const pupilCenterY = pupil.top + pupil.height / 2

    const deltaX = mouseX - pupilCenterX
    const deltaY = mouseY - pupilCenterY
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance)
    const angle = Math.atan2(deltaY, deltaX)
    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance

    return { x, y }
  }

  const pupilPosition = calculatePupilPosition()

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  )
}

const EyeBall = ({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = 'white', pupilColor = '#2D2D2D', isBlinking = false, forceLookX, forceLookY }) => {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const eyeRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX)
      setMouseY(e.clientY)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const calculatePupilPosition = () => {
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY }
    }
    if (!eyeRef.current) return { x: 0, y: 0 }

    const eye = eyeRef.current.getBoundingClientRect()
    const eyeCenterX = eye.left + eye.width / 2
    const eyeCenterY = eye.top + eye.height / 2

    const deltaX = mouseX - eyeCenterX
    const deltaY = mouseY - eyeCenterY
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance)
    const angle = Math.atan2(deltaY, deltaX)
    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance

    return { x, y }
  }

  const pupilPosition = calculatePupilPosition()

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  )
}

// Robot - se mueve cuando está el libro abierto
function InteractiveRobot({ onClick, showBook }) {
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
      className="fixed z-20 cursor-pointer -translate-x-1/2"
      style={{ 
        left: showBook ? '80%' : '50%', 
        bottom: showBook ? '20%' : '6%',
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        x: showBook ? 60 : position.x * 0.3,
        y: showBook ? 0 : position.y * 0.3,
        opacity: 1,
        scale: 1.1
      }}
      transition={{ type: 'spring', stiffness: 80, damping: 15 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
      whileHover={{ scale: 0.95 }}
    >
      <div className="relative w-28 h-28 flex items-center justify-center">
        <motion.svg viewBox="0 0 100 100" className="w-full h-full" animate={isHovering ? { rotate: [0, 12, -12, 0] } : { rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: isHovering ? 0.25 : 1.5 }}>
          <rect x="18" y="18" width="64" height="54" rx="12" fill="#4c1d95" />
          <motion.circle cx="36" cy="42" r="10" fill="#a855f7" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: isHovering ? 0.3 : 1.5 }} />
          <motion.circle cx="64" cy="42" r="10" fill="#a855f7" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: isHovering ? 0.3 : 1.5 }} />
          <circle cx="36" cy="42" r="5" fill="#fff" opacity="0.9" />
          <circle cx="64" cy="42" r="5" fill="#fff" opacity="0.9" />
          <rect x="36" y="56" width="28" height="6" rx="3" fill={isHovering ? '#f12b30' : '#8b5cf6'} />
          <line x1="50" y1="18" x2="50" y2="5" stroke="#8b5cf6" strokeWidth="5" />
          <circle cx="50" cy="5" r="5" fill="#c084fc"><animate attributeName="opacity" values="0.5;1;0.5" dur="0.4s" repeatCount="indefinite" /></circle>
          <rect x="22" y="75" width="56" height="16" rx="7" fill="none" stroke="#8b5cf6" strokeWidth="2.5" opacity="0.4" />
          <motion.rect x="3" y="55" width="14" height="18" rx="6" fill="#4c1d95" animate={isHovering ? { rotate: [-20, 20, -20] } : {}} transition={{ repeat: Infinity, duration: 0.3 }} />
          <motion.rect x="83" y="55" width="14" height="18" rx="6" fill="#4c1d95" animate={isHovering ? { rotate: [20, -20, 20] } : {}} transition={{ repeat: Infinity, duration: 0.3 }} />
        </motion.svg>
        <motion.div className="absolute inset-0 rounded-full bg-pink-500/35 blur-2xl -z-10" animate={{ opacity: isHovering ? [0.5, 0.8, 0.5] : 0.15 }} transition={{ repeat: Infinity, duration: 0.8 }} />
      </div>
    </motion.div>
  )
}

// Libro estilo shadcn/shugar de 21st.dev
function Book({ characterImage }) {
  const [isHovered, setIsHovered] = useState(false)
  const [showBack, setShowBack] = useState(false)
  
  return (
    <div 
      className="inline-block [perspective:900px]"
      onMouseEnter={() => setShowBack(true)}
      onMouseLeave={() => setShowBack(false)}
    >
      <motion.div
        className="relative w-[220px] h-[320px] md:w-[280px] md:h-[400px] cursor-pointer [transform-style:preserve-3d]"
        animate={{ rotateY: showBack ? -30 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 50 }}
      >
        {/* Back cover */}
        <div 
          className="absolute inset-0 rounded-l-md shadow-xl"
          style={{ 
            transform: 'translateZ(-20px)',
            background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #0f0a1f 100%)'
          }}
        >
          <div className="absolute left-2 top-3 bottom-3 w-1 bg-gradient-to-b from-white/8 via-transparent to-transparent" />
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p className="text-purple-300 font-semibold tracking-widest text-2xl" style={{ fontFamily: '"Bebas Neue", sans-serif' }}>365</p>
            <div className="w-10 h-px bg-purple-500/50" />
            <p className="text-purple-400/60 text-xs">THE BEGINNING</p>
            <p className="text-purple-500/35 text-xs mt-8">COMING SOON</p>
            <p className="text-purple-600/25 text-[10px] mt-6">31.X.2026</p>
          </div>
        </div>
        
        {/* Pages */}
        <div 
          className="absolute right-1 top-2 w-4 h-[calc(100%-1rem)] rounded-sm"
          style={{ 
            transform: 'rotateY(90deg)', 
            transformOrigin: 'left',
            background: 'linear-gradient(90deg, #cbd5e1, #fff 20%, #f1f5f9 50%, #fafafa 80%, #cbd5e1)'
          }}
        >
          <div className="mt-6 ml-1 space-y-2">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="h-0.5 w-16 bg-gray-400/35 rounded" style={{ opacity: 0.15 + Math.random() * 0.2 }} />
            ))}
          </div>
        </div>
        
        {/* Front cover with image */}
        <div 
          className="absolute inset-0 rounded-l-md overflow-hidden shadow-2xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img src={characterImage} alt="Portada" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />
          
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-5xl md:text-6xl font-bold text-white tracking-wider" style={{ fontFamily: '"Bebas Neue", sans-serif', textShadow: '0 3px 25px rgba(0,0,0,0.8)' }}>365</h2>
            <p className="text-purple-300/90 text-[9px] mt-1 uppercase tracking-[0.25em]">The Beginning</p>
          </div>
          
          <div className="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
          
          <motion.div 
            className="absolute inset-0 rounded-l-md border-2" 
            animate={{ 
              borderColor: isHovered ? 'rgba(168, 85, 247, 0.95)' : 'rgba(168, 85, 247, 0.15)', 
              boxShadow: isHovered ? '0 0 40px rgba(168, 85, 247, 0.6)' : 'none' 
            }} 
            transition={{ duration: 0.25 }} 
          />
        </div>
      </motion.div>
      
      <motion.p 
        initial={{ opacity: 0 }} 
        animate={{ opacity: isHovered ? 1 : 0 }} 
        className="absolute -bottom-8 left-0 right-0 text-center text-purple-400/70 text-[9px] tracking-widest"
      >
        ← CRONÓMETRO
      </motion.p>
    </div>
  )
}

// --- Pipo Easter Egg (Undertale/Pokemon style) ---
const PIPO_MESSAGES = [
  "Cuanto tiempo pasarias haciendo un regalo?.",
  "Mucho o poco tiempo? Depende desde donde lo mires.",
  "Paciencia…………",
  "La punta de el iceberg.",
  "1996 sera importante luego.",
  "Te gusta jugar a ser detective?.",
  "Cuanto tiempo falta?.",
  "Muchos secretos que descubrir.",
  "1……..9",
  "8 fases.",
  "Hecho desde 0 y solo con un objetivo.",
  "Cada dia haciendo algo mas.",
  "Un regalo? Nah, Una experiencia.",
  "El proyecto mas grande de mi vida.",
  "Aun falta.",
  "No seas impaciente.",
  "Cuantos mensajes crees que he echo?.",
  "Siempre un paso por delante.",
  "……………",
  "Recomiendo que le tomes captura a el cronometro.",
  "Consejo: Nunca pienses que descubriste todo.",
  "Nombre futbolista, Codigo, Nombre artista, Pokemon favorito.",
  "Se te va a hacer mas facil si empiezas desde ahora.",
  "Confio en que lo superaras.",
  "365",
  "Sera todo esto un sueno?.",
  "34536",
  "No quieras entender todo desde el principio, disfruta de la incertidumbre.",
  "Cada dia es uno menos. O uno mas?.",
  "Muchas preguntas pocas respuestas.",
  "Japon.",
  "Libre 365RUST.",
  "No te puedo dar mas pistas.",
  "Disfruta de el proceso.",
  "No me reconoces? Soy pipo.",
  "La respuesta es esperar.",
  "Te gusto la portada?.",
  "Solo una persona esta haciendo todo, alguien que te ama mucho.",
  "No es algo facil, pero es muy unico.",
  "Te tengo que decir que solo tengo algunos mensajes programados.",
  "Cuantas veces me has presionado?.",
  "Quieres seguir hablando?.",
  "Soy un unicornio un poco diferente a lo que es pipo pero asume que soy el mismo.",
  "Cobre vida? Donde estoy?.",
  "Todo puede ser malo pero nunca entenderas el sufrimiento de que te confundan con una bolsa de basura blanca.",
  "Cuanto tiempo mas voy a hablar, estoy cansado.",
  "Solo soy un simple unicornio que habla.",
  "Tengo hambre.",
  "Juguemos a algo, Choco, Choco, LA, LA, chocho, chocho, TE, TE, No? okey.",
  "Que dia esta haciendo hoy?."
]

// Images loaded from public folder
const PIPO_SPEAKING = '/images/unicorn-speaking.png'  // boca abierta
const PIPO_IDLE = '/images/unicorn-idle.png'    // boca cerrada

function UnicornEasterEgg({ isVisible }) {
  const [pipoLocked, setPipoLocked] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showDialogue, setShowDialogue] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Show if visible OR if locked (even if 19 is gone)
  const shouldShow = isVisible || pipoLocked
  
  const currentMessage = PIPO_MESSAGES[currentMessageIndex]
  
  // Typewriter effect
  useEffect(() => {
    if (!showDialogue) {
      setDisplayedText('')
      return
    }
    
    setDisplayedText('')
    setIsTyping(true)
    let index = 0
    
    const typeInterval = setInterval(() => {
      if (index < currentMessage.length) {
        setDisplayedText(currentMessage.slice(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(typeInterval)
      }
    }, 50)
    
    return () => clearInterval(typeInterval)
  }, [currentMessageIndex, showDialogue])
  
  // Cycle to next random message
  const nextMessage = () => {
    const nextIndex = Math.floor(Math.random() * PIPO_MESSAGES.length)
    setCurrentMessageIndex(nextIndex)
  }
  
const handleExpand = () => {
    if (isExpanded) {
      // Close and unlock (only close pipo)
      setShowDialogue(false)
      setDisplayedText('')
      setTimeout(() => {
        setIsExpanded(false)
        setPipoLocked(false)
      }, 300)
    } else {
      // Expand to center - lock pipo so it stays
      setPipoLocked(true)
      setIsExpanded(true)
      setShowDialogue(true)
      nextMessage()
    }
  }

  // Click on expanded pipo to get next message
  const handlePipoClick = () => {
    nextMessage()
  }

  if (!shouldShow) return null
  
  return (
    <>
      {/* Dark overlay when expanded (70%) */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/70"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Unicorn container */}
      <motion.div
        className={`fixed z-50 ${isExpanded ? 'inset-0 flex items-center justify-center' : 'top-4 right-4'}`}
        initial={false}
        animate={{
          scale: isExpanded ? 1 : 0.5
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.div
          className="cursor-pointer"
          onClick={isExpanded ? handlePipoClick : handleExpand}
          animate={isExpanded ? { scale: [1, 1.02, 1] } : { y: [0, -3, 0] }}
          transition={{ repeat: isExpanded ? Infinity : 0, duration: 2 }}
        >
          {/* Unicorn image - alternating between speaking and idle */}
          <img 
            src={showDialogue && isExpanded ? PIPO_SPEAKING : PIPO_IDLE}
            alt="Unicornio Mágico"
            className={`${isExpanded ? 'w-48 md:w-64' : 'w-16 md:w-20'} object-contain`}
            style={{ filter: 'drop-shadow(0 0 25px rgba(139, 92, 246, 0.8))' }}
          />
        </motion.div>
        
        {/* Dialogue Box (when expanded) */}
        {isExpanded && showDialogue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-8 md:bottom-16 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px]"
          >
            {/* Dialogue box */}
            <div className="bg-black/95 border-4 border-purple-500 rounded-lg p-4 relative shadow-2xl">
              {/* Character name */}
              <div className="absolute -top-5 left-4 bg-purple-600 text-white text-xs md:text-sm px-4 py-1 rounded font-bold tracking-wider">
PIPO
              </div>
              
              {/* Message text with typewriter */}
              <p className="text-white text-lg md:text-xl mt-3 font-mono min-h-[3rem] leading-relaxed">
                {displayedText}
                {isTyping && <span className="animate-pulse text-purple-400">▊</span>}
              </p>
              
              {/* Click for next message hint */}
              <div className="text-purple-400/70 text-xs mt-3 text-right">
                CLICK EN PIPO PARA OTRO MENSAJE
              </div>
              
              {/* X button to close */}
              <button
                onClick={handleExpand}
                className="absolute -top-4 -right-4 w-10 h-10 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Continue indicator */}
            <div className="flex justify-end mt-2 pr-2">
              <motion.span
                animate={{ opacity: [0, 1, 0], y: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="text-purple-400 text-2xl"
              >
                ▼
              </motion.span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  )
}

// --- Phases Progress Component (EXPANDABLE) ---
const TOTAL_PHASES = 8
const COMPLETED_PHASES = 4
const PHASE_SUBTITLES = [
  "Has completado la primera fase del proyecto. Solo faltan 7 mas.",
  "La segunda fase esta lista. Vamos bien, sigue asi.",
  "Tercer fase completa. Estas haciendo un gran trabajo.",
  "Ya casi llegas a la mitad. Continua asi!",
  "Fase 5: Esta bloqueada. Completed las anteriores primero.",
  "Fase 6: Esta bloqueada. Completed las anteriores primero.",
  "Fase 7: Esta bloqueada. Completed las anteriores primero.",
  "Fase 8: Ultima fase! Ya casi llegas."
]

function PhasesProgress({ setPhaseMessage }) {
  const [selectedPhase, setSelectedPhase] = useState(null)
  const [locked, setLocked] = useState(false)

  const handlePhaseClick = (index) => {
    const isCompleted = index < COMPLETED_PHASES
    
    if (isCompleted) {
      setSelectedPhase(index + 1)
      setLocked(true)
      setPhaseMessage?.(PHASE_SUBTITLES[index])
    } else {
      setSelectedPhase(index + 1)
      setLocked(true)
      setPhaseMessage?.(PHASE_SUBTITLES[index])
    }
  }

  const handleClose = () => {
    setSelectedPhase(null)
    setLocked(false)
    setPhaseMessage?.(null)
  }

  const showPhase = selectedPhase !== null && locked
  
  return (
    <>
      {/* Expanded phase view */}
      {showPhase && (
        <>
          {/* Dark overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80"
            onClick={handleClose}
          />
          
          {/* Phase content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            onClick={handleClose}
          >
            {/* Big FASE title */}
            <h1 className="text-7xl md:text-9xl font-black text-purple-400 mb-8" style={{ textShadow: '0 0 50px rgba(139,92,246,0.9)' }}>
              FASE {selectedPhase}
            </h1>
            
            {/* Subtitle */}
            <p className="text-purple-300 text-xl md:text-2xl max-w-md text-center px-8 leading-relaxed">
              {PHASE_SUBTITLES[selectedPhase - 1]}
            </p>
            
            {/* Close hint */}
            <p className="text-gray-500 text-sm mt-8">Click para cerrar</p>
          </motion.div>
        </>
      )}
      
      {/* Sidebar - only show when not expanded */}
      {!showPhase && (
        <div className="fixed left-0 top-0 bottom-0 w-16 md:w-20 z-30 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-between py-4 md:py-6 bg-black/60 border-r border-purple-500/30 backdrop-blur-sm px-2">
            
            <div className="flex-1 flex flex-col items-center justify-center gap-3 md:gap-4">
          {Array.from({ length: TOTAL_PHASES }).map((_, index) => {
            const isCompleted = index < COMPLETED_PHASES
            
            return (
              <div key={index} className="relative flex flex-col items-center">
                {/* Circle indicator - clickable */}
                <motion.div 
                  className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 cursor-pointer ${
                    isCompleted 
                      ? 'bg-purple-600 border-purple-500 hover:scale-125' 
                      : 'bg-gray-800 border-gray-700'
                  }`}
                  style={{ 
                    boxShadow: isCompleted ? '0 0 10px rgba(139,92,246,0.8)' : 'none'
                  }}
                  animate={isCompleted ? {
                    boxShadow: ['0 0 3px rgba(139,92,246,0.4)', '0 0 15px rgba(139,92,246,0.8)', '0 0 3px rgba(139,92,246,0.4)']
                  } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  whileHover={isCompleted ? { scale: 1.25 } : { scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePhaseClick(index)}
                >
                  {/* Checkmark for completed */}
                  {isCompleted && (
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  
                  {/* Number for pending */}
                  {!isCompleted && (
                    <span className="text-gray-500 text-xs md:text-sm font-bold">{index + 1}</span>
                  )}
                </motion.div>
                
                {/* Connector line */}
                {index < TOTAL_PHASES - 1 && (
                  <div 
                    className={`w-0.5 h-4 md:h-6 ${isCompleted ? 'bg-purple-600' : 'bg-gray-800'}`}
                  />
                )}
              </div>
            )
          })}
        </div>
        
        {/* Progress number at bottom */}
        <div className="text-center">
          <span className="text-purple-400 text-2xl md:text-3xl font-bold">{COMPLETED_PHASES}</span>
          <span className="text-gray-500 text-sm md:text-base">/{TOTAL_PHASES}</span>
        </div>
      </div>
        </div>
      )}
    </>
  )
}

function App() {
  const [isExpired, setIsExpired] = useState(false)
  const [showBook, setShowBook] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [phaseMessage, setPhaseMessage] = useState(null)
  
  // Detectar si hay un 19 en cualquier posición
  const hasNineteen = useMemo(() => {
    const daysStr = String(timeLeft.days).padStart(3, '0')
    const hoursStr = String(timeLeft.hours).padStart(2, '0')
    const minutesStr = String(timeLeft.minutes).padStart(2, '0')
    const secondsStr = String(timeLeft.seconds || 0).padStart(2, '0')
    
    return daysStr.includes('19') || hoursStr.includes('19') || minutesStr.includes('19') || secondsStr.includes('19')
  }, [timeLeft])
  
  const characterImage = '/images/book-cover.png'

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const difference = TARGET_DATE - now
      
      if (difference <= 0) {
        setIsExpired(true)
        clearInterval(timer)
        return
      }
      
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen w-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Phases Progress */}
      <PhasesProgress setPhaseMessage={setPhaseMessage} />
      
      {/* Phase message toast */}
      {phaseMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-purple-900/90 border border-purple-500 px-6 py-3 rounded-lg backdrop-blur-md"
          onClick={() => setPhaseMessage(null)}
        >
          <p className="text-white text-lg">{phaseMessage}</p>
          <p className="text-purple-400 text-xs text-center mt-2">Click para cerrar</p>
        </motion.div>
      )}
      
      {/* Shader Background - Grid + Plasma */}
      <ShaderBackground />
      
      {/* Overlay oscuro */}
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10,10,10,0.3)', zIndex: 1, pointerEvents: 'none' }} />
      
      {/* 365 giant background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.035 }} transition={{ duration: 2 }} className="text-[50vw] md:text-[60vw] font-black leading-none tracking-tight" style={{ fontFamily: '"Bebas Neue", sans-serif', color: '#8b5cf6' }}>
          365
        </motion.span>
      </div>
      
      {/* 1996 background - sutil arriba */}
      <div className="absolute top-8 md:top-16 left-0 right-0 flex justify-center pointer-events-none select-none z-5">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.08 }} transition={{ duration: 2, delay: 0.5 }} className="text-[8vw] md:text-[10vw] font-black leading-none tracking-tight" style={{ fontFamily: '"Orbitron", monospace', color: '#8b5cf6' }}>
          1996
        </motion.span>
      </div>
      
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {isExpired ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <h2 className="text-5xl md:text-7xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text">Espera</h2>
            <p className="text-2xl md:text-3xl text-purple-300 mt-4">Las puertas se abrirán pronto</p>
          </motion.div>
        ) : showBook ? (
          <Book characterImage={characterImage} />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <FlipCountdown targetDate={TARGET_DATE} onTimeUpdate={setTimeLeft} />
          </motion.div>
        )}
      </main>
      
      <InteractiveRobot onClick={() => setShowBook(!showBook)} showBook={showBook} />
      
      <UnicornEasterEgg isVisible={hasNineteen && !showBook} />
    </div>
  )
}

// Cronómetro SIN cajas - SOLO números flotando
function FloatingTime({ value, label }) {
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
      <motion.span
        animate={{ textShadow: ['0 0 20px rgba(139, 92, 246, 0.25)', '0 0 50px rgba(139, 92, 246, 0.5)', '0 0 20px rgba(139, 92, 246, 0.25)'] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-6xl md:text-8xl font-extralight text-white tracking-tight"
      >
        {String(value).padStart(2, '0')}
      </motion.span>
      <span className="text-purple-400/45 text-[10px] md:text-xs mt-1 uppercase tracking-[0.2em]">{label}</span>
    </motion.div>
  )
}

// Delete: FloatingTime nunca se usa
// Delete: cn nunca se usa
export default App
