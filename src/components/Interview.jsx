import { useState } from 'react'

function Interview({ resumeText }) {
  const [messages, setMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)

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
  }

  const sendAnswer = async () => {
    if (!userInput.trim()) return

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
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendAnswer()
    }
  }

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

      {/* Controls */}
      {!interviewStarted ? (
        <button
          onClick={startInterview}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all w-full"
        >
          🚀 Start Interview
        </button>
      ) : (
        <div className="flex gap-2">
          <textarea
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your answer... (Press Enter to send)"
            className="flex-1 border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-blue-400"
            rows={3}
            disabled={loading}
          />
          <button
            onClick={sendAnswer}
            disabled={loading || !userInput.trim()}
            className="bg-blue-600 text-white px-4 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            Send
          </button>
        </div>
      )}
    </div>
  )
}

export default Interview