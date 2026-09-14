/* ===== BraziClean — JavaScript ===== */
document.addEventListener('DOMContentLoaded', () => {
  // Header scroll effect
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // Mobile menu
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const mobileClose = document.querySelector('.mobile-nav-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav a');

  function openMenu() { mobileNav.classList.add('active'); mobileOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
  function closeMenu() { mobileNav.classList.remove('active'); mobileOverlay.classList.remove('active'); document.body.style.overflow = ''; }

  hamburger?.addEventListener('click', openMenu);
  mobileClose?.addEventListener('click', closeMenu);
  mobileOverlay?.addEventListener('click', closeMenu);
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Intersection Observer for fade-up animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // Keep statistics readable immediately; avoid showing "+0" while the page loads.
  document.querySelectorAll('[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    if (!Number.isNaN(target)) el.textContent = target.toLocaleString();
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  }, { passive: true });

  // EmailJS & Quote Form Logic
  let emailJsPromise;
  function loadEmailJs() {
    if (window.emailjs) return Promise.resolve(window.emailjs);
    if (emailJsPromise) return emailJsPromise;

    emailJsPromise = new Promise((resolve, reject) => {
      const emailJsScript = document.createElement('script');
      emailJsScript.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      emailJsScript.async = true;
      emailJsScript.onload = () => {
        emailjs.init({ publicKey: '_M1M0aep8-q2RYQph' });
        resolve(emailjs);
      };
      emailJsScript.onerror = reject;
      document.head.appendChild(emailJsScript);
    });

    return emailJsPromise;
  }

  const quoteFormHTML = `
    <input type="hidden" name="user_name" value="" />
    <div class="form-group row">
      <div class="w-100"><label for="quote-first-name">First Name</label><input id="quote-first-name" type="text" name="first_name" required placeholder="Jane" /></div>
      <div class="w-100"><label for="quote-last-name">Last Name</label><input id="quote-last-name" type="text" name="last_name" required placeholder="Doe" /></div>
    </div>
    <div class="form-group row">
      <div class="w-100"><label for="quote-email">Email</label><input id="quote-email" type="email" name="user_email" required placeholder="jane@example.com" /></div>
      <div class="w-100"><label for="quote-phone">Phone</label><input id="quote-phone" type="tel" name="user_phone" required placeholder="(615) 555-0123" /></div>
    </div>
    <div class="form-group"><label for="quote-details">Tell us about your property and the cleaning services you need</label><textarea id="quote-details" name="property_details" required rows="5" placeholder="Tell us about your property and the cleaning services you need."></textarea></div>
    <button type="submit" class="btn btn-primary submit-btn">Submit</button>
  `;

  // Inject Floating Action Button for SMS
  const smsBody = encodeURIComponent("Hi! I found you through the website and would like to request a free quote.");
  const fabHTML = `
    <a href="#contact" class="floating-action-btn" id="fab-quote" aria-label="Get a Free Quote" style="text-decoration: none;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
      <span>Get a Quote</span>
    </a>
  `;
  document.body.insertAdjacentHTML('beforeend', fabHTML);

  // Handle Form Submission (Works for global modal and hero form if it exists)
  async function handleQuoteFormSubmit(e) {
    e.preventDefault();
    const formEl = e.target;
    const submitBtn = formEl.querySelector('.submit-btn');
    const successMsg = formEl.parentElement.querySelector('.quote-form-success');
    const errorMsg = formEl.parentElement.querySelector('.quote-form-error');

    // Extract form data to pre-fill the SMS message
    const formData = new FormData(formEl);
    const data = Object.fromEntries(formData.entries());
    const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim();
    formEl.querySelector('[name="user_name"]').value = fullName;
    const messageBody = encodeURIComponent(`Hi! My name is ${fullName}. I would like to request a quote. ${data.property_details || ''} My email is ${data.user_email}.`);

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    // Meta Pixel — Lead event
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead', {
        content_name: 'Free Quote Form',
        content_category: 'Cleaning Quote',
        value: 0,
        currency: 'USD'
      });
    }

    try {
      await loadEmailJs();
      await emailjs.sendForm('service_g1o7nfc', 'template_i2m9acj', formEl);
      successMsg.style.display = 'block';
      formEl.style.display = 'none';
      const smsLink = successMsg.querySelector('[data-sms-link]');
      if (smsLink) smsLink.href = `sms:+16156694084?body=${messageBody}`;
    } catch (error) {
      console.error('EmailJS Error:', error);
      errorMsg.style.display = 'block';
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  document.querySelectorAll('.quote-form').forEach(f => {
    f.addEventListener('submit', handleQuoteFormSubmit);
  });

  // Render form dynamically into the #contact section
  const contactContainer = document.querySelector('#contact .container');
  if (contactContainer) {
    const formWrapHTML = `
      <div class="quote-form-wrap" style="flex: 1; max-width: 500px; width: 100%; text-align: left; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        <h3 style="margin-bottom: 20px; font-family: 'Poppins', sans-serif;">Get Your Free Quote</h3>
        <div class="quote-form-success" style="display: none; color: green; margin-bottom: 15px;"><strong>Thank you!</strong> Your request was sent successfully. We'll contact you shortly.<div class="quote-success-actions"><a class="btn btn-primary" data-sms-link href="#">Text us</a><a class="btn btn-secondary" href="tel:+16156694084">Call (615) 669-4084</a></div></div>
        <div class="quote-form-error" style="display: none; color: red; margin-bottom: 15px;">Failed to send request. Please try again.</div>
        <form class="quote-form" id="contactQuoteForm">
           ${quoteFormHTML}
        </form>
      </div>
    `;
    
    // Style the container for a side-by-side layout on desktop
    contactContainer.style.display = 'flex';
    contactContainer.style.flexWrap = 'wrap';
    contactContainer.style.justifyContent = 'space-between';
    contactContainer.style.alignItems = 'center';
    contactContainer.style.gap = '40px';
    
    const contactInfo = contactContainer.querySelector('.contact-info');
    if (contactInfo) {
       contactInfo.style.flex = '1';
       contactInfo.style.minWidth = '300px';
       contactInfo.style.textAlign = 'left';
    }
    
    contactContainer.insertAdjacentHTML('beforeend', formWrapHTML);
    document.getElementById('contactQuoteForm').addEventListener('submit', handleQuoteFormSubmit);
  }

  // Testimonial auto-scroll
  const slider = document.querySelector('.testimonials-slider');
  if (slider) {
    let scrollInterval;
    function startAutoScroll() {
      scrollInterval = setInterval(() => {
        if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) {
          slider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          slider.scrollBy({ left: 400, behavior: 'smooth' });
        }
      }, 4000);
    }
    startAutoScroll();
    slider.addEventListener('mouseenter', () => clearInterval(scrollInterval));
    slider.addEventListener('mouseleave', startAutoScroll);
  }

  // ─── Meta Pixel — Click Tracking ───
  function trackContact(label) {
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Contact', { content_name: label });
    }
  }

  // Track all CTA buttons (Free Quote / Request Quote / Get a Quote)
  document.querySelectorAll('.btn-primary, .service-link, .header-cta').forEach(btn => {
    btn.addEventListener('click', function() {
      const label = this.textContent.trim() || 'CTA Button';
      trackContact(label.length > 40 ? label.substring(0, 40) : label);
    });
  });

  // Track Floating Action Button
  const fab = document.getElementById('fab-quote');
  if (fab) {
    fab.addEventListener('click', () => trackContact('FAB Get a Quote'));
  }

  // Track phone link clicks
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', function() {
      trackContact('Phone Call: ' + (this.textContent.trim() || 'Phone Link'));
    });
  });

});
