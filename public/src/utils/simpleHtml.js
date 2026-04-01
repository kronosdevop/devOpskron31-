// Simple HTML generator

export function generateWebsiteHTML(data) {
  const { websiteName, sections, themeObject, heroImage, aboutImage } = data;
  
  const bgColor = themeObject?.bg || '#ffffff';
  const titleColor = themeObject?.titleColor || '#222222';
  const bodyColor = themeObject?.bodyColor || '#444444';
  const linkColor = themeObject?.linkColor || '#007bff';

  const navLinks = sections.navigation.links.map(link => 
    '<li><a href="#' + link.toLowerCase().replace(/\s+/g, '-') + '">' + link + '</a></li>'
  ).join('');

  const features = sections.features.map(feature => 
    '<div class="feature-card"><div class="feature-icon"><i class="' + feature.icon + '"></i></div><h3>' + feature.title + '</h3><p>' + feature.description + '</p></div>'
  ).join('');

  const services = sections.services.map(service => 
    '<div class="service-card"><div class="service-icon"><i class="' + service.icon + '"></i></div><h3>' + service.title + '</h3><p>' + service.description + '</p><a href="#" style="color: ' + linkColor + '; font-weight: 600;">' + service.link + '</a></div>'
  ).join('');

  const formFields = sections.contact.formFields.map(field => {
    const fieldId = field.label.toLowerCase().replace(/\s+/g, '-');
    if (field.type === 'textarea') {
      return '<div class="form-group"><label for="' + fieldId + '">' + field.label + '</label><textarea id="' + fieldId + '" placeholder="' + field.placeholder + '" rows="' + (field.rows || 4) + '"></textarea></div>';
    } else {
      return '<div class="form-group"><label for="' + fieldId + '">' + field.label + '</label><input type="' + (field.type || 'text') + '" id="' + fieldId + '" placeholder="' + field.placeholder + '"></div>';
    }
  }).join('');

  const footerLinks = sections.footer.links.map(link => 
    '<a href="#">' + link + '</a>'
  ).join('');

  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>' + websiteName + '</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"><link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet"><style>body{font-family:"Inter",sans-serif;margin:0;padding:0;line-height:1.6;color:' + bodyColor + ';background:' + bgColor + '}.container{max-width:1200px;margin:0 auto;padding:0 20px}.navbar{background:' + bgColor + ';padding:1rem 0;position:fixed;width:100%;top:0;z-index:1000}.logo{font-size:1.5rem;font-weight:700;color:' + titleColor + ';text-decoration:none}.nav-links{display:flex;list-style:none;gap:2rem}.nav-links a{color:' + bodyColor + ';text-decoration:none}.hero{padding:120px 0 80px;min-height:100vh;display:flex;align-items:center}.hero-content{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}.hero-text h1{font-size:3.5rem;font-weight:900;color:' + titleColor + ';margin-bottom:1.5rem}.hero-text p{font-size:1.3rem;margin-bottom:2rem}.btn{background:' + linkColor + ';color:white;padding:12px 24px;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;text-decoration:none;display:inline-block;margin-right:1rem}.hero-image img{max-width:100%;height:auto;border-radius:18px}.section{padding:80px 0}.section-title{text-align:center;font-size:2.5rem;font-weight:800;color:' + titleColor + ';margin-bottom:3rem}.features-grid,.services-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:2rem}.feature-card,.service-card{background:' + bgColor + ';padding:2rem;border-radius:18px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.1)}.feature-icon,.service-icon{font-size:2.5rem;color:' + linkColor + ';margin-bottom:1rem}.about-content{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}.about-image img{max-width:100%;height:auto;border-radius:12px}.contact-form{max-width:600px;margin:0 auto}.form-group{margin-bottom:1.5rem}.form-group label{display:block;margin-bottom:0.5rem;font-weight:600}.form-group input,.form-group textarea{width:100%;padding:12px;border:2px solid #e1e5e9;border-radius:8px;font-size:1rem}.footer{background:' + bgColor + ';padding:3rem 0;text-align:center;border-top:1px solid #e1e5e9}.footer-links{display:flex;justify-content:center;gap:2rem;flex-wrap:wrap}.footer-links a{color:' + bodyColor + ';text-decoration:none}@media(max-width:768px){.hero-content,.about-content{grid-template-columns:1fr}.hero-text h1{font-size:2.5rem}}</style></head><body><nav class="navbar"><div class="container"><div style="display:flex;justify-content:space-between;align-items:center"><a href="#" class="logo">' + sections.navigation.logo + '</a><ul class="nav-links">' + navLinks + '</ul></div></div></nav><section class="hero"><div class="container"><div class="hero-content"><div class="hero-text"><h1>' + sections.hero.title + '</h1><p>' + sections.hero.subtitle + '</p><div><a href="#" class="btn">' + sections.hero.primaryButton + '</a><a href="#" class="btn" style="background:transparent;color:' + linkColor + ';border:2px solid ' + linkColor + ';">' + sections.hero.secondaryButton + '</a></div></div><div class="hero-image"><img src="' + heroImage + '" alt="Hero Image"></div></div></div></section><section class="section" id="features"><div class="container"><h2 class="section-title">Why Choose Us</h2><div class="features-grid">' + features + '</div></div></section><section class="section" id="about"><div class="container"><div class="about-content"><div><h2>' + sections.about.title + '</h2><p>' + sections.about.description + '</p></div><div class="about-image"><img src="' + aboutImage + '" alt="About Us"></div></div></div></section><section class="section" id="services"><div class="container"><h2 class="section-title">Our Services</h2><div class="services-grid">' + services + '</div></div></section><section class="section" id="contact"><div class="container"><h2 class="section-title">' + sections.contact.title + '</h2><p style="text-align:center;margin-bottom:3rem">' + sections.contact.subtitle + '</p><div class="contact-form"><form>' + formFields + '<button type="submit" class="btn" style="width:100%">' + sections.contact.submitButton + '</button></form></div></div></section><footer class="footer"><div class="container"><div style="font-size:1.5rem;font-weight:700;margin-bottom:1rem">' + sections.footer.logo + '</div><div style="margin-bottom:1rem">' + sections.footer.text + '</div><div class="footer-links">' + footerLinks + '</div></div></footer><script>document.querySelectorAll("a[href^=\\"#\\"]").forEach(anchor=>{anchor.addEventListener("click",function(e){e.preventDefault();const target=document.querySelector(this.getAttribute("href"));if(target){target.scrollIntoView({behavior:"smooth",block:"start"})}})})document.querySelector("form").addEventListener("submit",function(e){e.preventDefault();alert("Thank you for your message! We will get back to you soon.")})</script></body></html>';
}

export function generateBasicHTML(websiteName) {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>' + websiteName + '</title><style>body{font-family:Arial,sans-serif;margin:0;padding:0;line-height:1.6}.container{max-width:1200px;margin:0 auto;padding:0 20px}.hero{background:#f5f5f5;padding:80px 0;text-align:center}.section{padding:60px 0}.btn{background:#007bff;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block}</style></head><body><section class="hero"><div class="container"><h1>Welcome to ' + websiteName + '</h1><p>Your professional website is now live!</p><a href="#" class="btn">Get Started</a></div></section><section class="section"><div class="container"><h2>About Us</h2><p>This is your new website. You can customize it further by editing the content and styling.</p></div></section></body></html>';
}
