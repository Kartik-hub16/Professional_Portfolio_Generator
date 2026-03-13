// Enhanced Professional Portfolio Script
// Purpose:
// - Loads the portfolio data saved from index.html/form.html (sessionStorage/localStorage)
// - Renders portfolio.html by filling DOM elements section-by-section
// - Provides Download HTML feature by generating a standalone HTML file with inline CSS
class ProfessionalPortfolio {
    constructor() {
        // `data` will hold the user's portfolio object once loaded from storage.
        // Rendering functions read from this object and update the DOM.
        this.data = null;
        // Main init flow (load -> render -> wire events).
        this.init();
    }

    init() {
        // Entry point when portfolio.html loads.
        // If storage has data we render the portfolio; otherwise sample data is created.
        this.loadData();
        if (this.data) {
            this.renderPortfolio();
            this.initializeAnimations();
            this.setupEventListeners();
            this.createParticles();
        } else {
            console.log('No portfolio data found, creating sample data for testing');
            this.createSampleData();
            if (this.data) {
                this.renderPortfolio();
                this.initializeAnimations();
                this.setupEventListeners();
                this.createParticles();
            }
        }
    }

    // Load portfolio data from storage
    loadData() {
        try {
            // Debug logs help confirm which storage key is being used.
            console.log('=== Portfolio Data Loading Debug ===');
            console.log('All sessionStorage keys:', Object.keys(sessionStorage));
            
            // Priority order:
            // 1) portfolioData (direct form submission)
            // 2) generatedPortfolio (AI-generated portfolio string)
            // 3) legacy keys (portfolio)
            // 4) localStorage fallback
            // Try to get data from sessionStorage first (from form.html)
            let storedData = sessionStorage.getItem("portfolioData");
            console.log('portfolioData found:', storedData ? 'YES' : 'NO');
            
            // If not found, try generated portfolio from backend
            if (!storedData) {
                storedData = sessionStorage.getItem("generatedPortfolio");
                console.log('generatedPortfolio found:', storedData ? 'YES' : 'NO');
            }
            
            // If not found, try legacy keys
            if (!storedData) {
                storedData = sessionStorage.getItem("portfolio");
                console.log('portfolio found:', storedData ? 'YES' : 'NO');
            }
            
            // If not found, try localStorage
            if (!storedData) {
                storedData = localStorage.getItem("portfolio");
                console.log('localStorage portfolio found:', storedData ? 'YES' : 'NO');
            }
            
            if (storedData) {
                // Parse JSON string into an object.
                this.data = JSON.parse(storedData);
                console.log("Portfolio data loaded successfully:", this.data);
                console.log("Data keys:", Object.keys(this.data));
                
                // Photo may be stored separately for convenience.
                // Also load photo data if available
                const photoData = sessionStorage.getItem("portfolioPhoto");
                if (photoData) {
                    this.data.photoData = photoData;
                }
            } else {
                console.log("No portfolio data found in sessionStorage or localStorage");
                console.log("Available sessionStorage keys:", Object.keys(sessionStorage));
            }
        } catch (error) {
            console.error("Error loading portfolio data:", error);
            this.data = null;
        }
    }

