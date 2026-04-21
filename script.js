/* ============================================================
   BURGER TOWN — JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Navbar scroll effect ---------- */
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ---------- Mobile Navigation ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileLinks = mobileNav.querySelectorAll('a');

  const toggleMobile = () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('open');
    mobileOverlay.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  };

  hamburger.addEventListener('click', toggleMobile);
  mobileOverlay.addEventListener('click', toggleMobile);
  mobileLinks.forEach(link => link.addEventListener('click', () => {
    if (mobileNav.classList.contains('open')) toggleMobile();
  }));

  /* ---------- Smooth scroll for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ---------- Menu Tabs ---------- */
  const tabs = document.querySelectorAll('.menu-tab');
  const categories = document.querySelectorAll('.menu-category');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      categories.forEach(cat => {
        cat.classList.remove('active');
        if (cat.dataset.category === target) {
          cat.classList.add('active');
          // Animate cards in
          const cards = cat.querySelectorAll('.menu-card');
          cards.forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
              card.style.transition = 'opacity .4s ease, transform .4s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, i * 80);
          });
        }
      });
    });
  });

  /* ---------- Add to Cart functionality ---------- */
  window.addToCart = (name, price, image, desc) => {
    BurgerCart.addItem({
      name: name,
      price: price,
      image: image,
      desc: desc || ''
    });

    // Show toast notification
    showToast(`${name} added to cart!`, 'success');
    
    // Update cart count badge
    updateCartCount();
  };

  /* ---------- Update Cart Count Badge ---------- */
  const updateCartCount = () => {
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) {
      const count = BurgerCart.getCount();
      cartCountEl.textContent = count;
      cartCountEl.style.display = count > 0 ? 'flex' : 'none';
    }
  };

  /* ---------- Cart Change Listener ---------- */
  if (typeof BurgerCart !== 'undefined' && BurgerCart.onChange) {
    BurgerCart.onChange((items) => {
      updateCartCount();
    });
  }

  // Initialize cart count on page load
  window.addEventListener('load', () => {
    updateCartCount();
  });

  /* ---------- Toast Notification ---------- */
  window.showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="ri-${type === 'success' ? 'check-circle' : 'error-warning'}-line"></i>
      <span>${message}</span>
    `;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4caf50' : '#ff4757'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 500;
      animation: slideInUp 0.3s ease;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutDown 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  /* ---------- Checkout button ---------- */
  const checkoutBtn = document.querySelector('a[href="checkout.html"]');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      if (BurgerCart.getCount() === 0) {
        e.preventDefault();
        showToast('Please add items to cart first', 'error');
        // Scroll to menu
        document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /* ---------- Reveal on scroll (Intersection Observer) ---------- */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ---------- Counter animation ---------- */
  const counters = document.querySelectorAll('[data-counter]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.counter);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        let current = 0;
        const increment = target / 60;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
        }, 20);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  /* ---------- WhatsApp order link ---------- */
  window.openWhatsApp = (item = '') => {
    const phone = '2348000000000'; // Replace with actual number
    let message = 'Hello Burger Town! 🍔 ';
    if (item) {
      message += `I'd like to order: ${item}. `;
    }
    message += 'Please send me the menu and delivery info.';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  /* ---------- Parallax on hero ---------- */
  const heroImg = document.querySelector('.hero-img-wrapper');
  if (heroImg && window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
      const scroll = window.scrollY;
      if (scroll < window.innerHeight) {
        heroImg.style.transform = `translateY(${scroll * 0.08}px)`;
      }
    }, { passive: true });
  }

  /* ---------- Active nav link highlight ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  const highlightNav = () => {
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + id) {
            link.style.color = '#FFC72C';
          }
        });
      }
    });
  };
  window.addEventListener('scroll', highlightNav, { passive: true });

  /* ---------- Year in footer ---------- */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
