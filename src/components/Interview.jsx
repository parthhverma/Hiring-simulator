import { useState, useRef, useEffect } from 'react'

function Interview({ resumeText }) {
  const [messages, setMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const recognitionRef = useRef(null)
  const timerRef = useRef(null)
  const remainingTextRef = useRef('')
  const messagesEndRef = useRef(null)
  const ANSWER_TIME = 120

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const speak = (text) => {
    window.speechSynthesis.cancel()
    remainingTextRef.current = text
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1
    const words = text.split(' ')
    let wordIndex = 0
    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        wordIndex++
        remainingTextRef.current = words.slice(wordIndex).join(' ')
      }
    }
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => { setIsSpeaking(false); remainingTextRef.current = '' }
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => { window.speechSynthesis.cancel(); setIsSpeaking(false) }
  const resumeSpeaking = () => { if (remainingTextRef.current) speak(remainingTextRef.current) }

  const startTimer = () => {
    setTimeLeft(ANSWER_TIME)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); stopListening(); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const stopTimer = () => { clearInterval(timerRef.current); setTimeLeft(ANSWER_TIME) }

  const startListening = () => {
    stopSpeaking()
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { alert('Use Chrome for voice features.'); return }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    let finalTranscript = ''

    recognition.onstart = () => { setIsListening(true); setUserInput(''); finalTranscript = ''; startTimer() }
    recognition.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript + ' '
        else interim += e.results[i][0].transcript
      }
      setUserInput(finalTranscript + interim)
    }
    recognition.onerror = (e) => { if (e.error === 'no-speech') return; setIsListening(false); stopTimer() }
    recognition.onend = () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.start() }
        catch { setIsListening(false); stopTimer() }
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop(); recognitionRef.current = null }
    setIsListening(false)
    stopTimer()
  }

  const callGroq = async (conversation) => {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a professional hiring manager conducting a job interview. 
            You have read the candidate's resume. 
            Ask ONE interview question at a time based on their actual experience.
            After they answer, give brief feedback (1-2 sentences) then ask the next question.
            After 5 questions, say "Thank you for your time!" and give an overall score out of 10 with a short summary.
            Keep responses concise and professional.
            Here is the candidate's resume: ${resumeText}`
          },
          ...conversation
        ]
      })
    })
    const data = await res.json()
    return data.choices[0].message.content
  }

  const startInterview = async () => {
    setLoading(true)
    setInterviewStarted(true)
    const firstQuestion = await callGroq([{ role: 'user', content: 'Please start the interview by introducing yourself briefly and asking your first question.' }])
    setMessages([
      { role: 'user', content: 'Please start the interview by introducing yourself briefly and asking your first question.' },
      { role: 'assistant', content: firstQuestion }
    ])
    setQuestionCount(1)
    setLoading(false)
    speak(firstQuestion)
  }

  const sendAnswer = async () => {
    if (!userInput.trim()) return
    if (isListening) stopListening()
    stopSpeaking()
    const newMessages = [...messages, { role: 'user', content: userInput }]
    setMessages(newMessages)
    setUserInput('')
    setLoading(true)
    const response = await callGroq(newMessages)
    setMessages([...newMessages, { role: 'assistant', content: response }])
    setQuestionCount(prev => prev + 1)
    setLoading(false)
    speak(response)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAnswer() }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    return () => { clearInterval(timerRef.current); window.speechSynthesis.cancel() }
  }, [])

  const visibleMessages = messages.filter(m => !(m.role === 'user' && m.content === 'Please start the interview by introducing yourself briefly and asking your first question.'))

  return (
    <div className="w-full max-w-2xl flex flex-col gap-4">

      {/* Header */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-xl">👔</div>
          <div>
            <p className="font-semibold text-white text-sm">AI Hiring Manager</p>
            <p className="text-white/40 text-xs">Reading from your resume</p>
          </div>
        </div>
        {interviewStarted && (
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
            <span className="text-blue-400 text-xs font-medium">Q {Math.min(questionCount, 5)} of 5</span>
          </div>
        )}
      </div>

      {/* AI Speaking Banner */}
      {(isSpeaking || remainingTextRef.current) && (
        <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center ${isSpeaking ? 'animate-pulse' : ''}`}>
              {isSpeaking ? '🔊' : '⏸'}
            </div>
            <span className="text-indigo-300 text-sm font-medium">
              {isSpeaking ? 'AI is speaking...' : 'AI paused'}
            </span>
          </div>
          {isSpeaking ? (
            <button onClick={stopSpeaking} className="text-xs bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-500/30 transition-all">
              ⏹ Stop
            </button>
          ) : (
            <button onClick={resumeSpeaking} className="text-xs bg-green-500/20 border border-green-500/30 text-green-300 px-3 py-1.5 rounded-lg hover:bg-green-500/30 transition-all">
              ▶ Resume
            </button>
          )}
        </div>
      )}

      {/* Chat Messages */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 min-h-72 max-h-[420px] overflow-y-auto">
        {!interviewStarted && !loading && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl">💼</div>
            <p className="text-white/30 text-sm">Click Start Interview to begin</p>
          </div>
        )}

        {visibleMessages.map((msg, i) => (
          msg.role === 'assistant' ? (
            <div key={i} className="flex gap-3 animate-fade-in-up">
              <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5">👔</div>
              <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-white/80 leading-relaxed max-w-[85%]">
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-3 justify-end animate-fade-in-up">
              <div className="bg-blue-600 rounded-2xl rounded-tr-none px-4 py-3 text-sm text-white leading-relaxed max-w-[75%]">
                {msg.content}
              </div>
              <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5">🧑</div>
            </div>
          )
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in-up">
            <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5">👔</div>
            <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-white/40 thinking-dot"></div>
              <div className="w-2 h-2 rounded-full bg-white/40 thinking-dot"></div>
              <div className="w-2 h-2 rounded-full bg-white/40 thinking-dot"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Timer */}
      {isListening && (
        <div className={`flex items-center justify-center gap-3 py-3 rounded-xl border font-mono font-bold text-lg animate-fade-in-up ${
          timeLeft <= 30
            ? 'bg-red-500/10 border-red-500/20 text-red-400'
            : 'bg-green-500/10 border-green-500/20 text-green-400'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${timeLeft <= 30 ? 'bg-red-400' : 'bg-green-400'} pulse-ring`}></div>
          <span>{formatTime(timeLeft)}</span>
          <span className="text-xs font-normal text-white/30">remaining</span>
        </div>
      )}

      {/* Controls */}
      {!interviewStarted ? (
        <button
          onClick={startInterview}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
        >
          🚀 Start Interview
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <textarea
              key={questionCount}
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isListening ? '🎤 Listening — speak your answer...' : 'Type your answer or click the mic...'}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
              rows={3}
              disabled={loading}
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={loading}
                className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                  isListening
                    ? 'bg-red-500/20 border border-red-500/30 text-red-400 pulse-ring'
                    : 'bg-white/10 border border-white/10 text-white/70 hover:bg-white/15'
                } disabled:opacity-30`}
              >
                {isListening ? '⏹' : '🎤'}
              </button>
              <button
                onClick={sendAnswer}
                disabled={loading || !userInput.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
          <p className="text-xs text-white/20 text-center">
            🎤 mic stops AI • ▶ resume AI • Enter to send • 2 min limit
          </p>
        </div>
      )}
    </div>
  )
}

export default Interview