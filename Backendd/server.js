// server.js
// Purpose:
// - Node/Express backend that powers AI features for the portfolio generator.
// - Provides endpoints for:
//   - Health check
//   - Grammar enhancement (/enhance-text)
//   - AI-generated portfolio content (/generate-portfolio)
//   - Role validation (/validate-engineering-role)
//   - Profile analysis suggestions (/analyze-profile)
// - Uses Groq SDK (LLM) with API key stored in .env

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const port = 3001;

// Middleware
// CORS allows the frontend (opened in browser) to call this backend.
// JSON/body limits are raised because photo uploads are stored as base64 strings.
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Groq
// Groq client is used to call the LLM models.
// GROQ_API_KEY must be present in Backend/.env
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Health check endpoint
// Simple endpoint used to verify the backend is running.
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Enhance text endpoint
// Used to quickly correct/enhance small pieces of text (e.g., one field at a time).
// Input: { text, section }
// Output: { enhancedText }
app.post("/enhance-text", async (req, res) => {
    try {
        const { text, section } = req.body;

        if (!text || !section) {
            return res.status(400).json({ error: "Missing text or section parameter" });
        }

        console.log(`\n🎨 Enhancing text for ${section} section`);

        // Prompt sent to the LLM.
        const prompt = `Make this text professional: "${text}"`;

        let completion;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                // LLM call. Temperature is set to 0 for deterministic grammar correction.
                completion = await groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "Correct grammar. Return only corrected text." },
                        { role: "user", content: text }
                    ],
                    temperature: 0,
                    max_tokens: 30
                });
                break; // Success, exit retry loop
            } catch (networkError) {
                retryCount++;
                console.log(`Retry attempt ${retryCount}/${maxRetries} for text enhancement...`);
                if (retryCount >= maxRetries) {
                    throw networkError;
                }
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
        }

        const enhancedText = completion.choices[0]?.message?.content || text;
        console.log("✓ Text enhanced successfully");

        return res.json({ enhancedText: enhancedText.trim() });

    } catch (error) {
        console.error("✗ Error enhancing text:", error.message);
        return res.status(500).json({ error: "Server error: " + error.message });
    }
});

// Generate portfolio endpoint
// Creates a full professional portfolio narrative based on the user's form inputs.
// Input: full form payload (name/email/field are required)
// Output: { portfolio: string, photoData: string|null }
app.post("/generate-portfolio", async (req, res) => {
    try {
        // Frontend sends data directly, not nested
        const { name, email, field, phone, location, linkedin, github, twitter, website, about, skills, experience, projects, education, certifications, testimonials, photoData, details } = req.body;

        if (!name || !email || !field) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        console.log(`\n🚀 Generating portfolio for ${name} (${field})`);
        console.log('Form data received:', { name, email, field, phone: phone || 'Not provided', location: location || 'Not provided' });

        // Prompt instructs the LLM to rewrite/expand the portfolio in a professional style.
        const portfolioPrompt = `Create a comprehensive professional portfolio for ${name}, who is a ${field}. 

Personal Information:
- Name: ${name}
- Email: ${email}
- Field: ${field}
- Phone: ${phone || 'Not provided'}
- Location: ${location || 'Not provided'}
- LinkedIn: ${linkedin || 'Not provided'}
- GitHub: ${github || 'Not provided'}
- Twitter: ${twitter || 'Not provided'}
- Website: ${website || 'Not provided'}

Professional Summary:
${about || 'No summary provided'}

Skills:
${skills || 'No skills provided'}

Experience:
${experience || 'No experience provided'}

Projects:
${projects || 'No projects provided'}

Education:
${education || 'No education provided'}

Certifications:
${certifications || 'No certifications provided'}

Testimonials:
${testimonials || 'No testimonials provided'}

Additional Details:
${details || 'No additional details provided'}

Please enhance and expand this content to create a comprehensive, professional portfolio. Make it impressive, detailed, and well-structured. Use professional language throughout.`;

        let completion;

        // Initialize retry mechanism for network errors
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                // LLM call for a longer output (max_tokens ~2000).
                completion = await groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: portfolioPrompt }],
                    temperature: 0.7,
                    max_tokens: 2000
                });
                break; // Success, exit retry loop
            } catch (networkError) {
                // Handle network error, increment retry count and wait before retrying
                retryCount++;
                console.log(`Retry attempt ${retryCount}/${maxRetries} for network error...`);
                if (retryCount >= maxRetries) {
                    throw networkError;
                }
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
        }

        // Extract portfolio content from LLM response
        const portfolioContent = completion.choices[0]?.message?.content || "Portfolio generation failed";
        console.log("✓ Portfolio generated successfully");

        return res.json({ 
            portfolio: portfolioContent.trim(),
            photoData: photoData || null
        });

    } catch (error) {
        console.error("✗ Error generating portfolio:", error.message);
        return res.status(500).json({ error: "Server error: " + error.message });
    }
});

