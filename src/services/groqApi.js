// Handles all communication with the Groq AI API
// Separating this from components keeps our code clean and reusable

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

const typeInstructions = {
  general: 'Ask a balanced mix of questions covering their background, motivations, and experience.',
  technical: 'Focus on technical questions about the skills, tools, and technologies listed on their resume. Ask about how they solved technical problems.',
  behavioral: 'Focus on behavioral questions using the STAR method — ask about teamwork, conflict, leadership, and handling challenges.'
}

export async function askHiringManager(conversation, resumeText, interviewType = 'general') {
  const systemPrompt = {
    role: 'system',
    content: `You are a professional hiring manager conducting a job interview.
    You have read the candidate's resume.
    Ask ONE interview question at a time based on their actual experience.
    ${typeInstructions[interviewType]}
    After they answer, give brief feedback (1-2 sentences) then ask the next question.
    After 5 questions, say "Thank you for your time!" and give an overall score out of 10 with a short summary.
    Keep responses concise and professional.
    Here is the candidate's resume: ${resumeText}`
  }

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [systemPrompt, ...conversation]
    })
  })

  if (!res.ok) {
    throw new Error(`API request failed with status ${res.status}`)
  }

  const data = await res.json()
  return data.choices[0].message.content
}