    // Create sample data for testing
    createSampleData() {
        // Sample data is used when no portfolio data is found in storage.
        // This allows the portfolio to still render with some content.
        this.data = {
            name: "John Doe",
            field: "Full Stack Developer",
            email: "john.doe@example.com",
            phone: "+1 (555) 123-4567",
            location: "San Francisco, CA",
            linkedin: "https://linkedin.com/in/johndoe",
            github: "https://github.com/johndoe",
            about: "Experienced full stack developer with expertise in modern web technologies including React, Node.js, and cloud platforms. Passionate about creating scalable, user-friendly applications and solving complex technical challenges.",
            skills: "JavaScript, React, Node.js, Python, MongoDB, Express, HTML, CSS, AWS, Docker, Git",
            experience: "Senior Full Stack Developer | Tech Corp | 2020-Present\n• Led development of enterprise web applications serving 10M+ users\n• Implemented microservices architecture reducing latency by 40%\n• Mentored team of 5 junior developers\n• Improved system performance and scalability\n\nFull Stack Developer | StartupXYZ | 2018-2020\n• Built RESTful APIs and responsive web applications\n• Collaborated with cross-functional teams\n• Implemented CI/CD pipelines and automated testing",
            projects: "E-Commerce Platform | React, Node.js, MongoDB | https://example.com | • Built scalable e-commerce solution with real-time inventory\n• Integrated payment processing with Stripe API\n• Achieved 99.9% uptime in production\n• Implemented advanced search and filtering\n\nTask Management System | Vue.js, Express, PostgreSQL | https://tasks.example.com | • Developed project management tool for teams\n• Real-time collaboration features\n• Advanced reporting and analytics dashboard",
            education: "Bachelor of Science in Computer Science | University of Technology | 2015-2019\n• GPA: 3.8/4.0\n• Dean's List for 6 semesters\n• Computer Science Society Member",
            certifications: "AWS Certified Solutions Architect | Amazon Web Services | 2021\nGoogle Cloud Professional | Google | 2022\nMongoDB Certified Developer | MongoDB | 2020",
            testimonials: "John is an exceptional developer who consistently delivers high-quality work and exceeds expectations. His technical skills and problem-solving abilities are invaluable to our team. - Jane Smith, CTO Tech Corp|Working with John has been a pleasure. He brings innovative solutions and maintains excellent communication throughout projects. - Mike Johnson, Project Manager|John's expertise in full-stack development helped us transform our legacy systems into modern, scalable applications. Highly recommended! - Sarah Williams, Product Manager"
        };
        console.log('Sample data created:', this.data);
        this.showNotification('Sample portfolio data loaded. Fill out the form to see your own information!', 'info');
    }

    // Render portfolio content
    renderPortfolio() {
        // Calls all section renderers.
        // Each renderer shows its section only if there is content.
        console.log("Rendering portfolio with data:", this.data);
        this.renderHeader();
        this.renderAbout();
        this.renderSkills();
        this.renderExperience();
        this.renderProjects();
        this.renderEducation();
        this.renderCertifications();
        this.renderTestimonials();
        // Ensure sections are visible after rendering
        setTimeout(() => {
            this.ensureSectionsVisible();
        }, 100);
    }

    // Render header section
    renderHeader() {
        // Populates the top header fields (name, title, contact info, social links, photo).
        const nameEl = document.getElementById('name');
        const fieldEl = document.getElementById('field');
        const emailEl = document.getElementById('email');
        const phoneEl = document.getElementById('phone');
        const locationEl = document.getElementById('location');
        const phoneItem = document.getElementById('phoneItem');
        const locationItem = document.getElementById('locationItem');
        const socialLinks = document.getElementById('socialLinks');
        const headerPhoto = document.getElementById('headerPhoto');
        const photoImg = document.getElementById('photoImg');

        if (nameEl) nameEl.textContent = this.data.name || 'Your Name';
        if (fieldEl) fieldEl.textContent = this.data.field || 'Your Professional Title';
        if (emailEl) emailEl.textContent = this.data.email || 'your.email@example.com';

        // Phone
        if (this.data.phone && phoneEl) {
            phoneEl.textContent = this.data.phone;
            if (phoneItem) phoneItem.style.display = 'block';
        }

        // Location
        if (this.data.location && locationEl) {
            locationEl.textContent = this.data.location;
            if (locationItem) locationItem.style.display = 'block';
        }

        // Social links (hidden in new design)
        if (socialLinks) {
            socialLinks.style.display = 'none';
        }

        // Photo
        if (this.data.photoData && photoImg) {
            photoImg.src = this.data.photoData;
            photoImg.style.display = 'block';
            if (headerPhoto) headerPhoto.style.display = 'block';
        }
    }

    // Render about section
    renderAbout() {
        // Renders the Professional Summary section.
        const aboutContent = document.getElementById('aboutContent');
        const aboutSection = document.getElementById('about');
        
        if (this.data.about && aboutContent && aboutSection) {
            aboutContent.innerHTML = this.escapeHtml(this.data.about).replace(/\n/g, '<br>');
            aboutSection.style.display = 'block';
        }
    }

