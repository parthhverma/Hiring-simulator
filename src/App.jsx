import { useState, useEffect, useRef } from 'react'
import ResumeUpload from './components/ResumeUpload'
import Interview from './components/Interview'

function Reveal({ children, delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting)
    }, { threshold: 0.15 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${visible ? 'visible' : ''} ${delay ? `reveal-delay-${delay}` : ''}`}>{children}</div>
}

function ThreeDBackground({ scrollY }) {
  const containerRef = useRef(null)
  const scrollRef = useRef(0)
  useEffect(() => { scrollRef.current = scrollY }, [scrollY])
  useEffect(() => {
    let renderer, animId
    import('three').then((THREE) => {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.z = 5
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      containerRef.current.appendChild(renderer.domElement)
      const shape = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 1), new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.25 }))
      shape.position.set(2.5, 0, 0)
      scene.add(shape)
      const shape2 = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: 0x818cf8, wireframe: true, transparent: true, opacity: 0.2 }))
      shape2.position.set(-2.5, -1, -2)
      scene.add(shape2)
      const starsGeometry = new THREE.BufferGeometry()
      const positions = new Float32Array(400 * 3)
      for (let i = 0; i < 400 * 3; i++) positions[i] = (Math.random() - 0.5) * 20
      starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0x60a5fa, size: 0.02, transparent: true, opacity: 0.6 }))
      scene.add(stars)
      const resize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight) }
      window.addEventListener('resize', resize)
      let t = 0
      const animate = () => {
        t += 0.005
        shape.rotation.x = t * 0.5; shape.rotation.y = t * 0.3
        shape2.rotation.x = -t * 0.4; shape2.rotation.y = t * 0.6
        stars.rotation.y = t * 0.05
        const scroll = scrollRef.current
        const sf = scroll * 0.001
        shape.position.y = Math.sin(scroll * 0.002) * 1.5
        shape.position.x = 2.5 + Math.cos(scroll * 0.0015) * 0.5
        shape.rotation.z = sf
        shape2.position.y = -1 + Math.cos(scroll * 0.0018) * 1.2
        shape2.rotation.z = -sf * 0.8
        camera.position.y = -sf * 0.5
        camera.lookAt(0, 0, 0)
        renderer.render(scene, camera)
        animId = requestAnimationFrame(animate)
      }
      animate()
      containerRef.current.cleanup = () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId); renderer.dispose(); if (containerRef.current && renderer.domElement && containerRef.current.contains(renderer.domElement)) containerRef.current.removeChild(renderer.domElement) }
    })
    return () => { cancelAnimationFrame(animId); if (containerRef.current && containerRef.current.cleanup) containerRef.current.cleanup() }
  }, [])
  return <div ref={containerRef} id="bg-3d" />
}

function AnimatedBackground({ scrollY }) {
  const canvasRef = useRef(null)
  const scrollRef = useRef(0)
  useEffect(() => { scrollRef.current = scrollY }, [scrollY])
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const count = window.innerWidth < 768 ? 60 : 150
    const particles = Array.from({ length: count }, () => ({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, size: Math.random() * 1.5 + 0.3, opacity: Math.random() * 0.6 + 0.1 }))
    const themes = [{ r: 59, g: 130, b: 246 }, { r: 99, g: 102, b: 241 }, { r: 139, g: 92, b: 246 }, { r: 14, g: 165, b: 233 }, { r: 59, g: 130, b: 246 }]
    let t = 0
    const draw = () => {
      t++
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#030712'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const sp = Math.min(scrollRef.current / Math.max(docHeight, 1), 1)
      const si = sp * (themes.length - 1)
      const ct = Math.floor(si)
      const nt = Math.min(ct + 1, themes.length - 1)
      const bl = si - ct
      const c1 = themes[ct], c2 = themes[nt]
      const r = Math.round(c1.r + (c2.r - c1.r) * bl)
      const g = Math.round(c1.g + (c2.g - c1.g) * bl)
      const b = Math.round(c1.b + (c2.b - c1.b) * bl)
      const orbConfigs = [{ ox: 0.2, oy: 0.3, radius: 350, sinMult: 1000, cosMult: 800 }, { ox: 0.8, oy: 0.6, radius: 280, sinMult: 900, cosMult: 700 }, { ox: 0.5, oy: 0.8, radius: 220, sinMult: 800, cosMult: 900 }]
      orbConfigs.forEach((orb, i) => {
        const x = orb.ox * canvas.width + Math.sin(t * 0.0008 * orb.sinMult + i) * 100
        const y = orb.oy * canvas.height + Math.cos(t * 0.0008 * orb.cosMult + i) * 80
        const grad = ctx.createRadialGradient(x, y, 0, x, y, orb.radius)
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.15)`)
        grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.05)`)
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, orb.radius, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 80) { const a = 0.02 + 0.02 * Math.sin(t * 0.005 + x * 0.01); ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke() }
      for (let y = 0; y < canvas.height; y += 80) { const a = 0.02 + 0.02 * Math.sin(t * 0.005 + y * 0.01); ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke() }
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} id="bg-canvas" />
}

function App() {
  const [resumeText, setResumeText] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  const goHome = () => { setResumeText(''); setShowUpload(false); window.scrollTo(0, 0) }
  return (
    <div className="min-h-screen bg-[#030712]">
      <AnimatedBackground scrollY={scrollY} />
      <ThreeDBackground scrollY={scrollY} />
      <div className="content-layer">
        <nav className="px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md border-b border-white/5">
          <button onClick={goHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center text-sm">🎤</div>
            <span className="text-white font-bold text-xs sm:text-sm tracking-wider uppercase">HirePrep AI</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            {(resumeText || showUpload) && (
              <button onClick={goHome} className="text-white/40 hover:text-white text-xs uppercase tracking-widest transition-all flex items-center gap-1.5">← Home</button>
            )}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-white/40 text-xs">AI Online</span>
            </div>
          </div>
        </nav>
        {resumeText ? (
          <div className="flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12">
            <Interview resumeText={resumeText} />
          </div>
        ) : !showUpload ? (
          <>
            <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-6 sm:gap-8 relative">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-blue-400 text-[10px] sm:text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                AI-POWERED INTERVIEW SIMULATOR
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-none tracking-tighter uppercase">ACE YOUR</h1>
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black leading-none tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600">INTERVIEW</h1>
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white/20 leading-none tracking-tighter uppercase">BEFORE IT</h1>
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white/20 leading-none tracking-tighter uppercase">HAPPENS</h1>
              </div>
              <p className="text-white/40 text-sm sm:text-base leading-relaxed max-w-md px-2">Upload your resume. Your personal AI hiring manager reads it and conducts a real voice interview — questions built around your actual experience.</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button onClick={() => setShowUpload(true)} className="group bg-blue-600 hover:bg-blue-500 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold text-sm uppercase tracking-widest transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30">Start Interview <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span></button>
                <div className="text-white/20 text-xs uppercase tracking-widest">Free · No signup</div>
              </div>
              <div className="flex items-center gap-6 sm:gap-12 mt-4">
                {[{ num: '5', label: 'Questions' }, { num: 'AI', label: 'Voice Interview' }, { num: '∞', label: 'Practice Rounds' }].map((s, i) => (
                  <div key={i} className="text-center"><p className="text-2xl sm:text-3xl font-black text-white">{s.num}</p><p className="text-white/30 text-[10px] sm:text-xs uppercase tracking-widest mt-1">{s.label}</p></div>
                ))}
              </div>
              <div className="absolute bottom-8 flex flex-col items-center gap-2 animate-bounce"><span className="text-white/20 text-xs uppercase tracking-widest">Scroll</span><span className="text-white/20 text-sm">↓</span></div>
            </section>
            <section className="py-20 sm:py-32 px-4 sm:px-8 max-w-5xl mx-auto">
              <Reveal>
                <div className="text-center mb-10 sm:mb-16"><p className="text-indigo-400 text-xs uppercase tracking-widest mb-3">The Process</p><h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">How It Works</h2></div>
              </Reveal>
              <Reveal delay={1}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {[{ step: '01', icon: '��', title: 'Upload Resume', desc: 'Drop your PDF resume into the app. Our AI reads every line — your experience, skills, and projects.' }, { step: '02', icon: '🤖', title: 'AI Reads It', desc: 'The hiring manager AI analyzes your background and builds personalized questions just for you.' }, { step: '03', icon: '🎤', title: 'Voice Interview', desc: 'Speak your answers out loud like a real interview. Get instant feedback after every question.' }].map((s, i) => (
                    <div key={i} className="relative bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/8 hover:border-indigo-500/30 transition-all duration-500 group">
                      <div className="text-5xl sm:text-6xl font-black text-white/5 absolute top-6 right-6 group-hover:text-indigo-500/10 transition-all">{s.step}</div>
                      <div className="text-3xl mb-4">{s.icon}</div>
                      <h3 className="text-white font-bold text-lg uppercase tracking-tight mb-2">{s.title}</h3>
                      <p className="text-white/40 text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </section>
            <section className="py-20 sm:py-32 px-4 sm:px-8 max-w-5xl mx-auto">
              <Reveal>
                <div className="text-center mb-10 sm:mb-16"><p className="text-purple-400 text-xs uppercase tracking-widest mb-3">What You Get</p><h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">Features</h2></div>
              </Reveal>
              <Reveal delay={1}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[{ icon: '🧠', title: 'Personalized Questions', desc: 'AI reads your actual resume and asks about your real experience — not generic interview questions.' }, { icon: '🎤', title: 'Voice Input', desc: 'Speak your answers naturally. No typing. The mic listens continuously with a 2-minute timer.' }, { icon: '💬', title: 'Instant Feedback', desc: 'After every answer, the AI gives you honest feedback on what was strong and what to improve.' }, { icon: '⏸', title: 'Stop and Resume AI', desc: 'Interrupt the AI mid-sentence, think, then resume from exactly where it stopped.' }, { icon: '⏱', title: '2 Min Answer Timer', desc: 'A countdown timer appears when you speak. Trains you to give concise, structured answers.' }, { icon: '🏆', title: 'Final Score', desc: 'After 5 questions, get an overall score out of 10 with a summary of your performance.' }].map((f, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 hover:bg-white/8 hover:border-purple-500/20 transition-all duration-300 flex gap-4">
                      <div className="text-2xl shrink-0">{f.icon}</div>
                      <div><h3 className="text-white font-bold text-sm uppercase tracking-tight mb-1">{f.title}</h3><p className="text-white/40 text-sm leading-relaxed">{f.desc}</p></div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </section>
            <section className="py-20 sm:py-32 px-4 sm:px-8 max-w-5xl mx-auto">
              <Reveal>
                <div className="text-center mb-10 sm:mb-16"><p className="text-cyan-400 text-xs uppercase tracking-widest mb-3">Who It's For</p><h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">Built For You</h2></div>
              </Reveal>
              <Reveal delay={1}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[{ icon: '🎓', title: 'First Job Hunters', desc: 'Landing your first job is nerve-wracking. Practice until the interview feels natural.' }, { icon: '��', title: 'Career Switchers', desc: 'Pivoting industries? Practice framing your past experience for a new role.' }, { icon: '📈', title: 'Promotion Seekers', desc: 'Going for a senior role? Practice articulating your impact and leadership.' }].map((w, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 text-center hover:bg-white/8 hover:border-cyan-500/20 transition-all duration-300">
                      <div className="text-4xl mb-4">{w.icon}</div><h3 className="text-white font-bold text-sm uppercase tracking-tight mb-2">{w.title}</h3><p className="text-white/40 text-sm leading-relaxed">{w.desc}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </section>
            <section className="pt-16 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-8 text-center">
              <Reveal>
                <div className="max-w-2xl mx-auto flex flex-col items-center gap-6 sm:gap-8">
                  <div className="flex flex-col items-center gap-2">
                    <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white uppercase tracking-tight leading-none">Ready to</h2>
                    <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Practice?</h2>
                  </div>
                  <p className="text-white/40 text-sm px-4">Free. No signup. Just upload your resume and go.</p>
                  <button onClick={() => setShowUpload(true)} className="group bg-blue-600 hover:bg-blue-500 text-white px-10 sm:px-12 py-4 sm:py-5 rounded-full font-bold text-sm uppercase tracking-widest transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40">Start Interview <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span></button>
                </div>
              </Reveal>
            </section>
            <footer className="border-t border-white/5 px-4 sm:px-8 py-8 sm:py-10">
              <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2"><div className="w-6 h-6 bg-blue-500/20 border border-blue-500/30 rounded-md flex items-center justify-center text-xs">🎤</div><span className="text-white font-bold text-sm tracking-wider uppercase">HirePrep AI</span></div>
                  <p className="text-white/20 text-xs">Built by Parth Verma · Toronto 🍁</p>
                </div>
                <div className="flex items-center gap-6">
                  <a href="https://github.com/parthhverma" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white text-sm transition-all flex items-center gap-2">GitHub <span className="text-xs">↗</span></a>
                  <a href="https://www.linkedin.com/in/parth-verma-a47566269" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white text-sm transition-all flex items-center gap-2">LinkedIn <span className="text-xs">↗</span></a>
                </div>
              </div>
            </footer>
          </>
        ) : (
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-lg flex flex-col items-center gap-6 animate-fade-in-up">
              <button onClick={() => setShowUpload(false)} className="self-start text-white/30 hover:text-white/60 text-sm flex items-center gap-1 transition-all">← Back</button>
              <div className="text-center"><h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">Upload Resume</h2><p className="text-white/40 text-sm mt-2">We'll read it and build your interview</p></div>
              <div className="w-full"><ResumeUpload onResumeLoad={setResumeText} /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