// Engineering role validation endpoint
// Verifies that a job role belongs to engineering/technical domains.
// Used early in the flow to restrict this project to engineering-related roles.
app.post("/validate-engineering-role", async (req, res) => {
    try {
        const { role } = req.body;

        if (!role) {
            return res.json({ isEngineering: false, message: "Please enter an engineering or technical role to continue" });
        }

        console.log(`\n🔍 Validating engineering role: ${role}`);

        // Prompt asks the LLM to validate the role.
        const validationPrompt = `You are a strict validation function for an Engineering Portfolio Generator. 

Your task is to determine if the following job role belongs to engineering or technical fields.

Job Role: "${role}"

ACCEPTABLE ENGINEERING DOMAINS:
• Software / Web / App Development  
• Computer Science / IT  
• Mechanical Engineering  
• Electrical / Electronics Engineering  
• Civil Engineering  
• Chemical Engineering  
• Data Science / Data Engineering  
• AI / ML / Robotics  
• Cybersecurity  
• Embedded / IoT  
• Cloud / DevOps  
• Engineering Student / Intern  

INVALID DOMAINS:
• Business / Management / MBA  
• Marketing / Sales  
• HR / Recruitment  
• Law / Medicine  
• Arts / Design (non-technical)  
• Influencer / Content Creator  
• Student (without engineering context)

Respond with ONLY JSON:
If engineering-related: {"isEngineering":true,"message":"Valid engineering role"}
If not engineering-related: {"isEngineering":false,"message":"Please enter an engineering or technical role to continue"}`;

        let completion;

        // Initialize retry mechanism for network errors
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                // LLM call with temperature set to 0 for deterministic validation
                completion = await groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "You are a validation function. Only respond with JSON as specified." },
                        { role: "user", content: validationPrompt }
                    ],
                    temperature: 0,
                    max_tokens: 100
                });
                break; // Success, exit retry loop
            } catch (networkError) {
                // Handle network error, increment retry count and wait before retrying
                retryCount++;
                console.log(`Retry attempt ${retryCount}/${maxRetries} for role validation...`);
                if (retryCount >= maxRetries) {
                    throw networkError;
                }
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
        }

        // Extract validation result from LLM response
        const aiResponse = completion.choices[0]?.message?.content || '{"isEngineering":false,"message":"Please enter an engineering or technical role to continue"}';
        
        try {
            // Parse the model output (expects strict JSON)
            const parsedResponse = JSON.parse(aiResponse);
            console.log(`✓ Role validation completed: ${parsedResponse.isEngineering ? 'VALID' : 'INVALID'}`);
            return res.json(parsedResponse);
        } catch (parseError) {
            console.log("✗ Failed to parse AI response, defaulting to invalid");
            return res.json({ isEngineering: false, message: "Please enter an engineering or technical role to continue" });
        }

    } catch (error) {
        console.error("✗ Error validating role:", error.message);
        return res.json({ isEngineering: false, message: "Please enter an engineering or technical role to continue" });
    }
});

// Analyze profile endpoint for AI suggestions
// Called by the Validate button on form.html.
// Input: { formData: {...} }
// Output: { suggestions: [ {category, text}, ... ] }
app.post("/analyze-profile", async (req, res) => {
    try {
        const { formData } = req.body;

        if (!formData) {
            return res.status(400).json({ error: "Missing form data" });
        }

        console.log(`\n🔍 Analyzing profile for: ${formData.name || 'Unknown'}`);

        // Prompt asks the LLM for concise suggestions in JSON array format.
        const analysisPrompt = `Analyze this engineering portfolio data and provide suggestions for improvement:

Name: ${formData.name || 'Not provided'}
Email: ${formData.email || 'Not provided'}
Field: ${formData.field || 'Not provided'}
Phone: ${formData.phone || 'Not provided'}
Location: ${formData.location || 'Not provided'}
LinkedIn: ${formData.linkedin || 'Not provided'}
GitHub: ${formData.github || 'Not provided'}
About: ${formData.about || 'Not provided'}
Skills: ${formData.skills || 'Not provided'}
Experience: ${formData.experience || 'Not provided'}
Projects: ${formData.projects || 'Not provided'}
Education: ${formData.education || 'Not provided'}
Certifications: ${formData.certifications || 'Not provided'}
Testimonials: ${formData.testimonials || 'Not provided'}

Provide suggestions in JSON format with categories. Focus on:
1. Missing critical information
2. Areas that need more detail
3. Professional improvements
4. Technical skills enhancement
5. Portfolio completeness

IMPORTANT: Keep each suggestion concise - exactly 4-10 words maximum. Use bullet points or short phrases.

Return only JSON array like:
[
  {"category": "Missing Information", "text": "Add phone number"},
  {"category": "Profile Enhancement", "text": "Include 2-3 key achievements"}
]`;

        let completion;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                // LLM should return only valid JSON array.
                completion = await groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        { role: "system", content: "You are a career counselor analyzing engineering portfolios. Return only valid JSON array with category and text fields. Each suggestion must be EXACTLY 4-10 words maximum. Be concise and actionable." },
                        { role: "user", content: analysisPrompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                });
                break;
            } catch (error) {
                console.error(`Attempt ${retryCount + 1} failed:`, error.message);
                retryCount++;
                if (retryCount >= maxRetries) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
        }

        const aiResponse = completion.choices[0]?.message?.content || '[]';
        
        try {
            // Parse JSON array of suggestions.
            const suggestions = JSON.parse(aiResponse);
            console.log(`✓ Profile analysis completed: ${suggestions.length} suggestions`);
            return res.json({ suggestions });
        } catch (parseError) {
            console.log("✗ Failed to parse AI response, using fallback");
            const fallbackSuggestions = [
                { category: "Profile Enhancement", text: "Consider adding more details to your about section" },
                { category: "Missing Information", text: "Make sure to include your work experience" }
            ];
            return res.json({ suggestions: fallbackSuggestions });
        }

    } catch (error) {
        console.error("✗ Error analyzing profile:", error.message);
        return res.status(500).json({ error: "Failed to analyze profile" });
    }
});

// Start server
// Starts Express on port 3001.
app.listen(port, () => {
    console.log(`API Key loaded: ${process.env.GROQ_API_KEY ? '✓ YES' : '✗ NO'}`);
    console.log(`✓ Server running on http://localhost:${port}`);
    console.log("Ready to generate portfolios!");
});
