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

  // Animated counters
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target).toLocaleString();
          if (progress < 1) requestAnimationFrame(updateCounter);
        }
        requestAnimationFrame(updateCounter);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

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
    <div class="form-group row">
      <div class="w-100">
        <label>Name</label>
        <input type="text" name="user_name" required placeholder="John Doe" />
      </div>
      <div class="w-100">
        <label>Phone</label>
        <input type="tel" name="user_phone" required placeholder="(615) 555-0123" />
      </div>
    </div>
    <div class="form-group row">
      <div class="w-100">
        <label>Email</label>
        <input type="email" name="user_email" required placeholder="john@example.com" />
      </div>
      <div class="w-100">
        <label>Cleaning Type</label>
        <select name="cleaning_type" required>
          <option value="Recurring Cleaning">Recurring Cleaning</option>
          <option value="Deep Cleaning">Deep Cleaning</option>
          <option value="Move In/Out Cleaning">Move In/Out Cleaning</option>
          <option value="Commercial Cleaning">Commercial Cleaning</option>
        </select>
      </div>
    </div>
    <div class="form-group row">
      <div class="w-100">
        <label>Frequency</label>
        <select name="frequency" required>
          <option value="One-Time">One-Time</option>
          <option value="Weekly">Weekly</option>
          <option value="Biweekly">Biweekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>
      <div class="w-100">
        <label>Home Size</label>
        <select name="home_size" required>
          <option value="Studio">Studio</option>
          <option value="1 Bedroom">1 Bedroom</option>
          <option value="2 Bedrooms">2 Bedrooms</option>
          <option value="3 Bedrooms">3 Bedrooms</option>
          <option value="4+ Bedrooms">4+ Bedrooms</option>
        </select>
      </div>
    </div>
    <button type="submit" class="btn btn-primary submit-btn">Get My Free Quote</button>
  `;

  // Inject Floating Action Button for SMS
  const smsBody = encodeURIComponent("Hi! I found you through the website and would like to request a free quote.");
  const fabHTML = `
    <a href="sms:+16156694084?body=${smsBody}" class="floating-action-btn" id="fab-quote" aria-label="Get a Free Quote" style="text-decoration: none;">
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
    const messageBody = encodeURIComponent(`Hi! My name is ${data.user_name}. I would like to get a quote for a ${data.cleaning_type} (${data.frequency}) for my ${data.home_size}. My email is ${data.user_email}.`);

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';

    try {
      await loadEmailJs();
      await emailjs.sendForm('service_g1o7nfc', 'template_i2m9acj', formEl);
      successMsg.style.display = 'block';
      formEl.style.display = 'none';
      setTimeout(() => {
        window.location.href = `sms:+16156694084?body=${messageBody}`;
        formEl.reset();
      }, 500);
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
        <div class="quote-form-success" style="display: none; color: green; margin-bottom: 15px;">Quote requested successfully! We'll contact you shortly.</div>
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
});
