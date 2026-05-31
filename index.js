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

  // 5. Gallery Lightbox Functionality
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const fullSrc = item.getAttribute('data-src');
      const captionText = item.getAttribute('data-caption');
      
      lightboxImg.src = fullSrc;
      lightboxImg.alt = captionText;
      lightboxCaption.textContent = captionText;
      
      lightboxModal.classList.add('active');
      lightboxModal.setAttribute('aria-hidden', 'false');
    });
  });

  function closeLightbox() {
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    // Clear image src after transition to avoid flicker on next open
    setTimeout(() => {
      lightboxImg.src = '';
      lightboxImg.alt = '';
      lightboxCaption.textContent = '';
    }, 300);
  }

  lightboxClose.addEventListener('click', closeLightbox);
  
  // Close on background click
  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal) {
      closeLightbox();
    }
  });

  // Close on ESC key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
      closeLightbox();
    }
  });

  // 6. FAQ Accordion Functionality
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other FAQ items for a clean accordion behavior
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
          otherItem.querySelector('.faq-content').setAttribute('aria-hidden', 'true');
        }
      });
      
      // Toggle current item
      if (!isActive) {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
        item.querySelector('.faq-content').setAttribute('aria-hidden', 'false');
      } else {
        item.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
        item.querySelector('.faq-content').setAttribute('aria-hidden', 'true');
      }
    });
  });

  // 7. Dark Mode Toggle Functionality
  const themeToggle = document.getElementById('theme-toggle');
  
  // Check local storage or system preferences
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.setAttribute('aria-label', 'Aktifkan Mode Terang');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    themeToggle.setAttribute('aria-label', 'Aktifkan Mode Gelap');
  }
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme = 'light';
    
    if (currentTheme === 'light') {
      newTheme = 'dark';
      themeToggle.setAttribute('aria-label', 'Aktifkan Mode Terang');
    } else {
      themeToggle.setAttribute('aria-label', 'Aktifkan Mode Gelap');
    }
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
});
