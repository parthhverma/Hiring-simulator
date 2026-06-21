# 🎤 HirePrep AI — AI-Powered Mock Interview Simulator

An AI-powered web app that reads your resume and conducts a personalized **voice interview** — just like the real thing. Upload your PDF resume, and an AI hiring manager asks questions based on your actual experience, then gives instant feedback.

🔗 **Live Demo:** [hiring-simulator.vercel.app](https://hiring-simulator.vercel.app)

---

## ✨ Features

- 📄 **Resume Parsing** — Upload a PDF and the app extracts and reads your full resume
- 🧠 **Personalized Questions** — AI generates interview questions based on your real experience, not generic templates
- 🎤 **Voice Interview** — Speak your answers out loud; the AI speaks its questions back to you
- 💬 **Instant Feedback** — Get honest feedback after every answer
- ⏱️ **Answer Timer** — A 2-minute countdown trains you to give concise, structured responses
- ⏸️ **Stop & Resume AI** — Interrupt the AI mid-sentence and resume from where it left off
- �� **Final Score** — Receive an overall score and summary after the interview
- 🎨 **Cinematic UI** — Animated 3D background with scroll-reactive themes, fully responsive

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React (Vite) |
| Styling | Tailwind CSS |
| AI / LLM | Groq API (Llama 3.3 70B) |
| PDF Parsing | PDF.js |
| Voice | Web Speech API |
| 3D Graphics | Three.js |
| Deployment | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS version)
- A free Groq API key from [console.groq.com](https://console.groq.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/parthhverma/Hiring-simulator.git

# Navigate into the project
cd Hiring-simulator

# Install dependencies
npm install

# Create a .env file in the root and add your API key
echo "VITE_GROQ_API_KEY=your_key_here" > .env

# Start the development server
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## 🧠 How It Works

1. The user uploads a PDF resume
2. **PDF.js** extracts the text content from the document
3. The resume text is sent to the **Groq API** with a system prompt instructing the AI to act as a hiring manager
4. The AI generates personalized questions based on the resume
5. The **Web Speech API** handles speech-to-text (your answers) and text-to-speech (AI's questions)
6. After 5 questions, the AI provides an overall score and feedback summary

---

## 📌 Future Improvements

- User accounts to save interview history and track progress over time
- Backend server to securely handle API requests
- Support for multiple interview types (behavioral, technical, case)
- Higher-quality voice using a dedicated text-to-speech service

---

## 👤 Author

**Parth Verma**
Toronto, Canada 🍁

- GitHub: [@parthhverma](https://github.com/parthhverma)
- LinkedIn: [Parth Verma](https://www.linkedin.com/in/parth-verma-a47566269)

---

⭐ If you found this project interesting, consider giving it a star!
