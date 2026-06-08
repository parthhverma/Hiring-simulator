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
  const ANSWER_TIME = 120

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
    utterance.onend = () => {
      setIsSpeaking(false)
      remainingTextRef.current = ''
    }
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const resumeSpeaking = () => {
    if (remainingTextRef.current) {
      speak(remainingTextRef.current)
    }
  }

  const startTimer = () => {
    setTimeLeft(ANSWER_TIME)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          stopListening()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopTimer = () => {
    clearInterval(timerRef.current)
    setTimeLeft(ANSWER_TIME)
  }

  const startListening = () => {
    stopSpeaking()

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition not supported. Use Chrome.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    let finalTranscript = ''

    recognition.onstart = () => {
      setIsListening(true)
      setUserInput('')
      finalTranscript = ''
      startTimer()
    }

    recognition.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript + ' '
        } else {
          interim += e.results[i][0].transcript
        }
      }
      setUserInput(finalTranscript + interim)
    }

    recognition.onerror = (e) => {
      if (e.error === 'no-speech') return
      console.error('Speech error:', e.error)
      setIsListening(false)
      stopTimer()
    }

    recognition.onend = () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch {
          setIsListening(false)
          stopTimer()
        }
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
    stopTimer()
  }

  const callGroq = async (conversation) => {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
      },
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

    const firstQuestion = await callGroq([{
      role: 'user',
      content: 'Please start the interview by introducing yourself briefly and asking your first question.'
    }])

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

    const newMessages = [
      ...messages,
      { role: 'user', content: userInput }
    ]

    setMessages(newMessages)
    setUserInput('')
    setLoading(true)

    const response = await callGroq(newMessages)

    setMessages([
      ...newMessages,
      { role: 'assistant', content: response }
    ])
    setQuestionCount(prev => prev + 1)
    setLoading(false)
    speak(response)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendAnswer()
    }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      window.speechSynthesis.cancel()
    }
  }, [])

  return (
    <div className="w-full max-w-2xl flex flex-col gap-4">

      {/* Header */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👔</span>
          <div>
            <p className="font-semibold text-gray-800">AI Hiring Manager</p>
            <p className="text-xs text-gray-400">Based on your resume</p>
          </div>
        </div>
        {interviewStarted && (
          <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium">
            Question {Math.min(questionCount, 5)} of 5
          </span>
        )}
      </div>

      {/* AI Speaking Banner */}
      {(isSpeaking || remainingTextRef.current) && (
        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <span className={isSpeaking ? 'animate-pulse text-lg' : 'text-lg'}>
              {isSpeaking ? '🔊' : '⏸'}
            </span>
            <span className="text-sm text-indigo-700 font-medium">
              {isSpeaking ? 'AI is speaking...' : 'AI paused'}
            </span>
          </div>
          <div className="flex gap-2">
            {isSpeaking ? (
              <button
                onClick={stopSpeaking}
                className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-all"
              >
                ⏹ Stop
              </button>
            ) : (
              <button
                onClick={resumeSpeaking}
                className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-all"
              >
                ▶ Resume
              </button>
            )}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-4 min-h-64 max-h-96 overflow-y-auto">
        {!interviewStarted && !loading && (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            Click "Start Interview" to begin
          </div>
        )}

        {messages
          .filter(m => !(m.role === 'user' && m.content === 'Please start the interview by introducing yourself briefly and asking your first question.'))
          .map((msg, i) => (
            msg.role === 'assistant' ? (
              <div key={i} className="flex gap-3">
                <span className="text-xl shrink-0">👔</span>
                <div className="bg-gray-50 rounded-xl rounded-tl-none p-3 text-sm text-gray-700 leading-relaxed">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div key={i} className="flex gap-3 justify-end">
                <div className="bg-blue-600 rounded-xl rounded-tr-none p-3 text-sm text-white leading-relaxed max-w-xs">
                  {msg.content}
                </div>
                <span className="text-xl shrink-0">🧑</span>
              </div>
            )
          ))}

        {loading && (
          <div className="flex gap-3">
            <span className="text-xl shrink-0">👔</span>
            <div className="bg-gray-50 rounded-xl rounded-tl-none p-3 text-sm text-gray-400">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Timer */}
      {isListening && (
        <div className={`flex items-center justify-center gap-2 py-2 rounded-xl font-mono text-lg font-bold ${
          timeLeft <= 30 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
        }`}>
          <span>🎤</span>
          <span>{formatTime(timeLeft)}</span>
          <span className="text-xs font-normal text-gray-400">time remaining</span>
        </div>
      )}

      {/* Controls */}
      {!interviewStarted ? (
        <button
          onClick={startInterview}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all w-full"
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
              placeholder={isListening ? '🎤 Listening — speak your answer...' : 'Type your answer or use the mic...'}
              className="flex-1 border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-blue-400"
              rows={3}
              disabled={loading}
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={loading}
                className={`px-4 py-2 rounded-xl font-medium transition-all text-white ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-gray-600 hover:bg-gray-700'
                } disabled:opacity-50`}
              >
                {isListening ? '⏹ Stop' : '🎤 Mic'}
              </button>
              <button
                onClick={sendAnswer}
                disabled={loading || !userInput.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">
            🎤 Mic auto-stops AI • ▶ Resume AI anytime • 2 min per answer
          </p>
        </div>
      )}
    </div>
  )
}

export default Interview