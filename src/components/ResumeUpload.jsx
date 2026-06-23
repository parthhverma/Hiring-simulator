import { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

function ResumeUpload({ onResumeLoad }) {
  const [status, setStatus] = useState('')
  const [isDragging, setIsDragging] = useState(false)

const processFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setStatus('Please upload a PDF file')
      return
    }

    setStatus('Reading your resume...')

    try {
      const arrayBuffer = await file.arrayBuffer()
      const typedArray = new Uint8Array(arrayBuffer)
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise

      let fullText = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        fullText += content.items.map(item => item.str).join(' ') + '\n'
      }

      const cleanText = fullText.trim()
      if (cleanText.length < 50) {
        setStatus('⚠️ Couldn\'t read text from this PDF. It might be a scanned image — please upload a text-based resume.')
        return
      }

      setStatus('Resume loaded!')
      onResumeLoad(cleanText)
    } catch (err) {
      setStatus('Error reading PDF. Please try another file.')
    }
  }

  const handleFile = (e) => processFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  return (
    <div className="w-full">
      <label
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-44 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-white/20 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/5'
        }`}
      >
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
            isDragging ? 'bg-blue-500/20 scale-110' : 'bg-white/10'
          }`}>
            📄
          </div>
          <div className="text-center">
            <p className="text-white/70 text-sm font-medium">
              {status || 'Drop your resume here'}
            </p>
            <p className="text-white/30 text-xs mt-1">PDF files only • Click to browse</p>
          </div>
        </div>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFile}
          className="hidden"
        />
      </label>
    </div>
  )
}

export default ResumeUpload