import { useState } from 'react'
import ResumeUpload from './components/ResumeUpload'

function App() {
  const [resumeText, setResumeText] = useState('')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)

  const handleResumeLoad = (text) => {
    setResumeText(text)
    console.log('Resume loaded:', text.slice(0, 200))
  }

  const startInterview = async () => {
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
            role: 'system',
            content: `You are a professional hiring manager conducting a job interview. 
            You have just read the candidate's resume. Ask them ONE specific interview 
            question based on their actual experience and skills. Be professional and friendly.
            Do not say anything else, just ask the question.`
          },
          {
            role: 'user',
            content: `Here is my resume:\n\n${resumeText}\n\nPlease ask me your first interview question.`
          }]
        })
      })
      const data = await res.json()
      setQuestion(data.choices[0].message.content)
    } catch (err) {
      console.error(err)
      setQuestion('Error — please try again')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        🎤 Hiring Manager Simulator
      </h1>
      <p className="text-gray-400 mb-8 text-sm">Upload your resume to start your mock interview</p>

      {!resumeText ? (
        <ResumeUpload onResumeLoad={handleResumeLoad} />
      ) : (
        <div className="w-full max-w-lg flex flex-col items-center gap-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 w-full flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-medium text-green-800">Resume loaded successfully</p>
              <p className="text-xs text-green-600">{resumeText.length} characters extracted</p>
            </div>
          </div>

          {!question && (
            <button
              onClick={startInterview}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all w-full"
            >
              {loading ? 'Preparing your interview...' : 'Start Interview 🚀'}
            </button>
          )}

          {question && (
            <div className="bg-white rounded-xl shadow-sm p-6 w-full border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">👔</span>
                <span className="font-semibold text-gray-700">Hiring Manager</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{question}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App