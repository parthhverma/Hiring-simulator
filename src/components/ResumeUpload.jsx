import { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

function ResumeUpload({ onResumeLoad }) {
  const [status, setStatus] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setStatus('Reading PDF...')

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

      setStatus('Resume loaded!')
      onResumeLoad(fullText)
    } catch (err) {
      setStatus('Error: ' + err.message)
    }
  }

  return (
    <div className="w-full max-w-lg flex flex-col items-center gap-4">
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFile}
      />
      {status && <p className="text-sm text-blue-600">{status}</p>}
    </div>
  )
}

export default ResumeUpload