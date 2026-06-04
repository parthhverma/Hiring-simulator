import { useState } from 'react'

function App() {
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const testGroq = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{
            role: 'user',
            content: 'Say hello and introduce yourself as an AI hiring manager in 2 sentences.'
          }]
        })
      })
      const data = await res.json()
      setResponse(data.choices[0].message.content)
    } catch (err) {
      console.error(err)
      setResponse('Error — check your API key')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        🎤 Hiring Manager Simulator
      </h1>
      <button
        onClick={testGroq}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all"
      >
        {loading ? 'Thinking...' : 'Test Groq API'}
      </button>
      {response && (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-sm max-w-lg text-gray-700">
          {response}
        </div>
      )}
    </div>
  )
}

export default App