    // Render skills section
    renderSkills() {
        // Skills are entered as comma-separated values in the form.
        // We split them and render each skill as a pill/card.
        const skillsList = document.getElementById('skillsList');
        const skillsSection = document.getElementById('skills');
        
        if (this.data.skills && skillsList && skillsSection) {
            const skillsArray = this.data.skills.split(',').map(skill => skill.trim()).filter(skill => skill);
            
            skillsArray.forEach((skill, index) => {
                const skillItem = document.createElement('div');
                skillItem.className = 'skill-item';
                skillItem.textContent = this.escapeHtml(skill);
                skillItem.style.animationDelay = `${index * 0.1}s`;
                skillsList.appendChild(skillItem);
            });

            skillsSection.style.display = 'block';
        }
    }

    // Render experience section
    renderExperience() {
        // Experience uses a structured textarea format:
        // Each job entry is separated by ---
        // Lines starting with bullet points are rendered as <p> items.
        const experienceList = document.getElementById('experienceList');
        const experienceSection = document.getElementById('experience');
        
        if (this.data.experience && experienceList && experienceSection) {
            const experiences = this.data.experience.split('---').filter(exp => exp.trim());
            
            experiences.forEach((exp, index) => {
                const lines = exp.split('\n').filter(line => line.trim());
                const titleLine = lines[0] || '';
                const titleParts = titleLine.split('|').map(part => part.trim());
                
                const title = titleParts[0] || 'Position';
                const company = titleParts[1] || 'Company';
                const duration = titleParts[2] || 'Duration';
                const bulletPoints = lines.slice(1).filter(line => line.trim().startsWith('•'));
                
                const experienceItem = document.createElement('div');
                experienceItem.className = 'timeline-item';
                experienceItem.style.animationDelay = `${index * 0.1}s`;
                
                experienceItem.innerHTML = `
                    <h3>${this.escapeHtml(title)}</h3>
                    <div class="timeline-meta">${this.escapeHtml(company)} | ${this.escapeHtml(duration)}</div>
                    <div>${bulletPoints.map(point => `<p>${this.escapeHtml(point)}</p>`).join('')}</div>
                `;
                
                experienceList.appendChild(experienceItem);
            });

            experienceSection.style.display = 'block';
        }
    }

    // Render projects section
    renderProjects() {
        // Projects textarea format:
        // Project Name | Description | Link
        // Bullets after that become bullet lines.
        const projectsList = document.getElementById('projectsList');
        const projectsSection = document.getElementById('projects');
        
        if (this.data.projects && projectsList && projectsSection) {
            const projects = this.data.projects.split('---').filter(proj => proj.trim());
            
            projects.forEach((proj, index) => {
                const lines = proj.split('\n').filter(line => line.trim());
                const titleLine = lines[0] || '';
                const titleParts = titleLine.split('|').map(part => part.trim());
                
                const title = titleParts[0] || 'Project';
                const description = titleParts[1] || 'Description';
                const techStack = titleParts[2] || '';
                const liveDemo = titleParts[3] || '';
                const bulletPoints = lines.slice(1).filter(line => line.trim().startsWith('•'));
                
                const projectCard = document.createElement('div');
                projectCard.className = 'project-card';
                projectCard.style.animationDelay = `${index * 0.1}s`;
                
                projectCard.innerHTML = `
                    <div class="project-header">
                        <h3>${this.escapeHtml(title)}</h3>
                        <p class="project-description">${this.escapeHtml(description)}</p>
                        ${techStack ? `<div class="tech-stack">${this.escapeHtml(techStack)}</div>` : ''}
                    </div>
                    <div class="project-body">
                        ${bulletPoints.map(point => `<p>${this.escapeHtml(point)}</p>`).join('')}
                        ${liveDemo ? `<a href="${liveDemo}" target="_blank" class="demo-link">Live Demo →</a>` : ''}
                    </div>
                `;
                
                projectsList.appendChild(projectCard);
            });

            projectsSection.style.display = 'block';
        }
    }

