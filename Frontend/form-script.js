// form-script.js
// Purpose:
// - Handles the full workflow of form.html (draft loading/saving, validation, photo upload)
// - Collects user inputs and stores them in sessionStorage so portfolio.html can render them
// - Integrates with backend AI endpoints (e.g., /analyze-profile) to show suggestions under fields
class PortfolioForm {
    constructor() {
        // Central in-memory object that mirrors the form's current values.
        // This gets populated from:
        // - sessionStorage (basic info from index.html)
        // - localStorage (saved draft)
        // - live values from the form inputs (on submit/validate)
        this.formData = {
            name: '',
            email: '',
            field: '',
            phone: '',
            location: '',
            linkedin: '',
            github: '',
            twitter: '',
            website: '',
            about: '',
            skills: '',
            experience: '',
            projects: '',
            education: '',
            certifications: '',
            testimonials: '',
            details: '',
            photoData: null
        };
        
        // Initialize all UI + behavior once the class instance is created.
        this.init();
    }

    init() {
        // Load previously stored data and wire up all UI event handlers.
        this.loadDraft();
        this.displayUserInfo();
        this.setupEventListeners();
        this.updateProgress();
        this.setupRealTimeValidation();
        this.setupSkillTags();
        this.setupPhotoUpload();
        this.setupCharacterCounters();
    }

    // Load saved draft from localStorage
    loadDraft() {
        // 1) Load the basic info from index.html (sessionStorage)
        //    This includes name/email/field, shown at the top of the form.
        // First load basic info from sessionStorage (from index.html)
        const basicInfo = sessionStorage.getItem('portfolioBasic');
        if (basicInfo) {
            try {
                const basicData = JSON.parse(basicInfo);
                Object.assign(this.formData, basicData);
                console.log('Basic info loaded from sessionStorage:', basicData);
            } catch (e) {
                console.error('Error loading basic info:', e);
            }
        }

        // 2) Load draft details from localStorage (if the user saved a draft earlier)
        //    Draft data should NOT overwrite name/email/field coming from index.html.
        // Then load draft from localStorage
        const savedDraft = localStorage.getItem('portfolioDraft');
        if (savedDraft) {
            try {
                const draftData = JSON.parse(savedDraft);
                // Merge draft data, but don't overwrite basic info
                Object.keys(draftData).forEach(key => {
                    if (!['name', 'email', 'field'].includes(key)) {
                        this.formData[key] = draftData[key];
                    }
                });
                this.populateForm();
                this.showNotification('Draft loaded successfully', 'success');
            } catch (e) {
                console.error('Error loading draft:', e);
                // Only show error notification if there was actually a draft that failed to load
                // Don't show error for first-time visitors
            }
        }
    }

