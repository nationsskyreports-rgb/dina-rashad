/* ===================================
   DINA RASHAD - INTERPRETER PWA
   PWA (Progressive Web App) JavaScript
   =================================== */

let deferredPrompt = null;

document.addEventListener('DOMContentLoaded', function() {
    initPWA();
    initServiceWorker();
    initInstallPrompt();
    initOnlineStatus();
});

/* ===================================
   PWA INITIALIZATION
   =================================== */
function initPWA() {
    console.log('🚀 Initializing PWA...');
    if ('serviceWorker' in navigator) {
        console.log('✅ Service Workers are supported');
    }
    if (isStandalone()) {
        console.log('📱 Running in standalone mode (installed PWA)');
        document.body.classList.add('pwa-standalone');
    }
}

/* ===================================
   SERVICE WORKER REGISTRATION
   =================================== */
function initServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/dina-rashad/sw.js')
            .then(function(registration) {
                console.log('✅ Service Worker registered:', registration.scope);

                registration.addEventListener('updatefound', function() {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', function() {
                        if (newWorker.state === 'activated') {
                            console.log('🔄 New Service Worker activated');
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(function(error) {
                console.error('❌ Service Worker registration failed:', error);
            });
    });

    navigator.serviceWorker.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
            showUpdateNotification();
        }
    });
}

/* ===================================
   INSTALL PROMPT
   =================================== */
function initInstallPrompt() {
    if (isStandalone()) {
        hideInstallBanner();
        return;
    }

    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        console.log('📲 Install prompt available');

        setTimeout(function() {
            showInstallBanner();
        }, 3000);
    });

    window.addEventListener('appinstalled', function() {
        console.log('✅ App installed successfully');
        deferredPrompt = null;
        hideInstallBanner();
        hidePwaInstallBtn();
        showNotification('🎉 App installed! Access it from your home screen.', 'success', 6000);
        localStorage.setItem('pwa_installed', JSON.stringify({
            date: new Date().toISOString(),
            version: '1.0.0'
        }));
    });

    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
        window.addEventListener('beforeinstallprompt', function() {
            installBtn.style.display = 'block';
        });
        installBtn.addEventListener('click', async function() {
            await installApp();
        });
    }
}

async function installApp() {
    if (!deferredPrompt) return;
    try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('User response:', outcome);
        deferredPrompt = null;
        hideInstallBanner();
        hidePwaInstallBtn();
    } catch (error) {
        console.error('Error during installation:', error);
    }
}

function isStandalone() {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://')
    );
}

function hidePwaInstallBtn() {
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.style.display = 'none';
}

/* ===================================
   INSTALL BANNER UI
   FIX: بدل ما تتخفى للأبد، بترجع بعد 7 أيام
   =================================== */
function wasDismissedRecently() {
    const dismissed = localStorage.getItem('install_banner_dismissed');
    if (!dismissed) return false;
    const dismissedDate = new Date(dismissed);
    const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
    // لو اتدسمس من أكتر من 7 أيام، امسح وارجع اعرضه
    if (daysSince > 7) {
        localStorage.removeItem('install_banner_dismissed');
        return false;
    }
    return true;
}

