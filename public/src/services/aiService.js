// AI Service for Landing Page Generation
class AIService {
    constructor() {
        // Use environment variable instead of hardcoded key

        // console.log('AI Service: API key loaded:', this.apiKey ? 'Yes' : 'No')

        // To test fallback mode, comment out the line above and uncomment the line below:
        this.apiKey = null

        this.baseURL = 'https://api.openai.com/v1'

        if (!this.apiKey) {
            console.warn('OpenAI API key not found. Using fallback simulation mode.')
        } else {
          //  console.log('OpenAI API key found. Using real API mode.')
        }
    }

    async generateLandingPage(prompt, selectedTemplate = null) {
        // Automatically append essential structure requirements to user's prompt
        const enhancedPrompt = `${prompt}

IMPORTANT: Please create a complete HTML landing page with:
1. Hero section with compelling headline and call-to-action
2. Features section highlighting key benefits
3. About section with company information
4. Contact section with contact form
${selectedTemplate && selectedTemplate.content.logo ? '5. Logo section with company branding' : ''}
${selectedTemplate && selectedTemplate.content.testimonials ? '6. Testimonials section with customer reviews' : ''}

Make it responsive, modern, and professional. Use a clean design with good typography and spacing. Include complete HTML, CSS, and ensure it's ready to deploy.`

      //  console.log('User prompt:', prompt);
      //  console.log('Enhanced prompt sent to AI:', enhancedPrompt);

        try {
            if (this.apiKey) {
              //  console.log('AI Service: Using OpenAI API')
                return await this.callOpenAI(enhancedPrompt, selectedTemplate)
            } else {
                // Fallback to simulated response
              //  console.log('AI Service: No API key found, using fallback simulation')
                return await this.simulateAIResponse(enhancedPrompt, selectedTemplate)
            }
        } catch (error) {
            console.error('AI generation error:', error)
            // Fallback to simulated response
          //  console.log('AI Service: API call failed, using fallback simulation')
            return await this.simulateAIResponse(enhancedPrompt, selectedTemplate)
        }
    }

