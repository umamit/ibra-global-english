document.addEventListener('DOMContentLoaded', () => {
  // 1. Header Scrolled Effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function toggleMenu() {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    mobileNav.setAttribute('aria-hidden', isExpanded);
    mobileNav.classList.toggle('active');
    
    // Toggle menu-toggle button layout
    const spans = menuToggle.querySelectorAll('span');
    if (!isExpanded) {
      spans[0].style.transform = 'translateY(5px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-4px) rotate(-45deg)';
    } else {
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    }
  }

  menuToggle.addEventListener('click', toggleMenu);

  // Close menu when a link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileNav.classList.contains('active')) {
        toggleMenu();
      }
    });
  });

  // Close menu when clicking outside content
  mobileNav.addEventListener('click', (e) => {
    if (e.target === mobileNav) {
      toggleMenu();
    }
  });

  // 3. Scroll Reveal Observer (Intersection Observer)
  const revealElements = document.querySelectorAll('.scroll-reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  // 4. Registration Form Handlers & WhatsApp Redirect
  const registrationForm = document.getElementById('registration-form');
  
  registrationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name-input').value.trim();
    const whatsapp = document.getElementById('whatsapp-input').value.trim();
    const program = document.getElementById('program-select').value;
    
    if (!name || !whatsapp) {
      alert('Mohon isi semua data pendaftaran dengan benar.');
      return;
    }
    
    // Form validation check (simple numeric check for WhatsApp)
    const numericWhatsapp = whatsapp.replace(/[^0-9]/g, '');
    if (numericWhatsapp.length < 9) {
      alert('Mohon masukkan nomor WhatsApp yang valid.');
      return;
    }
    
    // Target WhatsApp number for Ibra Global English: +62 813-5700-1357
    // We format the text message for WhatsApp API
    const targetPhone = '6281357001357';
    const message = `Halo Ibra Global English, saya ingin mendaftar kursus.\n\n*Nama Lengkap:* ${name}\n*Nomor WhatsApp:* ${whatsapp}\n*Program yang Diminati:* ${program}`;
    const encodedMessage = encodeURIComponent(message);
    
    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedMessage}`;
    
    // Redirect the current window directly to WhatsApp (100% bulletproof against pop-up blockers)
    window.location.href = whatsappUrl;
    registrationForm.reset();
  });
});
