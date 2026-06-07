import { useState } from 'react'
import ResumeUpload from './components/ResumeUpload'
import Interview from './components/Interview'

function App() {
  const [resumeText, setResumeText] = useState('')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        🎤 Hiring Manager Simulator
      </h1>
      <p className="text-gray-400 mb-8 text-sm">
        Upload your resume to start your mock interview
      </p>

      {!resumeText ? (
        <ResumeUpload onResumeLoad={setResumeText} />
      ) : (
        <Interview resumeText={resumeText} />
      )}
    </div>
  )
}

export default App