    // Display user basic info from sessionStorage
    displayUserInfo() {
        // Shows name/email/field at the top of the form.
        // If missing, redirects back to index.html because the app flow is:
        // index.html -> form.html -> portfolio.html
        const basicInfo = sessionStorage.getItem('portfolioBasic');
        if (basicInfo) {
            try {
                const basicData = JSON.parse(basicInfo);
                const userInfoDisplay = document.getElementById('userInfoDisplay');
                const displayName = document.getElementById('displayName');
                const displayEmail = document.getElementById('displayEmail');
                const displayField = document.getElementById('displayField');
                
                if (userInfoDisplay && displayName && displayEmail && displayField) {
                    displayName.textContent = basicData.name || 'Not provided';
                    displayEmail.textContent = basicData.email || 'Not provided';
                    displayField.textContent = basicData.field || 'Not provided';
                    userInfoDisplay.style.display = 'block';
                }
            } catch (e) {
                console.error('Error displaying user info:', e);
            }
        } else {
            // If no basic info, redirect to index.html
            this.showNotification('Please provide your basic information first.', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Attach all DOM event listeners once.
        // Important: Generate button is outside the <form>, so we attach a direct click handler.
        // Form submission
        document.getElementById('portfolioForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });

        // Save draft button
        document.getElementById('saveDraft').addEventListener('click', () => {
            this.saveDraft();
        });

        // Clear form button
        document.getElementById('clearForm').addEventListener('click', () => {
            this.clearForm();
        });

        // Validate form button
        document.getElementById('validateForm').addEventListener('click', () => {
            this.validateForm();
        });

        // Auto Fill Example button
        document.getElementById('autoFillExample').addEventListener('click', () => {
            this.autoFillExample();
        });

        const generateBtn = document.querySelector('.btn-submit');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                console.log('Generate Portfolio clicked');
                this.submitForm();
            });
        }

        // Form field listeners for real-time validation
        const fields = ['about', 'skills', 'experience', 'projects', 'education', 'certifications', 'testimonials'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.updateProgress();
                    if (fieldId === 'about') {
                        this.updateCharacterCount(fieldId);
                    }
                });
            }
        });
    }

    // Setup skill tags functionality
    setupSkillTags() {
        const skillsField = document.getElementById('skills');
        if (skillsField) {
            skillsField.addEventListener('input', (e) => {
                const skills = e.target.value.split(',').map(skill => skill.trim());
                this.displaySkillTags(skills);
            });
        }
    }

    // Display skill tags
    displaySkillTags(skills) {
        const container = document.getElementById('skillTags');
        if (!container) return;

        container.innerHTML = '';
        skills.forEach(skill => {
            if (skill.trim()) {
                const tag = document.createElement('span');
                tag.className = 'skill-tag';
                tag.textContent = skill;
                container.appendChild(tag);
            }
        });
    }

    // Setup photo upload functionality
    setupPhotoUpload() {
        const photoInput = document.getElementById('photo');
        const photoPreview = document.getElementById('photoPreview');
        const photoPreviewImg = document.getElementById('photoPreviewImg');
        const removePhotoBtn = document.getElementById('removePhoto');
        
        if (photoInput && photoPreview && photoPreviewImg) {
            photoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        photoPreviewImg.src = e.target.result;
                        this.formData.photoData = e.target.result;
                        photoPreview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Remove photo functionality
        if (removePhotoBtn) {
            removePhotoBtn.addEventListener('click', () => {
                photoPreview.style.display = 'none';
                photoPreviewImg.src = '';
                this.formData.photoData = null;
                photoInput.value = '';
            });
        }
    }

    // Setup character counters
    setupCharacterCounters() {
        const aboutField = document.getElementById('about');
        const charCounter = document.getElementById('aboutCharCount');
        
        if (aboutField && charCounter) {
            aboutField.addEventListener('input', () => {
                this.updateCharacterCount('about');
            });
            
            // Initialize count
            this.updateCharacterCount('about');
        }
    }

    // Update character count for a field
    updateCharacterCount(fieldId) {
        if (fieldId === 'about') {
            const field = document.getElementById(fieldId);
            const charCounter = document.getElementById('aboutCharCount');
            if (field && charCounter) {
                charCounter.textContent = field.value.length;
            }
        }
    }

    // Populate form with saved data
    populateForm() {
        Object.keys(this.formData).forEach(key => {
            const field = document.getElementById(key);
            if (field) {
                field.value = this.formData[key];
            }
        });

        // Update photo preview if exists
        if (this.formData.photoData) {
            const photoPreview = document.getElementById('photoPreview');
            const photoPreviewImg = document.getElementById('photoPreviewImg');
            if (photoPreview && photoPreviewImg) {
                photoPreviewImg.src = this.formData.photoData;
                photoPreview.style.display = 'block';
            }
        }

        this.updateProgress();
    }

    // Save draft to localStorage
    saveDraft() {
        try {
            localStorage.setItem('portfolioDraft', JSON.stringify(this.formData));
            this.showNotification('Draft saved successfully', 'success');
        } catch (e) {
            console.error('Error saving draft:', e);
            // Removed error notification
        }
    }

    // Clear form
    clearForm() {
        this.showCustomConfirm('Are you sure you want to clear all form data?', () => {
            this.formData = {
                name: '',
                email: '',
                field: '',
                phone: '',
                location: '',
                linkedin: '',
                github: '',
                twitter: '',
                website: '',
                about: '',
                skills: '',
                experience: '',
                projects: '',
                education: '',
                certifications: '',
                testimonials: '',
                details: '',
                photoData: null
            };
            
            document.getElementById('portfolioForm').reset();
            
            // Clear photo preview
            const photoPreview = document.getElementById('photoPreview');
            const photoPreviewImg = document.getElementById('photoPreviewImg');
            if (photoPreview && photoPreviewImg) {
                photoPreview.style.display = 'none';
                photoPreviewImg.src = '';
            }
            
            // Clear skill tags
            const container = document.getElementById('skillTags');
            if (container) {
                container.innerHTML = '';
            }
            
            this.updateProgress();
            this.showNotification('Form cleared successfully', 'success');
        });
    }

    // Validate form and proceed to submission
    async validateForm() {
        // Validate button behavior:
        // - Collect current form values
        // - Merge basic info from index.html (sessionStorage: portfolioBasic)
        // - Call backend AI endpoint /analyze-profile
        // - Render suggestions under the relevant section inputs
        console.log('Validate button clicked!');
        console.log('Current formData:', this.formData);
        
        try {
            this.showNotification('Validating your information...', 'success');

            const formData = new FormData(document.getElementById('portfolioForm'));
            const currentData = {};
            
            for (let [key, value] of formData.entries()) {
                currentData[key] = value;
            }
            
            this.formData = currentData;
            console.log('Updated formData:', this.formData);
            console.log('Form data keys:', Object.keys(this.formData));

            const basicInfoRaw = sessionStorage.getItem('portfolioBasic');
            if (basicInfoRaw) {
                try {
                    const basicData = JSON.parse(basicInfoRaw);
                    ['name', 'email', 'field'].forEach((k) => {
                        if (!this.formData[k] || String(this.formData[k]).trim() === '') {
                            this.formData[k] = basicData[k] || this.formData[k];
                        }
                    });
                } catch (e) {
                    console.error('Error parsing portfolioBasic:', e);
                }
            }

            // Backend call to get AI suggestions.
            const response = await fetch('http://localhost:3001/analyze-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    formData: this.formData
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            this.displayInlineSuggestions(result.suggestions || []);
            this.showNotification('Suggestions added below the fields.', 'success');
            
        } catch (error) {
            console.error('Validation error:', error);
            this.showNotification('Unable to get AI suggestions. Please try again.', 'error');
        }
    }

    // Display inline suggestions under each section
    displayInlineSuggestions(suggestions) {
        // Suggestions are displayed as DOM nodes injected below the matching form section.
        // We remove old suggestion blocks first to avoid duplicates.
        // Clear previous suggestions
        document.querySelectorAll('.validation-suggestions').forEach(el => el.remove());

        // Helper: find the closest .form-section for a given field id.
        const getSection = (fieldId) => {
            const el = document.getElementById(fieldId);
            return el ? el.closest('.form-section') : null;
        };
        
        suggestions.forEach(suggestion => {
            let targetSection = null;
            
            // Map suggestion categories to form sections
            switch(suggestion.category) {
                case 'Missing Information':
                    if (suggestion.text.toLowerCase().includes('name') || suggestion.text.toLowerCase().includes('email') || suggestion.text.toLowerCase().includes('field')) {
                        targetSection = document.querySelector('#userInfoDisplay')?.closest('.form-section') || null;
                    } else if (suggestion.text.toLowerCase().includes('phone') || suggestion.text.toLowerCase().includes('location')) {
                        targetSection = getSection('phone') || getSection('location');
                    } else if (suggestion.text.toLowerCase().includes('photo')) {
                        targetSection = getSection('photo');
                    }
                    break;
                case 'Profile Enhancement':
                    if (suggestion.text.toLowerCase().includes('about') || suggestion.text.toLowerCase().includes('summary')) {
                        targetSection = getSection('about');
                    } else if (suggestion.text.toLowerCase().includes('skill')) {
                        targetSection = getSection('skills');
                    }
                    break;
                case 'Professional Improvements':
                    if (suggestion.text.toLowerCase().includes('experience') || suggestion.text.toLowerCase().includes('work')) {
                        targetSection = getSection('experience');
                    } else if (suggestion.text.toLowerCase().includes('project')) {
                        targetSection = getSection('projects');
                    }
                    break;
                case 'Technical Skills':
                    targetSection = getSection('skills');
                    break;
                case 'Portfolio Completeness':
                    if (suggestion.text.toLowerCase().includes('education')) {
                        targetSection = getSection('education');
                    } else if (suggestion.text.toLowerCase().includes('certification')) {
                        targetSection = getSection('certifications');
                    } else if (suggestion.text.toLowerCase().includes('testimonial')) {
                        targetSection = getSection('testimonials');
                    }
                    break;
            }
            
            // If no specific section found, add to the first empty section
            if (!targetSection) {
                // List of sections to check
                const sections = ['about', 'skills', 'experience', 'projects', 'education', 'certifications', 'testimonials'];
                for (let section of sections) {
                    // Get the field element
                    const field = document.getElementById(section);
                    // Check if the field exists and is empty
                    if (field && !field.value.trim()) {
                        // Get the section element
                        targetSection = getSection(section);
                        // Break the loop
                        break;
                    }
                }
            }
            
            // Create suggestion element
            if (targetSection) {
                const suggestionDiv = document.createElement('div');
                suggestionDiv.className = 'validation-suggestions';
                suggestionDiv.style.cssText = `
                    margin-top: 15px;
                    padding: 12px 16px;
                    background: linear-gradient(135deg, rgba(120, 219, 255, 0.1), rgba(255, 119, 198, 0.1));
                    border-left: 3px solid #78dbff;
                    border-radius: 8px;
                    font-size: 14px;
                    color: #e0e0f0;
                    animation: slideIn 0.3s ease;
                `;
                suggestionDiv.innerHTML = `
                    <div style="font-weight: 600; color: #ff77c6; margin-bottom: 5px;">💡 ${suggestion.category}</div>
                    <div>${suggestion.text}</div>
                `;
                
                targetSection.appendChild(suggestionDiv);
            }
        });
        
        this.showNotification('Suggestions added under each section!', 'success');
    }

    // Real-time validation
    setupRealTimeValidation() {
        const fields = {
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            linkedin: document.getElementById('linkedin'),
            github: document.getElementById('github'),
            twitter: document.getElementById('twitter'),
            website: document.getElementById('website')
        };

        // Email validation
        if (fields.email) {
            fields.email.addEventListener('input', (e) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const isValid = emailRegex.test(e.target.value);
                this.showFieldValidation(fields.email, isValid);
            });
        }

        // URL validation for social links
        ['linkedin', 'github', 'twitter', 'website'].forEach(platform => {
            if (fields[platform]) {
                fields[platform].addEventListener('input', (e) => {
                    const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?$/;
                    const isValid = !e.target.value || urlRegex.test(e.target.value);
                    this.showFieldValidation(fields[platform], isValid);
                });
            }
        });
    }

    // Show field validation
    showFieldValidation(field, isValid) {
        if (isValid) {
            field.style.borderColor = '#28a745';
            field.style.boxShadow = '0 0 10px rgba(40, 167, 69, 0.2)';
        } else {
            field.style.borderColor = '#dc3545';
            field.style.boxShadow = '0 0 10px rgba(220, 53, 69, 0.2)';
        }
    }

    // Update progress bar
    updateProgress() {
        const fields = ['about', 'skills', 'experience', 'projects', 'education', 'certifications', 'testimonials'];
        let filledFields = 0;
        let totalCharacters = 0;

        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && field.value.trim()) {
                filledFields++;
                if (fieldId === 'about') {
                    totalCharacters = field.value.length;
                }
            }
        });

        const progress = (filledFields / fields.length) * 100;
        const progressBar = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        if (progressText) {
            progressText.textContent = `${filledFields}/${fields.length} sections completed (${Math.round(progress)}%)`;
        }

        // Update about character count
        this.updateCharacterCount('about');
    }

    async readPhotoAsDataUrl(file) {
        // Converts an uploaded image file to a base64 Data URL so it can be stored in sessionStorage
        // and displayed later in portfolio.html and in downloaded HTML.
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read image file'));
            reader.readAsDataURL(file);
        });
    }

    // Submit form
    async submitForm() {
        // Generate Portfolio behavior:
        // - Uses native HTML5 required validation first (checkValidity/reportValidity)
        // - Collects all form values into this.formData
        // - Ensures photoData exists (reads it if needed)
        // - Stores final payload in sessionStorage (portfolioData + portfolioPhoto)
        // - Redirects to portfolio.html
        const formEl = document.getElementById('portfolioForm');
        if (formEl && !formEl.checkValidity()) {
            formEl.reportValidity();
            return;
        }

        // Collect form data
        const formData = new FormData(document.getElementById('portfolioForm'));
        
        // Collect ALL form fields, not just existing ones
        for (let [key, value] of formData.entries()) {
            this.formData[key] = value;
        }
        
        console.log('Collected form data in submitForm:', this.formData);
        console.log('Form data keys:', Object.keys(this.formData));

        const basicInfoRaw = sessionStorage.getItem('portfolioBasic');
        if (basicInfoRaw) {
            try {
                const basicData = JSON.parse(basicInfoRaw);
                ['name', 'email', 'field'].forEach((k) => {
                    if (!this.formData[k] || String(this.formData[k]).trim() === '') {
                        this.formData[k] = basicData[k] || this.formData[k];
                    }
                });
            } catch (e) {
                console.error('Error parsing portfolioBasic:', e);
            }
        }

        if (!this.formData.name || !this.formData.email || !this.formData.field) {
            this.showNotification('Basic information missing. Please start from the homepage.', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }

        const requiredSectionFields = ['about', 'skills', 'experience', 'projects', 'education'];
        const missingFields = [];
        requiredSectionFields.forEach((field) => {
            const value = this.formData[field];
            if (!value || String(value).trim() === '') {
                missingFields.push(field.charAt(0).toUpperCase() + field.slice(1));
            }
        });

        if (missingFields.length > 0) {
            this.showNotification(`Please fill in all required fields: ${missingFields.join(', ')}`, 'error');
            return;
        }

        if (!this.formData.photoData || String(this.formData.photoData).trim() === '') {
            const photoInput = document.getElementById('photo');
            const file = photoInput && photoInput.files ? photoInput.files[0] : null;
            if (file) {
                try {
                    this.formData.photoData = await this.readPhotoAsDataUrl(file);
                } catch (e) {
                    console.error('Photo read error:', e);
                    if (formEl) formEl.reportValidity();
                    return;
                }
            } else {
                if (formEl) formEl.reportValidity();
                return;
            }
        }

        console.log('Submitting form data:', this.formData);

        // Save to sessionStorage for portfolio page
        sessionStorage.setItem('portfolioData', JSON.stringify(this.formData));
        
        // Also save photo data separately
        if (this.formData.photoData) {
            sessionStorage.setItem('portfolioPhoto', this.formData.photoData);
        }
        
        console.log('Data saved to sessionStorage:', {
            portfolioData: sessionStorage.getItem('portfolioData'),
            portfolioPhoto: sessionStorage.getItem('portfolioPhoto')
        });
        
        // Debug: Show all sessionStorage keys
        console.log('All sessionStorage keys:', Object.keys(sessionStorage));
        console.log('Form data being saved:', this.formData);
        
        this.showNotification('Portfolio generated successfully!', 'success');
        
        // Redirect to portfolio page after a short delay
        setTimeout(() => {
            window.location.href = 'portfolio.html';
        }, 1500);
    }

    // Auto fill form with example data
    autoFillExample() {
        const exampleData = {
            name: 'John Anderson',
            email: 'john.anderson@techcorp.com',
            field: 'Senior Software Engineer',
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA',
            linkedin: 'https://linkedin.com/in/johnanderson',
            github: 'https://github.com/johnanderson',
            twitter: 'https://twitter.com/johnanderson',
            website: 'https://johnanderson.dev',
            about: 'Experienced Senior Software Engineer with 8+ years of expertise in full-stack development, cloud architecture, and team leadership. Passionate about building scalable solutions and mentoring junior developers. Specialized in React, Node.js, AWS, and modern web technologies. Led multiple high-impact projects that improved system performance by 40% and reduced operational costs by 25%.',
            skills: 'JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, MongoDB, PostgreSQL, Git, CI/CD, Microservices, REST APIs, GraphQL',
            experience: 'Senior Software Engineer | TechCorp Inc. | San Francisco, CA | Jan 2020 - Present\n• Led a team of 5 developers in building microservices architecture that served 1M+ users\n• Reduced system latency by 40% through optimization and caching strategies\n• Implemented CI/CD pipelines that reduced deployment time by 60%\n• Mentored 3 junior developers who promoted to mid-level within 18 months\n\nSoftware Engineer | StartupXYZ | San Francisco, CA | Jun 2018 - Dec 2019\n• Developed and launched 3 major products using React and Node.js\n• Improved application performance by 35% through code optimization\n• Collaborated with cross-functional teams to deliver features 2 weeks ahead of schedule',
            projects: 'E-Commerce Platform Redesign | React, Node.js, MongoDB | 2023\n• Led complete redesign of legacy e-commerce platform serving 500K+ users\n• Implemented real-time inventory management reducing stock discrepancies by 80%\n• Added AI-powered recommendations increasing sales by 25%\n\nCloud Infrastructure Migration | AWS, Docker, Kubernetes | 2022\n• Migrated monolithic application to microservices architecture\n• Reduced infrastructure costs by 25% through optimization\n• Achieved 99.9% uptime with improved monitoring',
            education: 'Master of Science in Computer Science | Stanford University | Stanford, CA | 2016-2018\n• GPA: 3.8/4.0, Specialized in Distributed Systems\n• Thesis: "Scalable Architectures for Cloud-Native Applications"\n• Teaching Assistant for Advanced Algorithms course\n\nBachelor of Science in Software Engineering | UC Berkeley | Berkeley, CA | 2012-2016\n• GPA: 3.6/4.0, Dean\'s List\n• President of Computer Science Student Association',
            certifications: 'AWS Solutions Architect Professional | Amazon Web Services | 2021\n• Specialty: Designing and deploying scalable cloud applications\n\nGoogle Cloud Professional Cloud Architect | Google Cloud | 2020\n• Specialty: Enterprise cloud solutions and migration strategies\n\nCertified Kubernetes Administrator (CKA) | Cloud Native Computing Foundation | 2019',
            testimonials: 'John is an exceptional technical leader who consistently delivers outstanding results. His ability to architect complex systems and lead teams is unmatched. He transformed our development process and delivered a critical project 3 months ahead of schedule. - Sarah Chen, VP Engineering at TechCorp\n\nWorking with John was a game-changer for our team. His technical expertise and mentorship skills helped elevate our entire engineering department. He\'s not just a great engineer, but a great leader who brings out the best in everyone around him. - Michael Rodriguez, CTO at StartupXYZ'
        };

        // Fill form fields with example data
        Object.keys(exampleData).forEach(key => {
            const field = document.getElementById(key);
            if (field) {
                field.value = exampleData[key];
                this.formData[key] = exampleData[key];
            }
        });

        // Update progress
        this.updateProgress();

        // Show success notification
        this.showNotification('Form filled with example data!', 'success');

        // Handle skill tags if function exists
        if (this.setupSkillTags) {
            this.setupSkillTags();
        }
    }

    // Show custom confirmation dialog
    showCustomConfirm(message, onConfirm) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Create dialog box
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: linear-gradient(135deg, rgba(45, 45, 65, 0.95) 0%, rgba(30, 30, 46, 0.95) 50%, rgba(22, 33, 62, 0.95) 100%);
            backdrop-filter: blur(20px);
            border-radius: 16px;
            padding: 40px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 
                0 20px 60px rgba(0, 0, 0, 0.4),
                0 0 120px rgba(120, 119, 198, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            max-width: 400px;
            width: 90%;
            text-align: center;
            position: relative;
            overflow: hidden;
        `;
        
        // Add content
        dialog.innerHTML = `
            <div style="
                color: #e8e8e8;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 30px;
                line-height: 1.5;
            ">${message}</div>
            <div style="
                display: flex;
                gap: 15px;
                justify-content: center;
            ">
                <button id="confirmCancel" style="
                    background: linear-gradient(135deg, #666, #444);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 100px;
                ">Cancel</button>
                <button id="confirmOk" style="
                    background: linear-gradient(135deg, #ff6b6b, #ff8e53);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 100px;
                ">Clear Form</button>
            </div>
        `;
        
        // Add hover effects
        dialog.querySelector('#confirmCancel').addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(135deg, #777, #555)';
        });
        dialog.querySelector('#confirmCancel').addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(135deg, #666, #444)';
        });
        
        dialog.querySelector('#confirmOk').addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(135deg, #ff7777, #ff9966)';
        });
        dialog.querySelector('#confirmOk').addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(135deg, #ff6b6b, #ff8e53)';
        });
        
        // Add event listeners
        dialog.querySelector('#confirmCancel').addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        dialog.querySelector('#confirmOk').addEventListener('click', () => {
            document.body.removeChild(overlay);
            onConfirm();
        });
        
        // Add to DOM
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }

    // Show notification
    showNotification(message, type = 'success') {
        // Visual toast-style notification used across the app for success/error/warning messages.
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: ${20 + (document.querySelectorAll('.notification').length * 80)}px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #78dbff, #ff77c6)' : 
                       type === 'error' ? 'linear-gradient(135deg, #ff6b6b, #ff8e53)' : 
                       'linear-gradient(135deg, #ffc107, #ff9800)'};
            color: white;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 2.5s forwards;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            max-width: 300px;
        `;
        notification.textContent = message;
        notification.className = 'notification';
        
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
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioForm();
});
