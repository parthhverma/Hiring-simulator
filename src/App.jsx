import { useState, useEffect, useRef } from 'react'
import ResumeUpload from './components/ResumeUpload'
import Interview from './components/Interview'

function AnimatedBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Particles
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.6 + 0.1,
    }))

    // Orbs
    const orbs = [
      { x: window.innerWidth * 0.2, y: window.innerHeight * 0.3, r: 300, color: '59,130,246', speed: 0.0008 },
      { x: window.innerWidth * 0.8, y: window.innerHeight * 0.6, r: 250, color: '99,102,241', speed: 0.0012 },
      { x: window.innerWidth * 0.5, y: window.innerHeight * 0.8, r: 200, color: '14,165,233', speed: 0.001 },
    ]

    let t = 0

    const draw = () => {
      t++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background
      ctx.fillStyle = '#030712'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Orbs
      orbs.forEach((orb, i) => {
        const x = orb.x + Math.sin(t * orb.speed * 1000 + i) * 80
        const y = orb.y + Math.cos(t * orb.speed * 800 + i) * 60
        const grad = ctx.createRadialGradient(x, y, 0, x, y, orb.r)
        grad.addColorStop(0, `rgba(${orb.color}, 0.12)`)
        grad.addColorStop(1, `rgba(${orb.color}, 0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, orb.r, 0, Math.PI * 2)
        ctx.fill()
      })

      // Grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'
      ctx.lineWidth = 1
      const gridSize = 80
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }

      // Particles
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(147,197,253,${p.opacity})`
        ctx.fill()
      })

      // Connect nearby particles
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(147,197,253,${0.08 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} id="bg-canvas" />
}

function App() {
  const [resumeText, setResumeText] = useState('')
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div className="min-h-screen bg-[#030712] overflow-hidden">
      <AnimatedBackground />

      <div className="content-layer min-h-screen flex flex-col">

        {/* Nav */}
        <nav className="px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center text-sm">🎤</div>
            <span className="text-white font-bold text-sm tracking-wider uppercase">HirePrep AI</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-white/40 text-xs">AI Online</span>
          </div>
        </nav>

        {/* Main */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          {!resumeText ? (
            !showUpload ? (

              /* LANDING HERO */
              <div className="w-full max-w-4xl flex flex-col items-center text-center gap-8">

                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-blue-400 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                  AI-POWERED INTERVIEW SIMULATOR
                </div>

                <div className="flex flex-col gap-2">
                  <h1 className="text-7xl font-black text-white leading-none tracking-tighter uppercase">
                    ACE YOUR
                  </h1>
                  <h1 className="text-7xl font-black leading-none tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600">
                    INTERVIEW
                  </h1>
                  <h1 className="text-7xl font-black text-white/20 leading-none tracking-tighter uppercase">
                    BEFORE IT
                  </h1>
                  <h1 className="text-7xl font-black text-white/20 leading-none tracking-tighter uppercase">
                    HAPPENS
                  </h1>
                </div>

                <p className="text-white/40 text-base leading-relaxed max-w-md">
                  Upload your resume. Your personal AI hiring manager reads it and conducts a real voice interview — questions built around your actual experience.
                </p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowUpload(true)}
                    className="group relative bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30"
                  >
                    Start Interview
                    <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
                  </button>
                  <div className="text-white/20 text-xs uppercase tracking-widest">Free · No signup</div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-12 mt-4">
                  {[
                    { num: '5', label: 'Questions' },
                    { num: 'AI', label: 'Voice Interview' },
                    { num: '∞', label: 'Practice Rounds' },
                  ].map((s, i) => (
                    <div key={i} className="text-center">
                      <p className="text-3xl font-black text-white">{s.num}</p>
                      <p className="text-white/30 text-xs uppercase tracking-widest mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

              </div>

            ) : (

              /* UPLOAD SCREEN */
              <div className="w-full max-w-lg flex flex-col items-center gap-6 animate-fade-in-up">
                <button onClick={() => setShowUpload(false)} className="self-start text-white/30 hover:text-white/60 text-sm flex items-center gap-1 transition-all">
                  ← Back
                </button>
                <div className="text-center">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">Upload Resume</h2>
                  <p className="text-white/40 text-sm mt-2">We'll read it and build your interview</p>
                </div>
                <div className="w-full backdrop-blur-sm">
                  <ResumeUpload onResumeLoad={setResumeText} />
                </div>
              </div>

            )
          ) : (
            <Interview resumeText={resumeText} />
          )}
        </div>
      </div>
    </div>
  )
}

export default App