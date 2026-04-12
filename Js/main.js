/* ===================================
   DINA RASHAD - INTERPRETER PWA
   Main JavaScript — Fixed v2.1
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollEffects();
    initSmoothScroll();
    initIntersectionObserver();
    console.log('🎤 Dina Rashad Interpreter PWA - Initialized');
});

/* ===================================
   NAVIGATION — ROOT FIX
   المشكلة كانت: click event بيبابل للـ document
   وبيقفل الـ menu فوراً بعد ما يتفتح
   =================================== */
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu   = document.getElementById('navMenu');
    const navbar    = document.getElementById('navbar');

    if (navToggle && navMenu) {

        // FIX: stopPropagation يمنع الـ event من الوصول للـ document listener
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = navMenu.classList.contains('active');
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = isOpen ? '' : 'hidden';
        });

        // إغلاق عند الضغط على لينك
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => closeNav(navToggle, navMenu));
        });

        // إغلاق عند الضغط خارج الـ nav
        document.addEventListener('click', function(e) {
            if (
                navMenu.classList.contains('active') &&
                !navToggle.contains(e.target) &&
                !navMenu.contains(e.target)
            ) {
                closeNav(navToggle, navMenu);
            }
        });

        // إغلاق بـ Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeNav(navToggle, navMenu);
            }
        });
    }

    // Navbar scroll effect
    if (navbar) {
        window.addEventListener('scroll', function() {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
    }
}

function closeNav(toggle, menu) {
    toggle.classList.remove('active');
    menu.classList.remove('active');
    document.body.style.overflow = '';
}

/* ===================================
   SCROLL EFFECTS
   =================================== */
function initScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    document.querySelectorAll('.scroll-animate, .stagger-children')
        .forEach(el => observer.observe(el));
}

/* ===================================
   SMOOTH SCROLL
   =================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                const offset = document.querySelector('.navbar')?.offsetHeight || 80;
                window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
            }
        });
    });
}

/* ===================================
   INTERSECTION OBSERVER
   =================================== */
function initIntersectionObserver() {
    const sections = document.querySelectorAll('.service-card, .feature-item, .language-card');
    sections.forEach((el, i) => {
        el.classList.add('scroll-animate');
        el.style.transitionDelay = `${i * 0.1}s`;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    sections.forEach(el => observer.observe(el));
}

/* ===================================
   UTILITIES
   =================================== */
function debounce(func, wait = 20) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

function throttle(func, limit = 100) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 && rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right  <= (window.innerWidth  || document.documentElement.clientWidth)
    );
}

function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    function update() {
        start += increment;
        if (start < target) { element.textContent = Math.ceil(start); requestAnimationFrame(update); }
        else { element.textContent = target; }
    }
    update();
}

/* ===================================
   FORM VALIDATION
   =================================== */
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isValidPhone(phone) { return /^[\d\s\-\+\(\)]{10,}$/.test(phone); }

function showError(input, message) {
    const group = input.closest('.form-group') || input.parentElement;
    let el = group.querySelector('.error-message');
    if (!el) { el = document.createElement('span'); el.className = 'error-message'; group.appendChild(el); }
    el.textContent = message;
    input.classList.add('error');
}

function clearError(input) {
    const group = input.closest('.form-group') || input.parentElement;
    group?.querySelector('.error-message')?.remove();
    input.classList.remove('error');
}

/* ===================================
   DATE HELPERS
   =================================== */
function formatDate(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getTimeSlots() {
    const slots = [];
    for (let h = 8; h <= 20; h++) {
        slots.push(`${String(h).padStart(2,'0')}:00`);
        slots.push(`${String(h).padStart(2,'0')}:30`);
    }
    return slots;
}

function isPastDate(date) {
    const today = new Date();
    today.setHours(0,0,0,0);
    return date < today;
}

function formatTime24To12(time) {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2,'0')} ${period}`;
}

/* ===================================
   WHATSAPP
   =================================== */
function generateWhatsAppMessage(data) {
    return encodeURIComponent(`Hello Dina! 👋\n\nI'm interested in booking your interpretation services.\n\n*Details:*\n• Name: ${data.name}\n• Email: ${data.email || 'N/A'}\n• Phone: ${data.phone}\n• Date: ${formatDate(new Date(data.date))}\n• Time: ${data.time}\n• Event Type: ${data.eventType}\n• Duration: ${data.duration || 'To be discussed'}\n• Message: ${data.message || 'N/A'}\n\nLooking forward to hearing from you!`);
}

function openWhatsApp(data) {
    window.open(`https://wa.me/201011160627?text=${generateWhatsAppMessage(data)}`, '_blank');
}

/* ===================================
   LOCAL STORAGE
   =================================== */
function saveToStorage(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); return true; }
    catch(e) { console.error('Storage save error:', e); return false; }
}

function getFromStorage(key) {
    try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : null; }
    catch(e) { console.error('Storage read error:', e); return null; }
}

function removeFromStorage(key) {
    try { localStorage.removeItem(key); return true; }
    catch(e) { console.error('Storage remove error:', e); return false; }
}

/* ===================================
   NOTIFICATIONS
   =================================== */
function showNotification(message, type = 'success', duration = 4000) {
    document.querySelector('.notification')?.remove();

    if (!document.querySelector('#notification-styles')) {
        const s = document.createElement('style');
        s.id = 'notification-styles';
        s.textContent = `
            .notification { position:fixed; top:100px; right:20px; padding:16px 20px; border-radius:12px; background:white; box-shadow:0 10px 40px rgba(0,0,0,0.15); display:flex; align-items:center; gap:12px; z-index:10000; max-width:400px; animation:slideInRight 0.3s ease; }
            .notification-success { border-left:4px solid #10b981; }
            .notification-error   { border-left:4px solid #ef4444; }
            .notification-info    { border-left:4px solid #3b82f6; }
            .notification-content { display:flex; align-items:center; gap:10px; flex:1; }
            .notification-success .notification-content i { color:#10b981; }
            .notification-error   .notification-content i { color:#ef4444; }
            .notification-info    .notification-content i { color:#3b82f6; }
            .notification-close   { background:none; border:none; color:#9ca3af; cursor:pointer; padding:4px; }
            .notification-close:hover { color:#374151; }
            @keyframes slideInRight { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
        `;
        document.head.appendChild(s);
    }

    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const n = document.createElement('div');
    n.className = `notification notification-${type}`;
    n.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    document.body.appendChild(n);
    setTimeout(() => {
        n.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => n.remove(), 300);
    }, duration);
}

/* ===================================
   GLOBAL EXPORT
   =================================== */
window.DinaRashadApp = {
    openWhatsApp, showNotification,
    saveToStorage, getFromStorage, removeFromStorage,
    isValidEmail, isValidPhone,
    formatDate, formatTime24To12, getTimeSlots
};
window.showNotification  = showNotification;
window.formatTime24To12  = formatTime24To12;
