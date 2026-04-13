/* ===================================
   PAGE TRANSITION LAUNCHER
   بيظهر لوجو المشروع بين الصفحات
   =================================== */
(function() {

    // إنشاء الـ overlay
    function createLauncher() {
        if (document.getElementById('page-launcher')) return;

        var launcher = document.createElement('div');
        launcher.id = 'page-launcher';
        launcher.innerHTML = \`
            <div class="launcher-inner">
                <div class="launcher-logo">
                    <i class="fas fa-language"></i>
                </div>
                <div class="launcher-name">Dina Rashad</div>
                <div class="launcher-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        \`;

        var style = document.createElement('style');
        style.textContent = \`
            #page-launcher {
                position: fixed;
                inset: 0;
                background: linear-gradient(135deg, #1e3a8a, #2563eb);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: opacity 0.4s ease;
            }
            #page-launcher.fade-out {
                opacity: 0;
                pointer-events: none;
            }
            #page-launcher.hidden {
                display: none;
            }
            .launcher-inner {
                text-align: center;
                color: white;
            }
            .launcher-logo {
                width: 80px;
                height: 80px;
                background: rgba(255,255,255,0.15);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 16px;
                animation: launcher-pulse 1.5s ease-in-out infinite;
            }
            .launcher-logo i {
                font-size: 36px;
                color: white;
            }
            .launcher-name {
                font-family: 'Inter', sans-serif;
                font-size: 22px;
                font-weight: 700;
                letter-spacing: 0.5px;
                margin-bottom: 24px;
                opacity: 0.95;
            }
            .launcher-dots {
                display: flex;
                gap: 8px;
                justify-content: center;
            }
            .launcher-dots span {
                width: 8px;
                height: 8px;
                background: rgba(255,255,255,0.7);
                border-radius: 50%;
                animation: launcher-dot 1.2s ease-in-out infinite;
            }
            .launcher-dots span:nth-child(2) { animation-delay: 0.2s; }
            .launcher-dots span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes launcher-pulse {
                0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.3); }
                50% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(255,255,255,0); }
            }
            @keyframes launcher-dot {
                0%, 100% { transform: translateY(0); opacity: 0.5; }
                50% { transform: translateY(-6px); opacity: 1; }
            }
        \`;

        document.head.appendChild(style);
        document.body.appendChild(launcher);
    }

    // إخفاء الـ launcher عند تحميل الصفحة
    function hideLauncher() {
        var launcher = document.getElementById('page-launcher');
        if (!launcher) return;
        setTimeout(function() {
            launcher.classList.add('fade-out');
            setTimeout(function() {
                launcher.classList.add('hidden');
            }, 400);
        }, 300);
    }

    // إظهار الـ launcher عند الضغط على لينك
    function showLauncher() {
        var launcher = document.getElementById('page-launcher');
        if (!launcher) return;
        launcher.classList.remove('hidden', 'fade-out');
    }

    // تهيئة
    createLauncher();

    // إخفاء عند اكتمال التحميل
    if (document.readyState === 'complete') {
        hideLauncher();
    } else {
        window.addEventListener('load', hideLauncher);
    }

    // إظهار عند التنقل بين الصفحات
    document.addEventListener('click', function(e) {
        var link = e.target.closest('a[href]');
        if (!link) return;
        var href = link.getAttribute('href');
        // فقط للروابط الداخلية HTML
        if (!href || href.startsWith('#') || href.startsWith('http') ||
            href.startsWith('mailto') || href.startsWith('tel') ||
            link.target === '_blank') return;

        e.preventDefault();
        showLauncher();
        setTimeout(function() {
            window.location.href = href;
        }, 350);
    });

})();

/* ===================================
   DINA RASHAD - INTERPRETER PWA
   Main JavaScript v2.2
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollAnimations();  // replaces IntersectionObserver with reliable scroll
    initSmoothScroll();
    initCounters();
    console.log('🎤 Dina Rashad Interpreter PWA - Initialized');
});

/* ===================================
   NAVIGATION
   =================================== */
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu   = document.getElementById('navMenu');
    const navbar    = document.getElementById('navbar');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = navMenu.classList.contains('active');
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = isOpen ? '' : 'hidden';
        });

        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => closeNav(navToggle, navMenu));
        });

        document.addEventListener('click', function(e) {
            if (navMenu.classList.contains('active') &&
                !navToggle.contains(e.target) &&
                !navMenu.contains(e.target)) {
                closeNav(navToggle, navMenu);
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeNav(navToggle, navMenu);
        });
    }

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
   SCROLL ANIMATIONS
   بدل IntersectionObserver — أكتر موثوقية على كل المتصفحات
   =================================== */
function initScrollAnimations() {
    // اضف scroll-animate لـ service cards وغيرها
    document.querySelectorAll('.service-card, .feature-item, .language-card').forEach((el, i) => {
        el.classList.add('scroll-animate');
        el.style.transitionDelay = `${i * 0.1}s`;
    });

    function checkVisibility() {
        const windowH = window.innerHeight;
        document.querySelectorAll('.scroll-animate:not(.visible), .stagger-children:not(.visible)').forEach(el => {
            const rect = el.getBoundingClientRect();
            // عنصر يكون visible لو 10% منه ظاهر في الشاشة
            if (rect.top < windowH * 0.92 && rect.bottom > 0) {
                el.classList.add('visible');
            }
        });
    }

    // شغّل فوراً عند التحميل
    checkVisibility();
    // شغّل عند كل scroll
    window.addEventListener('scroll', checkVisibility, { passive: true });
    // شغّل بعد ثانية كـ fallback لو فيه حاجة اتأخرت
    window.addEventListener('load', function() {
        checkVisibility();
        setTimeout(checkVisibility, 500);
        setTimeout(checkVisibility, 1500);
    });
}

/* ===================================
   COUNTER ANIMATION
   =================================== */
function initCounters() {
    function checkCounters() {
        document.querySelectorAll('.stat-number[data-count]:not(.animated)').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
                el.classList.add('animated');
                animateCounter(el, parseInt(el.dataset.count));
            }
        });
    }

    checkCounters();
    window.addEventListener('scroll', checkCounters, { passive: true });
    window.addEventListener('load', function() {
        checkCounters();
        setTimeout(checkCounters, 300);
    });
}

function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    function update() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start).toLocaleString();
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString() + '+';
        }
    }
    requestAnimationFrame(update);
}

/* ===================================
   SMOOTH SCROLL
   =================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = document.querySelector('.navbar')?.offsetHeight || 80;
                window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
            }
        });
    });
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
    return rect.top < window.innerHeight && rect.bottom > 0;
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
    return date.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
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
    return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

/* ===================================
   WHATSAPP
   =================================== */
function generateWhatsAppMessage(data) {
    return encodeURIComponent(
`Hello Dina! 👋

I'm interested in booking your interpretation services.

*Details:*
• Name: ${data.name}
• Email: ${data.email || 'N/A'}
• Phone: ${data.phone}
• Date: ${formatDate(new Date(data.date))}
• Time: ${data.time}
• Event Type: ${data.eventType}
• Duration: ${data.duration || 'To be discussed'}
• Message: ${data.message || 'N/A'}

Looking forward to hearing from you!`);
}

function openWhatsApp(data) {
    window.open(`https://wa.me/201011160627?text=${generateWhatsAppMessage(data)}`, '_blank');
}

/* ===================================
   LOCAL STORAGE
   =================================== */
function saveToStorage(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); return true; }
    catch(e) { return false; }
}

