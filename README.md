# Professional Portfolio Generator

A Full Stack Development project that generates professional portfolios using AI.

## Project Structure

```
Frontend/
├── index.html          (Basic info page)
├── form.html          (Detailed form)
├── portfolio.html     (Portfolio display)
├── script.js          (Form handlers)
├── form-script.js     (Form submission)
├── portfolio-script.js (Portfolio logic + PDF download)
└── style.css          (All styling)

Backend/
├── server.js          (Express API)
├── package.json       (Dependencies)
└── .env              (API key - create this)
```

## How It Works

### Page Flow

1. **index.html** - User enters basic info (Name, Title, Email)
   - Stores in sessionStorage
   - Redirects to form.html

2. **form.html** - User fills comprehensive details
   - Phone, location, social links, photo
   - Skills, experience, projects, education, certifications, testimonials
   - Submits to backend API
   - Stores portfolio in localStorage
   - Redirects to portfolio.html

3. **portfolio.html** - Beautiful portfolio display
   - Shows all portfolio content
   - Download as PDF button

## Setup

### Backend Setup
```bash
cd Backend
npm install
# Create .env file with: GROQ_API_KEY=your_key
node server.js
```

### Frontend Setup
1. Open `Frontend/index.html` in browser
2. Or use: `python -m http.server 8000`

## Features

✅ 2-page form flow (Basic → Detailed)
✅ Professional portfolio display
✅ PDF download
✅ Photo upload
✅ Social media links (LinkedIn, GitHub, Twitter, Website)
✅ AI-powered content generation (Groq API)
✅ Responsive design
✅ Dark professional theme

## Form Sections

**Page 1 (index.html):**
- Name
- Professional title
- Email

**Page 2 (form.html):**
- Phone (optional)
- Location (optional)
- Social media links (optional)
- Professional photo (optional)
- Professional summary
- Skills
- Work experience
- Projects
- Education
- Certifications
- Testimonials (optional)
- Additional details (optional)

## Technologies

- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js, Express
- AI: Groq API (Llama 3.3)
- PDF: html2pdf.js

## Browser Support

Chrome, Firefox, Safari, Edge (modern versions)

## API Endpoint

**POST /generate-portfolio**

Takes all form data and returns AI-enhanced portfolio content.

## Notes

- API key from: https://console.groq.com
- Make sure backend is running on http://localhost:3001
- Uses sessionStorage for basic form data
- Uses localStorage for complete portfolio data
