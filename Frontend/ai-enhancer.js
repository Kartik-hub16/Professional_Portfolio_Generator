// ai-enhancer.js
// Purpose:
// - Adds small "Enhance Text" buttons near each main textarea on form.html
// - When clicked, it calls the backend endpoint /enhance-text to improve grammar/professional tone
// - Replaces the textarea content with the enhanced version returned by the AI
// Notes:
// - This file does NOT generate the portfolio; it only enhances individual sections.
// - Requires backend server running on http://localhost:3001
//
// AI Professional Language Enhancer
class AIEnhancer {
    constructor() {
        // Kick off DOM wiring.
        this.init();
    }

    init() {
        // Create/attach "Enhance" buttons for all supported sections.
        this.setupEnhanceButtons();
    }

    // Setup enhance buttons for each section
    setupEnhanceButtons() {
        // Map: textarea element IDs -> human-readable section label.
        const sections = [
            { id: 'about', label: 'About' },
            { id: 'skills', label: 'Skills' },
            { id: 'experience', label: 'Experience' },
            { id: 'projects', label: 'Projects' },
            { id: 'education', label: 'Education' },
            { id: 'certifications', label: 'Certifications' },
            { id: 'testimonials', label: 'Testimonials' }
        ];

        sections.forEach(section => {
            this.addEnhanceButton(section.id, section.label);
        });
    }

    // Add enhance button to a section
    addEnhanceButton(fieldId, label) {
        // Find the textarea by id. If it doesn't exist on the current page, do nothing.
        const field = document.getElementById(fieldId);
        if (!field) return;

        // Check if enhance button already exists
        // (Prevents duplicates if init runs multiple times.)
        const existingContainer = field.parentNode.querySelector('.ai-enhance-btn-container');
        if (existingContainer) return;

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'ai-enhance-btn-container';
        buttonContainer.style.cssText = 'margin-top: 10px; text-align: right;';
        
        const enhanceBtn = document.createElement('button');
        enhanceBtn.innerHTML = `🤖 Enhance Text`;
        enhanceBtn.className = 'ai-enhance-btn';
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
        
        enhanceBtn.onmouseover = () => {
            // Simple hover effect for better UX.
            enhanceBtn.style.transform = 'translateY(-2px)';
            enhanceBtn.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.4)';
        };
        
        enhanceBtn.onmouseout = () => {
            enhanceBtn.style.transform = 'translateY(0)';
            enhanceBtn.style.boxShadow = 'none';
        };

        // Main click handler: calls the backend AI to enhance the content.
        enhanceBtn.onclick = () => this.enhanceSectionWithAI(fieldId, label, enhanceBtn);
        
        buttonContainer.appendChild(enhanceBtn);
        field.parentNode.insertBefore(buttonContainer, field.nextSibling);
    }

    // Enhance a section using AI API
    async enhanceSectionWithAI(fieldId, label, button) {
        // Reads textarea value, posts it to backend, and replaces the textarea with enhanced text.
        const field = document.getElementById(fieldId);
        const originalText = field.value.trim();
        
        if (!originalText) {
            // Do not call backend if there is no input.
            this.showNotification(`Please enter some content for ${label} first`, 'warning');
            return;
        }

        // Show loading state
        const originalTextBtn = button.innerHTML;
        button.innerHTML = '⏳ AI Processing...';
        button.disabled = true;

        try {
            console.log(`Enhancing ${fieldId} with text:`, originalText);
            const enhancedText = await this.callAIEnhancementAPI(originalText, fieldId);
            
            console.log('Enhanced text received:', enhancedText);
            
            if (enhancedText && enhancedText.trim()) {
                field.value = enhancedText;
                this.showNotification(`${label} enhanced professionally!`, 'success');
                
                // Update progress and character count
                if (window.portfolioForm) {
                    window.portfolioForm.updateProgress();
                    if (fieldId === 'about') {
                        const charCounter = document.getElementById('aboutCharCount');
                        if (charCounter) {
                            charCounter.textContent = enhancedText.length;
                        }
                    }
                }
            } else {
                this.showNotification('No enhancement needed', 'info');
            }
        } catch (error) {
            console.error('AI enhancement error:', error);
            // Don't show error popup - just log it
        } finally {
            // Reset button
            button.innerHTML = originalTextBtn;
            button.disabled = false;
        }
    }

    // Call AI API for enhancement
    async callAIEnhancementAPI(text, fieldId) {
        try {
            console.log('Calling AI API for enhancement...');
            const response = await fetch('http://localhost:3001/enhance-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    section: fieldId
                })
            });

            console.log('API response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error response:', errorText);
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();
            console.log('API response result:', result);
            
            if (!result.enhancedText) {
                throw new Error('No enhanced text in response');
            }
            
            return result.enhancedText;
        } catch (error) {
            console.error('API call failed:', error);
            // Simple fallback - just return original text
            console.log('API failed, returning original text');
            return text;
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

// Initialize AI Enhancer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIEnhancer();
});