    async callOpenAI(prompt, selectedTemplate = null) {
        try {
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an expert web developer specializing in creating professional, modern landing pages. 

Your task is to create a complete HTML landing page based on the user's business requirements.

${selectedTemplate ? `IMPORTANT: Follow the structure and style of the "${selectedTemplate.name}" template. Include all sections from the template: ${Object.keys(selectedTemplate.content).join(', ')}.` : ''}

Use modern CSS with:
- Responsive design (mobile-first)
- Professional color schemes
- Clean typography
- Smooth animations and hover effects
- Modern layout techniques (CSS Grid/Flexbox)

The HTML should be complete, self-contained, and ready to deploy.`
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 4000,
                    temperature: 0.7
                })
            })

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            const aiResponse = data.choices[0].message.content

            // Parse the AI response to extract sections and HTML
            const sections = this.parseAIResponse(aiResponse)
            const html = this.generateHTMLFromSections(sections)

            return {
                sections: sections,
                html: html,
                rawResponse: aiResponse
            }
        } catch (error) {
            console.error('OpenAI API call failed:', error)
            throw error
        }
    }

    parseAIResponse(aiResponse) {
        // Try to extract structured content from AI response
        // This is a fallback parser - the AI might return different formats
        try {
            // Look for JSON-like structure in the response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0])
                if (parsed.sections) {
                    return parsed.sections
                }
            }

            // If no JSON found, create structured content from the response
            return this.createStructuredContent(aiResponse)
        } catch (error) {
            console.warn('Failed to parse AI response, using fallback structure:', error)
            return this.createStructuredContent(aiResponse)
        }
    }

    createStructuredContent(aiResponse) {
        // Extract content from AI response and structure it
        const lines = aiResponse.split('\n')
        let currentSection = ''
        let heroTitle = ''
        let heroSubtitle = ''
        let features = []
        let aboutTitle = ''
        let aboutDescription = ''
        let contactTitle = ''
        let contactDescription = ''

        for (const line of lines) {
            const trimmedLine = line.trim().toLowerCase()

            if (trimmedLine.includes('hero') || trimmedLine.includes('main') || trimmedLine.includes('welcome')) {
                currentSection = 'hero'
            } else if (trimmedLine.includes('feature') || trimmedLine.includes('benefit')) {
                currentSection = 'features'
            } else if (trimmedLine.includes('about') || trimmedLine.includes('company')) {
                currentSection = 'about'
            } else if (trimmedLine.includes('contact') || trimmedLine.includes('touch')) {
                currentSection = 'contact'
            } else if (line.trim() && currentSection === 'hero') {
                if (!heroTitle) {
                    heroTitle = line.trim()
                } else if (!heroSubtitle) {
                    heroSubtitle = line.trim()
                }
            } else if (line.trim() && currentSection === 'features') {
                if (line.includes('-') || line.includes('•')) {
                    const featureText = line.replace(/[-•]/g, '').trim()
                    if (featureText) {
                        features.push({
                            icon: 'mdi-star',
                            title: featureText.split(':')[0] || featureText,
                            description: featureText.split(':')[1] || featureText
                        })
                    }
                }
            } else if (line.trim() && currentSection === 'about') {
                if (!aboutTitle) {
                    aboutTitle = line.trim()
                } else if (!aboutDescription) {
                    aboutDescription = line.trim()
                }
            } else if (line.trim() && currentSection === 'contact') {
                if (!contactTitle) {
                    contactTitle = line.trim()
                } else if (!contactDescription) {
                    contactDescription = line.trim()
                }
            }
        }

        // Ensure we have at least 3 features
        while (features.length < 3) {
            features.push({
                icon: 'mdi-star',
                title: `Feature ${features.length + 1}`,
                description: 'Professional service and support'
            })
        }

        return {
            hero: {
                title: heroTitle || 'Welcome to Our Business',
                subtitle: heroSubtitle || 'Professional solutions for your needs',
                cta: 'Get Started'
            },
            features: features,
            about: {
                title: aboutTitle || 'About Us',
                description: aboutDescription || 'We are dedicated to providing exceptional service and innovative solutions.',
                image: 'https://via.placeholder.com/400x300'
            },
            contact: {
                title: contactTitle || 'Get In Touch',
                description: contactDescription || 'Ready to get started? Contact us today.',
                cta: 'Contact Us'
            }
        }
    }

    generateHTMLFromSections(sections) {
        // Generate HTML from structured sections
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${sections.hero?.title || 'Your Business'}</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    margin: 0; 
                    padding: 0; 
                    line-height: 1.6;
                    color: #333;
                }
                .hero { 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    padding: 100px 20px; 
                    text-align: center; 
                    color: white;
                }
                .hero h1 { 
                    font-size: 3rem; 
                    margin: 0 0 20px 0; 
                    font-weight: 700;
                }
                .hero p { 
                    font-size: 1.3rem; 
                    margin: 0 0 30px 0; 
                    opacity: 0.9;
                }
                .section { 
                    padding: 80px 20px; 
                }
                .container { 
                    max-width: 1200px; 
                    margin: 0 auto; 
                    padding: 0 20px;
                }
                .btn { 
                    background: #fff; 
                    color: #667eea; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 30px; 
                    display: inline-block; 
                    font-weight: 600;
                    font-size: 1.1rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .btn:hover { 
                    transform: translateY(-2px); 
                    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                }
                .features-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
                    gap: 40px; 
                    margin-top: 50px; 
                }
                .feature-card { 
                    text-align: center; 
                    padding: 40px 30px; 
                    background: white; 
                    border-radius: 15px; 
                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                }
                .feature-card:hover { 
                    transform: translateY(-5px); 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                }
                .feature-card h3 { 
                    color: #333; 
                    margin: 20px 0 15px 0; 
                    font-size: 1.5rem;
                }
                .feature-card p { 
                    color: #666; 
                    margin: 0; 
                    line-height: 1.6;
                }
                .about-section { 
                    background: #f8f9fa; 
                }
                .about-content { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 60px; 
                    align-items: center; 
                }
                .about-content h2 { 
                    font-size: 2.5rem; 
                    margin-bottom: 30px; 
                    color: #333;
                }
                .about-content p { 
                    font-size: 1.2rem; 
                    line-height: 1.8; 
                    color: #666;
                }
                .about-content img { 
                    width: 100%; 
                    border-radius: 15px; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }
                .contact-section { 
                    text-align: center; 
                    background: #667eea;
                    color: white;
                }
                .contact-section h2 { 
                    font-size: 2.5rem; 
                    margin-bottom: 20px;
                }
                .contact-section p { 
                    font-size: 1.2rem; 
                    margin-bottom: 30px; 
                    opacity: 0.9;
                }
                .contact-section .btn { 
                    background: white; 
                    color: #667eea;
                }
                .section h2 { 
                    text-align: center; 
                    font-size: 2.5rem; 
                    margin-bottom: 20px; 
                    color: #333;
                }
                @media (max-width: 768px) {
                    .about-content { grid-template-columns: 1fr; }
                    .hero h1 { font-size: 2rem; }
                    .section h2 { font-size: 2rem; }
                    .features-grid { grid-template-columns: 1fr; }
                }
            </style>
        </head>
        <body>
            <section class="hero">
                <div class="container">
                    <h1>${sections.hero?.title || 'Welcome to Our Business'}</h1>
                    <p>${sections.hero?.subtitle || 'Professional solutions for your needs'}</p>
                    <a href="#" class="btn">${sections.hero?.cta || 'Get Started'}</a>
                </div>
            </section>
            
            <section class="section">
                <div class="container">
                    <h2>Our Features</h2>
                    <div class="features-grid">
                        ${(sections.features || []).map(f => `
                            <div class="feature-card">
                                <h3>${f.title || 'Feature'}</h3>
                                <p>${f.description || 'Professional service and support'}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
            
            <section class="section about-section">
                <div class="container">
                    <div class="about-content">
                        <div>
                            <h2>${sections.about?.title || 'About Us'}</h2>
                            <p>${sections.about?.description || 'We are dedicated to providing exceptional service and innovative solutions.'}</p>
                        </div>
                        <div>
                            <img src="${sections.about?.image || 'https://via.placeholder.com/400x300'}" alt="About Us">
                        </div>
                    </div>
                </div>
            </section>
            
            <section class="section contact-section">
                <div class="container">
                    <h2>${sections.contact?.title || 'Get In Touch'}</h2>
                    <p>${sections.contact?.description || 'Ready to get started? Contact us today.'}</p>
                    <a href="#" class="btn">${sections.contact?.cta || 'Contact Us'}</a>
                </div>
            </section>
        </body>
        </html>
        `
    }

    async simulateAIResponse(prompt, selectedTemplate = null) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Extract business information from prompt with better regex patterns
        const businessMatch = prompt.match(/business called "([^"]+)"/)
        const businessTypeMatch = prompt.match(/for a ([^ ]+) business/)
        const targetAudienceMatch = prompt.match(/Target audience: ([^\n\r]+)/)
        const featuresMatch = prompt.match(/Key features\/services: ([^\n\r]+)/)
        const styleMatch = prompt.match(/Design style: ([^\n\r]+)/)

        const businessName = businessMatch ? businessMatch[1] : 'Your Business'
        const businessType = businessTypeMatch ? businessTypeMatch[1] : 'professional'
        const targetAudience = targetAudienceMatch ? targetAudienceMatch[1] : 'our customers'
        const features = featuresMatch ? featuresMatch[1].split(',').slice(0, 3) : ['Quality Service', 'Expert Support', 'Fast Delivery']
        const style = styleMatch ? styleMatch[1] : 'Modern & Clean'

        // console.log('AI Service - Extracted data:', {
        //     businessName,
        //     businessType,
        //     targetAudience,
        //     features,
        //     style
        // })

        // If a template is selected, use its structure
        if (selectedTemplate && selectedTemplate.content) {
            // console.log('AI Service - Using selected template structure:', selectedTemplate.name)
            const sections = { ...selectedTemplate.content }

            // Update content with business-specific information
            sections.hero.title = sections.hero.title.replace('Our Business', businessName)
            sections.hero.subtitle = sections.hero.subtitle.replace('modern companies', targetAudience)

            // Update features with extracted features
            if (sections.features && features.length > 0) {
                sections.features = sections.features.map((feature, index) => ({
                    ...feature,
                    title: features[index] || feature.title,
                    description: feature.description.replace('solutions', features[index] || 'solutions')
                }))
            }

            // Update about section
            if (sections.about) {
                sections.about.description = sections.about.description.replace('solutions', `${businessType} solutions`)
            }

            // Generate HTML from sections
            const html = this.generateHTMLFromSections(sections)

            return {
                sections: sections,
                html: html,
                rawResponse: `Simulated response using ${selectedTemplate.name} template for ${businessName}`
            }
        }

        // Generate content based on style (fallback)
        const sections = this.generateStyleBasedContent(style, businessName, businessType, targetAudience, features)

        // Generate HTML from sections
        const html = this.generateHTMLFromSections(sections)

        // console.log('AI Service - Generated content:', sections)

        // Return the same structure as callOpenAI
        return {
            sections: sections,
            html: html,
            rawResponse: `Simulated response for ${businessName} - ${businessType} business`
        }
    }

    generateStyleBasedContent(style, businessName, businessType, targetAudience, features) {
        const styleTemplates = {
            'Modern & Clean': {
                hero: {
                    title: `Transform Your ${businessType.charAt(0).toUpperCase() + businessType.slice(1)} with ${businessName}`,
                    subtitle: `Innovative solutions designed for ${targetAudience}. Experience the future of ${businessType} today.`,
                    cta: 'Get Started Now'
                },
                features: features.map((feature, index) => ({
                    icon: ['mdi-rocket', 'mdi-shield-check', 'mdi-lightning-bolt', 'mdi-trending-up'][index] || 'mdi-star',
                    title: feature.trim(),
                    description: `Revolutionary ${feature.trim().toLowerCase()} that sets new industry standards.`
                })),
                about: {
                    title: `About ${businessName}`,
                    description: `We're pioneers in ${businessType}, dedicated to empowering ${targetAudience} with cutting-edge solutions that drive real results.`,
                    image: 'https://via.placeholder.com/400x300/1976D2/FFFFFF?text=About+Us'
                },
                contact: {
                    title: 'Ready to Transform Your Business?',
                    description: `Join thousands of satisfied ${targetAudience} who have already revolutionized their ${businessType} with ${businessName}.`,
                    cta: 'Start Your Journey'
                }
            },
            'Professional': {
                hero: {
                    title: `${businessName} - Your Trusted ${businessType.charAt(0).toUpperCase() + businessType.slice(1)} Partner`,
                    subtitle: `Delivering exceptional ${businessType} solutions for ${targetAudience} with proven expertise and reliability.`,
                    cta: 'Learn More'
                },
                features: features.map((feature, index) => ({
                    icon: ['mdi-briefcase', 'mdi-account-check', 'mdi-chart-line', 'mdi-handshake'][index] || 'mdi-star',
                    title: feature.trim(),
                    description: `Professional ${feature.trim().toLowerCase()} backed by years of industry experience.`
                })),
                about: {
                    title: `Why Choose ${businessName}?`,
                    description: `With decades of combined experience in ${businessType}, we understand the unique challenges faced by ${targetAudience} and deliver tailored solutions.`,
                    image: 'https://via.placeholder.com/400x300/424242/FFFFFF?text=Professional'
                },
                contact: {
                    title: 'Let\'s Discuss Your Needs',
                    description: `Contact our team of ${businessType} experts to explore how ${businessName} can support your business objectives.`,
                    cta: 'Schedule Consultation'
                }
            },
            'Creative & Bold': {
                hero: {
                    title: `🚀 ${businessName} - Where ${businessType} Meets Innovation`,
                    subtitle: `Breaking boundaries and redefining what's possible for ${targetAudience}. Bold solutions for bold businesses.`,
                    cta: 'Join the Revolution'
                },
                features: features.map((feature, index) => ({
                    icon: ['mdi-flash', 'mdi-fire', 'mdi-diamond', 'mdi-crown'][index] || 'mdi-star',
                    title: feature.trim(),
                    description: `Bold, innovative ${feature.trim().toLowerCase()} that challenges the status quo.`
                })),
                about: {
                    title: `The ${businessName} Story`,
                    description: `We're not just another ${businessType} company - we're visionaries, creators, and disruptors passionate about empowering ${targetAudience}.`,
                    image: 'https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=Creative'
                },
                contact: {
                    title: 'Ready to Make Waves?',
                    description: `Don't just follow trends - set them. Let ${businessName} help you create something extraordinary.`,
                    cta: 'Start Creating'
                }
            },
            'Minimalist': {
                hero: {
                    title: businessName,
                    subtitle: `Simple. Effective. ${businessType.charAt(0).toUpperCase() + businessType.slice(1)}.`,
                    cta: 'Explore'
                },
                features: features.map((feature, index) => ({
                    icon: ['mdi-check', 'mdi-check-circle', 'mdi-check-decagram'][index] || 'mdi-check',
                    title: feature.trim(),
                    description: `Essential ${feature.trim().toLowerCase()} without complexity.`
                })),
                about: {
                    title: 'About',
                    description: `We believe in the power of simplicity. Our ${businessType} solutions are designed for ${targetAudience} who value clarity and efficiency.`,
                    image: 'https://via.placeholder.com/400x300/9E9E9E/FFFFFF?text=Minimal'
                },
                contact: {
                    title: 'Get in Touch',
                    description: `Ready to simplify your ${businessType}? Let's talk.`,
                    cta: 'Contact'
                }
            }
        }

        return styleTemplates[style] || styleTemplates['Modern & Clean']
    }

    async generateSEOContent(pageData) {
        const seoData = {
            title: `${pageData.businessName} - ${pageData.businessType} Solutions`,
            description: `Professional ${pageData.businessType} services for ${pageData.targetAudience}. ${pageData.keyFeatures}. Contact ${pageData.businessName} today.`,
            keywords: `${pageData.businessType}, ${pageData.targetAudience}, ${pageData.keyFeatures}, ${pageData.businessName}`,
            ogTitle: `${pageData.businessName} - ${pageData.businessType} Solutions`,
            ogDescription: `Professional ${pageData.businessType} services for ${pageData.targetAudience}.`,
            ogImage: 'https://via.placeholder.com/1200x630/1976D2/FFFFFF?text=Landing+Page'
        }

        return seoData
    }

    async generateCustomCSS(style, primaryColor, secondaryColor, fontFamily) {
        const cssTemplates = {
            'Modern & Clean': `
        .hero {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
        }
        .feature-card {
          border: 1px solid #e0e0e0;
          transition: all 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
      `,
            'Professional': `
        .hero {
          background: ${primaryColor};
        }
        .section-title {
          border-bottom: 3px solid ${primaryColor};
          padding-bottom: 10px;
        }
      `,
            'Creative & Bold': `
        .hero {
          background: linear-gradient(45deg, ${primaryColor}, ${secondaryColor}, ${primaryColor});
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `,
            'Minimalist': `
        .hero {
          background: #f8f9fa;
          color: #333;
        }
        .btn {
          background: ${primaryColor};
          border: none;
          padding: 12px 24px;
        }
      `
        }

        return `
      body {
        font-family: '${fontFamily}', sans-serif;
      }
      ${cssTemplates[style] || cssTemplates['Modern & Clean']}
    `
    }

    generatePrompt() {
        const businessType = this.pageData.businessType || "business";
        const businessName = this.pageData.businessName || "Your Business";
        const targetAudience = this.pageData.targetAudience || "General audience";
        const keyFeatures = this.pageData.keyFeatures || "Quality services and solutions";
        const customPrompt = this.pageData.customPrompt || "";

        // Only show user info and custom instructions in the textarea
        this.generatedPrompt =
            `Create a landing page for a ${businessType} business called "${businessName}".\n` +
            `Target audience: ${targetAudience}\n` +
            `Key features/services: ${keyFeatures}` +
            (customPrompt ? `\n\n${customPrompt}` : "");
    }

    generateTemplatePreview(template) {
        return template.preview;
    }
}

export default new AIService() 