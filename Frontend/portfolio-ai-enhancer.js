// Portfolio AI Enhancement Features
class PortfolioAIEnhancer {
    constructor() {
        this.apiKey = localStorage.getItem('openai_api_key');
        this.init();
    }

    init() {
        this.setupEnhanceButtons();
        this.setupBatchEnhance();
    }

    // Setup enhance buttons for portfolio sections
    setupEnhanceButtons() {
        const sections = [
            { id: 'aboutContent', label: 'About', prompt: 'professional summary' },
            { id: 'skillsGrid', label: 'Skills', prompt: 'technical skills list' },
            { id: 'experienceList', label: 'Experience', prompt: 'professional experience descriptions' },
            { id: 'projectsList', label: 'Projects', prompt: 'project descriptions' },
            { id: 'educationList', label: 'Education', prompt: 'education details' },
            { id: 'certificationsList', label: 'Certifications', prompt: 'certification details' },
            { id: 'testimonialsList', label: 'Testimonials', prompt: 'professional testimonials' }
        ];

        // Add enhance button to navigation
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            const enhanceBtn = document.createElement('button');
            enhanceBtn.innerHTML = '🤖 AI Enhance All';
            enhanceBtn.className = 'nav-link ai-enhance-all';
            enhanceBtn.style.cssText = `
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                transition: all 0.3s ease;
            `;
            
            enhanceBtn.onclick = () => this.batchEnhanceAll();
            navLinks.appendChild(enhanceBtn);
        }
    }

    // Setup batch enhance functionality
    setupBatchEnhance() {
        // Add enhance button to each section header
        const sectionHeaders = document.querySelectorAll('.section h2');
        sectionHeaders.forEach((header, index) => {
            const sectionId = header.closest('.section').id;
            const enhanceBtn = document.createElement('button');
            enhanceBtn.innerHTML = '🤖 Enhance';
            enhanceBtn.style.cssText = `
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 4px 12px;
                border-radius: 15px;
                cursor: pointer;
                font-size: 11px;
                font-weight: 600;
                margin-left: 10px;
                transition: all 0.3s ease;
            `;
            
            enhanceBtn.onclick = () => this.enhanceSection(sectionId);
            header.appendChild(enhanceBtn);
        });
    }

    // Batch enhance all sections
    async batchEnhanceAll() {
        if (!this.apiKey) {
            this.showNotification('Please set up your OpenAI API key in the form first', 'error');
            return;
        }

        const sections = ['about', 'skills', 'experience', 'projects', 'education', 'certifications', 'testimonials'];
        let enhancedCount = 0;
        
        this.showNotification('Starting AI enhancement for all sections...', 'success');
        
        for (const sectionId of sections) {
            try {
                await this.enhanceSection(sectionId);
                enhancedCount++;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
            } catch (error) {
                console.error(`Error enhancing ${sectionId}:`, error);
            }
        }
        
        this.showNotification(`Enhanced ${enhancedCount} sections with AI!`, 'success');
    }

    // Enhance a specific section
    async enhanceSection(sectionId) {
        if (!this.apiKey) {
            this.showNotification('Please set up your OpenAI API key first', 'error');
            return;
        }

        const section = document.getElementById(sectionId);
        if (!section) return;

        const originalContent = this.extractSectionContent(sectionId);
        if (!originalContent) return;

        // Show loading state
        const enhanceBtn = section.querySelector('button[onclick*="enhanceSection"], .ai-enhance-all');
        if (enhanceBtn) {
            const originalText = enhanceBtn.innerHTML;
            enhanceBtn.innerHTML = '⏳ Processing...';
            enhanceBtn.disabled = true;
        }

        try {
            const enhancedContent = await this.callAI(originalContent, this.getPromptType(sectionId));
            if (enhancedContent) {
                this.applyEnhancedContent(sectionId, enhancedContent);
                this.showNotification(`${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} enhanced!`, 'success');
            }
        } catch (error) {
            console.error('AI enhancement error:', error);
            this.showNotification(`Enhancement failed: ${error.message}`, 'error');
        } finally {
            // Reset button
            if (enhanceBtn) {
                enhanceBtn.innerHTML = '🤖 Enhance';
                enhanceBtn.disabled = false;
            }
        }
    }

    // Extract content from a section
    extractSectionContent(sectionId) {
        switch (sectionId) {
            case 'about':
                const aboutEl = document.getElementById('aboutContent');
                return aboutEl ? aboutEl.textContent.trim() : null;
                
            case 'skills':
                const skillEls = document.querySelectorAll('#skillsGrid .skill-item p');
                return skillEls.length > 0 ? Array.from(skillEls).map(el => el.textContent).join(', ') : null;
                
            case 'experience':
                const expItems = document.querySelectorAll('#experienceList .timeline-item');
                return expItems.length > 0 ? Array.from(expItems).map(item => {
                    const title = item.querySelector('h3')?.textContent || '';
                    const meta = item.querySelector('.timeline-meta')?.textContent || '';
                    const points = Array.from(item.querySelectorAll('p')).map(p => p.textContent).join('\n');
                    return `${title}\n${meta}\n${points}`;
                }).join('\n---\n') : null;
                
            case 'projects':
                const projItems = document.querySelectorAll('#projectsList .timeline-item');
                return projItems.length > 0 ? Array.from(projItems).map(item => {
                    const title = item.querySelector('h3')?.textContent || '';
                    const meta = item.querySelector('.timeline-meta')?.textContent || '';
                    const points = Array.from(item.querySelectorAll('p')).map(p => p.textContent).join('\n');
                    return `${title}\n${meta}\n${points}`;
                }).join('\n---\n') : null;
                
            case 'education':
                const eduItems = document.querySelectorAll('#educationList .timeline-item');
                return eduItems.length > 0 ? Array.from(eduItems).map(item => {
                    const title = item.querySelector('h3')?.textContent || '';
                    const meta = item.querySelector('.timeline-meta')?.textContent || '';
                    return `${title}\n${meta}`;
                }).join('\n---\n') : null;
                
            case 'certifications':
                const certItems = document.querySelectorAll('#certificationsList .timeline-item');
                return certItems.length > 0 ? Array.from(certItems).map(item => {
                    const title = item.querySelector('h3')?.textContent || '';
                    const meta = item.querySelector('.timeline-meta')?.textContent || '';
                    return `${title}\n${meta}`;
                }).join('\n---\n') : null;
                
            case 'testimonials':
                const testItems = document.querySelectorAll('#testimonialsList .testimonial-item');
                return testItems.length > 0 ? Array.from(testItems).map(item => {
                    const quote = item.querySelector('p')?.textContent || '';
                    const author = item.querySelector('.testimonial-author')?.textContent || '';
                    return `${quote}\n${author}`;
                }).join('\n---\n') : null;
                
            default:
                return null;
        }
    }

    // Get prompt type for section
    getPromptType(sectionId) {
        const prompts = {
            'about': 'professional summary',
            'skills': 'technical skills list',
            'experience': 'professional experience descriptions',
            'projects': 'project descriptions',
            'education': 'education details',
            'certifications': 'certification details',
            'testimonials': 'professional testimonials'
        };
        return prompts[sectionId] || 'professional text';
    }

    // Apply enhanced content to section
    applyEnhancedContent(sectionId, enhancedContent) {
        switch (sectionId) {
            case 'about':
                const aboutEl = document.getElementById('aboutContent');
                if (aboutEl) aboutEl.textContent = enhancedContent;
                break;
                
            case 'skills':
                const skillsGrid = document.getElementById('skillsGrid');
                if (skillsGrid) {
                    skillsGrid.innerHTML = '';
                    const skills = enhancedContent.split(',').map(skill => skill.trim()).filter(skill => skill);
                    skills.forEach((skill, index) => {
                        const skillItem = document.createElement('div');
                        skillItem.className = 'skill-item';
                        skillItem.innerHTML = `<p>${this.escapeHtml(skill)}</p>`;
                        skillItem.style.animationDelay = `${index * 0.1}s`;
                        skillsGrid.appendChild(skillItem);
                    });
                }
                break;
                
            case 'experience':
            case 'projects':
            case 'education':
            case 'certifications':
                const listId = sectionId + 'List';
                const listEl = document.getElementById(listId);
                if (listEl) {
                    const items = enhancedContent.split('---').map(item => item.trim()).filter(item => item);
                    listEl.innerHTML = '';
                    items.forEach((item, index) => {
                        const timelineItem = document.createElement('div');
                        timelineItem.className = 'timeline-item';
                        
                        const lines = item.split('\n').filter(line => line.trim());
                        const titleLine = lines[0] || '';
                        const titleParts = titleLine.split('|').map(part => part.trim());
                        
                        let title = titleParts[0] || 'Title';
                        let meta = titleParts[1] || '';
                        if (titleParts[2]) meta += ' | ' + titleParts[2];
                        
                        let points = lines.slice(1).filter(line => line.trim().startsWith('•'));
                        
                        timelineItem.innerHTML = `
                            <h3>${this.escapeHtml(title)}</h3>
                            <div class="timeline-meta">${this.escapeHtml(meta)}</div>
                            <div>${points.map(point => `<p>${this.escapeHtml(point)}</p>`).join('')}</div>
                        `;
                        
                        timelineItem.style.animationDelay = `${index * 0.15}s`;
                        listEl.appendChild(timelineItem);
                    });
                }
                break;
                
            case 'testimonials':
                const testimonialsList = document.getElementById('testimonialsList');
                if (testimonialsList) {
                    const testimonials = enhancedContent.split('---').map(item => item.trim()).filter(item => item);
                    testimonialsList.innerHTML = '';
                    testimonials.forEach((testimonial, index) => {
                        const parts = testimonial.split('\n').map(part => part.trim());
                        const quote = parts[0] || '';
                        const author = parts[1] || '';
                        
                        const testimonialItem = document.createElement('div');
                        testimonialItem.className = 'testimonial-item';
                        testimonialItem.innerHTML = `
                            <p>${this.escapeHtml(quote)}</p>
                            <div class="testimonial-author">— ${this.escapeHtml(author)}</div>
                        `;
                        
                        testimonialItem.style.animationDelay = `${index * 0.2}s`;
                        testimonialsList.appendChild(testimonialItem);
                    });
                }
                break;
        }
    }

    // Call OpenAI API (same as form enhancer)
    async callAI(text, promptType) {
        const prompts = {
            'professional summary': `Convert this personal summary into professional, corporate-ready language that would impress HR and hiring managers. Focus on achievements, skills, and value proposition. Keep it concise but impactful:\n\n${text}`,
            
            'technical skills list': `Convert this skills list into a professional, comprehensive technical skills inventory that would appeal to recruiters and hiring managers. Group related skills and use industry-standard terminology:\n\n${text}`,
            
            'professional experience descriptions': `Transform these work experience descriptions into professional, achievement-focused bullet points that would impress hiring managers. Use action verbs, quantify results, and focus on business impact. Maintain the same structure but enhance the language:\n\n${text}`,
            
            'project descriptions': `Enhance these project descriptions to sound more professional and impressive to potential employers. Focus on technical achievements, business impact, and innovative solutions. Maintain the structure but elevate the language:\n\n${text}`,
            
            'education details': `Convert these education details into professional, impressive format that highlights academic achievements and relevant coursework. Make it sound more prestigious and comprehensive:\n\n${text}`,
            
            'certification details': `Transform these certification details into professional, impressive format that emphasizes credibility and expertise. Make them sound more prestigious and valuable:\n\n${text}`,
            
            'professional testimonials': `Enhance these testimonials to sound more professional, credible, and impactful. Make them sound like they come from senior professionals and highlight key strengths:\n\n${text}`
        };

        const prompt = prompts[promptType] || `Convert this text into professional, corporate-ready language:\n\n${text}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert career coach and professional resume writer. Your task is to enhance text to make it more professional, impressive, and appealing to hiring managers and HR professionals. Maintain the original meaning and structure but elevate the language, add professional terminology, and focus on achievements and impact.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
                       'linear-gradient(135deg, #ffc107, #ff9800)'};
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
}

// Initialize Portfolio AI Enhancer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for portfolio to load
    setTimeout(() => {
        window.portfolioAIEnhancer = new PortfolioAIEnhancer();
    }, 1000);
});