    // Render education section
    renderEducation() {
        // Education textarea format:
        // Degree | Institution | Years
        // Multiple entries separated by ---
        const educationList = document.getElementById('educationList');
        const educationSection = document.getElementById('education');
        
        if (this.data.education && educationList && educationSection) {
            const education = this.data.education.split('---').filter(edu => edu.trim());
            
            education.forEach((edu, index) => {
                const parts = edu.split('|').map(part => part.trim());
                const degree = parts[0] || 'Degree';
                const institution = parts[1] || 'Institution';
                const years = parts[2] || 'Years';
                
                const educationItem = document.createElement('div');
                educationItem.className = 'timeline-item';
                educationItem.style.animationDelay = `${index * 0.1}s`;
                
                educationItem.innerHTML = `
                    <h3>${this.escapeHtml(degree)}</h3>
                    <div class="timeline-meta">${this.escapeHtml(institution)} | ${this.escapeHtml(years)}</div>
                `;
                
                educationList.appendChild(educationItem);
            });

            educationSection.style.display = 'block';
        }
    }

    // Render certifications section
    renderCertifications() {
        // Certifications textarea format:
        // Name | Issuer | Year
        const certificationsList = document.getElementById('certificationsList');
        const certificationsSection = document.getElementById('certifications');
        
        if (this.data.certifications && certificationsList && certificationsSection) {
            const certifications = this.data.certifications.split('\n').filter(cert => cert.trim());
            
            certifications.forEach((cert, index) => {
                const parts = cert.split('|').map(part => part.trim());
                const name = parts[0] || 'Certification';
                const issuer = parts[1] || 'Issuer';
                const year = parts[2] || 'Year';
                
                const certificationItem = document.createElement('div');
                certificationItem.className = 'timeline-item';
                certificationItem.style.animationDelay = `${index * 0.1}s`;
                
                certificationItem.innerHTML = `
                    <h3>${this.escapeHtml(name)}</h3>
                    <div class="timeline-meta">${this.escapeHtml(issuer)} | ${this.escapeHtml(year)}</div>
                `;
                
                certificationsList.appendChild(certificationItem);
            });

            certificationsSection.style.display = 'block';
        }
    }

