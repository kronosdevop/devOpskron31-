// Website Edit HTML Generator
// This file generates HTML for the website editing functionality

export function generateWebsiteEditHTML(data) {
  const { websiteName, websiteData } = data;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${websiteName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            font-family: "Inter", sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.6;
            color: #444444;
            background: #ffffff;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        .hero {
            padding: 120px 0 80px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .hero-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
        }
        .hero-text h1 {
            font-size: 3.5rem;
            font-weight: 900;
            margin-bottom: 1.5rem;
        }
        .hero-text p {
            font-size: 1.3rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .btn {
            background: #ffffff;
            color: #667eea;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin-right: 1rem;
        }
        .hero-image img {
            max-width: 100%;
            height: auto;
            border-radius: 18px;
        }
        .section {
            padding: 80px 0;
        }
        .section-title {
            text-align: center;
            font-size: 2.5rem;
            font-weight: 800;
            color: #222222;
            margin-bottom: 3rem;
        }
        .about-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
        }
        .about-image img {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
        }
        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
        }
        .service-card {
            background: #ffffff;
            padding: 2rem;
            border-radius: 18px;
            text-align: center;
            box-shadow: 0 4px 24px rgba(0,0,0,0.1);
        }
        .service-icon {
            font-size: 2.5rem;
            color: #667eea;
            margin-bottom: 1rem;
        }
        .contact-info {
            text-align: center;
            max-width: 600px;
            margin: 0 auto;
        }
        .contact-item {
            margin-bottom: 1rem;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .footer {
            background: #f8f9fa;
            padding: 3rem 0;
            text-align: center;
            border-top: 1px solid #e1e5e9;
        }
        @media (max-width: 768px) {
            .hero-content, .about-content {
                grid-template-columns: 1fr;
            }
            .hero-text h1 {
                font-size: 2.5rem;
            }
        }
    </style>
</head>
<body>
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <div class="hero-text">
                    <h1>${websiteData.hero.title}</h1>
                    <p>${websiteData.hero.subtitle}</p>
                    <div>
                        <a href="${websiteData.hero.cta_link}" class="btn">${websiteData.hero.cta_text}</a>
                    </div>
                </div>
                <div class="hero-image">
                    <img src="${websiteData.hero.image}" alt="Hero Image">
                </div>
            </div>
        </div>
    </section>

    <section class="section" id="about">
        <div class="container">
            <div class="about-content">
                <div>
                    <h2 class="section-title">${websiteData.about.title}</h2>
                    <p>${websiteData.about.content}</p>
                </div>
                <div class="about-image">
                    <img src="${websiteData.about.image}" alt="About Us">
                </div>
            </div>
        </div>
    </section>

    <section class="section" id="services">
        <div class="container">
            <h2 class="section-title">${websiteData.services.title}</h2>
            <p style="text-align: center; margin-bottom: 3rem; font-size: 1.2rem;">${websiteData.services.subtitle}</p>
            <div class="services-grid">
                ${websiteData.services.items.map(service => `
                    <div class="service-card">
                        <div class="service-icon">
                            <i class="${service.icon}"></i>
                        </div>
                        <h3>${service.title}</h3>
                        <p>${service.description}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>

    <section class="section" id="contact">
        <div class="container">
            <h2 class="section-title">${websiteData.contact.title}</h2>
            <p style="text-align: center; margin-bottom: 3rem; font-size: 1.2rem;">${websiteData.contact.content}</p>
            <div class="contact-info">
                <div class="contact-item">
                    <strong>Email:</strong> ${websiteData.contact.email}
                </div>
                <div class="contact-item">
                    <strong>Phone:</strong> ${websiteData.contact.phone}
                </div>
                <div class="contact-item">
                    <strong>Address:</strong> ${websiteData.contact.address}
                </div>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <div style="margin-bottom: 1rem;">
                ${websiteData.footer.copyright}
            </div>
            <div style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap;">
                ${websiteData.footer.links.split('\\n').map(link => `<a href="#" style="color: #666; text-decoration: none;">${link}</a>`).join('')}
            </div>
        </div>
    </footer>

    <script>
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    </script>
</body>
</html>`;
} 