function showInstallBanner() {
    if (wasDismissedRecently()) return;
    if (localStorage.getItem('pwa_installed')) return;
    if (document.getElementById('install-banner')) return;

    addInstallBannerStyles();

    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.className = 'install-banner';
    banner.innerHTML = `
        <div class="install-banner-content">
            <div class="install-banner-icon">
                <i class="fas fa-download"></i>
            </div>
            <div class="install-banner-text">
                <h4>Install App</h4>
                <p>Add Dina Rashad Interpreter to your home screen for quick access!</p>
            </div>
            <div class="install-banner-actions">
                <button class="btn-install" onclick="installApp()">Install</button>
                <button class="btn-dismiss" onclick="dismissInstallBanner()" aria-label="Dismiss">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(banner);
    requestAnimationFrame(function() {
        banner.classList.add('visible');
    });
}

function hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
        banner.classList.remove('visible');
        setTimeout(function() { banner.remove(); }, 300);
    }
}

function dismissInstallBanner() {
    // FIX: بنحفظ التاريخ مش مجرد true — عشان نرجع نظهره بعد 7 أيام
    localStorage.setItem('install_banner_dismissed', new Date().toISOString());
    hideInstallBanner();
}

function addInstallBannerStyles() {
    if (document.getElementById('install-banner-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'install-banner-styles';
    styles.textContent = `
        .install-banner {
            position: fixed;
            bottom: -120px;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #1e40af, #2563eb);
            color: white;
            padding: 16px 20px;
            z-index: 9998;
            box-shadow: 0 -5px 30px rgba(0,0,0,0.2);
            transition: bottom 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .install-banner.visible { bottom: 0; }
        .install-banner-content { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 16px; }
        .install-banner-icon { width: 48px; height: 48px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .install-banner-text h4 { margin: 0 0 4px 0; font-size: 16px; font-weight: 600; }
        .install-banner-text p { margin: 0; font-size: 13px; opacity: 0.9; }
        .install-banner-actions { display: flex; gap: 8px; margin-left: auto; align-items: center; }
        .btn-install { background: white; color: #2563eb; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; transition: transform 0.2s, box-shadow 0.2s; }
        .btn-install:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .btn-dismiss { background: rgba(255,255,255,0.2); color: white; border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
        .btn-dismiss:hover { background: rgba(255,255,255,0.35); }
        body:has(.whatsapp-float) .install-banner.visible { bottom: 80px; }
        @media (max-width: 768px) {
            .install-banner { padding: 14px 16px; }
            .install-banner-content { flex-wrap: wrap; gap: 10px; position: relative; }
            .install-banner-text { flex: 1; min-width: 180px; }
            .install-banner-actions { width: 100%; justify-content: center; }
            .btn-dismiss { position: absolute; top: -8px; right: 0; width: 30px; height: 30px; font-size: 12px; }
        }
    `;
    document.head.appendChild(styles);
}

/* ===================================
   UPDATE NOTIFICATION
   =================================== */
function showUpdateNotification() {
    if (document.getElementById('update-notification')) return;

    if (!document.getElementById('update-notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'update-notification-styles';
        styles.textContent = `
            .update-notification { position: fixed; top: 90px; left: 50%; transform: translateX(-50%) translateY(-150px); background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 14px 20px; border-radius: 12px; display: flex; align-items: center; gap: 14px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); z-index: 10001; animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            @keyframes slideDown { to { transform: translateX(-50%) translateY(0); } }
            .update-content { display: flex; align-items: center; gap: 10px; font-size: 14px; }
            .update-content i { animation: spin 1s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .btn-update { background: white; color: #059669; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px; transition: transform 0.2s; }
            .btn-update:hover { transform: scale(1.05); }
            .btn-dismiss-update { background: rgba(255,255,255,0.2); color: white; border: none; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        `;
        document.head.appendChild(styles);
    }

    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-content">
            <i class="fas fa-sync-alt"></i>
            <span>A new version is available!</span>
        </div>
        <button onclick="reloadPage()" class="btn-update">Reload</button>
        <button onclick="this.parentElement.remove()" class="btn-dismiss-update">
            <i class="fas fa-times"></i>
        </button>
    `;
    document.body.appendChild(notification);
}

function reloadPage() {
    window.location.reload();
}

/* ===================================
   OFFLINE / ONLINE STATUS
   =================================== */
function initOnlineStatus() {
    window.addEventListener('online', function() {
        showNotification('🌐 You\'re back online!', 'success');
        document.body.classList.remove('offline');
    });
    window.addEventListener('offline', function() {
        showNotification('⚠️ You\'re offline. Some features may be limited.', 'error', 5000);
        document.body.classList.add('offline');
    });
}

/* ===================================
   NOTIFICATION HELPER
   =================================== */
function showNotification(message, type, duration) {
    duration = duration || 3000;
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white; padding: 12px 20px; border-radius: 10px;
        font-size: 14px; font-weight: 500;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        z-index: 10002; opacity: 0; transform: translateY(-10px);
        transition: all 0.3s ease; max-width: 320px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    requestAnimationFrame(function() {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    });
    setTimeout(function() {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        setTimeout(function() { notification.remove(); }, 300);
    }, duration);
}

/* ===================================
   EXPORT
   =================================== */
window.installApp = installApp;
window.dismissInstallBanner = dismissInstallBanner;
window.reloadPage = reloadPage;