    // Render testimonials section
    renderTestimonials() {
        // Testimonials are free-text quotes, typically one per line.
        const testimonialsList = document.getElementById('testimonialsList');
        const testimonialsSection = document.getElementById('testimonials');
        
        if (this.data.testimonials && testimonialsList && testimonialsSection) {
            const testimonials = this.data.testimonials.split('\n').filter(testimonial => testimonial.trim());
            
            testimonials.forEach((testimonial, index) => {
                const parts = testimonial.split('-').map(part => part.trim());
                const quote = parts[0] || 'Testimonial';
                const author = parts[1] || 'Author';
                
                const testimonialItem = document.createElement('div');
                testimonialItem.className = 'testimonial-item';
                testimonialItem.style.animationDelay = `${index * 0.1}s`;
                
                testimonialItem.innerHTML = `
                    <p>${this.escapeHtml(quote)}</p>
                    <div class="testimonial-author">— ${this.escapeHtml(author)}</div>
                `;
                
                testimonialsList.appendChild(testimonialItem);
            });

            testimonialsSection.style.display = 'block';
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // HTML download
        const htmlBtn = document.getElementById('downloadHTML');
        if (htmlBtn) {
            htmlBtn.addEventListener('click', () => this.downloadHTML());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.downloadHTML();
                        break;
                }
            }
        });
    }

    // Download HTML functionality
    downloadHTML() {
        // Creates a standalone HTML file that contains:
        // - Inline CSS
        // - The rendered data
        // So it can be opened independently without the project.
        const button = document.getElementById('downloadHTML');
        const originalText = button.innerHTML;
        
        try {
            // Show loading state
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating HTML...';

            // Create standalone HTML
            const htmlContent = this.generateStandaloneHTML();
            
            // Create download link
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.data.name || 'portfolio'}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Portfolio HTML downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error generating HTML:', error);
            this.showNotification('Error generating HTML. Please try again.', 'error');
        } finally {
            // Reset button
            button.disabled = false;
            button.innerHTML = originalText;
        }
    }

    // Generate standalone HTML
    generateStandaloneHTML() {
        // Builds a complete HTML document as a string.
        // Uses inline styles so the downloaded file is self-contained.
        if (!this.data) {
            return '<html><body><h1>No portfolio data available</h1></body></html>';
        }
        
        const currentDate = new Date().toLocaleDateString();
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(this.data.name || 'Professional Portfolio')} - Professional Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary-color: #1e3a8a;
            --accent-color: #4a90e2;
            --text-primary: #1a1a1a;
            --text-secondary: #64748b;
            --text-muted: #9ca3af;
            --bg-white: #ffffff;
            --bg-light: #f8fafc;
            --bg-gray: #f1f5f9;
            --border-light: #e2e8f0;
            --border-medium: #cbd5e1;
            --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
            --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
            --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: var(--bg-light);
            color: var(--text-primary);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding: 40px 20px;
            position: relative;
            overflow-x: hidden;
            overflow-y: auto;
            line-height: 1.6;
        }

        .portfolio-container {
            max-width: 1200px;
            width: 100%;
            margin: 0 auto;
            background: var(--bg-white);
            border-radius: 20px;
            box-shadow: var(--shadow-lg);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            color: white;
            padding: 60px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .profile-photo {
            text-align: center;
            margin-bottom: 20px;
        }

        .profile-photo img {
            border-radius: 50%;
            border: 3px solid var(--primary-color);
            box-shadow: var(--shadow-lg);
            transition: transform 0.3s ease;
        }

        .profile-photo img:hover {
            transform: scale(1.05);
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }

        .header h1 {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }

        .professional-title {
            font-size: 1.5rem;
            font-weight: 500;
            margin-bottom: 30px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }

        .contact-info {
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.95rem;
            opacity: 0.9;
        }

        .contact-item i {
            width: 20px;
            text-align: center;
        }

        .section {
            padding: 60px 40px;
            border-bottom: 1px solid var(--border-light);
        }

        .section:last-child {
            border-bottom: none;
        }

        .section h2 {
            color: var(--primary-color);
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 30px;
            position: relative;
            padding-left: 20px;
        }

        .section h2::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 24px;
            background: var(--accent-color);
            border-radius: 2px;
        }

        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }

        .skill-item {
            background: var(--bg-light);
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            font-weight: 500;
            color: var(--text-primary);
            border: 1px solid var(--border-light);
            transition: all 0.3s ease;
        }

        .skill-item:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
            border-color: var(--accent-color);
        }

        .timeline-item {
            background: var(--bg-white);
            border: 1px solid var(--border-light);
            border-left: 4px solid var(--accent-color);
            padding: 30px;
            margin-bottom: 30px;
            border-radius: 0 12px 12px 0;
            transition: all 0.3s ease;
        }

        .timeline-item:hover {
            box-shadow: var(--shadow-md);
            transform: translateX(5px);
        }

        .timeline-item h3 {
            color: var(--primary-color);
            font-size: 1.3rem;
            margin-bottom: 10px;
            font-weight: 600;
        }

        .timeline-meta {
            color: var(--accent-color);
            font-size: 0.9rem;
            margin-bottom: 15px;
            font-weight: 500;
        }

        .project-card {
            background: var(--bg-white);
            border: 1px solid var(--border-light);
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            transition: all 0.3s ease;
        }

        .project-card:hover {
            box-shadow: var(--shadow-md);
            transform: translateY(-2px);
        }

        .project-header h3 {
            color: var(--primary-color);
            font-size: 1.3rem;
            margin-bottom: 10px;
            font-weight: 600;
        }

        .project-description {
            color: var(--text-secondary);
            margin-bottom: 15px;
        }

        .tech-stack {
            background: var(--bg-light);
            color: var(--accent-color);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
            display: inline-block;
            margin-bottom: 15px;
        }

        .demo-link {
            color: var(--accent-color);
            text-decoration: none;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            transition: gap 0.3s ease;
        }

        .demo-link:hover {
            gap: 10px;
        }

        .testimonial-item {
            background: var(--bg-light);
            border: 1px solid var(--border-light);
            border-left: 4px solid var(--accent-color);
            padding: 30px;
            margin-bottom: 30px;
            border-radius: 0 12px 12px 0;
            font-style: italic;
        }

        .testimonial-author {
            text-align: right;
            font-weight: 600;
            color: var(--primary-color);
            margin-top: 15px;
            font-style: normal;
        }

        .footer {
            text-align: center;
            padding: 40px;
            color: var(--text-secondary);
            border-top: 1px solid var(--border-light);
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            .portfolio-container {
                margin: 10px;
                border-radius: 12px;
            }
            
            .header {
                padding: 40px 20px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .section {
                padding: 40px 20px;
            }
            
            .contact-info {
                flex-direction: column;
                gap: 15px;
            }
            
            .skills-grid {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
            }
        }

        @media print {
            body {
                background: white;
                color: #333;
            }
            
            .portfolio-container {
                box-shadow: none;
                border: 1px solid #ddd;
            }
            
            .header {
                background: white !important;
                color: #1a1a1a !important;
            }
            
            .header h1,
            .section h2 {
                color: #1a1a1a !important;
                -webkit-text-fill-color: #1a1a1a !important;
            }
        }
    </style>
</head>
<body>
    <div class="portfolio-container">
        <header class="header">
            ${this.data.photoData ? `
            <div class="profile-photo">
                <img src="${this.data.photoData}" alt="Profile Photo" style="width: 120px; height: 120px; border-radius: 50%; border: 3px solid var(--primary-color); margin-bottom: 20px; object-fit: cover;">
            </div>` : ''}
            <h1>${this.escapeHtml(this.data.name || 'Your Name')}</h1>
            <p class="professional-title">${this.escapeHtml(this.data.field || 'Your Professional Title')}</p>
            
            <div class="contact-info">
                <div class="contact-item">
                    <i class="fas fa-envelope"></i>
                    <span>${this.escapeHtml(this.data.email || 'your.email@example.com')}</span>
                </div>
                ${this.data.phone ? `
                <div class="contact-item">
                    <i class="fas fa-phone"></i>
                    <span>${this.escapeHtml(this.data.phone)}</span>
                </div>` : ''}
                ${this.data.location ? `
                <div class="contact-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${this.escapeHtml(this.data.location)}</span>
                </div>` : ''}
            </div>
        </header>

        ${this.data.about ? `
        <section class="section">
            <h2>Professional Summary</h2>
            <p>${this.escapeHtml(this.data.about).replace(/\n/g, '<br>')}</p>
        </section>` : ''}

        ${this.data.skills ? `
        <section class="section">
            <h2>Core Skills</h2>
            <div class="skills-grid">
                ${this.data.skills.split(',').map(skill => 
                    `<div class="skill-item">${this.escapeHtml(skill.trim())}</div>`
                ).join('')}
            </div>
        </section>` : ''}

        ${this.data.experience ? `
        <section class="section">
            <h2>Professional Experience</h2>
            ${this.data.experience.split('---').map(exp => {
                const lines = exp.split('\n').filter(line => line.trim());
                const titleLine = lines[0] || '';
                const titleParts = titleLine.split('|').map(part => part.trim());
                const title = titleParts[0] || 'Position';
                const company = titleParts[1] || 'Company';
                const duration = titleParts[2] || 'Duration';
                const bulletPoints = lines.slice(1).filter(line => line.trim().startsWith('•'));
                
                return `
                <div class="timeline-item">
                    <h3>${this.escapeHtml(title)}</h3>
                    <div class="timeline-meta">${this.escapeHtml(company)} | ${this.escapeHtml(duration)}</div>
                    <div>${bulletPoints.map(point => `<p>${this.escapeHtml(point)}</p>`).join('')}</div>
                </div>`;
            }).join('')}
        </section>` : ''}

        ${this.data.projects ? `
        <section class="section">
            <h2>Featured Projects</h2>
            ${this.data.projects.split('---').map(proj => {
                const lines = proj.split('\n').filter(line => line.trim());
                const titleLine = lines[0] || '';
                const titleParts = titleLine.split('|').map(part => part.trim());
                const title = titleParts[0] || 'Project';
                const description = titleParts[1] || 'Description';
                const techStack = titleParts[2] || '';
                const liveDemo = titleParts[3] || '';
                const bulletPoints = lines.slice(1).filter(line => line.trim().startsWith('•'));
                
                return `
                <div class="project-card">
                    <div class="project-header">
                        <h3>${this.escapeHtml(title)}</h3>
                        <p class="project-description">${this.escapeHtml(description)}</p>
                        ${techStack ? `<div class="tech-stack">${this.escapeHtml(techStack)}</div>` : ''}
                    </div>
                    <div class="project-body">
                        ${bulletPoints.map(point => `<p>${this.escapeHtml(point)}</p>`).join('')}
                        ${liveDemo ? `<a href="${liveDemo}" target="_blank" class="demo-link">Live Demo →</a>` : ''}
                    </div>
                </div>`;
            }).join('')}
        </section>` : ''}

        ${this.data.education ? `
        <section class="section">
            <h2>Education</h2>
            ${this.data.education.split('---').map(edu => {
                const parts = edu.split('|').map(part => part.trim());
                const degree = parts[0] || 'Degree';
                const institution = parts[1] || 'Institution';
                const years = parts[2] || 'Years';
                
                return `
                <div class="timeline-item">
                    <h3>${this.escapeHtml(degree)}</h3>
                    <div class="timeline-meta">${this.escapeHtml(institution)} | ${this.escapeHtml(years)}</div>
                </div>`;
            }).join('')}
        </section>` : ''}

        ${this.data.certifications ? `
        <section class="section">
            <h2>Certifications & Awards</h2>
            ${this.data.certifications.split('\n').map(cert => {
                const parts = cert.split('|').map(part => part.trim());
                const name = parts[0] || 'Certification';
                const issuer = parts[1] || 'Issuer';
                const year = parts[2] || 'Year';
                
                return `
                <div class="timeline-item">
                    <h3>${this.escapeHtml(name)}</h3>
                    <div class="timeline-meta">${this.escapeHtml(issuer)} | ${this.escapeHtml(year)}</div>
                </div>`;
            }).join('')}
        </section>` : ''}

        ${this.data.testimonials ? `
        <section class="section">
            <h2>Professional Testimonials</h2>
            ${this.data.testimonials.split('\n').map(testimonial => {
                const parts = testimonial.split('-').map(part => part.trim());
                const quote = parts[0] || 'Testimonial';
                const author = parts[1] || 'Author';
                
                return `
                <div class="testimonial-item">
                    <p>${this.escapeHtml(quote)}</p>
                    <div class="testimonial-author">— ${this.escapeHtml(author)}</div>
                </div>`;
            }).join('')}
        </section>` : ''}

        <footer class="footer">
            <p>Generated on ${currentDate} using Professional Portfolio Generator</p>
            <p> ${new Date().getFullYear()} ${this.escapeHtml(this.data.name || 'Your Name')}. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>`;
    }

    // Initialize animations
    initializeAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1
        });

        // Observe elements for animation
        document.querySelectorAll('.section, .timeline-item, .skill-item, .testimonial-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            observer.observe(el);
        });
    }

    // Create particle effects
    createParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;
        document.body.appendChild(particleContainer);

        // Create floating particles
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 1}px;
                height: ${Math.random() * 4 + 1}px;
                background: rgba(74, 144, 226, ${Math.random() * 0.3 + 0.1});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 10}s linear infinite;
            `;
            particleContainer.appendChild(particle);
        }

        // Add floating animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // Ensure sections are visible when they have content
    ensureSectionsVisible() {
        // Defensive UI fix: if a section has meaningful content, force it visible.
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            const hasContent = this.hasSectionContent(section.id);
            if (hasContent) {
                section.style.display = 'block';
                console.log(`Showing section: ${section.id}`);
            } else {
                console.log(`No content for section: ${section.id}`);
            }
        });
    }

    // Check if section has content
    hasSectionContent(sectionId) {
        switch(sectionId) {
            case 'about': return this.data.about && this.data.about.trim().length > 0;
            case 'skills': return this.data.skills && this.data.skills.trim().length > 0;
            case 'experience': return this.data.experience && this.data.experience.trim().length > 0;
            case 'projects': return this.data.projects && this.data.projects.trim().length > 0;
            case 'education': return this.data.education && this.data.education.trim().length > 0;
            case 'certifications': return this.data.certifications && this.data.certifications.trim().length > 0;
            case 'testimonials': return this.data.testimonials && this.data.testimonials.trim().length > 0;
            default: return false;
        }
    }

    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 
                       type === 'error' ? 'linear-gradient(135deg, #f093fb, #f5576c)' : 
                       'linear-gradient(135deg, #4facfe, #00f2fe)'};
            color: white;
            border-radius: 12px;
            font-weight: 600;
            z-index: 10000;
            animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 2.5s forwards;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            max-width: 300px;
        `;
        notification.textContent = message;
        
        // Add animation styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Utility function to escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfessionalPortfolio();
});
