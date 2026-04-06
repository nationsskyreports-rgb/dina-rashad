/* ===================================
   DINA RASHAD - INTERPRETER PWA
   PWA (Progressive Web App) JavaScript
   Service Worker & Installation
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
    initPWA();
    initServiceWorker();
    initInstallPrompt();
});

/* ===================================
   PWA INITIALIZATION
   =================================== */
function initPWA() {
    console.log('🚀 Initializing PWA...');
    
    // Check if PWA is supported
    if ('serviceWorker' in navigator) {
        console.log('✅ Service Workers are supported');
    } else {
        console.log('⚠️ Service Workers are not supported');
    }
    
    // Check if installed as PWA
    if (isStandalone()) {
        console.log('📱 Running in standalone mode (installed PWA)');
        document.body.classList.add('pwa-standalone');
    }
}

/* ===================================
   SERVICE WORKER REGISTRATION
   =================================== */
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('✅ Service Worker registered successfully:', registration.scope);
                    
                    // Check for updates
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
        
        // Handle service worker messages
        navigator.serviceWorker.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'CACHE_UPDATED') {
                showUpdateNotification();
            }
        });
    }
}

/* ===================================
   INSTALL PROMPT (Add to Home Screen)
   =================================== */
let deferredPrompt = null;

function initInstallPrompt() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        
        console.log('📲 Install prompt available');
        
        // Show install button/banner after a delay
        setTimeout(() => {
            showInstallBanner();
        }, 5000);
    });
    
    // Listen for successful installation
    window.addEventListener('appinstalled', function(evt) {
        console.log('✅ App was installed successfully');
        deferredPrompt = null;
        hideInstallBanner();
        showNotification('🎉 App installed successfully! You can now access it from your home screen.', 'success', 6000);
        
        // Save installation info
        saveToStorage('pwa_installed', {
            date: new Date().toISOString(),
            version: '1.0.0'
        });
    });
    
    // Check if already installed
    if (isStandalone()) {
        hideInstallBanner();
    }
}

// Trigger install prompt
async function installApp() {
    if (!deferredPrompt) {
        console.log('⚠️ Install prompt not available');
        return;
    }
    
    try {
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for user response
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log(`User response to install prompt: ${outcome}`);
        
        if (outcome === 'accepted') {
            console.log('✅ User accepted the install prompt');
        } else {
            console.log('❌ User dismissed the install prompt');
        }
        
        // Clear the deferred prompt
        deferredPrompt = null;
        
    } catch (error) {
        console.error('Error during installation:', error);
    }
}

// Check if running in standalone mode (installed)
function isStandalone() {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://')
    );
}

/* ===================================
   INSTALL BANNER UI
   =================================== */

function showInstallBanner() {
    // Don't show if already dismissed or installed
    if (getFromStorage('install_banner_dismissed')) {
        return;
    }
    
    // Don't show if already installed
    if (getFromStorage('pwa_installed')) {
        return;
    }
    
    // Create banner element
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
                <button id="install-btn" class="btn-install" onclick="installApp()">
                    Install
                </button>
                <button id="dismiss-install-btn" class="btn-dismiss" onclick="dismissInstallBanner()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add styles
    addInstallBannerStyles();
    
    // Append to body
    document.body.appendChild(banner);
    
    // Animate in
    requestAnimationFrame(() => {
        banner.classList.add('visible');
    });
}

function hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
        banner.classList.remove('visible');
        setTimeout(() => banner.remove(), 300);
    }
}

function dismissInstallBanner() {
    saveToStorage('install_banner_dismissed', true);
    hideInstallBanner();
}

function addInstallBannerStyles() {
    if (document.getElementById('install-banner-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'install-banner-styles';
    styles.textContent = `
        .install-banner {
            position: fixed;
            bottom: -100px;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #1e40af, #2563eb);
            color: white;
            padding: 16px 20px;
            z-index: 9998;
            box-shadow: 0 -5px 30px rgba(0,0,0,0.2);
            transition: bottom 0.3s ease;
        }
        
        .install-banner.visible {
            bottom: 0;
        }
        
        .install-banner-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        .install-banner-icon {
            width: 48px;
            height: 48px;
            background: rgba(255,255,255,0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            flex-shrink: 0;
        }
        
        .install-banner-text h4 {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
        }
        
        .install-banner-text p {
            margin: 0;
            font-size: 13px;
            opacity: 0.9;
        }
        
        .install-banner-actions {
            display: flex;
            gap: 8px;
            margin-left: auto;
        }
        
        .btn-install {
            background: white;
            color: #2563eb;
            border: none;
            padding: 10px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .btn-install:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .btn-dismiss {
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .btn-dismiss:hover {
            background: rgba(255,255,255,0.3);
        }
        
        /* Adjust for mobile */
        @media (max-width: 768px) {
            .install-banner-content {
                flex-wrap: wrap;
                gap: 12px;
            }
            
            .install-banner-text {
                flex: 1;
                min-width: 200px;
            }
            
            .install-banner-actions {
                width: 100%;
                justify-content: center;
            }
            
            .btn-dismiss {
                position: absolute;
                top: 10px;
                right: 10px;
            }
        }
        
        /* Hide when WhatsApp button is present */
        body.pwa-standalone .install-banner,
        .whatsapp-float + .install-banner {
            bottom: 90px;
        }
    `;
    
    document.head.appendChild(styles);
}

/* ===================================
   UPDATE NOTIFICATION
   =================================== */

function showUpdateNotification() {
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
    
    // Add styles
    if (!document.getElementById('update-notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'update-notification-styles';
        styles.textContent = `
            .update-notification {
                position: fixed;
                top: 90px;
                left: 50%;
                transform: translateX(-50%) translateY(-100px);
                background: linear-gradient(135deg, #059669, #10b981);
                color: white;
                padding: 14px 20px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                gap: 14px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                z-index: 10001;
                animation: slideDown 0.3s ease forwards;
            }
            
            @keyframes slideDown {
                to { transform: translateX(-50%) translateY(0); }
            }
            
            .update-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .update-content i {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .btn-update {
                background: white;
                color: #059669;
                border: none;
                padding: 8px 18px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s;
            }
            
            .btn-update:hover {
                transform: scale(1.05);
            }
            
            .btn-dismiss-update {
                background: rgba(255,255,255,0.2);
                color: white;
                border: none;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
}

function reloadPage() {
    window.location.reload();
}

/* ===================================
   OFFLINE/ONLINE STATUS
   =================================== */

function initOnlineStatus() {
    const updateOnlineStatus = () => {
        if (navigator.onLine) {
            showNotification('🌐 You\'re back online!', 'success');
            document.body.classList.remove('offline');
        } else {
            showNotification('⚠️ You\'re offline. Some features may be limited.', 'error', 5000);
            document.body.classList.add('offline');
        }
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}

// Initialize online status monitoring
initOnlineStatus();

/* ===================================
   EXPORT FUNCTIONS
   =================================== */

window.installApp = installApp;
window.dismissInstallBanner = dismissInstallBanner;
window.reloadPage = reloadPage;