/* ===== BraziClean — JavaScript ===== */
document.addEventListener('DOMContentLoaded', () => {
  // Header scroll effect
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });

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
  document.querySelectorAll('a[href^="#"]:not([href="#contact"])').forEach(anchor => {
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
  });

  // EmailJS & Quote Form Logic
  const emailJsScript = document.createElement('script');
  emailJsScript.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
  emailJsScript.onload = () => {
    emailjs.init({ publicKey: '_M1M0aep8-q2RYQph' });
  };
  document.head.appendChild(emailJsScript);

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

  // Inject Global Modal and FAB
  const modalHTML = `
    <div class="quote-modal-overlay" id="quote-modal">
      <div class="quote-modal-content">
        <button class="quote-modal-close" id="close-quote-modal">&times;</button>
        <div class="quote-form-wrap">
          <h3>Get Your Free Quote</h3>
          <div class="quote-form-success" style="display: none;">Quote requested successfully! We'll contact you shortly.</div>
          <div class="quote-form-error" style="display: none;">Failed to send request. Please try again.</div>
          <form class="quote-form" id="globalQuoteForm">
             ${quoteFormHTML}
          </form>
        </div>
      </div>
    </div>
    <button class="floating-action-btn" id="fab-quote" aria-label="Get a Free Quote">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
      <span>Get a Quote</span>
    </button>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Modal Logic
  const quoteModal = document.getElementById('quote-modal');
  const closeQuoteModalBtn = document.getElementById('close-quote-modal');
  const fabQuote = document.getElementById('fab-quote');

  function openModal() { quoteModal.classList.add('active'); document.body.style.overflow = 'hidden'; }
  function closeModal() { quoteModal.classList.remove('active'); document.body.style.overflow = ''; }

  fabQuote?.addEventListener('click', openModal);
  closeQuoteModalBtn?.addEventListener('click', closeModal);
  quoteModal?.addEventListener('click', e => {
    if (e.target === quoteModal) closeModal();
  });

  // Re-route contact buttons to open modal if we are not on a page that handles it, or just use modal universally for UX
  document.querySelectorAll('a[href="#contact"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      // On mobile always open modal. On desktop we could scroll, but modal is cleaner
      if (window.innerWidth <= 768 || true) {
        openModal();
      }
    });
  });

  // Handle Form Submission (Works for global modal and hero form if it exists)
  function handleQuoteFormSubmit(e) {
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

    emailjs.sendForm('service_g1o7nfc', 'template_i2m9acj', formEl)
      .then(() => {
        successMsg.style.display = 'block';
        formEl.style.display = 'none';
        formEl.reset();
        setTimeout(() => {
          // Use ?body= for SMS pre-fill
          window.location.href = `sms:+16156694084?body=${messageBody}`;
        }, 500);
      }, (error) => {
        console.error('EmailJS Error:', error);
        errorMsg.style.display = 'block';
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
  }

  document.querySelectorAll('.quote-form').forEach(f => {
    f.addEventListener('submit', handleQuoteFormSubmit);
  });

  // Render hero form dynamically if the container exists
  const heroFormContainer = document.getElementById('hero-quote-form-container');
  if (heroFormContainer) {
    heroFormContainer.innerHTML = `
      <div class="quote-form-wrap">
        <h3>Get Your Free Quote</h3>
        <div class="quote-form-success" style="display: none;">Quote requested successfully! We'll contact you shortly.</div>
        <div class="quote-form-error" style="display: none;">Failed to send request. Please try again.</div>
        <form class="quote-form" id="heroQuoteForm">
           ${quoteFormHTML}
        </form>
      </div>
    `;
    // Attach listener to the newly injected form
    document.getElementById('heroQuoteForm').addEventListener('submit', handleQuoteFormSubmit);
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