function getFromStorage(key) {
    try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : null; }
    catch(e) { return null; }
}

function removeFromStorage(key) {
    try { localStorage.removeItem(key); return true; }
    catch(e) { return false; }
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
            .notification{position:fixed;top:100px;right:20px;padding:16px 20px;border-radius:12px;background:white;box-shadow:0 10px 40px rgba(0,0,0,.15);display:flex;align-items:center;gap:12px;z-index:10000;max-width:400px;animation:slideInRight .3s ease}
            .notification-success{border-left:4px solid #10b981}
            .notification-error{border-left:4px solid #ef4444}
            .notification-info{border-left:4px solid #3b82f6}
            .notification-content{display:flex;align-items:center;gap:10px;flex:1}
            .notification-success .notification-content i{color:#10b981}
            .notification-error .notification-content i{color:#ef4444}
            .notification-info .notification-content i{color:#3b82f6}
            .notification-close{background:none;border:none;color:#9ca3af;cursor:pointer;padding:4px}
            @keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
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
        n.style.animation = 'slideInRight .3s ease reverse';
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
window.showNotification = showNotification;
window.formatTime24To12 = formatTime24To12;

/* ===================================
   PAGE TRANSITION LAUNCHER
   =================================== */
(function () {
    var DURATION = 350;

    /* ---- CSS ---- */
    var style = document.createElement('style');
    style.textContent = [
        '#page-launcher{position:fixed;inset:0;background:linear-gradient(135deg,#1e3a8a,#2563eb);',
        'z-index:99999;display:flex;align-items:center;justify-content:center;',
        'transition:opacity .4s ease;}',
        '#page-launcher.fade-out{opacity:0;pointer-events:none;}',
        '#page-launcher.gone{display:none;}',
        '.pl-inner{text-align:center;color:#fff;}',
        '.pl-icon{width:80px;height:80px;background:rgba(255,255,255,.15);border-radius:20px;',
        'display:flex;align-items:center;justify-content:center;margin:0 auto 16px;',
        'animation:pl-pulse 1.5s ease-in-out infinite;}',
        '.pl-icon i{font-size:36px;color:#fff;}',
        '.pl-name{font-family:Inter,sans-serif;font-size:22px;font-weight:700;margin-bottom:24px;}',
        '.pl-dots{display:flex;gap:8px;justify-content:center;}',
        '.pl-dots span{width:8px;height:8px;background:rgba(255,255,255,.7);border-radius:50%;',
        'animation:pl-dot 1.2s ease-in-out infinite;}',
        '.pl-dots span:nth-child(2){animation-delay:.2s;}',
        '.pl-dots span:nth-child(3){animation-delay:.4s;}',
        '@keyframes pl-pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.06);}}',
        '@keyframes pl-dot{0%,100%{transform:translateY(0);opacity:.5;}50%{transform:translateY(-6px);opacity:1;}}'
    ].join('');
    document.head.appendChild(style);

    /* ---- HTML ---- */
    var el = document.createElement('div');
    el.id = 'page-launcher';
    el.innerHTML = '<div class="pl-inner">'
        + '<div class="pl-icon"><i class="fas fa-language"></i></div>'
        + '<div class="pl-name">Dina Rashad</div>'
        + '<div class="pl-dots"><span></span><span></span><span></span></div>'
        + '</div>';
    document.body.appendChild(el);

    /* ---- Hide on load ---- */
    function hide() {
        el.classList.add('fade-out');
        setTimeout(function () { el.classList.add('gone'); }, 420);
    }
    if (document.readyState === 'complete') { setTimeout(hide, 200); }
    else { window.addEventListener('load', function () { setTimeout(hide, 200); }); }

    /* ---- Show on internal navigation ---- */
    document.addEventListener('click', function (e) {
        var a = e.target.closest('a[href]');
        if (!a) return;
        var href = a.getAttribute('href');
        if (!href || href.charAt(0) === '#'
            || href.indexOf('http') === 0
            || href.indexOf('mailto') === 0
            || href.indexOf('tel') === 0
            || a.target === '_blank') return;
        e.preventDefault();
        el.classList.remove('gone', 'fade-out');
        setTimeout(function () { window.location.href = href; }, DURATION);
    });
}());
